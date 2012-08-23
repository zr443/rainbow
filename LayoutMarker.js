var LayoutMarker = function (ele, session) {
    this.ele = ele;
    this.session = session;
};

LayoutMarker.prototype.clear = function () {
    this.ele.innerHTML = '';
};
LayoutMarker.prototype.createSelection = function (head, tail) {
    var _layout = this.session.layout, 
    _HY = head.y,
    _TY = tail.y,
    _charW = _layout.charW,
    _charH = _layout.charH,
    _width,
    _div,
    _left;
    _left = head.s * _charW; 
    if (_HY == _TY) {
        _width = (tail.s - head.s) * _charW;
        _div = document.createElement('div');
        _div.className = "editor_selection";
        _div.style.cssText = 'height:' 
            + _charH 
            + 'px;left:' 
            + _left 
            + 'px; width:' 
            + _width 
            + 'px; top:' 
            + _HY * _charH
            + 'px';
        this.ele.appendChild(_div);
    }
    else {
        _width = this.ele.offsetWidth - _left;
        _div = document.createElement('div');
        _div.className = "editor_selection";
        _div.style.cssText = 'height:' 
            + _charH 
            + 'px;left:' 
            + _left 
            + 'px; width:' 
            + _width 
            + 'px; top:' 
            + _HY * _charH
            + 'px';
        this.ele.appendChild(_div);
        
        for (var i = _HY + 1; i < _TY; i++) {
            var _div = document.createElement('div');
            _div.className = "editor_selection";
            _div.style.cssText = 'height:' 
                + _charH 
                + 'px;width:100%; top:' 
                + i * _charH
                + 'px';
            this.ele.appendChild(_div);
        }
        
        var _div = document.createElement('div');
        _div.className = "editor_selection";
        _div.style.cssText = 'height:' 
            + _charH 
            + 'px;width:' 
            + tail.s * _charW
            +'px; top:' 
            + _TY * _charH
            + 'px';
        this.ele.appendChild(_div);
    }
};