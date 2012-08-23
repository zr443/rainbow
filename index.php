<?php
//phpinfo();
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <title>Rainbow Editor</title>
        <meta name="description" content=""/>
        <meta name="keywords" content=""/>
        <link href="editor.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript" src="rainbowEditor-1.0.1.js.php" ></script>
    </head>
    <body>
    <!-- 
    	<div id="head" style="width:100px; height:400px;float: left;">
            
        </div>
        <div id="main" style="width:600px; height:400px;float: left;margin-top: 20px;">
            
        </div>
     -->
     <div id="main">
            
    </div>
    </body>
    <script type="text/javascript">
    	var _txt = "Selection.prototype.getInitialPosition = function () {\r\n";
    	_txt += "    return {\r\n";
    	_txt += "        x : 0,\r\n";
    	_txt += "        y : 0,\r\n";
    	_txt += "        s : 0\r\n";
    	_txt += "    };\r\n";
    	_txt += "};再试一下中文";
        $editor('main', _txt);
    </script>
</html>