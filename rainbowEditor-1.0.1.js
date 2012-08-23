/**
*	@Use: web代码编辑器
*	@Author: derongzeng
*	@Version: 1.0.1
*/

(function () {
    var opts = {
        offsetLeft : 50,
        cursorTime : 600
    };

﻿var RuleJavascript = {
    'comment' : ['(\\/\\/.*$)', '(\\/\\*)', '.*?\\*\\/', '(^#!.*$)'],
    'string' : ['(["](?:(?:\\\\.)|(?:[^"\\\\]))*?["])', "(['](?:(?:\\\\.)|(?:[^'\\\\]))*?['])"],
    'numeric' : ['(0[xX][0-9a-fA-F]+\\b)', '([+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b)'],
    'boolean' : '((?:true|false)\\b)',
    'keyword' : '((?:case|do|else|finally|in|instanceof|return|throw|try|typeof|yield)\\b)',
    'operator' : '(!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void))',
    'separator' : '(\\?|\\:|\\,|\\;|\\.)',
    'bracket' : ['([[({])', '([\\])}])'],
    'others' : ['(\\/=?)', '(\\s+)', '(.)']
};
﻿var Tokenizer = function (language) {
    var _orders = [], 
    _token, _tokens = [],
    //在网页显示需要转移的特殊字符
    _escapeChar = '\\t|&|<|( +)',
    //在网页上无法显示的特殊字符
    _specialChar = '[\\v\\f \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u3000]',
    //在网页上需要占据两格空间的宽字符
    _wideChar = '[\\u1100-\\u115F]|[\\u11A3-\\u11A7]|[\\u11FA-\\u11FF]|[\\u2329-\\u232A]|[\\u2E80-\\u2E99]|[\\u2E9B-\\u2EF3]|[\\u2F00-\\u2FD5]|[\\u2FF0-\\u2FFB]|[\\u3000-\\u303E]|[\\u3041-\\u3096]|[\\u3099-\\u30FF]|[\\u3105-\\u312D]|[\\u3131-\\u318E]|[\\u3190-\\u31BA]|[\\u31C0-\\u31E3]|[\\u31F0-\\u321E]|[\\u3220-\\u3247]|[\\u3250-\\u32FE]|[\\u3300-\\u4DBF]|[\\u4E00-\\uA48C]|[\\uA490-\\uA4C6]|[\\uA960-\\uA97C]|[\\uAC00-\\uD7A3]|[\\uD7B0-\\uD7C6]|[\\uD7CB-\\uD7FB]|[\\uF900-\\uFAFF]|[\\uFE10-\\uFE19]|[\\uFE30-\\uFE52]|[\\uFE54-\\uFE66]|[\\uFE68-\\uFE6B]|[\\uFF01-\\uFF60]|[\\uFFE0-\\uFFE6]';
    
    this.wideCharReg = new RegExp(_wideChar);
    this.escapeCharReg = new RegExp(this.specialChar);
    this.specialCharReg = new RegExp(_escapeChar + '|(' + _specialChar + ')|(' + _wideChar + ')+/g');
    
    for (var key in language) {
        _token = language[key];
        if(_token instanceof Array) {
            var _len = _token.length;
            while (_len) {
                _tokens.push(_token[--_len]);
                _orders.push(key);
            }
        }
        else {
            _tokens.push(_token);
            _orders.push(key);
        }
    }
    this.re = new RegExp('(?:' + _tokens.join('|') + ')', 'g');
    this.orders = _orders;
};

Tokenizer.prototype.getTokens = function (text) {

    /**
     * 对特殊字符做替换处理
     * @param c 匹配的字符串
     * 
     * replace的第二个参数如果是function，则function的第一个参数是匹配模式的字符串。
     * 接下来的参数是与模式中的子表达式匹配的字符串，可以有 0 个或多个这样的参数。
     * 接下来的参数是一个整数，声明了匹配在 stringObject 中出现的位置。
     * 最后一个参数是 stringObject 本身。
     */
    var replaceFunc = function(c) {
        var test_str = c.substring(0, 1);
        var c_len = c.length;
        if (test_str.charCodeAt(0) == 32) {
            return new Array(c_len+1).join("&nbsp;");
        } else if (test_str == "\t") {
            return new Array(c_len+1).join('&nbsp;&nbsp;&nbsp;&nbsp;');
        } else if (test_str == "&") {
            return new Array(c_len+1).join('&amp;');
        } else if (test_str == "<") {
            return new Array(c_len+1).join('&lt;');
        } else if (test_str == "\u3000") {
            return " ";
        } else if (this.specialCharReg.test(test_str)) {
            return "&#160;";
        } else {
            var char_unit = '';
            for (var i = 0; i < c_len; i++) {
                char_unit += "<span class='char_unit' style='width:" +
                (e_pos.width * 2) +
                "px'>" + c[i] + "</span>";
            }
            return char_unit;
        }
    };
    
    
    var _token,
    _tokens = [],
    _rules = this.orders,
    _matched,
    _re = this.re;
    _re.lastIndex = 0;
    while (_matched = _re.exec(text)) {
        _matched.shift();
        var _mlen = _matched.length;
        for (var i = 1; i < _mlen; i ++) {
            if (undefined !== _matched[i]) {
                var _output = _matched[i].replace(this.specialCharReg, replaceFunc);
                var type = _rules[i];
                if (type) {
                    _token = "<span class='editor_" + type + "'>" + _output + "</span>";
                }
                else {
                    _token = _output;
                }
                _tokens.push(_token);
            }
        }
    }
    return _tokens;
};
﻿var LayoutInput = function (ele, session) {
    this.inCompostion = false;
    this.ele = ele;
    this.session = session;
    ele.addEventListener('input', this.input.bind(this));
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
﻿var LayoutText = function (ele, session) {
    this.ele = ele;
    this.session = session;
    this.inFocus = false;
    _that = this;
    ele.addEventListener('mouseup', this.mouseup.bind(this));
};

LayoutText.prototype.mouseup = function (e) {
    this.session.cursorMoveTo(e);
    this.session.input.focus();
    this.inFocus = false;
    e.stopPropagation();
    e.preventDefault();
};
﻿var Layout = function (ctn) {
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
    this.gutter = _gutter;
    this.marker = _marker;
    this.content = _content;
    this.ac = _autocomplete;
    this.cursor = _cursor;
    this.textinput = _textinput;
    this.layout = _layout;
    function createDiv(id) {
        var _div;
        _div = document.createElement('div');
        _div.id = "__rb_" + id + "__";
        return _div;
    }
};

Layout.prototype.measureCharSize = function () {
    var _mNode = document.createElement('div');
    var _style = "width:auto; height:auto;left:4000px; top:4000px; visibility:hidden; position:absolute; overflow:visible; whiteSpace:nowrap";
    _mNode.style.cssText = _style;
    _mNode.innerHTML = new Array(101).join('xY');
    this.editor.appendChild(_mNode);
    this.charW = parseInt(_mNode.offsetWidth / 200);
    this.charH = _mNode.offsetHeight;
};

Layout.prototype.cursorAdjust = function (pos) {
    var _style = "left: " + pos.s * this.charW + "px;";
    _style += "top: " + pos.y * this.charH + "px;";
    _style += "height: " + this.charH + "px;";
    this.cursor.style.cssText = _style;
};

Layout.prototype.getActiveLine = function (src) {
    if (!src) {
        console.error('Can not find ActiveLine!');
        return false;
    }
    if (src.className == 'line') {
        return src;
    }
    if (src.id == '__rb_content__') {
        var _tags = src.getElementsByClassName('line');
        var _len = _tags.length;
        if (0 < _len) {
            return _tags[_len-1];
        }
        else {
            console.error('Can not find ActiveLine from __rb_content__!');
            return false;
        }
    }
    else {
        return this.getActiveLine(src.parentNode);
    }
};

Layout.prototype.createNewLine = function (activeLine, rows) {
    var new_div = document.createElement('div');
    new_div.className = 'line';
    new_div.style.height = this.charH + 'px';
    if (activeLine) {
        this.content.insertBefore( new_div, activeLine.nextSibling );
    }
    else {
        this.content.appendChild(new_div);
    }
    //添加行号
    var line_num = document.createElement('div');
    line_num.className = 'line_num';
    line_num.innerText = rows;
    this.gutter.appendChild(line_num);
    return new_div;
};
﻿/**
*TODO 把position相关的独立出来。
*TODO 把RegExp相关的独立出来。
*SESSION 只做各个模块间的桥梁。
*/
var Session = function (layout) {
    this.layout = layout;
    this.position = {
        x : 0,
        y : -1,
        s : 0
    };
    this.input = new LayoutInput(layout.textinput, this);
    this.textarea = new LayoutText(layout.content, this);
    this.rows = [];
    this.tokenizer = new Tokenizer(RuleJavascript);
};

Session.prototype.begin = function () {
    this.newLine();
    this.input.focus();
};

Session.prototype.cursorMoveTo = function (e) {
    var x, y, pos;
    x = Math.round(e.clientX);
    y = Math.round(e.clientY) + this.layout.layout.scrollTop;
    this.position = this.getPositionByOffset(x, y, this.layout.charW, this.layout.charH);
    this.activeLine = this.layout.getActiveLine(e.srcElement);
    this.layout.cursorAdjust(this.position);
};

Session.prototype.getPositionByCol = function (x, y) {
    var _s = 0;
    var _row = this.rows[y];
    for (var i = 0; i < x; i++) {
        if(this.wideCharReg.test(_row[i])) {
            _s += 2;
        }
        else if ("\t" == _row[i][i]) {
            _s += 4;
        }
        else {
            _s++;
        }
    }
    return {x : x, y : y, s : _s};
};

Session.prototype.getPositionByOffset = function (x, y, cWidth, cHeight) {
    var _half = Math.round(cWidth / 2),
    _wideCharReg = this.tokenizer.wideCharReg,
    _row = Math.floor(y / cHeight),
    _len = this.rows.length,
    _col = 0,
    _spike = 1,
    _length = 0,
    _cLine,
    _cLen;
    if (0 == _len) {
        return {x : 0, y : 0, s : 0};
    }
    
    if (_row >= _len) {
        _row = _len - 1;
    }
    _cLine = this.rows[_row];
    _cLen = _cLine.length;
    
    for (var i = 0; i < _cLen; i++) {
        if(_wideCharReg.test(_cLine[i])) {
            _spike = 2;
        }
        else if ("\t" == _cLine[i]) {
            _spike = 4;
        }
        else {
            _spike = 1;
        }
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
    return {x : i, y : _row, s : _col};
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
    this.layout.cursorAdjust(this.position);
    this.activeLine = this.layout.createNewLine(this.activeLine, rows.length);
    
};

Session.prototype.add = function (text) {
    if (0 == text.length) return;
    //如果有选中内容
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

Session.prototype.render = function (line) {
    var _tokens = this.tokenizer.getTokens(line);
    var _len = _tokens.length;
    var _htmlStr = '';
    for (var i = 0; i < _len; i ++) {
        _htmlStr += _tokens[i];
    }
    this.activeLine.innerHTML = _htmlStr;
};
    window.$editor = function (elementId, txt) {
        //addEventListener
        //dispatchEvent
        var _layout = new Layout(document.getElementById(elementId));
        _layout.measureCharSize();
        var _session = new Session(_layout);
        _session.begin();
    }
})();