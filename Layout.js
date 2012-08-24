var Layout = function (ctn, session) {
     var _editor,
    _layout,
    _gutter,
    _marker,
    _content,
    _autocomplete,
    _textinput,
    _cursor,
    _ctn = ctn;

    _editor = createDiv('editor');
    _layout = createDiv('layout');
    _gutter = createDiv('gutter');
    _marker = createDiv('marker');
    _content = createDiv('content');
    _autocomplete = createDiv('ac');
    _textinput = document.createElement('textarea');
    _textinput.id = "__rb_textinput__";
    _cursor = createDiv('cursor');
    _layout.appendChild(_marker);
    _layout.appendChild(_content);
    _layout.appendChild(_autocomplete);
    _layout.appendChild(_textinput);
    _layout.appendChild(_cursor);
    _editor.appendChild(_gutter);
    _editor.appendChild(_layout);
    _ctn.appendChild(_editor);
    
    if (0 < _ctn.offsetHeight) {//如果有固定高度，就用固定高度
        _editor.style.height = _ctn.offsetHeight + 'px';
        _layout.style.width = (_editor.offsetWidth - opts.offsetLeft) + 'px';
    }
    else {//如果没有，就用窗口高度
        var _margin;
        _editor.style.height = document.documentElement.clientHeight + 'px';
        _layout.style.width = (_editor.offsetWidth - opts.offsetLeft) + 'px';
        
        //在onresize时重新调整高度
        window.onresize = function () {
            _editor.style.height = document.documentElement.clientHeight + 'px';
            _layout.style.width = (_editor.offsetWidth - opts.offsetLeft) + 'px';
        };
    }
    _gutter.style.width = opts.offsetLeft + 'px';
    _layout.style.left = opts.offsetLeft + 'px';
    _ctn.style.overflow = 'hidden';
    
    //光标闪烁
    this.cursorLoop = setInterval(function () {
        var _style = _cursor.style;
        if ('hidden' == _style.visibility) {
            _style.visibility = 'visible';
        }
        else {
            _style.visibility = 'hidden';
        }
    }, opts.cursorTime);
    
    this.editor = _editor;
    this.session = session;
    this.gutter = new LayoutGutter(_gutter, session);
    this.marker = new LayoutMarker(_marker, session);
    this.content = new LayoutText(_content, session);
    this.ac = _autocomplete;
    this.cursor = new LayoutCursor(_cursor, session);
    this.textinput = new LayoutInput(_textinput, session);
    this.layout = _layout;
    function createDiv(id) {
        var _div;
        _div = document.createElement('div');
        _div.id = "__rb_" + id + "__";
        return _div;
    }
    this.measureCharSize();
    
    _layout.addEventListener('mousedown', this.mousedown.bind(this));
    _layout.addEventListener('dblclick', this.dblclick.bind(this));
};


Layout.prototype.mouseup = function(e) {
    this.inFocus = false;
    var _layout = this;
    var x = e.pageX - this.content.clientRect.left;
    var y = e.pageY - this.content.clientRect.top;
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    //_layout.cursorMoveTo(x, y, e.srcElement);
    _layout.cursorMoveTo(x, y);
    _layout.textinput.focus();
    document.removeEventListener('mouseup', this.mouseup.bind(this), true);
    document.removeEventListener('mousemove', this.mousemove.bind(this), true);
    e.stopPropagation();
    e.preventDefault();
};

Layout.prototype.mousedown = function (e) {
    //TODO SetCapture用法
    this.inFocus = true;
    var _selection = this.session.selection;
    var x = e.pageX - this.content.clientRect.left;
    var y = e.pageY - this.content.clientRect.top;
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    var _pos = this.session.getPositionByOffset(x, y);
    if (_selection.hasHead) {
        if (this.session.shiftOn) {
            _selection.update(_pos);
        }
        else {
            _selection.clear(); 
        }
    }
    else {
        _selection.start(_pos);
    }
    //TODO 不能干扰整个document的鼠标事件
    document.addEventListener('mouseup', this.mouseup.bind(this), true);
    document.addEventListener('mousemove', this.mousemove.bind(this), true);
    e.stopPropagation();
    e.preventDefault();
};

Layout.prototype.mousemove = function (e) {
    //如果是按下状态
    if (this.inFocus && this.session.selection.hasHead) {
        var x = e.pageX - this.content.clientRect.left;
        var y = e.pageY - this.content.clientRect.top;
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        var _pos = this.session.getPositionByOffset(x, y);
        this.session.selection.update(_pos);
        e.stopPropagation();
        e.preventDefault();
    }
};

Layout.prototype.dblclick = function (e) {
    var x = e.pageX - this.content.clientRect.left;
    var y = e.pageY - this.content.clientRect.top;
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    this.session.selectWord(x, y);
    e.stopPropagation();
    e.preventDefault();
};


Layout.prototype.measureCharSize = function () {
    var _mNode = document.createElement('div');
    var _style = "width:auto; height:auto;left:4000px; top:4000px; visibility:hidden; position:absolute; overflow:visible; white-space: nowrap;";
    _mNode.style.cssText = _style;
    _mNode.innerHTML = new Array(101).join('xY');
    this.editor.appendChild(_mNode);
    this.charW = parseInt(_mNode.offsetWidth / 200);
    this.charH = _mNode.offsetHeight;
};

Layout.prototype.cursorAdjust = function (pos) {
    this.cursor.adjustTo(pos, this.charW, this.charH);
};

//TODO此处做括号匹配判断
Layout.prototype.cursorMoveTo = function (x, y) {
    var pos = this.session.getPositionByOffset(x, y);
    this.session.setPosition(pos);
    this.activeLine = this.getActiveLine(pos.y);
    this.cursorAdjust(pos);
    this.session.checkBracket();
    return pos;
};

Layout.prototype.getActiveLine = function (row) {
    this.activeLine = this.content.getActiveLine(row);
    return this.activeLine;
};

Layout.prototype.createNewLine = function () {
	//添加行号
    this.gutter.addLineNum();
	this.activeLine = this.content.newLine(this.activeLine, this.charH);
};

Layout.prototype.updateLine = function (html) {
    this.activeLine.innerHTML = html;
};

Layout.prototype.activeLineMoveUp = function () {
    this.activeLine = this.activeLine.previousSibling;
};

Layout.prototype.activeLineMoveDown = function () {
    this.activeLine = this.activeLine.nextSibling;
};

Layout.prototype.deleteLine = function (direction) {
    var _newActiveLine;
    var _activeLine = this.activeLine;
    _newActiveLine = direction ? _activeLine.previousSibling : _activeLine.nextSibling;
    this.content.deleteLine(_activeLine);
    this.gutter.delLineNum(1);
    this.activeLine = _newActiveLine;
    return this.activeLine;
};

Layout.prototype.deleteLines = function (row, num) {
    var _activeLine, _newLine;
    this.activeLine = this.getActiveLine(row);
    _activeLine = this.activeLine.nextSibling;
    for (var i = 1; i <= num; i++) {
        _newLine = _activeLine.nextSibling;
        this.content.deleteLine(_activeLine);
        _activeLine = _newLine;
    }
    this.gutter.delLineNum(num);
    return this.activeLine;
};

Layout.prototype.getScrollTop = function () {
    return this.layout.scrollTop;
};

Layout.prototype.highlightBracket = function (open, close) {
    this.marker.clear();
    this.marker.bracketsBox(this.charW, this.charH, open, close);
};