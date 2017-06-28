!function TextObject(){
    window.Text = function(ctx, style) {
        this.ctx = ctx;
    }

    Text.prototype.print = function(text, style) {
      var texts = text.split('\n');
      var offset = 0;

      for(index in texts) {
          style.initOffset = offset;
          offset = this.printSingleRow(texts[index], style);
      }
      return offset;
    };

    Text.prototype.printSingleRow = function(text, style) {

      var ctx = this.ctx;
      var DEFAULT = {
        rowWidth: 900,
        marginTop: 10,
        marginLeft: 10,
        lineHeight: 24,
        initOffset: 0,
        fontSize: '16px',
        fontFamily: '微软雅黑',
        color: 'rgb(51,51,51)'
      };
      style = $.extend({}, DEFAULT, style);

      ctx.font = style.fontSize + ' ' + style.fontFamily;
      ctx.fillStyle = style.color;

      for(var i = 1; this.getTrueLength(text) > 0; i++){
        var cutPos = this.cutString(text, style.rowWidth);
        var currentRowText = text.substr(0, cutPos).replace(/^\s+|\s+$/, "");
        var textOffset = i * style.lineHeight + style.initOffset;

        ctx.fillText(currentRowText, style.marginLeft, style.marginTop + textOffset);
        // 剩余字符串
        text = text.substr(cutPos);
      }
      return textOffset;
    };

    /**
     * 获取字串的单位长度（汉字2单位，英文1单位）
     * @param str
     * @return 单位长度
     **/
    Text.prototype.getTrueLength = function(str) {
      var truelen = 0;
      var chLen = 2, enLen = 1;

      for(var i = 0; i < str.length; i++){
        if(str.charCodeAt(i) > 128){
          truelen += chLen;
        }else{
          truelen += enLen;
        }
      }
      return truelen;
    };

    /**
     * 获取字符串应该裁剪的位置 x（tlen）
     * @param text (字串)
     * @param rowWidth (每行的单位长度，应为字符选1单位，汉字算2单位)
     * @return pos(int) 字串应被切割的位置
     ****/
    Text.prototype.cutString = function(text, rowWidth) {
      var len = text.length;
      var pos = len;
      var sumlen = 0;
      var chLen = 2, enLen = 1;

      for(var i = 0;  i< len; i++){
        // text.charCodeAt(i)获取每个字符的charcode
        // charcode > 120 为汉字，算2个单位长度
        if(text.charCodeAt(i) > 128) {
          if(sumlen + chLen < rowWidth) {
            sumlen += chLen;
          } else {
            pos = i;
            break;
          }
        } else {
          if(sumlen + enLen < rowWidth) {
            sumlen += enLen;
          } else {
            pos = i;
            break;
          }
        }
      }
      return pos;
    };
  }();

  !function CanvasCardObject(){

		window.CanvasCard = function(options, multiple = 2) {
			var DEFAULT = {
				el: '.card',
				initStyle: {
					paddingTop: 15,
					paddingLeft: 15,
					backgroundColor: '#ffffff'
				},
				coverSize: {
					width: 0,
					height: 0
				},
				dateStyle: {
					marginBottom: 20,
					title: {
						fontSize: 70,
						color: '#ffffff',
						fontFamily: 'PingFang SC,Microsoft YaHei',
						marginLeft: 20,
						lineHeight: 20,
					},
					text: {
						fontSize: 14,
						color: '#ffffff',
						fontFamily: 'PingFang SC,Microsoft YaHei',
						marginLeft: 15,
						lineHeight: 20,
					}
				},
				sentencesStyle: {
					lineHeight: 24,
		      fontSize: 17,
		      color: 'rgb(51,51,51)',
		      marginLeft: 15,
		      marginTop: 5
				},
				portraitStyle: {
					width: 40,
					marginLeft: 15,
					marginBottom: 20,
				},
				userInfoStyle: {
					fontSize: 14,
					color: 'rgb(51,51,51)',
					fontFamily: 'PingFang SC,Microsoft YaHei',
					marginLeft: 10,
					marginBottom: 35
				},
				canvasSize: {
					width: 375,
					height: 667
				}
			};
			this.multiple = multiple;
			this.options = this._multipleScale($.extend({}, DEFAULT, options), multiple);
			this.ctx = null;
			this.canvas = null;
		};

		CanvasCard.prototype._multipleScale = function(options, multiple){

			options.initStyle.paddingTop *= multiple;
			options.initStyle.paddingLeft *= multiple;

			options.dateStyle.marginBottom *= multiple;
			options.dateStyle.title.fontSize *= multiple;
			options.dateStyle.title.marginLeft *= multiple;
			options.dateStyle.title.lineHeight *= multiple;
			options.dateStyle.text.fontSize *= multiple;
			options.dateStyle.text.marginLeft *= multiple;
			options.dateStyle.text.lineHeight *= multiple;

			options.canvasSize.width *= multiple;
			options.canvasSize.height *= multiple;

			options.portraitStyle.width *= multiple;
			options.portraitStyle.marginLeft *= multiple;
			options.portraitStyle.marginBottom *= multiple;

			options.sentencesStyle.lineHeight *= multiple;
			options.sentencesStyle.fontSize *= multiple;
			options.sentencesStyle.marginLeft *= multiple;
			options.sentencesStyle.marginTop *= multiple;

			options.userInfoStyle.fontSize *= multiple;
			options.userInfoStyle.marginLeft *= multiple;
			options.userInfoStyle.marginBottom *= multiple;

			return options;
		};

		CanvasCard.prototype._imageObject = function(src){
			var img = new Image();
			img.src = src;
			img.crossOrigin = 'Anonymous'; //解决跨域 
			return img;
		};

		CanvasCard.prototype._imgLazy = function($img, callback) {
	  	if($img.complete) {
	  		callback && callback($img);
	  	} else {
	  		$img.onload = function(){
	  			callback && callback($img);
		  	};
		  	$img.error = function() {
		  		console.error('Error: error to load '+$img.src);
		  	}
	  	}
	  };

	  CanvasCard.prototype._tasksDone = function(restTasks, callback) {
	  	if(restTasks === 0) {
	  		callback && callback();
	  	}
	  };

		CanvasCard.prototype._init = function() {
			var that = this;
			var options = that.options;
			
			var canvas = document.createElement('canvas');

			canvas.width = options.canvasSize.width;
			canvas.height = options.canvasSize.height;
			this.canvas = canvas;

			var ctx = canvas.getContext('2d');

			ctx.fillStyle = options.initStyle.backgroundColor;
		  ctx.fillRect(0, 0, canvas.width, canvas.height);
		  this.ctx = ctx;
		};

		CanvasCard.prototype._drawCover = function($img) {
			var that = this;
			var options = that.options;
			var canvas = that.canvas;

			var marginTop = options.initStyle.paddingTop;
	  	var marginLeft = options.initStyle.paddingLeft;

	  	var width = canvas.width - 2 * marginLeft;
	  	var height = Math.floor(width * $img.height / $img.width);
	  	options.coverSize = {
	  		width: width,
	  		height: height
	  	};
	  	that.ctx.drawImage($img, marginLeft, marginTop, width, height);
	  };

	  CanvasCard.prototype._setShadow = function(ctx, x, y, blur, color) {
	  	ctx.shadowOffsetX = x;
			ctx.shadowOffsetY = y;
			ctx.shadowBlur    = blur;
			ctx.shadowColor   = color;
	  };

	  CanvasCard.prototype._clearShadow = function(ctx) {
	  	ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur    = 0;
			ctx.shadowColor   = "rgba(0,0,0,0)";
	  };

	  CanvasCard.prototype._drawDateText = function(sender) {
	  	var DEFAULT = {
	  		title: 'title文字',
	  		text: { 
	  			new: '新历日期',
	  			old: '旧历日期'
	  		}
	  	};
	  	sender = $.extend({}, DEFAULT, sender);

	  	var that = this;
	  	var ctx = that.ctx;
	  	var dateStyle = that.options.dateStyle;
	  	var titleStyle = dateStyle.title;
	  	var textStyle = dateStyle.text;
	  	var offsetFormTop = that.options.coverSize.height + that.options.initStyle.paddingTop;

	  	var marginLeft = titleStyle.marginLeft + that.options.initStyle.paddingLeft;
	  	var marginBottom = titleStyle.lineHeight + 2 * textStyle.lineHeight;
			that._setShadow(ctx, 1, 1, 3, 'rgb(0,0,0)');

	  	ctx.font = titleStyle.fontSize + "px " + titleStyle.fontFamily;
	  	ctx.fillStyle = titleStyle.color;
			ctx.fillText(sender.title, marginLeft, offsetFormTop - marginBottom);

			that._setShadow(ctx, 1, 1, 5, 'rgb(0,0,0)');
			var marginLeft = textStyle.marginLeft + that.options.initStyle.paddingLeft;
			var marginBottom = 2 * textStyle.lineHeight;
			ctx.font = textStyle.fontSize + "px " + textStyle.fontFamily;
			ctx.fillText(sender.text.new, marginLeft, offsetFormTop - marginBottom);

			var marginBottom = textStyle.lineHeight;
			ctx.fillText(sender.text.old,  marginLeft, offsetFormTop - marginBottom);
			that._clearShadow(ctx);
			
	  };

	  CanvasCard.prototype._circleImg = function(ctx, $img, x, y, r) {
			ctx.save();
			var d =2 * r;
			var cx = x + r;
			var cy = y + r;
			ctx.arc(cx, cy, r, 0, 2 * Math.PI);
			ctx.clip();
			ctx.drawImage($img, x, y, d, d);
			ctx.restore();
		};

		CanvasCard.prototype._drawSentences = function(text) {
			var that = this;
			var style = that.options.sentencesStyle;
			var marginTop = style.marginTop + that.options.initStyle.paddingTop + that.options.coverSize.height;
			var txt = new Text(this.ctx);
			txt.print(text, {
				rowWidth: 44,
				lineHeight: style.lineHeight,
	      fontSize: style.fontSize + 'px',
	      marginLeft: style.marginLeft,
	      marginTop: marginTop
			});
		};

	  CanvasCard.prototype._drawPortrait = function($img) {
	  	var that = this;
	  	var canvasSize = that.options.canvasSize;
	  	var portraitStyle = that.options.portraitStyle;
	  	var marginLeft = portraitStyle.marginLeft,
	  			radius = portraitStyle.width / 2,
	  			marginBottom = portraitStyle.marginBottom;

			that._circleImg(this.ctx, $img, marginLeft, canvasSize.height - marginBottom - 2 * radius, radius);
	  };

	  CanvasCard.prototype._drawUserInfo = function(name) {
	  	var that = this;
	  	var ctx = that.ctx;
	  	var canvasSize = that.options.canvasSize;
	  	var portraitStyle = that.options.portraitStyle;
	  	var style = that.options.userInfoStyle;
	  	var marginLeft = style.marginLeft + portraitStyle.marginLeft + portraitStyle.width;
			var marginBottom = style.marginBottom;

	  	ctx.fillStyle = style.color;
			ctx.font = style.fontSize + "px " + style.fontFamily;
			ctx.fillText(name, marginLeft, canvasSize.height - marginBottom);
	  };

	  CanvasCard.prototype.create = function(sender) {
			var that = this;
			var options = that.options;
			sender = $.extend({}, sender);
			var restTasks = 2;

			if(typeof sender.extend === 'object') {
				that.options = $.extend({}, that.options, sender.extend);
			}

			that._init();

			var cover = that._imageObject(sender.cover);
			var portrait = that._imageObject(sender.portrait);

			that._imgLazy(cover, function drawCoverBeforeLoad($img){
				that._drawCover($img);
				that._drawDateText(sender.dateText);

				that._drawSentences(sender.sentences);

				that._tasksDone(--restTasks, function(){
					sender.callback && sender.callback.call(that, that.canvas);
				});
			});

			that._imgLazy(portrait, function drawPortraitBeforeLoad($img) {
				that._drawPortrait($img);
				that._drawUserInfo(sender.nickname);
				that._tasksDone(--restTasks, function(){
					sender.callback && sender.callback.call(that, that.canvas);
				});
			});
		};
	}();