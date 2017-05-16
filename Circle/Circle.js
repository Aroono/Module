(function($,w) {
    var dic = {};
    var defaults = {
            size: 100,
            trackColor: "#DDD",
            barColor: "#27C",
            lineWidth: 3,
            lineCap: "square",
            animate: false,
            onStart: $.noop,
            onStop: $.noop
    };
    var Circle = function () {};
    Circle.prototype = {
        Init : function () {
            this.EvtSet();
        },
        PageShow : function (options) {
            if (!this.isInit) {
                this.Init();
                this.isInit = true;
            }
            var uid = options.domStr;
            if (dic[uid]) clearInterval(dic[uid].animation); //清空历史定时器
            dic[uid] = $.extend({}, defaults, options);
            if (dic[uid].lineCap == "butt") dic[uid].lineCap = "flat";
            this.PagePaintDetail(uid);
        },
        PagePaintDetail : function (uid) {
            var dom = $("body").find("[m-Circle='" + dic[uid].domStr + "']"); dic[uid].percent = parseInt(dom.data("percent"), 10);
            var canvas = $("<canvas width='" + dic[uid].size + "' height='" + dic[uid].size + "'></canvas>").get(0);
            dom.append(canvas);
            //Canvas兼容IE7、8
            if (!document.createElement("canvas").getContext) {
                this.PagePaintDetail_G_vmlCanvasManager(canvas);
            }
            dic[uid].ctx = canvas.getContext("2d");
            dic[uid].ctx.translate(dic[uid].size / 2, dic[uid].size / 2);
            dom.addClass("circleChart").css({
                width: dic[uid].size,
                height: dic[uid].size
            });
            this.PagePaintDetail_SetPercent(uid);
        },
        PagePaintDetail_SetPercent : function (uid) {
            dic[uid].onStart();
            if (dic[uid].animate === false) {
                return this.PagePaintDetail_DrawLine(uid, dic[uid].percent);
            } else {
                return this.PagePaintDetail_AnimateLine(uid);
            }
        },
        PagePaintDetail_DrawLine : function (uid, percent) {
            var offset = dic[uid].size / 2 - dic[uid].lineWidth / 2;
            var opercent = (percent == 0 || percent == 100) ? percent : (100 - percent);
            this.PagePaintDetail_RenderBackground(uid);
            if (percent == 0 && !document.createElement("canvas").getContext ) return;
            else {
                dic[uid].ctx.strokeStyle = dic[uid].barColor;
                dic[uid].ctx.lineCap = dic[uid].lineCap;
                dic[uid].ctx.save();
                dic[uid].ctx.rotate(-Math.PI / 2);
                dic[uid].ctx.beginPath();
                dic[uid].ctx.arc(0, 0, offset, 0, Math.PI * 2 * opercent / 100, true);
                dic[uid].ctx.stroke();
                return dic[uid].ctx.restore();
            }
            
        },
        PagePaintDetail_AnimateLine : function (uid) {
            var c = this;
            var currentStep = 0, fps = 30; var steps = fps * dic[uid].animate / 1000;
            if (dic[uid].animation) {
                clearInterval(dic[uid].animation);
                dic[uid].animation = false;
            }
            return dic[uid].animation = setInterval(function () {
                dic[uid].ctx.clearRect(-dic[uid].size / 2, -dic[uid].size / 2, dic[uid].size, dic[uid].size);
                c.PagePaintDetail_RenderBackground(uid);
                c.PagePaintDetail_DrawLine(uid, c.Evtset_EaseInOutQuad(currentStep, 0, dic[uid].percent, steps));
                currentStep++;
                if ((currentStep / steps) > 1) {
                    clearInterval(dic[uid].animation);
                    dic[uid].animation = false;
                    return dic[uid].onStop();
                }
            }, 1000 / fps);
        },
        PagePaintDetail_RenderBackground : function (uid) {
            var data = dic[uid];
            if (data.trackColor !== false) {
                var offset = data.size / 2 - data.lineWidth / 2;
                dic[uid].ctx.beginPath();
                dic[uid].ctx.arc(0, 0, offset, 0, Math.PI * 2, true);
                dic[uid].ctx.closePath();
                dic[uid].ctx.strokeStyle = data.trackColor;
                dic[uid].ctx.lineWidth = data.lineWidth;
                return dic[uid].ctx.stroke();
            }
        },
        PagePaintDetail_G_vmlCanvasManager: function (el) {
            if (!el.getContext) {
                el.getContext = function() {
                    return new CanvasRenderingContext2D(el);
                };
                el.innerHTML = '';
                var attrs = el.attributes;
                if (attrs.width && attrs.width.specified) el.style.width = attrs.width.nodeValue + "px";
                else el.width = el.clientWidth;
                if (attrs.height && attrs.height.specified) el.style.height = attrs.height.nodeValue + "px";
                else el.height = el.clientHeight;
              }
              return el;
        },
        Evtset_EaseInOutQuad : function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            else return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        EvtSet : function () {
            
        }
    };

    var CanvasRenderingContext2D = function (obj) { this.Init(obj); };
    CanvasRenderingContext2D.prototype = {
        Init : function (obj) {
            this.EvtSet();
            this.PageShow(obj);
        },
        PageShow : function (obj) {
            this.matrix = this.Evtset_CreateMatrix();
            this.mStack = [];
            this.aStack = [];
            this.currentPath = [];
            this.element = $("<div></div>").css({"width":$(obj).attr("width") + 'px', "height":$(obj).attr("height") + 'px', "position":"absolute"});
            $(obj).append(this.element);
            this.arcScaleX = 1;
            this.arcScaleY = 1;
        },
        clearRect : function () {
            this.element.empty();
        },
        beginPath : function () {
            this.currentPath = [];
        },
        arc : function (aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
            var ms = Math.sin, mc = Math.cos;
            aRadius *= 10; 
            var arcType = aClockwise ? "at" : "wa";
            var xStart = aX + mc(aStartAngle) * aRadius - 5;
            var yStart = aY + ms(aStartAngle) * aRadius - 5;
            var xEnd = aX + mc(aEndAngle) * aRadius - 5;
            var yEnd = aY + ms(aEndAngle) * aRadius - 5;
            if (xStart == xEnd && !aClockwise) xStart += 0.125; 
            var p = this.Evtset_GetCoords(aX, aY);
            var pStart = this.Evtset_GetCoords(xStart, yStart);
            var pEnd = this.Evtset_GetCoords(xEnd, yEnd);
            this.currentPath.push({type: arcType,x: p.x,y: p.y,radius: aRadius,xStart: pStart.x,yStart: pStart.y,xEnd: pEnd.x,yEnd: pEnd.y});
        },
        stroke : function () {
            var lineStr = []; var mr = Math.round;
            lineStr.push("<g_vml_:shape", " filled='false'", " stroked='true'",
                        " style='position:absolute;width:10px;height:10px;'",
                        " coordorigin='0 0' coordsize='100 100'", " path='");
            for (var i = 0; i < this.currentPath.length; i++) {
                var p = this.currentPath[i]; var c;
                switch (p.type) {
                    case "moveTo":
                        c = p; lineStr.push(" m ", mr(p.x), ",", mr(p.y));
                        break;
                    case "lineTo":
                        lineStr.push(" l ", mr(p.x), ",", mr(p.y));
                        break;
                    case "close":
                        lineStr.push(" x "); p = null;
                        break;
                    case "bezierCurveTo":
                        lineStr.push(" c ",
                                mr(p.cp1x), ",", mr(p.cp1y), ",",
                                mr(p.cp2x), ",", mr(p.cp2y), ",",
                                mr(p.x), ",", mr(p.y));
                        break;
                    case "at":
                    case "wa":
                        lineStr.push(" ", p.type, " ",
                                mr(p.x - this.arcScaleX * p.radius), ",",
                                mr(p.y - this.arcScaleY * p.radius), " ",
                                mr(p.x + this.arcScaleX * p.radius), ",",
                                mr(p.y + this.arcScaleY * p.radius), " ",
                                mr(p.xStart), ",", mr(p.yStart), " ",
                                mr(p.xEnd), ",", mr(p.yEnd));
                        break;
                }
            }
            lineStr.push(" '>");
            lineStr.push("<g_vml_:stroke",
                    " endcap='", this.lineCap, "'",
                    " weight='", this.lineWidth, "px'",
                    " color='", this.strokeStyle, "' />");
            lineStr.push("</g_vml_:shape>");
            var html = $(this.element).html(); 
            this.Evtset_SetNamespaces();
            $(this.element).html(html + lineStr.join(""));
        },
        closePath : function () {
            this.currentPath.push({type: "close"});
        },
        save : function () {
            var o = {};
            this.Evtset_CopyState(this, o);
            this.aStack.push(o);
            this.mStack.push(this.matrix);
            this.matrix = this.Evtset_MatrixMultiply(this.Evtset_CreateMatrix(), this.matrix);
        },
        restore : function () {
            this.Evtset_CopyState(this.aStack.pop(), this);
            this.matrix = this.mStack.pop();
        },
        translate : function (aX, aY) {
            var m = [
                [1,  0,  0],
                [0,  1,  0],
                [aX, aY, 1]
            ];
            this.Evtset_SetMatrix(this, this.Evtset_MatrixMultiply(m, this.matrix));
        },
        rotate : function (aRot) {
            var c = Math.cos(aRot), s = Math.sin(aRot);
            var m = [
                [c,  s, 0],
                [-s, c, 0],
                [0,  0, 1]
            ];
            this.Evtset_SetMatrix(this, this.Evtset_MatrixMultiply(m, this.matrix));
        },
        Evtset_GetCoords : function (aX, aY) {
            var m = this.matrix; var Z = 10, Z2 = 5;
            return {
                x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
                y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
            }
        },
        Evtset_CreateMatrix : function () {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];
        },
        Evtset_MatrixMultiply : function (m1, m2) {
            var result = this.Evtset_CreateMatrix();
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    var sum = 0;
                    for (var z = 0; z < 3; z++) {
                        sum += m1[x][z] * m2[z][y];
                    }
                    result[x][y] = sum;
                }
            }
            return result;
        },
        Evtset_CopyState : function (m1, m2) {
            m2.lineCap       = m1.lineCap;
            m2.lineWidth     = m1.lineWidth;
            m2.strokeStyle   = m1.strokeStyle;
            m2.arcScaleX     = m1.arcScaleX;
            m2.arcScaleY     = m1.arcScaleY;
        },
        Evtset_SetMatrix : function (o, m) {
            if (!this.Evtset_MatrixIsFinite(m)) return;
            o.matrix = m;
        },
        Evtset_MatrixIsFinite : function (m) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 2; k++) {
                    if (!isFinite(m[j][k]) || isNaN(m[j][k])) return false;
                }
            }
            return true;
        },
        Evtset_SetNamespaces : function () {
            if (/MSIE/.test(navigator.userAgent) && !window.opera && !document.createElement("canvas").getContext) {
                if (!document.namespaces["g_vml_"]) document.namespaces.add("g_vml_", "urn:schemas-microsoft-com:vml","#default#VML");
                if (!document.namespaces["g_o_"]) document.namespaces.add("g_o_", "urn:schemas-microsoft-com:office:office","#default#VML");
                if (!document.styleSheets["ex_canvas_"]) document.createStyleSheet().cssText = "canvas{display:inline-block;}" + "g_vml_\\:*{behavior:url(#default#VML)};g_o_\\:*{behavior:url(#default#VML)}";
            }
        },
        EvtSet : function () {
            var c = this;
            $(document).ready(function () {
                c.Evtset_SetNamespaces();
            })
        }
    };

    var CircleTool = new Circle();
    fw.Circle = {
        Init : function (options) {
            CircleTool.PageShow(options);      
        },
        Refresh : function (options) {
            
        }
    };
})(jQuery,window);
