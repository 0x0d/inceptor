/*
 *	This CSS rule resolution code has been adopted from the code within the Firebug extension.
 *		http://getfirebug.com/
 *		http://code.google.com/p/fbug/
 *	Firebug's source is under MPL (http://www.mozilla.org/MPL/).
 */

var CSSUtil;
(function() {
	var cssInfo =
	{
	    "background": ["bgRepeat", "bgAttachment", "bgPosition", "color", "systemColor", "none"],
	    "background-attachment": ["bgAttachment"],
	    "background-color": ["color", "systemColor"],
	    "background-image": ["none"],
	    "background-position": ["bgPosition"],
	    "background-repeat": ["bgRepeat"],
	    
	    "border": ["borderStyle", "thickness", "color", "systemColor", "none"],
	    "border-top": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
	    "border-right": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
	    "border-bottom": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
	    "border-left": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
	    "border-collapse": ["borderCollapse"],
	    "border-color": ["color", "systemColor"],
	    "border-top-color": ["color", "systemColor"],
	    "border-right-color": ["color", "systemColor"],
	    "border-bottom-color": ["color", "systemColor"],
	    "border-left-color": ["color", "systemColor"],
	    "border-spacing": [],
	    "border-style": ["borderStyle"],
	    "border-top-style": ["borderStyle"],
	    "border-right-style": ["borderStyle"],
	    "border-bottom-style": ["borderStyle"],
	    "border-left-style": ["borderStyle"],
	    "border-width": ["thickness"],
	    "border-top-width": ["thickness"],
	    "border-right-width": ["thickness"],
	    "border-bottom-width": ["thickness"],
	    "border-left-width": ["thickness"],
	    
	    "bottom": ["auto"],
	    "caption-side": ["captionSide"],
	    "clear": ["clear", "none"],
	    "clip": ["auto"],
	    "color": ["color", "systemColor"],
	    "content": ["content"],
	    "counter-increment": ["none"],
	    "counter-reset": ["none"],
	    "cursor": ["cursor", "none"],
	    "direction": ["direction"],
	    "display": ["display", "none"],
	    "empty-cells": [],
	    "float": ["float", "none"],
	    "font": ["fontStyle", "fontVariant", "fontWeight", "fontFamily"],

	    "font-family": ["fontFamily"],
	    "font-size": ["fontSize"],
	    "font-size-adjust": [],
	    "font-stretch": [],
	    "font-style": ["fontStyle"],
	    "font-variant": ["fontVariant"],
	    "font-weight": ["fontWeight"],

	    "height": ["auto"],
	    "left": ["auto"],    
	    "letter-spacing": [],
	    "line-height": [],

	    "list-style": ["listStyleType", "listStylePosition", "none"],
	    "list-style-image": ["none"],
	    "list-style-position": ["listStylePosition"],
	    "list-style-type": ["listStyleType", "none"],

	    "margin": [],
	    "margin-top": [],
	    "margin-right": [],
	    "margin-bottom": [],
	    "margin-left": [],

	    "marker-offset": ["auto"],
	    "min-height": ["none"],
	    "max-height": ["none"],
	    "min-width": ["none"],
	    "max-width": ["none"],
	    
	    "outline": ["borderStyle", "color", "systemColor", "none"],
	    "outline-color": ["color", "systemColor"],
	    "outline-style": ["borderStyle"],
	    "outline-width": [],

	    "overflow": ["overflow", "auto"],
	    "overflow-x": ["overflow", "auto"],
	    "overflow-y": ["overflow", "auto"],
	    
	    "padding": [],
	    "padding-top": [],
	    "padding-right": [],
	    "padding-bottom": [],
	    "padding-left": [],

	    "position": ["position"],
	    "quotes": ["none"],
	    "right": ["auto"],
	    "table-layout": ["tableLayout", "auto"],
	    "text-align": ["textAlign"],
	    "text-decoration": ["textDecoration", "none"],
	    "text-indent": [],
	    "text-shadow": [],
	    "text-transform": ["textTransform", "none"],
	    "top": ["auto"],
	    "unicode-bidi": [],
	    "vertical-align": ["verticalAlign"],
	    "white-space": ["whiteSpace"],
	    "width": ["auto"],
	    "word-spacing": [],
	    "z-index": [],
	    
	    "-moz-appearance": ["mozAppearance"],
	    "-moz-border-radius": [],
	    "-moz-border-radius-bottomleft": [],
	    "-moz-border-radius-bottomright": [],
	    "-moz-border-radius-topleft": [],
	    "-moz-border-radius-topright": [],
	    "-moz-border-top-colors": ["color", "systemColor"],
	    "-moz-border-right-colors": ["color", "systemColor"],
	    "-moz-border-bottom-colors": ["color", "systemColor"],
	    "-moz-border-left-colors": ["color", "systemColor"],
	    "-moz-box-align": ["mozBoxAlign"],
	    "-moz-box-direction": ["mozBoxDirection"],
	    "-moz-box-flex": [],
	    "-moz-box-ordinal-group": [],
	    "-moz-box-orient": ["mozBoxOrient"],
	    "-moz-box-pack": ["mozBoxPack"],
	    "-moz-box-sizing": ["mozBoxSizing"],
	    "-moz-opacity": [],
	    "-moz-user-focus": ["userFocus", "none"],
	    "-moz-user-input": ["userInput"],
	    "-moz-user-modify": [],
	    "-moz-user-select": ["userSelect", "none"],
	    "-moz-background-clip": [],
	    "-moz-background-inline-policy": [],
	    "-moz-background-origin": [],
	    "-moz-binding": [],
	    "-moz-column-count": [],
	    "-moz-column-gap": [],
	    "-moz-column-width": [],
	    "-moz-image-region": []
	};

	var inheritedStyleNames =
	{
	    "border-collapse": 1,
	    "border-spacing": 1,
	    "border-style": 1,
	    "caption-side": 1,
	    "color": 1,
	    "cursor": 1,
	    "direction": 1,
	    "empty-cells": 1,
	    "font": 1,
	    "font-family": 1,
	    "font-size-adjust": 1,
	    "font-size": 1,
	    "font-style": 1,
	    "font-variant": 1,
	    "font-weight": 1,
	    "letter-spacing": 1,
	    "line-height": 1,
	    "list-style": 1,
	    "list-style-image": 1,
	    "list-style-position": 1,
	    "list-style-type": 1,
	    "quotes": 1,
	    "text-align": 1,
	    "text-decoration": 1,
	    "text-indent": 1,
	    "text-shadow": 1,
	    "text-transform": 1,
	    "white-space": 1,
	    "word-spacing": 1
	};

	var cssKeywords = 
	{
	    "appearance":
	    [
	        "button",
	        "button-small",
	        "checkbox",
	        "checkbox-container",
	        "checkbox-small",
	        "dialog",
	        "listbox",
	        "menuitem",
	        "menulist",
	        "menulist-button",
	        "menulist-textfield",
	        "menupopup",
	        "progressbar",
	        "radio",
	        "radio-container",
	        "radio-small",
	        "resizer",
	        "scrollbar",
	        "scrollbarbutton-down",
	        "scrollbarbutton-left",
	        "scrollbarbutton-right",
	        "scrollbarbutton-up",
	        "scrollbartrack-horizontal",
	        "scrollbartrack-vertical",
	        "separator",
	        "statusbar",
	        "tab",
	        "tab-left-edge",
	        "tabpanels",
	        "textfield",
	        "toolbar",
	        "toolbarbutton",
	        "toolbox",
	        "tooltip",
	        "treeheadercell",
	        "treeheadersortarrow",
	        "treeitem",
	        "treetwisty",
	        "treetwistyopen",
	        "treeview",
	        "window"
	    ],
	    
	    "systemColor":
	    [
	        "ActiveBorder",
	        "ActiveCaption",
	        "AppWorkspace",
	        "Background",
	        "ButtonFace",
	        "ButtonHighlight",
	        "ButtonShadow",
	        "ButtonText",
	        "CaptionText",
	        "GrayText",
	        "Highlight",
	        "HighlightText",
	        "InactiveBorder",
	        "InactiveCaption",
	        "InactiveCaptionText",
	        "InfoBackground",
	        "InfoText",
	        "Menu",
	        "MenuText",
	        "Scrollbar",
	        "ThreeDDarkShadow",
	        "ThreeDFace",
	        "ThreeDHighlight",
	        "ThreeDLightShadow",
	        "ThreeDShadow",
	        "Window",
	        "WindowFrame",
	        "WindowText",
	        "-moz-field",
	        "-moz-fieldtext",
	        "-moz-workspace",
	        "-moz-visitedhyperlinktext",
	        "-moz-use-text-color"
	    ],
	    
	    "color":
	    [
	        "AliceBlue",
	        "AntiqueWhite",
	        "Aqua",
	        "Aquamarine",
	        "Azure",
	        "Beige",
	        "Bisque",
	        "Black",
	        "BlanchedAlmond",
	        "Blue",
	        "BlueViolet",
	        "Brown",
	        "BurlyWood",
	        "CadetBlue",
	        "Chartreuse",
	        "Chocolate",
	        "Coral",
	        "CornflowerBlue",
	        "Cornsilk",
	        "Crimson",
	        "Cyan",
	        "DarkBlue",
	        "DarkCyan",
	        "DarkGoldenRod",
	        "DarkGray",
	        "DarkGreen",
	        "DarkKhaki",
	        "DarkMagenta",
	        "DarkOliveGreen",
	        "DarkOrange",
	        "DarkOrchid",
	        "DarkRed",
	        "DarkSalmon",
	        "DarkSeaGreen",
	        "DarkSlateBlue",
	        "DarkSlateGray",
	        "DarkTurquoise",
	        "DarkViolet",
	        "DeepPink",
	        "DarkSkyBlue",
	        "DimGray",
	        "DodgerBlue",
	        "Feldspar",
	        "FireBrick",
	        "FloralWhite",
	        "ForestGreen",
	        "Fuchsia",
	        "Gainsboro",
	        "GhostWhite",
	        "Gold",
	        "GoldenRod",
	        "Gray",
	        "Green",
	        "GreenYellow",
	        "HoneyDew",
	        "HotPink",
	        "IndianRed",
	        "Indigo",
	        "Ivory",
	        "Khaki",
	        "Lavender",
	        "LavenderBlush",
	        "LawnGreen",
	        "LemonChiffon",
	        "LightBlue",
	        "LightCoral",
	        "LightCyan",
	        "LightGoldenRodYellow",
	        "LightGrey",
	        "LightGreen",
	        "LightPink",
	        "LightSalmon",
	        "LightSeaGreen",
	        "LightSkyBlue",
	        "LightSlateBlue",
	        "LightSlateGray",
	        "LightSteelBlue",
	        "LightYellow",
	        "Lime",
	        "LimeGreen",
	        "Linen",
	        "Magenta",
	        "Maroon",
	        "MediumAquaMarine",
	        "MediumBlue",
	        "MediumOrchid",
	        "MediumPurple",
	        "MediumSeaGreen",
	        "MediumSlateBlue",
	        "MediumSpringGreen",
	        "MediumTurquoise",
	        "MediumVioletRed",
	        "MidnightBlue",
	        "MintCream",
	        "MistyRose",
	        "Moccasin",
	        "NavajoWhite",
	        "Navy",
	        "OldLace",
	        "Olive",
	        "OliveDrab",
	        "Orange",
	        "OrangeRed",
	        "Orchid",
	        "PaleGoldenRod",
	        "PaleGreen",
	        "PaleTurquoise",
	        "PaleVioletRed",
	        "PapayaWhip",
	        "PeachPuff",
	        "Peru",
	        "Pink",
	        "Plum",
	        "PowderBlue",
	        "Purple",
	        "Red",
	        "RosyBrown",
	        "RoyalBlue",
	        "SaddleBrown",
	        "Salmon",
	        "SandyBrown",
	        "SeaGreen",
	        "SeaShell",
	        "Sienna",
	        "Silver",
	        "SkyBlue",
	        "SlateBlue",
	        "SlateGray",
	        "Snow",
	        "SpringGreen",
	        "SteelBlue",
	        "Tan",
	        "Teal",
	        "Thistle",
	        "Tomato",
	        "Turquoise",
	        "Violet",
	        "VioletRed",
	        "Wheat",
	        "White",
	        "WhiteSmoke",
	        "Yellow",
	        "YellowGreen",
	        "transparent",
	        "invert"        
	    ],
	    
	    "auto":
	    [
	        "auto"
	    ],
	    
	    "none":
	    [
	        "none"
	    ],
	    
	    "captionSide":
	    [
	        "top",
	        "bottom",
	        "left",
	        "right"
	    ],
	    
	    "clear":
	    [
	        "left",
	        "right",
	        "both"
	    ],
	    
	    "cursor":
	    [
	        "auto",
	        "cell",
	        "context-menu",
	        "crosshair",
	        "default",
	        "help",
	        "pointer",
	        "progress",
	        "move",
	        "e-resize",
	        "all-scroll",
	        "ne-resize",
	        "nw-resize",
	        "n-resize",
	        "se-resize",
	        "sw-resize",
	        "s-resize",
	        "w-resize",
	        "ew-resize",
	        "ns-resize",
	        "nesw-resize",
	        "nwse-resize",
	        "col-resize",
	        "row-resize",
	        "text",
	        "vertical-text",
	        "wait",
	        "alias",
	        "copy",
	        "move",
	        "no-drop",
	        "not-allowed",
	        "-moz-alias",
	        "-moz-cell",
	        "-moz-copy",
	        "-moz-grab",
	        "-moz-grabbing",
	        "-moz-contextmenu",
	        "-moz-zoom-in",
	        "-moz-zoom-out",
	        "-moz-spinning"
	    ],
	    
	    "direction":
	    [
	        "ltr",
	        "rtl"
	    ],
	    
	    "bgAttachment":
	    [
	        "scroll",
	        "fixed"
	    ],
	    
	    "bgPosition":
	    [
	        "top",
	        "center",
	        "bottom",
	        "left",
	        "right"
	    ],
	    
	    "bgRepeat":
	    [
	        "repeat",
	        "repeat-x",
	        "repeat-y",
	        "no-repeat"
	    ],
	    
	    "borderStyle":
	    [
	        "hidden",
	        "dotted",
	        "dashed",
	        "solid",
	        "double",
	        "groove",
	        "ridge",
	        "inset",
	        "outset",
	        "-moz-bg-inset",
	        "-moz-bg-outset",
	        "-moz-bg-solid"
	    ],
	    
	    "borderCollapse":
	    [
	        "collapse",
	        "separate"
	    ],
	    
	    "overflow":
	    [
	        "visible",
	        "hidden",
	        "scroll",
	        "-moz-scrollbars-horizontal",
	        "-moz-scrollbars-none",
	        "-moz-scrollbars-vertical"
	    ],
	    
	    "listStyleType":
	    [
	        "disc",
	        "circle",
	        "square",
	        "decimal",
	        "decimal-leading-zero",
	        "lower-roman",
	        "upper-roman",
	        "lower-greek",
	        "lower-alpha",
	        "lower-latin",
	        "upper-alpha",
	        "upper-latin",
	        "hebrew",
	        "armenian",
	        "georgian",
	        "cjk-ideographic",
	        "hiragana",
	        "katakana",
	        "hiragana-iroha",
	        "katakana-iroha",
	        "inherit"
	    ],
	    
	    "listStylePosition":
	    [
	        "inside",
	        "outside"
	    ],
	    
	    "content":
	    [
	        "open-quote",
	        "close-quote",
	        "no-open-quote",
	        "no-close-quote",
	        "inherit"
	    ],
	    
	    "fontStyle":
	    [
	        "normal",
	        "italic",
	        "oblique",
	        "inherit"
	    ],
	        
	    "fontVariant":
	    [
	        "normal",
	        "small-caps",
	        "inherit"
	    ],

	    "fontWeight":
	    [
	        "normal",
	        "bold",
	        "bolder",
	        "lighter",
	        "inherit"
	    ],

	    "fontSize":
	    [
	        "xx-small",
	        "x-small",        
	        "small",
	        "medium",
	        "large",
	        "x-large",
	        "xx-large",
	        "smaller",
	        "larger"        
	    ],
	    
	    "fontFamily":
	    [
	        "Arial",
	        "Comic Sans MS",
	        "Georgia",
	        "Tahoma",
	        "Verdana",
	        "Times New Roman",
	        "Trebuchet MS",
	        "Lucida Grande",
	        "Helvetica",
	        "serif",
	        "sans-serif",
	        "cursive",
	        "fantasy",
	        "monospace",
	        "caption",
	        "icon",
	        "menu",
	        "message-box",
	        "small-caption",
	        "status-bar",
	        "inherit"
	    ],
	    
	    "display":
	    [
	        "block",
	        "inline",
	        "list-item",
	        "marker",
	        "run-in",
	        "compact",
	        "table",
	        "inline-table",
	        "table-row-group",
	        "table-column",
	        "table-column-group",
	        "table-header-group",
	        "table-footer-group",
	        "table-row",
	        "table-cell",
	        "table-caption",
	        "-moz-box",
	        "-moz-compact",
	        "-moz-deck",
	        "-moz-grid",
	        "-moz-grid-group",
	        "-moz-grid-line",
	        "-moz-groupbox",
	        "-moz-inline-block",
	        "-moz-inline-box",
	        "-moz-inline-grid",
	        "-moz-inline-stack",
	        "-moz-inline-table",
	        "-moz-marker",
	        "-moz-popup",
	        "-moz-runin",
	        "-moz-stack"
	    ],
	    
	    "position":
	    [
	        "static",
	        "relative",
	        "absolute",
	        "fixed",
	        "inherit"
	    ],
	    
	    "float":
	    [
	        "left",
	        "right"
	    ],
	    
	    "textAlign":
	    [
	        "left",
	        "right",
	        "center",
	        "justify"
	    ],

	    "tableLayout":
	    [
	        "fixed"
	    ],
	    
	    "textDecoration":
	    [
	        "underline",
	        "overline",
	        "line-through",
	        "blink"
	    ],
	    
	    "textTransform":
	    [
	        "capitalize",
	        "lowercase",
	        "uppercase",
	        "inherit"
	    ],
	    
	    "unicodeBidi":
	    [
	        "normal",
	        "embed",
	        "bidi-override"
	    ],
	    
	    "whiteSpace":
	    [
	        "normal",
	        "pre",
	        "nowrap"
	    ],
	    
	    "verticalAlign":
	    [
	        "baseline",
	        "sub",
	        "super",
	        "top",
	        "text-top",
	        "middle",
	        "bottom",
	        "text-bottom",
	        "inherit"
	    ],
	    
	    "thickness":
	    [
	        "thin",
	        "medium",
	        "thick"
	    ],
	    
	    "userFocus":
	    [
	        "ignore",
	        "normal"
	    ],
	    
	    "userInput":
	    [
	        "disabled",
	        "enabled"
	    ],

	    "userSelect":
	    [
	        "normal"
	    ],
	    
	    "mozBoxSizing":
	    [
	        "content-box",
	        "padding-box",
	        "border-box"
	    ],

	    "mozBoxAlign":
	    [
	        "start",
	        "center",
	        "end",
	        "baseline",
	        "stretch"
	    ],

	    "mozBoxDirection":
	    [
	        "normal",
	        "reverse"
	    ],

	    "mozBoxOrient":
	    [
	        "horizontal",
	        "vertical"
	    ],

	    "mozBoxPack":
	    [
	        "start",
	        "center",
	        "end"
	    ]    
	};

	var domUtils = Components.classes["@mozilla.org/inspector/dom-utils;1"].getService(Components.interfaces.inIDOMUtils);
	function getPostStream(browser) {
	    try {
	        var webNav = browser.webNavigation;
	        var descriptor = webNav.QueryInterface(Components.interfaces.nsIWebPageDescriptor).currentDescriptor;
	        var entry = descriptor.QueryInterface(Components.interfaces.nsISHEntry);
	        
	        // Seek to the beginning, or it will probably start reading at the end
	        var postStream = entry.postData.QueryInterface(Components.interfaces.nsISeekableStream);
	        postStream.seek(0, 0);
	        
	        return postStream;
	    } catch (exc) {
			PB_Debug.print(exc);
	    }
	}

	function getCacheKey(browser) {
	    try {
	        var webNav = browser.webNavigation;
	        var descriptor = webNav.QueryInterface(Components.interfaces.nsIWebPageDescriptor).currentDescriptor;
	        var entry = descriptor.QueryInterface(Components.interfaces.nsISHEntry);
	        return entry.cacheKey;
	    } catch (exc) {
			PB_Debug.print(exc);
	    }
	}

	var loadSource = function(url, browser) {
		var charset = browser.document.characterSet;
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var channel;
		try {
			channel = ioService.newChannel(url, null, null);
			channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_FROM_CACHE | Components.interfaces.nsIRequest.LOAD_BYPASS_LOCAL_CACHE_IF_BUSY;
		} catch (exc) {
			PB_Debug.print(exc);
			return;
		}

		if (url == content.location.href) {
			if (channel instanceof Components.interfaces.nsIUploadChannel) {
				var postData = getPostStream(browser);
				var uploadChannel = channel.QueryInterface(Components.interfaces.nsIUploadChannel);
				uploadChannel.setUploadStream(postData, "", -1);
			}
			
			if (channel instanceof nsICachingChannel) {
				var cacheChannel = channel.QueryInterface(Components.interfaces.nsICachingChannel);
				cacheChannel.cacheKey = getCacheKey(browser);
			}
		}
		
		var stream;
		try {
			stream = channel.open();
		} catch (exc) {
			PB_Debug.print(exc);
			return;
		}
		
		try {
			var data = readFromStream(stream, charset);
			var lines = data.split(/\r\n|\r|\n/);
			this.cache[url] = lines;
			
			return lines;
		} catch (exc) {
			PB_Debug.print(exc);
			stream.close();
		}
	};
	function isSystemURL(url)
	{
	    if (url.substr(0, 9) == "resource:")
	        return true;
	    else if (url.substr(0, 17) == "chrome://firebug/")
	        return true;
	    else if (url.substr(0, 6) == "about:")
	        return true;
	    else if (url.indexOf("firebug-service.js") != -1)
	        return true;
	    else
	        return false;
	};

	var getElementXPath = function(element)
	{
	    if (element && element.id)
	        return '//*[@id="' + element.id + '"]';
	    else
	        return getElementTreeXPath(element);
	};

	var getElementTreeXPath = function(element)
	{
	    var paths = [];
	    
	    for (; element && element.nodeType == 1; element = element.parentNode)
	    {
	        var index = 0;
	        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
	        {
	            if (sibling.localName == element.localName)
	                ++index;
	        }
	        
	        var tagName = element.localName.toLowerCase();
	        var pathIndex = (index ? "[" + (index+1) + "]" : "");
	        paths.splice(0, 0, tagName + pathIndex);
	    }
	    
	    return paths.length ? "/" + paths.join("/") : null;    
	};

	function rgbToHex(value)
	{
	    var reg = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/i;
	    var m = reg.exec(value);
	    if (!m)
	        return value;

	    var r = parseInt(m[1]).toString(16);
	    if (r.length == 1)
	        r = "0" + r;
	    var g = parseInt(m[2]).toString(16);
	    if (g.length == 1)
	        g = "0" + g;
	    var b = parseInt(m[3]).toString(16);
	    if (b.length == 1)
	        b = "0" + b;

	    var preExpr = value.substr(0, m.index);
	    var postExpr = value.substr(m.index+m[0].length);
	    
	    return preExpr + "#" + (r + g + b).toUpperCase() + postExpr;
	}

	function parsePriority(value)
	{
	    var rePriority = /(.*?)\s*(!important)?$/;
	    var m = rePriority.exec(value);
	    var propValue = m ? m[1] : "";
	    var priority = m && m[2] ? "important" : "";
	    return {value: propValue, priority: priority};
	}

	function parseURLValue(value)
	{
	    var m = reURL.exec(value);
	    return m ? m[1] : "";
	}

	function parseRepeatValue(value)
	{
	    var m = reRepeat.exec(value);
	    return m ? m[0] : "";
	}

	function parseCSSValue(value, offset)
	{
	    var start = 0;
	    var m;
	    while (1)
	    {
	        m = reSplitCSS.exec(value);
	        if (m && m.index+m[0].length < offset)
	        {
	            value = value.substr(m.index+m[0].length);
	            start += m.index+m[0].length;
	            offset -= m.index+m[0].length;
	        }
	        else
	            break;
	    }
	    
	    if (m)
	    {
	        var type;
	        if (m[1])
	            type = "url";
	        else if (m[2] || m[3])
	            type = "rgb";
	        else if (m[4])
	            type = "int";
	        
	        return {value: m[0], start: start+m.index, end: start+m.index+(m[0].length-1), type: type};
	    }    
	}

	function findPropByName(props, name)
	{
	    for (var i = 0; i < props.length; ++i)
	    {
	        if (props[i].name == name)
	            return i;
	    }
	}

	function sortProperties(props)
	{
	    props.sort(function(a, b)
	    {
	        return a.name > b.name ? 1 : -1;
	    });    
	}

	function getTopmostRuleLine(panelNode)
	{
	    for (var child = panelNode.firstChild; child; child = child.nextSibling)
	    {
	        if (child.offsetTop+child.offsetHeight > panelNode.scrollTop)
	        {
	            var rule = child.repObject ? child.repObject.parentRule : null;
	            if (rule)
	                return {
	                    line: domUtils.getRuleLine(rule),
	                    offset: panelNode.scrollTop-child.offsetTop
	                };
	        }
	    }
	    return 0;
	}

	function getStyleSheetCSS(sheet)
	{
	    if (sheet.ownerNode instanceof HTMLStyleElement)
	        return sheet.ownerNode.innerHTML;
	    else
	        return loadSource(sheet.href, content).join("\n");
	}

	function getStyleSheetDocument(sheet)
	{
	    for (; sheet && !sheet.ownerNode; sheet = sheet.parentStyleSheet);
	        
	    return sheet.ownerNode.ownerDocument;
	}

	CSSUtil = {
	    getInheritedRules: function(element, sections, usedProps)
	    {
	        var parent = element.parentNode;
	        if (parent && parent.nodeType == 1)
	        {
	            this.getInheritedRules(parent, sections, usedProps);

	            var rules = [];
	            this.getElementRules(parent, rules, usedProps, true);

	            if (rules.length)
	                sections.splice(0, 0, {element: parent, rules: rules});
	        }
	    },

	    getElementRules: function(element, rules, usedProps, inheritMode)
	    {    
	        var inspectedRules;
	        try
	        {
	            inspectedRules = domUtils ? domUtils.getCSSStyleRules(element) : null;
	        } catch (exc) {
				PB_Debug.print(exc);
			}
	        
	        if (inspectedRules)
	        {
	            for (var i = 0; i < inspectedRules.Count(); ++i)
	            {
	                var rule = inspectedRules.GetElementAt(i).QueryInterface(Components.interfaces.nsIDOMCSSStyleRule);

	                var href = rule.parentStyleSheet.href;
	                if (isSystemURL(href))
	                    continue;

	                var props = this.getRuleProperties(this.selectorMap, rule, inheritMode);
	                if (inheritMode && !props.length)
	                    continue;

	                this.markOverridenProps(props, usedProps);

	                var line = domUtils.getRuleLine(rule);
	                var ruleId = rule.selectorText+"/"+line;
	                var sourceLink = { href:href, line:line }; //new SourceLink(href, line, "css", rule);
	                rules.splice(0, 0, {rule: rule, id: ruleId, 
	                        selector: rule.selectorText, sourceLink: sourceLink,
	                        props: props, inherited: inheritMode});
	            }
	        }

	        this.getStyleProperties(element, rules, usedProps, inheritMode);
	    },
		

	    markOverridenProps: function(props, usedProps)
	    {
	        for (var i = 0; i < props.length; ++i)
	        {
	            var prop = props[i];
	            if (prop.name in usedProps)
	            {
	                var deadProps = usedProps[prop.name];
	                for (var j = 0; j < deadProps.length; ++j)
	                {
	                    var deadProp = deadProps[j];
	                    if (!deadProp.disabled && deadProp.important && !prop.important)
	                        prop.overridden = true;
	                    else if (!prop.disabled)
	                        deadProp.overridden = true;
	                }
	            }
	            else
	                usedProps[prop.name] = [];

	            usedProps[prop.name].push(prop);
	        }
	    },
		
		selectorMap: {},
	    getStyleProperties: function(element, rules, usedProps, inheritMode)
	    {
	        var props = [];

	        var style = element.style;
	        for (var i = 0; i < style.length; ++i)
	        {
	            var name = style.item(i);
	            var value = style.getPropertyValue(name);
	            var important = style.getPropertyPriority(name) == "important";
	            if (value)
	                this.addProperty(name, value, important, false, inheritMode, props);
	        }

	        this.addOldProperties(this.selectorMap, getElementXPath(element), inheritMode, props);

	        sortProperties(props);
	        this.markOverridenProps(props, usedProps);

	        if (props.length)
	            rules.splice(0, 0,
	                    {rule: element, id: getElementXPath(element),
	                        selector: "element.style", props: props, inherited: inheritMode});
	    },
		
	    getRuleProperties: function(selectorMap, rule, inheritMode)
	    {
	        var props = [];

	        var ruleRE = /\{(.*?)\}$/;
	        var m = ruleRE.exec(rule.cssText);
	        if (!m)
	            return props;

	        var propRE = /\s*([^:\s]*?)\s*:\s*(.*?)\s*(! important)?$/;

	        var lines = m[1].split(";");
	        for (var i = 0; i < lines.length-1; ++i)
	        {
	            var m = propRE.exec(lines[i]);
	            if (!m)
	                continue;

	            var name = m[1], value = m[2], important = !!m[3];
	            if (value)
	                this.addProperty(name, value, important, false, inheritMode, props);
	        }

	        var line = domUtils.getRuleLine(rule);
	        var ruleId = rule.selectorText+"/"+line;
	        this.addOldProperties(selectorMap, ruleId, inheritMode, props);
	        sortProperties(props);
	        
	        return props;
	    },
		
	    addOldProperties: function(selectorMap, ruleId, inheritMode, props)
	    {
	        if (selectorMap && ruleId in selectorMap)
	        {
	            var moreProps = selectorMap[ruleId];
	            for (var i = 0; i < moreProps.length; ++i)
	            {
	                var prop = moreProps[i];
	                this.addProperty(prop.name, prop.value, prop.important, true, inheritMode, props);
	            }
	        }
	    },
	    
	    addProperty: function(name, value, important, disabled, inheritMode, props)
	    {
	        if (inheritMode && !inheritedStyleNames[name])
	            return;

	        name = this.translateName(name, value);
	        if (name)
	        {
	            value = rgbToHex(value);
	            important = important ? " !important" : "";

	            var prop = {name: name, value: value, important: important, disabled: disabled};
	            props.push(prop);
	        }
	    },

	    translateName: function(name, value)
	    {
	        // Don't show these proprietary Mozilla properties
	        if ((value == "-moz-initial"
	            && (name == "-moz-background-clip" || name == "-moz-background-origin"
	                || name == "-moz-background-inline-policy"))
	        || (value == "physical"
	            && (name == "margin-left-ltr-source" || name == "margin-left-rtl-source"
	                || name == "margin-right-ltr-source" || name == "margin-right-rtl-source"))
	        || (value == "physical"
	            && (name == "padding-left-ltr-source" || name == "padding-left-rtl-source"
	                || name == "padding-right-ltr-source" || name == "padding-right-rtl-source")))
	            return null;

	        // Translate these back to the form the user probably expects
	        if (name == "margin-left-value")
	            return "margin-left";
	        else if (name == "margin-right-value")
	            return "margin-right";
	        else if (name == "margin-top-value")
	            return "margin-top";
	        else if (name == "margin-bottom-value")
	            return "margin-bottom";
	        else if (name == "padding-left-value")
	            return "padding-left";
	        else if (name == "padding-right-value")
	            return "padding-right";
	        else if (name == "padding-top-value")
	            return "padding-top";
	        else if (name == "padding-bottom-value")
	            return "padding-bottom";
	        // XXXjoe What about border!
	        else
	            return name;
	    },
	};
})();
