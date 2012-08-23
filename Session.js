/**
 * @author derongzeng
*/
var Session = function (elementId, opt) {
    this.layout = new Layout(document.getElementById(elementId), this);
    this.position = {
        x : 0,
        y : -1,
        s : 0
    };
    this.rows = [];
    this.tokenizer = new Tokenizer(RuleJavascript, this.layout.charW);
    this.selection = new Selection(this.layout.marker);
    this.shiftOn = 0;
    this.ctrlOn = 0;
    this.insertOn = 0;
    this.opt = opt || {};
};

Session.prototype.begin = function () {
    this.newLine();
    this.layout.textinput.focus();
};

Session.prototype.setPosition = function (pos) {
    this.position.x = pos.x;
    this.position.y = pos.y;
    this.position.s = pos.s;
    return this.position;
};

Session.prototype.getPositionByCol = function (x, y) {
    var _s = 0;
    var _row = this.rows[y];
    for (var i = 0; i < x; i++) {
        _s += this.tokenizer.checkWideChar(_row[i]);
    }
    this.position.x = x;
    this.position.y = y;
    this.position.s = _s;
    return this.position;
};

Session.prototype.getPositionByOffset = function (x, y) {
    var _len = this.rows.length,
    _layout = this.layout,
    _col = 0,
    _spike = 1,
    _length = 0,
    _cLine,
    _cLen,
    _row,
    _half,
    _pos = {};
    var cWidth = _layout.charW;
    var cHeight = _layout.charH;
    x = Math.round(x);
    y = Math.round(y) + _layout.getScrollTop();
    
    _row = Math.floor(y / cHeight);
    _half = Math.round(cWidth / 2);
    
    if (0 == _len) {
        return {x : 0, y : 0, s : 0};
    }
    
    if (_row >= _len) {
        _row = _len - 1;
    }
    _cLine = this.rows[_row];
    _cLen = _cLine.length;
    
    for (var i = 0; i < _cLen; i++) {
        _spike = this.tokenizer.checkWideChar(_cLine[i]);
        _length += _spike * cWidth;
        _col += _spike;
        if (_length >= x) {
            //单字符、宽字符或缩进 右半部分
            if ((2 == _spike && _length - cWidth <= x) || (1 == _spike && _length - _half <= x) || (4 == _spike && (_length - 2) * cWidth <= x)) {
                return {x : i + 1, y : _row, s : _col};
            }
            else {
                return {x : i, y : _row, s : _col - _spike};
            }
        }
    }
    _pos.x = i;
    _pos.y = _row;
    _pos.s = _col;
    return _pos;
};

Session.prototype.newLine = function () {
    var position = this.position;
    var rows = this.rows;
    //如果在文字中间换行
    if (0 <= position.y && position.x < rows[position.y].length) {
        var old_text = rows[position.y].substring(0, position.x);
        var new_text = rows[position.y].substring(position.x);
        rows[position.y] = old_text;
        addChars(rows[position.y]);
        position.y++;
        rows.splice(position.y, 0, new_text);
        addChars(rows[position.y]);
    }
    //如果在文字末尾换行
    else {
        position.y++;
        rows.splice(position.y, 0, '');
    }
    position.x = position.s = 0;
    this.layout.cursorAdjust(position);
    this.layout.createNewLine();
};

Session.prototype.add = function (text) {
    if (0 == text.length) return;
    //TODO如果有选中内容
    var _pos = this.position,
    _chars = text.split(/\r\n|\r|\n/),
    _rows = this.rows,
    _lineNum,
    _n = 1,
    _charL,
    _charR;
    _lineNum = _chars.length;
    //原光标前内容
    _charL = _rows[_pos.y].substring(0, _pos.x);
    //原光标后内容
    _charR = _rows[_pos.y].substring(_pos.x);
    //将输入的第一行内容添加在当前行，光标前内容的后面。
    _rows[_pos.y] = _charL + _chars[0];
    //位置移动
    _pos.x += _chars[0].length;
    //如果是多行
    if (1 < _lineNum) {
        //输入多行中的第一行到html
        this.render(_rows[_pos.y]);
        while (_n < _lineNum) {
            var _row = _chars[_n];
            //新建一行，光标在行首
            this.newLine();
            //将数组内容添加至此行
            _rows[_pos.y] = _row;
            //输入到html
            this.render(_row);
            _pos.x += _row.length;
            _n ++;
            //new_line;
        }
    }
    //将原光标后的内容，赋在现光标后面。
    _rows[_pos.y] = _rows[_pos.y] + _charR;
    this.render(_rows[_pos.y]);
    _pos = this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(_pos);
};

