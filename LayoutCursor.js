var LayoutCursor = function (ele, session) {
    this.ele = ele;
    this.session = session;
};

LayoutCursor.prototype.adjustTo = function (pos, charW, charH) {
    var _style = "left: " + pos.s * charW + "px;";
    _style += "top: " + pos.y * charH + "px;";
    _style += "height: " + charH + "px;";
    this.ele.style.cssText = _style;
};