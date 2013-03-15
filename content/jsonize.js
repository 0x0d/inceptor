/*
 *  Some code adapted from http://www.json.org/json.js.
 */

var javascriptEscapeCharacters = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
};

function encodeJavascriptString(x) {
    x = x.replace(/'/g, "\\'").replace(/"/g, "\\\"");
    if (/["\\\x00-\x1f]/.test(x)) {
        return x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
            var c = javascriptEscapeCharacters[b];
            if (c) {
                return c;
            }
            c = b.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        });
    } else {
        return x;
    }
}

function JsonizingContext(parent) {
    this._parent = parent;
    this._root = (parent == null) ? this : parent.getRoot();
    this._properties = {};
}
JsonizingContext.prototype = {
    getProperty: function(name) {
        return (name in this._properties) ?
            this._properties[name] :
            (this._parent != null ? this._parent.getProperty(name) : null);
    },
    setProperty: function(name, value) {
        this._properties[name] = value;
    },
    getRoot: function() {
        return this._root;
    },
    getRootProperty: function(name) {
        return this.getRoot().getProperty(name);
    },
    setRootProperty: function(name, value) {
        return this.getRoot().setProperty(name, value);
    },
    create: function() {
        return new JsonizingContext(this);
    }
};

function JsonizingWriter(context) {
    this._context = context;
    this._stream = context.getProperty("stream");
}
JsonizingWriter.prototype = {
    appendLineBreak: function() {
        this._stream.append("\n");
    },
    appendIndent: function() {
        var indentLevel = this._context.getRootProperty("indentLevel");
        var indentString = this._context.getRootProperty("indentString");
        for (var i = 0; i < indentLevel; i++) {
            this._stream.append(indentString);
        }
    },
    indent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") + 1);
    },
    unindent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") - 1);
    },
    append: function(s) {
        this._stream.append(s);
    }
};

function jsonize(o, params) {
    params = (params) ? params : {};
    
    var result = "";
    
    var indentCount = ("indentCount" in params) ? params.indent : 4;
    var indentString = ""; for (var i = 0; i < indentCount; i++) indentString += " ";
    var quoteAllFieldNames = ("quoteAllFieldNames" in params) ? params.quoteAllFieldNames : true;
    
    var context = new JsonizingContext(null);
    context.setProperty("indentCount", indentCount);
    context.setProperty("indentString", indentString);
    context.setProperty("indentLevel", 0);
    context.setProperty("breakLines", ("breakLines" in params) ? params.breakLines : true);
    context.setProperty("alignFieldValues", ("alignFieldValues" in params) ? params.alignFieldValues : true);
    context.setProperty("stream", {
        append: function(s) {
            result += s;
        }
    });
    context.setProperty("fieldNameEncoder", {
        _m: {},
        encode: function(s) {
            if (s in this._m) {
                return this._m[s];
            } else {
                var t = encodeJavascriptString(s);
                this._m[s] = t = (quoteAllFieldNames || /\W/.test(t)) ? ('"' + t + '"') : t;
                return t;
            }
        }
    });
    context.setProperty("path", []);
    context.setProperty(
        "contextualize", 
        ("contextualize" in params) ? params.contextualize :
            function(context, path) {
                return context;
            }
    );
    
    var writer = new JsonizingWriter(context);

    if (o instanceof Object) {
        jsonize.converters['object'](o, context, writer);
    } else if (o instanceof Array) {
        jsonize.converters['array'](o, context, writer);
    } else {
        o.toString();
    }
    return result;
}

jsonize.converters = {
    'array': function (a, context, writer) {
        var breakLines = context.getProperty("breakLines");
        
        writer.append('[');
        if (breakLines) {
            writer.appendLineBreak();
            writer.indent();
        } else {
            writer.append(" ");
        }
        
        var l = a.length;
        for (var i = 0; i < l; i ++) {
            var v = a[i];
            var f = jsonize.converters[typeof v];
            if (f) {
                if (breakLines) {
                    writer.appendIndent();
                }
                
                f(v, context, writer);
                if (i < l - 1) {
                    writer.append(',');
                }
                
                if (breakLines) {
                    writer.appendLineBreak();
                } else {
                    writer.append(" ");
                }
            }
        }
        
        if (breakLines) {
            writer.unindent();
            writer.appendIndent();
        }
        writer.append(']');
    },
    'boolean': function (x, context, writer) {
        writer.append(String(x));
    },
    'null': function (x, context, writer) {
        writer.append("null");
    },
    'undefined': function (x, context, writer) {
        writer.append("undefined");
    },
    'number': function (x, context, writer) {
        writer.append(isFinite(x) ? String(x) : "null");
    },
    'object': function (x, context, writer) {
        if ((x instanceof Array) || ("concat" in x)) {
            jsonize.converters['array'](x, context, writer);
        } else {
            var contextualize = context.getRootProperty("contextualize");
            var path = context.getProperty("path");
            
            var breakLines = context.getProperty("breakLines");
            var alignFieldValues = context.getProperty("alignFieldValues");
            
            writer.append('{');
            if (breakLines) {
                writer.appendLineBreak();
                writer.indent();
            } else {
                writer.append(" ");
            }
            
            var count = 0;
            var maxFieldLength = 0;
            var fieldNameEncoder = context.getRootProperty("fieldNameEncoder");
			if (x.hasOwnProperty) {
	            for (var n in x) {
	                if (x.hasOwnProperty(n)) {
	                    count++;
	                    maxFieldLength = Math.max(maxFieldLength, fieldNameEncoder.encode(n).length);
	                }
	            }
	            for (var n in x) {
	                if (x.hasOwnProperty(n)) {
	                    var v = x[n];
	                    var f = jsonize.converters[typeof v];
	                    var n2 = fieldNameEncoder.encode(n);
	                    if (breakLines) {
	                        writer.appendIndent();
	                    }
	                    
	                    writer.append(n2);
	                    writer.append(": ");
	                    
	                    if (breakLines && alignFieldValues) {
	                        for (var q = n2.length; q < maxFieldLength; q++) {
	                            writer.append(" ");
	                        }
	                    }
	                    
	                    path.unshift({ field: n });
	                    f(v, contextualize(context, path), writer);
	                    path.shift();
	                    
	                    count--;
	                    if (count > 0) {
	                        writer.append(',');
	                    }
	                    
	                    if (breakLines) {
	                        writer.appendLineBreak();
	                    } else {
	                        writer.append(" ");
	                    }
	                }
	            }
            }
			
            if (breakLines) {
                writer.unindent();
                writer.appendIndent();
            }
            writer.append('}');
        }
    },
    'string': function (x, context, writer) {
        writer.append('"' + encodeJavascriptString(x) + '"');
    }
};

function dontBreakLinesForFields() {
    var m = {};
    for (var i = 0; i < arguments.length; i++) {
        m[arguments[i]] = true;
    }
    return function(context, path) {
        if (path.length > 0 && path[0].field in m) {
            var context2 = context.create();
            context2.setProperty("breakLines", false);
            return context2;
        } else {
            return context;
        }
    };
}

function dontBreakLinesAfterDepth(d) {
    return function(context, path) {
        if (path.length == d) {
            var context2 = context.create();
            context2.setProperty("breakLines", false);
            return context2;
        } else {
            return context;
        }
    };
}