Session.prototype.remove = function (dir) {
    //如果有选择的状态，就删除选区
    if (this.selection.isExpanded()) {
        this.removeMulti(this.selection.head, this.selection.tail);
        this.selection.clear();
        return;
    }
    
    var _pos = this.position, _deletedChar, _rest;
    if (1 == dir) {
        if (this.rows[_pos.y].length == _pos.x) {
            if (this.rows.length - 1 == _pos.y) {
                //已至末尾
                return false;
            }
            else {
                var _y = _pos.y + 1;
                this.layout.getActiveLine(_y);
                _rest = this.rows[_y];
                console.log(_rest);
                _deletedChar = String.fromCharCode(13);
                this.layout.deleteLine(1);
                this.rows.splice(_y, 1);
                _rest = this.rows[_pos.y] + _rest;
            }
        }
        else {
            var _row = this.rows[_pos.y];
            _rest = _row.substring(0, _pos.x) + _row.substring(_pos.x + 1);
            _deletedChar = _row.charAt(_pos.x + 1);
        }
    }
    else {
        if (0 == _pos.x) {
            if (0 == _pos.y) {
                return false;
            }
            else {
                _rest = this.rows[_pos.y];
                _deletedChar = String.fromCharCode(13);
                this.layout.deleteLine(1);
                this.rows.splice(_pos.y, 1);
                _pos.y --;
                _rest = this.rows[_pos.y] + _rest;
                _pos.x = this.rows[_pos.y].length;
            }
        }
        else {
            var _row = this.rows[_pos.y];
            _rest = _row.substring(0, _pos.x - 1) + _row.substring(_pos.x);
            _deletedChar = _row.charAt(_pos.x - 1);
            _pos.x --;
        }
    }
    this.rows[_pos.y] = _rest;
    this.render(_rest);
    this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(this.position);
    //undoManager.push(_deleted_text, 'delete', {head : {row : position.row, col : position.col}});
};

Session.prototype.removeMulti = function (head, tail) {
    var _hy = head.y, _ty = tail.y, _rest, _deletedCont;
    var _hRow = this.rows[_hy];
    var _tRow = this.rows[_ty];
    if (_hy == _ty) {
        _rest = _hRow.substring(0, head.x) + _hRow.substring(tail.x);
        _deletedCont = _hRow.substring(head.x + 1, head.x - 1);
    }
    
    else {
        _rest = _hRow.substring(0, head.x) + _tRow.substring(tail.x);
        _deletedCont = _hRow.substring(head.x);
        var _lines = _ty - _hy;
        var _enter = String.fromCharCode(13);
        if (_lines > 1) {
            //从开头的下一行开始，到结尾的上一行，都删掉
            _deletedCont += _enter + this.rows.splice(_hy + 1, _lines - 1).join(_enter);
        }
        _deletedCont += _enter + _tRow.substring(0, tail.x);
        //去掉最后一行
        this.rows.splice(_hy, 1);
        this.layout.deleteLines(_hy, _lines);
    }
    this.rows[_hy] = _rest;
    this.render(_rest);
    this.getPositionByCol(head.x, head.y);
    this.layout.cursorAdjust(this.position);
    //undoManager.push(_deleted_text, 'delete', {head : {row : position.row, col : position.col}});
};

Session.prototype.indent = function () {
    if (1 == this.shiftOn) {
        this.outdent();
        return false;
    }
    var _pos = this.position,
    _x = _pos.x;
    if (!this.opt.space_indent) {
        indent_str = Array(5).join(' ');
        _length = 4;
    }
    else {
        indent_str = '\t';
        _length = 1;
    }
    if (this.selection.isExpanded()) {
        for (var i = this.selection.head.y; i <= this.selection.tail.y; i++) {
            this.layout.getActiveLine(i);
            this.indentLine(indent_str, i, 0);
        }
        var _start = {
            x : this.selection.head.x + _length,
            y : this.selection.head.y,
            s : this.selection.head.s + 4
        };
        var _end = {
            x : this.selection.tail.x + _length,
            y : this.selection.tail.y,
            s : this.selection.tail.s + 4
        };
        this.selection.start(_start);
        this.selection.update(_end);
    }
    else {
        this.indentLine(indent_str, _pos.y, _x);
    }
    _pos.x += _length;
    _pos.s += 4;
    this.layout.cursorAdjust(_pos);
};

Session.prototype.indentLine = function (indent_str, y, x) {
    var _row = this.rows[y];
    _row = _row.substring(0, x) + indent_str +  _row.substring(x);
    this.rows[y] = _row;
    this.render(_row);
};

