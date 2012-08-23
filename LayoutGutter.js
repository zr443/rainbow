var LayoutGutter = function (ele, session) {
    this.ele = ele;
    this.session = session;
    this.rows = 0;
};

LayoutGutter.prototype.addLineNum = function (pos, charW, charH) {
	var line_num = document.createElement('div');
    line_num.className = 'line_num';
    line_num.innerText = ++this.rows;
    this.ele.appendChild(line_num);
};

LayoutGutter.prototype.delLineNum = function (lines) {
    for (var i = 0; i < lines; i++) {
        this.ele.removeChild(this.ele.lastChild);
    }
    this.rows -= lines;
};