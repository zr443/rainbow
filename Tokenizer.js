var Tokenizer = function (language, charW) {
    var _orders = [], 
    _token, _tokens = [],
    //在网页显示需要转移的特殊字符
    _escapeChar = '\\t|&|<|( +)',
    //在网页上无法显示的特殊字符
    _specialChar = '[\\v\\f \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u3000]',
    //在网页上需要占据两格空间的宽字符
    _wideChar = '[\\u1100-\\u115F]|[\\u11A3-\\u11A7]|[\\u11FA-\\u11FF]|[\\u2329-\\u232A]|[\\u2E80-\\u2E99]|[\\u2E9B-\\u2EF3]|[\\u2F00-\\u2FD5]|[\\u2FF0-\\u2FFB]|[\\u3000-\\u303E]|[\\u3041-\\u3096]|[\\u3099-\\u30FF]|[\\u3105-\\u312D]|[\\u3131-\\u318E]|[\\u3190-\\u31BA]|[\\u31C0-\\u31E3]|[\\u31F0-\\u321E]|[\\u3220-\\u3247]|[\\u3250-\\u32FE]|[\\u3300-\\u4DBF]|[\\u4E00-\\uA48C]|[\\uA490-\\uA4C6]|[\\uA960-\\uA97C]|[\\uAC00-\\uD7A3]|[\\uD7B0-\\uD7C6]|[\\uD7CB-\\uD7FB]|[\\uF900-\\uFAFF]|[\\uFE10-\\uFE19]|[\\uFE30-\\uFE52]|[\\uFE54-\\uFE66]|[\\uFE68-\\uFE6B]|[\\uFF01-\\uFF60]|[\\uFFE0-\\uFFE6]';
    this.wideCharRegAll = new RegExp(_wideChar, 'g');
    this.wideCharReg = new RegExp(_wideChar);
    this.blankCharReg = new RegExp(_specialChar);
    this.specialCharReg = new RegExp(_escapeChar + '|(' + _specialChar + ')|(' + _wideChar + ')+', 'g');
    
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
    this.charW = charW;
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
            return "<span class='char_unit' style='width:" +(_charW * 4) +"px'></span>";
            //return new Array(c_len+1).join('&nbsp;&nbsp;&nbsp;&nbsp;');
        } else if (test_str == "&") {
            return new Array(c_len+1).join('&amp;');
        } else if (test_str == "<") {
            return new Array(c_len+1).join('&lt;');
        } else if (test_str == "\u3000") {
            return " ";
        } else if (_blankCharReg.test(test_str)) {
            return "&#160;";
        } else {
            var char_unit = '';
            for (var i = 0; i < c_len; i++) {
                char_unit += "<span class='char_unit' style='width:" +
                (_charW * 2) +
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
    _re.lastIndex = 0,
    _blankCharReg = this.blankCharReg,
    _charW = this.charW;
    while (_matched = _re.exec(text)) {
        _matched.shift();
        var _mlen = _matched.length;
        for (var i = 1; i < _mlen; i ++) {
            if (undefined !== _matched[i]) {
                var _output = _matched[i];
                if ('others' == _rules[i]) {
                    _output = _output.replace(this.specialCharReg, replaceFunc);
                }
                _token = "<span class='editor_" + _rules[i] + "'>" + _output + "</span>";
                _tokens.push(_token);
            }
        }
    }
    return _tokens;
};

Tokenizer.prototype.checkWideChar = function (_char) {
    if(this.wideCharReg.test(_char)) {
        return 2;
    }
    else if ("\t" == _char) {
        return 4;
    }
    else {
        return 1;
    }
};