Session.prototype.outdent = function () {
    var _pos = this.position;
    if (this.selection.isExpanded()) {
        var _h_y = this.selection.head.y,
        _t_y = this.selection.tail.y,
        _h_outdent_x = _t_outdent_x = _outdent_x = 0;
        this.layout.getActiveLine(_h_y);
        _h_outdent_x = this.outdentLine(_h_y);
        var _start = {
            x : this.selection.head.x,
            y : this.selection.head.y,
            s : this.selection.head.s
        };
        if (0 < _h_outdent_x) {
            _start.x = _start.x - _h_outdent_x;
            _start.s = _start.s - 4;
        }
        if (_t_y != _h_y) {
            this.layout.getActiveLine(_t_y);
            _t_outdent_x = this.outdentLine(_t_y);
        }
        else {
            _t_outdent_x = _h_outdent_x;
        }
        var _end = {
            x : this.selection.tail.x,
            y : this.selection.tail.y,
            s : this.selection.tail.s
        };
        if (0 < _t_outdent_x) {
            _end.x = _end.x -  - _t_outdent_x;
            _end.s = _end.s - 4;
        }
        for (var i = _h_y + 1; i < _t_y ; i++) {
            this.layout.getActiveLine(i);
            this.outdentLine(i);
        }
        this.selection.start(_start);
        this.selection.update(_end);
        _outdent_x = (_h_y == _pos.y) ? _h_outdent_x : _t_outdent_x;
    }
    else {
        _outdent_x = this.outdentLine( _pos.y);
    }
    if (0 < _outdent_x) {
        _pos.x -= _outdent_x;
        _pos.s -= 4;
        this.layout.cursorAdjust(_pos);
    }
};

//减少缩进不管是空格还是Tab，都减少
Session.prototype.outdentLine = function (y) {
    var _row = this.rows[y],
    _length = _row.length;
    _row = _row.replace(/^(\t|    )/, '');
    this.rows[y] = _row;
    this.render(_row);
    return (_length - _row.length);
};

Session.prototype.render = function (line) {
    var _tokens = this.tokenizer.getTokens(line);
    var _len = _tokens.length;
    var _htmlStr = '';
    for (var i = 0; i < _len; i ++) {
        _htmlStr += _tokens[i];
    }
    this.layout.updateLine(_htmlStr);
};

Session.prototype.cursorMoveLeft = function () {
    var _pos = this.position;
    if (0 < _pos.x) {
        _pos.x = _pos.x - 1;
    }
    else {
        if (0 < _pos.y) {
            this.layout.activeLineMoveUp();
            _pos.y--;
            _pos.x = this.rows[_pos.y].length;
        }
        else {
            return false;
        }
    }
    this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(_pos);
    if (this.shiftOn) {
        if (this.selection.hasHead) {
            this.selection.update(_pos);
        }
    }
    else if (this.selection.hasHead){
        this.selection.clear();
    }
};

Session.prototype.cursorMoveRight = function () {
    var _pos = this.position;
    if (_pos.x < this.rows[_pos.y].length) {
        _pos.x = _pos.x + 1;
        this.getPositionByCol(_pos.x, _pos.y);
    }
    else {
        if (_pos.y < this.rows.length - 1) {
            this.layout.activeLineMoveDown();
            _pos.y++;
            _pos.x = _pos.s = 0;
        }
        else {
            return false;
        }
    }
    this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(_pos);
    if (this.shiftOn) {
        if (this.selection.hasHead) {
            this.selection.update(_pos);
        }
    }
    else if (this.selection.hasHead){
        this.selection.clear();
    }
};

Session.prototype.cursorMoveUp = function () {
    var _pos = this.position;
    if (0 < _pos.y) {
        this.layout.activeLineMoveUp();
        _pos.y--;
        if (_pos.x > this.rows[_pos.y].length) {
            _pos.x = this.rows[_pos.y].length;
        }
    }
    else {
        return false;
    }
    this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(_pos);
    if (this.shiftOn) {
        if (this.selection.hasHead) {
            this.selection.update(_pos);
        }
    }
    else if (this.selection.hasHead){
        this.selection.clear();
    }
};

Session.prototype.cursorMoveDown = function () {
    var _pos = this.position;
    if (_pos.y < this.rows.length - 1) {
        this.layout.activeLineMoveDown();
        _pos.y++;
        if (_pos.x > this.rows[_pos.y].length) {
            _pos.x = this.rows[_pos.y].length;
        }
    }
    else {
        return false;
    }
    this.getPositionByCol(_pos.x, _pos.y);
    this.layout.cursorAdjust(_pos);
    if (this.shiftOn) {
        if (this.selection.hasHead) {
            this.selection.update(_pos);
        }
    }
    else if (this.selection.hasHead){
        this.selection.clear();
    }
};

