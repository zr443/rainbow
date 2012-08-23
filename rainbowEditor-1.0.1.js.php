/**
*	@Use: web代码编辑器
*	@Author: derongzeng
*	@Version: 1.0.1
*/

(function () {
    var opts = {
        offsetLeft : 50,
        cursorTime : 600
    }

<?php require_once 'RuleJavascript.js' ?>

<?php require_once 'Tokenizer.js' ?>

<?php require_once 'LayoutMarker.js' ?>

<?php require_once 'LayoutCursor.js' ?>

<?php require_once 'LayoutGutter.js' ?>

<?php require_once 'LayoutInput.js' ?>

<?php require_once 'LayoutText.js' ?>

<?php require_once 'Layout.js' ?>

<?php require_once 'Selection.js' ?>

<?php require_once 'Session.js' ?>

    window.$editor = function (elementId, txt) {
        //addEventListener
        //dispatchEvent
        
        var _session = new Session(elementId);
        _session.begin();
        if (undefined != txt) {
        	_session.add(txt);
        }
    }
})();