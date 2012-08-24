var LayoutInput = function (ele, session) {
    this.inCompostion = false;
    this.ele = ele;
    this.session = session;
    ele.addEventListener('input', this.input.bind(this));
    ele.addEventListener('keydown', this.keydown.bind(this));
    ele.addEventListener('keyup', this.keyup.bind(this));
    ele.addEventListener('copy', this.copy.bind(this));
    ele.addEventListener('cut', this.cut.bind(this));
    ele.addEventListener('compositionstart', this.compositionstart.bind(this));
    ele.addEventListener('compositionend', this.compositionend.bind(this));
};

LayoutInput.prototype.compositionstart = function () {
    this.inCompostion = true;
};

LayoutInput.prototype.compositionend = function () {
    this.inCompostion = false;
};

LayoutInput.prototype.focus = function () {
    //去掉selection
    this.ele.focus();
    this.ele.select();
};

LayoutInput.prototype.input = function () {
    if (!this.inCompostion) {
    	this.session.add(this.ele.value);
        var _ele = this.ele;
        setTimeout(function () {_ele.select();}, 0);
    }
};

LayoutInput.prototype.keydown = function (e) {
    var _keyCode = e.keyCode;
    var _session = this.session;
    switch (_keyCode) {
    case 8 :
        //backspace
        _session.remove();
        break;
    case 9 :
        //tab
        _session.indent();
        e.stopPropagation();
        e.preventDefault();
        break;
    case 16 :
        //shift
        if (!_session.shiftOn) {
            _session.shiftOn = 1;
            if (0 == _session.selection.status) {
                _session.selection.start(_session.position);
            }
            else if (2 == _session.selection.status) {
                _session.selection.status = 1;
            }
        }
        break;
    case 17 :
        //ctrl
        _session.ctrlOn = 1;
        break;
    case 37 :
        //left
        _session.cursorMoveLeft();
        e.stopPropagation();
        e.preventDefault();
        break;
    case 38 :
        //up
        _session.cursorMoveUp();
        e.stopPropagation();
        e.preventDefault();
        break;
    case 39 :
        //right
        _session.cursorMoveRight();
        e.stopPropagation();
        e.preventDefault();
        break;
    case 40 :
        //down
        _session.cursorMoveDown();
        e.stopPropagation();
        e.preventDefault();
        break;
    case 45 :
        //insert
        _session.insertOn = _session.insertOn ? 0 : 1;
        break;
    case 46 :
        //delete
        _session.remove(1);
        break;
    case 65 :
        //a
        if (1 == _session.ctrlOn) {
            _session.selectAll();
            e.stopPropagation();
            e.preventDefault();
        }
        break;
    }
};

LayoutInput.prototype.keyup = function (e) {
    var _keyCode = e.keyCode;
    var _session = this.session;
    switch (_keyCode) {
    case 16 :
        //shift
        this.session.shiftOn = 0;
        if (1 == _session.selection.status) {
            _session.selection.end();
        }
        break;
    case 17 :
        //ctrl
        this.session.ctrlOn = 0;
        break;
    }
};

LayoutInput.prototype.copy = function () {
    var copyText = this.session.getSelectedText();
    this.ele.value = copyText;
    this.ele.select();
};

LayoutInput.prototype.cut = function () {
    var copyText = this.session.getSelectedText();
    this.ele.value = copyText;
    this.ele.select();
    this.session.remove();
};