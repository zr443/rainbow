var Selection = function (marker) {
    this.marker = marker;
    //this.initPosition();
    this.hasHead = 0;
};

Selection.prototype.getInitialPosition = function () {
    return {
        x : 0,
        y : 0,
        s : 0
    };
};

Selection.prototype.initPosition = function () {
    this.lead   = this.getInitialPosition(); //头
    this.anchor = this.getInitialPosition(); //尾
    this.head   = this.getInitialPosition(); //绝对起点
    this.tail   = this.getInitialPosition(); //绝对终点
};

Selection.prototype.clonePosition = function (a, b) {
    a.x = b.x;
    a.y = b.y;
    a.s = b.s;
};

Selection.prototype.start = function  (pos) {
    this.clear();
    this.clonePosition(this.lead, pos);
    this.clonePosition(this.anchor, pos);
    this.hasHead = 1;
};

Selection.prototype.update = function (pos) {
    var _head, _tail;
    this.marker.clear();
    this.clonePosition(this.anchor, pos);
    if (pos.y > this.lead.y) {
        this.clonePosition(this.tail, pos);
        this.clonePosition(this.head, this.lead);
    }
    else if (pos.y == this.lead.y) {
        if (pos.x > this.lead.x) {
            this.clonePosition(this.tail, pos);
            this.clonePosition(this.head, this.lead);
        }
        else if (pos.x == this.lead.x) {
            return false;
        }
        else {
            this.clonePosition(this.head, pos);
            this.clonePosition(this.tail, this.lead);
        }
    }
    else {
        this.clonePosition(this.head, pos);
        this.clonePosition(this.tail, this.lead);
    }
    this.marker.createSelection(this.head, this.tail);
};

Selection.prototype.isExpanded = function () {
    return (this.hasHead && (this.head.x != this.tail.x || this.head.y != this.tail.y)) ? true : false;
};

Selection.prototype.clear = function () {
    this.hasHead = 0;
    this.initPosition();
    this.marker.clear();
};