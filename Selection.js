/**
 * 控制/创建/删除选区
 * @auth derongzeng
 * @param marker  选区显示层
 * @returns
 */
var Selection = function (marker) {
    this.marker = marker;
    this.initPosition();
    this.status = 0;
};

/**
 * 初始化一个空的位置对象
 */
Selection.prototype.getInitialPosition = function () {
    return {
        x : null,
        y : null,
        s : null
    };
};

/**
 * init头、尾、起、终
 */
Selection.prototype.initPosition = function () {
    this.lead   = this.getInitialPosition(); //头
    this.anchor = this.getInitialPosition(); //尾
    this.head   = this.getInitialPosition(); //绝对起点
    this.tail   = this.getInitialPosition(); //绝对终点
};

/**
 * 克隆两个位置
 * @param a
 * @param b
 */
Selection.prototype.clonePosition = function (a, b) {
    a.x = b.x;
    a.y = b.y;
    a.s = b.s;
};

/**
 * 设置起点
 * @param pos
 * @returns {Boolean}
 */
Selection.prototype.start = function (pos) {
    if (0 != this.status) {
        console.log('哥，start状态不对咧！');
        return false;
    }
    this.clonePosition(this.lead, pos);
    this.clonePosition(this.anchor, pos);
    this.status = 1;
};

/**
 * 更新选区
 * @param pos
 * @returns {Boolean}
 */
Selection.prototype.update = function (pos) {
    if (1 != this.status) {
        console.log('哥，update状态不对咧！');
        return false;
    }
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

/**
 * 设置终点
 * @returns {Boolean}
 */
Selection.prototype.end = function (pos) {
    if (1 != this.status) {
        console.log('哥，end状态不对咧！');
        return false;
    }
    if (pos) {
        this.update(pos);
    }
    //如果头尾完全相等
    if (this.head.x == this.tail.x && this.head.y == this.tail.y) {
        this.clear();
        return false;
    }
    else {
        this.status = 2;
    }
};

/**
 * 清楚选区
 */
Selection.prototype.clear = function () {
    this.status = 0;
    this.initPosition();
    this.marker.clear();
};