Session.prototype.getSelectedText = function () {
    var _selection = this.selection,
    _rows = this.rows,
    _h_y = _selection.head.y,
    _h_x = _selection.head.x,
    _t_y = _selection.tail.y,
    _t_x = _selection.tail.x,
    rangText;
    if (_h_y == _t_y) {
        rangText = _rows[_h_y].substring(_h_x, _t_x);
        return rangText;
    }
    rangText = _rows[_h_y].substring(_h_x) + "\r\n";
    for(var i = _h_y + 1; i < _t_y; i++) {
        rangText += _rows[i] + "\r\n";
    }
    rangText += _rows[_t_y].substring(0, _t_x);
    return rangText;
};

Session.prototype.selectWord = function (x, y) {
    var _pos = this.getPositionByOffset(x, y),
    _line = this.rows[_pos.y],
    _len = _line.length,
    _hit_char = _line.charAt(_pos.x),
    i = _pos.x - 1,
    j = _pos.x + 1,
    _end = {
        x : _pos.x,
        y : _pos.y,
        s : _pos.s
    },
    t,
    _wideChar = this.tokenizer.wideCharRegAll;
    if (j <= _len) {
        _end.x++;
        _end.s += this.tokenizer.checkWideChar(_hit_char);
    }
    while (i >= 0) {
        t = (_hit_char + _line.charAt(i)).match(/(\w)/g);
        if (t && 2 == t.length) {
            i --;
            _pos.x--;
            _pos.s--;
            continue;
        }
        t = (_hit_char + _line.charAt(i)).match(_wideChar);
        if (t && 2 == t.length) {
            i --;
            _pos.x--;
            _pos.s = _pos.s - 2;
            continue;
        }
        if (_hit_char == _line.charAt(i)) {
            i --;
            _pos.x--;
            _pos.s--;
            continue;
        }
        else break;
    }
    while (j <= _len) {
        t = (_hit_char + _line.charAt(j)).match(/(\w)/g);
        if (t && 2 == t.length) {
            j ++;
            _end.x++;
            _end.s++;
            continue;
        }
        t = (_hit_char + _line.charAt(j)).match(_wideChar);
        if (t && 2 == t.length) {
            j ++;
            _end.x++;
            _end.s = _end.s + 2;
            continue;
        }
        if (_hit_char == _line.charAt(j)) {
            j ++;
            _end.x++;
            _end.s++;
            continue;
        }
        else break;
    }
    this.selection.start(_pos);
    this.selection.update(_end);
    this.setPosition(_end);
    this.layout.cursorAdjust(_end);
};

Session.prototype.selectAll = function () {
    var _y = this.rows.length - 1;
    var _end = this.getPositionByCol(this.rows[_y].length, _y);
    this.selection.start({x : 0, y : 0, s : 0});
    this.selection.update(_end);
    this.layout.cursorAdjust(_end);
    console.log(this.selection);
};

Session.prototype.findClosingBracket = function (bracket, position) {
    var closingBracket;
    var depth = 1;
    switch (bracket) {
        case '{' : 
            closingBracket = '}';
        break;
        case '[' :
            closingBracket = ']';
        break;
        case '(' :
            closingBracket = ')';
        break;
        default : 
        break;
    }
    for (var i = position.row; i < rows.length; i++) {
        var j = 0;
        if (i == position.row) {
            var j = position.col + 1;
        }
        for (; j < rows[i].length; j++) {
            var _char = rows[i].charAt(j);
            if (bracket == _char) {
                depth++;
            }
            else if (closingBracket == _char) {
                depth--;
                if (!depth) {
                    return {row : i, col : j};
                }
            }
        }
    }
};

Session.prototype.findOpenBracket= function (bracket, position) {
    var openBracket;
    var depth = 1;
    switch (bracket) {
        case '}' : 
            openBracket = '{';
        break;
        case ']' :
            openBracket = '[';
        break;
        case ')' :
            openBracket = '(';
        break;
        default : 
        break;
    }
    for (var i = position.row; i >= 0; i--) {
        var j = rows[i].length - 1;
        if (i == position.row) {
            var j = position.col - 1;
        }
        for (; j >= 0; j--) {
            var _char = rows[i].charAt(j);
            if (bracket == _char) {
                depth++;
            }
            else if (openBracket == _char) {
                depth--;
                if (!depth) {
                    return {row : i, col : j};
                }
            }
        }
    }
};