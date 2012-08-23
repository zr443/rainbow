var LayoutText = function(ele, session) {
    this.ele = ele;
    this.inFocus = false;
    this.session = session;
    this.clientRect = ele.getBoundingClientRect();
};


/*
 * @Obsolete
LayoutText.prototype.mouseout = function (e) {
    if (this.inFocus && (e.pageX < this.clientRect.left || e.pageX > this.clientRect.right || e.pageY < this.clientRect.top || e.pageY > this.clientRect.bottom)) {
        var _session = this.session;
        var _pos = _session.selection.anchor;
        _session.setPosition(_pos);
        _session.layout.cursorAdjust(_pos);
        this.inFocus = false;
    }
};
*/

LayoutText.prototype.getActiveLine = function(row) {
    var _nodes = this.ele.childNodes;
    if (row < 0) {
        row = 0;
    }
    else if (row > _nodes.length) {
        row = _nodes.length;
    }
    return _nodes[row];
};

LayoutText.prototype.newLine = function(activeLine, charH) {
    var new_div = document.createElement('div');
    new_div.className = 'line';
    new_div.style.height = charH + 'px';
    if (activeLine) {
        this.ele.insertBefore(new_div, activeLine.nextSibling);
    } else {
        this.ele.appendChild(new_div);
    }
    return new_div;
};

LayoutText.prototype.deleteLine = function(line) {
    this.ele.removeChild(line);
};