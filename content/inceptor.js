var tasks = [];
var jsd = null;

const inceptor = (function ()
{
    return {

        httpd: null,
        sniffer: null,
        debug: null,

        dbName: "ddd.sqlite",

        log: function (msg, level)
        {
            dump(msg + "\n");
        },
        startup: function ()
        {
            inceptor.log("Trying to start debugger...", 0);
            debug = new inceptor.Debug();
            debug.enable();

            inceptor.log("Trying to start database...", 0);
            sqLite._initService(inceptor.dbName);

            inceptor.log("Trying to start HTTPD...", 0);
            httpd = new inceptor.HTTPD();
            httpd.start(10000);
        },

        shutdown: function ()
        {
        }
    };

})();

inceptor.Task = function(host, port, instream, outstream) 
{
    //var pid = Math.floor(Math.random() * (65535 - 0 + 1) + 0);
    var listener = null;
    var hooker = null;
    var events = null;
    var timer = null;

    var pid = sqLite.cmd(inceptor.dbName, "INSERT INTO `tasks`(client_host, client_port, status) VALUES('" + host + "','" + port + "','1')");

    function addFrame () 
    {
        var frame = document.getElementById("browser" + pid);
        if (!frame) 
        {
            frame = document.createElement("browser");
        }

        initFrame(frame);
        inceptor.log("[" + pid + "] Frame created", 1);
        return frame;
    }

    function initFrame(frame) 
    {
        frame.setAttribute("id", "browser" + pid);
        frame.setAttribute("name", "browser" + pid);
        frame.setAttribute("type", "content");
        frame.setAttribute("disablehistory", true);
        frame.style.setProperty('min-height', "0px", 'important');
        frame.style.setProperty('height', "0px", 'important');
        frame.style.visibility = "hidden";

        document.getElementById("inceptor").appendChild(frame);

        frame.webNavigation.allowAuth = false;
        frame.webNavigation.allowImages = false;
        frame.webNavigation.allowJavascript = true;
        frame.webNavigation.allowMetaRedirects = true;
        frame.webNavigation.allowPlugins = false;
        frame.webNavigation.allowSubframes = true;
    }

    function addCanvas()
    {
        var canvas = document.getElementById("canvas" + pid);
        if (!canvas) {
            canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
        }

        initCanvas(canvas);
        inceptor.log("[" + pid + "] Canvas created", 1);
        return canvas;
    }

    function initCanvas(canvas) 
    {
        canvas.setAttribute("id", "canvas" + pid);

        document.getElementById("inceptor").appendChild(canvas);
    }

    function killFrame (frame)
    {
        try {
            frame.destroy();
            frame.parentNode.removeChild(frame);
            inceptor.log("[" + pid + "] Frame destroyed", 1);
        } catch(e) {
            inceptor.log("[" + pid + "] Fail to destroy frame: " + e, 1);
        }
    }    

    function killCanvas (canvas) 
    {
       try {
            canvas.parentNode.removeChild(canvas);
            inceptor.log("[" + pid + "] Canvas destroyed", 1); 
        } catch(e) {
            inceptor.log("[" + pid + "] Fail to destroy canvas: " + e, 1);
        }
    }

    function task() 
    {    
        this.pid = pid;
        this.clientHost = host;
        this.clientPort = port;
        this.inputStream = instream;
        this.outputStream = outstream;

        this.url = null;

        this.frame = null;
        this.canvas = null;

        this.subtasks = [];

        this.screenshot = null;

        listener = new inceptor.Listener(this);
        hooker = new inceptor.Hooker(this);
        events = new inceptor.Events(this);

        this.init = function(url) 
        {
            sqLite.cmd(inceptor.dbName, "UPDATE `tasks` SET url = '" + url + "', status = '2' WHERE task_id = '" + pid + "'");
            this.url = url;
            this.frame = addFrame();
            this.canvas = addCanvas();
            
            listener.init(this.frame);
            events.init(this.frame);

            hooker.init();
            this.timekill(90000);

            this.frame.webNavigation.loadURI(this.url,Components.interfaces.nsIWebNavigation,null,null,null);
        }

        this.destroy = function()
        {
            this.timekill(0);
            hooker.enumerate();

            events.destroy(this.frame);
            listener.destroy(this.frame);

            killCanvas(this.canvas);
            killFrame(this.frame);

            sqLite.cmd(inceptor.dbName, "UPDATE `tasks` SET status = '3' WHERE task_id = '" + pid + "'");
            delete this;
        }

        this.timekill = function (lifetime)
        {
            if(timer != null || lifetime == 0) {
                clearTimeout(timer);
                timer = null;
            }
            if(lifetime != 0) {
                timer = setTimeout(function(obj) { obj.destroy(); }, lifetime, this);
            }
        }

        this.initSubTask = function(url) 
        {
            var subtask = new inceptor.subTask(this, url);
            this.subtasks.push(subtask);
            return subtask;
        }

        this.getSubTask = function(url)
        {
            var sub = [];
            for(num in this.subtasks) {
                var subtask = this.subtasks[num];
                if(subtask.url == url) {
                    sub.push(subtask);
                }
            }

            if(sub.length == 1) {
                return sub[0];
            } else if(sub.length == 0) {
                return false;
            } else if(sub.length > 1) {
                return sub[sub.length - 1];
            }
        }

        this.updateStatus = function(status) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `statuses`(task_id, msg) VALUES ('" + pid + "','" + sqLite.addslashes(status.msg) + "')");
        }

        this.updateRedirect = function(redirect) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `redirects`(task_id, from_url, to_url, type) VALUES ('" + pid + "','" + sqLite.addslashes(redirect.from) + "','"+ sqLite.addslashes(redirect.to) + "','" + redirect.type + "')");
        }


    }
    return new task();
};

inceptor.subTask = function(task, url) 
{
    var pid = sqLite.cmd(inceptor.dbName,"INSERT INTO `subtasks`(task_id, url) VALUES ('" + task.pid + "','" + sqLite.addslashes(url) + "')");

    function subtask() {

        this.url = url;
        this.pid = pid;

        this.injector = null;
        this.overrides = [];
        this.statistics = [];

        this.updateSecurity = function(secure) {
            sqLite.cmd(inceptor.dbName, "UPDATE `subtasks` SET security = '" + sqLite.addslashes(secure) + "' WHERE subtask_id = '" + pid + "'"); 
        }

        this.updateErrors = function(errorStatus, errorCode, errorDesc) {
            sqLite.cmd(inceptor.dbName, "UPDATE `subtasks` SET error_status = '" + errorStatus + "', error_code = '" + sqLite.addslashes(errorCode) + "', error_desc = '" + sqLite.addslashes(errorDesc) + "' WHERE subtask_id = '" + pid + "'"); 
        }

        this.updateHTTPMethods = function(requestMethod, requestSuccess, responseStatus, responseStatusText, responseMimeType) {
            sqLite.cmd(inceptor.dbName, "UPDATE `subtasks` SET request_method = '" + sqLite.addslashes(requestMethod) + "', request_status = '" + requestSuccess + "', response_status_code = '" + sqLite.addslashes(responseStatus) + "', response_status_text = '" + sqLite.addslashes(responseStatusText) + "', response_mime_type = '" + sqLite.addslashes(responseMimeType) + "' WHERE subtask_id = '" + pid + "'");
        }

        this.updateDomSource = function(domSource) {
            sqLite.cmd(inceptor.dbName, "UPDATE `subtasks` SET dom_source = '" + sqLite.addslashes(domSource) + "' WHERE subtask_id = '" + pid + "'");
        }

        this.updateSource = function(source) {
            sqLite.cmd(inceptor.dbName, "UPDATE `subtasks` SET source = '" + sqLite.addslashes(source) + "' WHERE subtask_id = '" + pid + "'");
        }

        this.updateHeaders = function(requestHeaders, responseHeaders) {

            var header = null;
            var name = null;
            var value = null;

            for(x in requestHeaders) {
                header = requestHeaders[x];
                name = sqLite.addslashes(header.name);
                value = sqLite.addslashes(header.value);
                sqLite.cmd(inceptor.dbName, "INSERT INTO `request_headers`(subtask_id, name, value) VALUES ('" + pid + "','" + name + "', '" + value + "')");
            }

            for(x in responseHeaders) {
                header = responseHeaders[x];
                name = sqLite.addslashes(header.name);
                value = sqLite.addslashes(header.value);
                sqLite.cmd(inceptor.dbName, "INSERT INTO `response_headers`(subtask_id, name, value) VALUES ('" + pid + "','" + name + "', '" + value + "')");
            }
        }

        this.updateScriptEval = function(script) {
            if(!script.functionName) script.functionName = "__inline__";
            sqLite.cmd(inceptor.dbName, "INSERT INTO `script_calls`(subtask_id, tag, function_name, base_line, total_lines, source) VALUES ('" + pid + "','" + script.tag + "','" + sqLite.addslashes(script.functionName) + "','" + script.baseLine + "','" + script.totalLines + "','" + sqLite.addslashes(script.functionSource) + "')");    
        }

        this.updateScriptError = function(script) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `script_errors`(subtask_id, line, msg) VALUES ('" + pid + "', '" + script.lineNumber + "', '" + sqLite.addslashes(script.msg) + "')");
        }

        this.updateFuncCall = function(script) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `func_calls`(subtask_id, line, func_name) VALUES ('" + pid + "', '" + script.line + "', '" + sqLite.addslashes(script.functionName) + "')");
        }

        this.updateFuncReturn = function(script) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `func_returns`(subtask_id, line, func_name) VALUES ('" + pid + "', '" + script.line + "', '" + sqLite.addslashes(script.functionName) + "')");
        }

        this.updateScriptProfiler = function(script) {
            sqLite.cmd(inceptor.dbName, "UPDATE `script_calls` SET call_count = '" + script.callCount + "', total_exec_time = '" + script.totalExecutionTime + "', total_own_exec_time = '" + script.totalOwnExecutionTime + "', min_exec_time = '" + script.minExecutionTime + "', max_exec_time = '" + script.maxExecutionTime + "' WHERE subtask_id = '" + pid + "' AND tag = '" + script.tag + "'");    
        }

        this.updateStatistic = function(name, data) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `statistic_results`(subtask_id, name, data) VALUES ('" + pid + "','" + sqLite.addslashes(name) + "','" + sqLite.addslashes(data) + "')");
        }

        this.updateOverride = function(name, data) {
            sqLite.cmd(inceptor.dbName, "INSERT INTO `override_results`(subtask_id, name, data) VALUES ('" + pid + "','" + sqLite.addslashes(name) + "','" + sqLite.addslashes(data) + "')");
        }


    }
    return new subtask();
}

inceptor.HTTPD = function ()
{

    function httpParser(packet) 
    {
        params = false;
 
        get_parser = function(data){
            try {
                var params = {};
                var url = data.split(/[\n\r]/)[0].split(" ")[1];
                var query = url.split("?")[1];
                if (query) {
                    var tokens = query.split("&");
                    for (var i = 0; i < tokens.length; i++) {
                        var token = tokens[i];
                        var param = token.split("=");
                        var name = param[0];
                        var value = decodeURIComponent(param[1]);
                        params[name] = value;
                    }
                }
                return params;
            } catch(e) {
                inceptor.log("Error on packetParser.getparser: " + e, 0);
                return false;
            }
        }

        if( packet.match("([\n]{2}|[\r]{2}|(\r\n){2})") || packet.match(/GET *(\/[^ ?]*)\??([^ ]*)/)) {
            params = get_parser(packet);
            return params;
        }
 
        return false;
    }
 

    function asyncListener()
    { 
        this.onStopListening = function(sockid, status) 
        {
            try {
                inceptor.log("Listening stop", 0);
            } catch (e) {
                inceptor.log("Fail on stop listening " + e, 0);
            }
        }

        this.onSocketAccepted = function(sockid, transport) 
        {
            try {
                var data = "";
                var result = null;

                var stream = transport.openInputStream(0,0,0);
                var outstream = transport.openOutputStream(0,10000000,100000);
                var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
                var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);

                var dataList = {
                    onStartRequest: function(request, context) 
                    {
                        try {
                            inceptor.log("Client connected: " + transport.host + ":" + transport.port, 0);
                        } catch(e) {
                            inceptor.log("Error on dataList.onStartRequest: " + e, 0);
                        }
                    },

                    onStopRequest: function(request, context, status) 
                    {
                        try {
                            inceptor.log("Client disconnected: " + transport.host + ":" + transport.port, 0);
                            instream.close();
                            outstream.close();
                        } catch(e) {
                            inceptor.log("Error on dataList.onStopRequest: " + e, 0);
                        }
                    },

                    onDataAvailable: function( request, context, inputStream, offset, count ) 
                    {
                        try {
                            var bis = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream );
                            bis.setInputStream(stream);
                            data += bis.readBytes(count);
                            if( result = httpParser(data) ) {
                                if(result.url && result.url.match(/^https?\:\/\/.*$/)) {

                                    var task = new inceptor.Task(transport.host, transport.port, instream, outstream);
                                    task.init(result.url);

                                    tasks.push(task);

                                    inceptor.log("Client task accepted", 0);
                                    var headers = "HTTP/1.0 200 OK\nContent-type: text/html\n\n";
                                    var body = "<html><head><title>Successfull</title></head><body>Work successfully accepted</body></html>\n";

                                } else {

                                    inceptor.log("Client sends bad URI, disconnect", 0);
                                    var headers = "HTTP/1.0 Bad Request\nContent-type: text/html\n\n";
                                    var body = "<html><head><title>Error</title></head><body>This is not correct URI</body></html>\n";

                                }
                            } else {
                                inceptor.log("Client sends bad method, disconnect", 0);
                                var headers = "HTTP/1.0 405 Method Not Allowed\nContent-type: text/html\n\n";
                                var body = "<html><head><title>Error</title></head><body>Allowed only GET method</body></html>\n";
                            }
                        
                            var response = headers + body;
                            outstream.write(response, response.length);
                            instream.close();
                            outstream.close();
                        } catch(e) {
                            inceptor.log("Error on dataList.onDataAvailable: " + e, 0);
                        }
                    }
                };                

                if(transport.setTimeout) { // FF 1.0.0 does not allow this
                    transport.setTimeout(1, 60); // 60s timeout for connection
                }
                instream.init(stream);
                pump.init(stream, -1, -1, 1000000, 100, true);
                pump.asyncRead(dataList,null);

            } catch (e) {
                inceptor.log("Error on asyncListener.onSocketAccepted: " + e, 0);
            } 
        }
    }

    function httpd() 
    {
        this.serverSocket = null;
        
        this.start = function (port)
        {
            try {
                this.serverSocket = Components.classes["@mozilla.org/network/server-socket;1"].createInstance(Components.interfaces.nsIServerSocket);
                this.serverSocket.init(port, false, -1);
                this.serverSocket.asyncListen(new asyncListener);
                inceptor.log("HTTPD started on port: " + port, 0);
                return true;
            } catch(e) {
                inceptor.log("Error on HTTPD.start: " + e);
                return false;
            }
        }
    
        this.stop = function ()
        {
            try {
                inceptor.log("HTTPD stopped", 0);
            } catch(e) {
                inceptor.log("Error on HTTPD.stop: " + e);
                return false;
            }
        }

    };

    return new httpd();
};

inceptor.Debug = function () 
{
    jsd = Components.classes["@mozilla.org/js/jsd/debugger-service;1"].getService(Components.interfaces["jsdIDebuggerService"]);

    function debug()
    {
        this.enable = function()
        {
            jsd.on();
            jsd.flags |= Components.interfaces["jsdIDebuggerService"].COLLECT_PROFILE_DATA;
            jsd.flags |= Components.interfaces["jsdIDebuggerService"].DISABLE_OBJECT_TRACE;
            inceptor.log("JSD started", 0);
        }

        this.disable = function()
        {
            jsd.off();
            inceptor.log("JSD stopped", 0);
        }
    
    };

    return new debug();
};

inceptor.Hooker = function (task)
{
    var pid = task.pid;
    var subtask = null;

    function getSubTask(file) {
        var subtsks = [];
        for(num in tasks) {
            var tsk = tasks[num];
            var subtsk = tsk.getSubTask(file);
            if(subtsk) {
                subtsks.push(subtsk);
            }
        }
        if(subtsks.length == 1) {
            return subtsks[0];
        } else if(subtsks.length == 0) {
            return false;
        } else if(subtsks.length > 1) {
            return subtsks[subtsks.length - 1];
        }
    }

    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

    function getDirURL(key) {
        try {
            var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get(key, Components.interfaces.nsIFile);
            return Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newFileURI(file).spec.toLowerCase().replace(/\/+/g, "/");
        } catch (e) {
            return null;
        }
    }

    function checkFilter(fileName) {
        if(!fileName) return false;
        fileName = fileName.toLowerCase().replace(/\/+/g, "/");
        if (fileName.substr(0,3) == "xpc" || fileName.substr(0,3) == "xst" || fileName.indexOf("chrome:/") == 0 || fileName.indexOf("about:") == 0 || (getDirURL("GreD") && fileName.indexOf(getDirURL("GreD")) == 0) || (getDirURL("ProfD") && fileName.indexOf(getDirURL("ProfD")) == 0)) {
            return false;
        } else {
            return true;
        }
    }

    var scriptHook = {
        onScriptCreated: function(script) 
        {           
            if(checkFilter(script.fileName)) {
                subtask = getSubTask(script.fileName);
                if(subtask) {
                    inceptor.log("[" + pid + "] Insert SCRIPT(" + script.tag + ") call(functionName: "+script.functionName+", fileName: "+script.fileName, 1);
                    subtask.updateScriptEval({tag: script.tag, functionName: script.functionName, baseLine: script.baseLineNumber, totalLines: script.lineExtent, functionSource: script.functionSource});
                } else {
                    inceptor.log("[" + pid + "] Fail to associate filename and subtask, for SCRIPT call(functionName: "+script.functionName+", fileName: "+script.fileName, 1);
                }
            }
        },
        onScriptDestroyed: function(script) {},
        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.jsdIScriptHook])
    }

    var errorHook = {
        onError: function(message, fileName, lineNo, pos, flags, errnum, exc) {
            if(checkFilter(fileName)) {
                subtask = getSubTask(fileName);
                if(subtask) {
                    var _script = {lineNumber: lineNo, msg: message};
                    subtask.updateScriptError(_script);
                    inceptor.log("[" + pid + "] Insert SCRIPT error: " + message + "@" + fileName + "." + lineNo, 1);
                } else {
                    inceptor.log("[" + pid + "]  Fail to associate filename and subtask, for insert SCRIPT error: " + message + "@" + fileName + "." + lineNo, 1);
                }
                return true;
            }
        }
    };

    var functionHook = {
        onCall: function(frame, type) {
            if(checkFilter(frame.script.fileName)) {
                subtask = getSubTask(frame.script.fileName);
                if(subtask) {
                    if (type == Components.interfaces.jsdICallHook.TYPE_FUNCTION_RETURN) {
                        subtask.updateFuncReturn({functionName: frame.functionName, line: frame.line});
                        inceptor.log("[" + pid + "] Insert SCRIPT(" + frame.script.tag + ") func return: " + frame.script.fileName+"#"+frame.functionName+":"+frame.line, 1);
                    } else if (type == Components.interfaces.jsdICallHook.TYPE_FUNCTION_CALL) {
                        subtask.updateFuncCall({functionName: frame.functionName, line: frame.line});
                        inceptor.log("[" + pid + "] Insert SCRIPT(" + frame.script.tag + ") func call: " + frame.script.fileName+"#"+frame.functionName+":"+frame.line, 1);
                    }
                } else {
                    inceptor.log("[" + pid + "]  Fail to associate filename and subtask, for insert SCRIPT func: " + frame.script.fileName+"#"+frame.functionName, 1);
                }
            }
        }
    }

    var enumerateScripts = {
        enumerateScript: function(script) {
            if(checkFilter(script.fileName)) {
                if (script.callCount) {
                    subtask = getSubTask(script.fileName);
                    if(subtask) {
                        inceptor.log("[" + pid + "] SCRIPT(" + script.tag + ") enumerate: " + script.fileName + ", callCount: " + script.callCount + ", totalExecTime: " + script.totalExecutionTime + ", totalOwnExecTime: " + script.totalOwnExecutionTime + ", minexecTime: " + script.minExecutionTime + ", maxExecTime: " + script.maxExecutionTime, 1);
                        subtask.updateScriptProfiler({tag: script.tag, callCount: script.callCount, totalExecutionTime: script.totalExecutionTime, totalOwnExecutionTime: script.totalOwnExecutionTime, minExecutionTime: script.minExecutionTime, maxExecutionTime: script.maxExecutionTime});
                    } else {
                        inceptor.log("[" + pid + "] Fail to associate filename and subtask, for SCRIPT enumerate(" + script.tag + ") enumerate: " + script.fileName + ", functionName: "+ script.functionName+ ", callCount: " + script.callCount + ", totalExecTime: " + script.totalExecutionTime + ", totalOwnExecTime: " + script.totalOwnExecutionTime + ", minexecTime: " + script.minExecutionTime + ", maxExecTime: " + script.maxExecutionTime, 1);
                    }
                }
            }
        }
    }

    function hooker() 
    {
        this.init = function ()
        {
            inceptor.log("[" + pid + "] Add scripts hooks", 0);
            jsd.scriptHook = scriptHook;
            jsd.errorHook = errorHook;
    //        jsd.functionHook = functionHook;
            jsd.GC();
            
        }

        this.enumerate = function() {
            jsd.enumerateScripts(enumerateScripts);
        }

        this.destroy = function ()
        {
            jsd.GC();
        }   
 
    };

    return new hooker();
};

inceptor.Listener = function (task)
{
    var pid = task.pid;
    var subtask = null;

    function requestFilter(webProgress, request) {
        if ((webProgress != null) && ("DOMWindow" in webProgress) && request && (request.name.substr(0,4) == "http")) {
            return true;
        } else {
            return false;
        }
    }

    const mimeExtensionMap =
    {
        "txt": "text/plain",
        "html": "text/html",
        "htm": "text/html",
        "xhtml": "text/html",
        "xml": "text/xml",
        "css": "text/css",
        "js": "application/x-javascript",
        "jss": "application/x-javascript",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "png": "image/png",
        "bmp": "image/bmp",
        "swf": "application/x-shockwave-flash"
    };

    const mimeCategoryMap = 
    {
        "text/plain": "txt",
        "application/octet-stream": "bin",
        "text/html": "html",
        "text/xml": "html",
        "text/css": "css",
        "application/x-javascript": "js",
        "text/javascript": "js",
        "image/jpeg": "image",
        "image/gif": "image",
        "image/png": "image",
        "image/bmp": "image",
        "application/x-shockwave-flash": "flash"
    };

    function getFileExtension(url)
    {
        var lastDot = url.lastIndexOf(".");
        return url.substr(lastDot+1);
    };


    function getMimeType(request)
    {
        var mimeType = request.contentType;
        if (!mimeType || !(mimeType in mimeCategoryMap))
        {
            var ext = getFileExtension(request.name);
            if (!ext)
                return mimeType;
            else
            {
                var extMimeType = mimeExtensionMap[ext.toLowerCase()];
                return extMimeType ? extMimeType : mimeType;
            }
        }
        else
            return mimeType;
    }

    function detectRedirect(request, type) 
    {
        var redirect = new Object();
        var http = request.QueryInterface(Components.interfaces.nsIHttpChannel);

        if(type == "onstate") {
            redirect.type = "header";
            try {
                redirect.to = http.getResponseHeader("Location");
            } catch(e) {
                redirect.to = 'undefined';
            }
            redirect.from = request.name;            
        }

        if(type == "onlocation") {

            if(http.referrer) { 
                redirect.from = http.referrer.spec.toString();
            } else {
                redirect.from = null;
            }

            if(redirect.from) {
                redirect.type = "script";
            } else {
                redirect.type = "meta";
            }

            redirect.to = request.name;
        }

        inceptor.log("[" + pid + "] Detected \"" + redirect.type + "\" redirect from " + redirect.from + " to " + redirect.to);
        return redirect;
    }

    var WebProgressListener = {
        QueryInterface: function(iid) {
            if (iid.equals(Components.interfaces.nsIWebProgressListener) || iid.equals(Components.interfaces.nsISupportsWeakReference) || iid.equals(Components.interfaces.nsISupports)) {
                return this;
            }
            throw Components.results.NS_ERROR_NO_INTERFACE;
        },
        onStateChange: function(webProgress, request, stateFlags, status) 
        {
            const WPL = Components.interfaces.nsIWebProgressListener;
            if(requestFilter(webProgress, request)) {
            
                if (stateFlags & WPL.STATE_IS_REQUEST) {
                    if (stateFlags & WPL.STATE_START) {
                        inceptor.log("[" + pid + "] Request start: " + request.name);
                        subtask = task.initSubTask(request.name);
                        if(!subtask.injector) {
                            subtask.injector = new inceptor.Injector(task, subtask);
                        }
                   } else if (stateFlags & WPL.STATE_STOP) {

                        // understand status change

                        inceptor.log("[" + pid + "] Request stop: " + request.name);
                        subtask = task.getSubTask(request.name);
                        if(subtask) {
                            try {
                                /*
                                var http = request.QueryInterface(Components.interfaces.nsIHttpChannel);
                                
                                var requestMethod = http.requestMethod;
                                var responseStatus = request.responseStatus;                            
                                var responseStatusText = request.responseStatusText;
                                var requestSuccess = request.requestSucceeded;
                                var responseMimeType = getMimeType(request); 

                                subtask.updateHTTPMethods(requestMethod, requestSuccess, responseStatus, responseStatusText, responseMimeType);

                                var requestHeaders = [];
                                http.visitRequestHeaders({
                                    visitHeader: function(_name, _value)
                                    {
                                        requestHeaders.push({name: _name, value: _value});
                                    }
                                });

                                var responseHeaders = [];
                                http.visitResponseHeaders({
                                    visitHeader: function(_name, _value)
                                    {
                                        responseHeaders.push({name: _name, value: _value});
                                    }
                                });

                                subtask.updateHeaders(requestHeaders, responseHeaders);
                            */
                                var errorStatus = false;
                                var errorCode = null;
                                var errorDesc = null;
                                subtask.updateErrors(errorStatus, errorCode, errorDesc);

                            } catch(e) {
                                inceptor.log("[" + pid + "] Some error during parse headers: " + e);
                            }
                        } else {
                            inceptor.log("[" + pid + "] Fail to associate subtask with " + request.name);
                        }  
                    } else if(stateFlags & WPL.STATE_REDIRECTING) {
                        inceptor.log("[" + pid + "] Request redirecting: " + request.name);
                        var redirect = detectRedirect(request, "onstate");
                        task.updateRedirect(redirect);
                    } else if(stateFlags & WPL.STATE_TRANSFERRING) {
                        inceptor.log("[" + pid + "] Request transferring: " + request.name);
                    }
                }

                if (stateFlags & WPL.STATE_IS_DOCUMENT) {
                    if (stateFlags & WPL.STATE_START) {
                        inceptor.log("[" + pid + "] Document start: " + request.name);
                    } else if (stateFlags & WPL.STATE_STOP) {
                        inceptor.log("[" + pid + "] Document stop: " + request.name); 
                    } else if(stateFlags & WPL.STATE_REDIRECTING) {
                        inceptor.log("[" + pid + "] Document redirecting: " + request.name);
                    } else if(stateFlags & WPL.STATE_TRANSFERRING) {
                        inceptor.log("[" + pid + "] Document transferring: " + request.name);
                        subtask = task.getSubTask(request.name);
                        if(subtask.injector && !subtask.injector.initBeforeStatus) {
                            subtask.injector.initBefore(webProgress.DOMWindow);
                        }
                    }
                }

                if (stateFlags & WPL.STATE_IS_WINDOW) {
                    if (stateFlags & WPL.STATE_START) {
                        inceptor.log("[" + pid + "] Window start: " + request.name);
                    } else if (stateFlags & WPL.STATE_STOP) {
                        inceptor.log("[" + pid + "] Window stop: " + request.name);
                    } else if(stateFlags & WPL.STATE_REDIRECTING) {
                        inceptor.log("[" + pid + "] Window redirecting: " + request.name);
                    } else if(stateFlags & WPL.STATE_TRANSFERRING) {
                        inceptor.log("[" + pid + "] Window transferring: " + request.name);
                    }
                }

                if (stateFlags & WPL.STATE_IS_NETWORK) {
                    if (stateFlags & WPL.STATE_START) {
                        inceptor.log("[" + pid + "] Network start: " + request.name);
                    } else if (stateFlags & WPL.STATE_STOP) {
                        inceptor.log("[" + pid + "] Network stop: " + request.name);
                    } else if(stateFlags & WPL.STATE_REDIRECTING) {
                        inceptor.log("[" + pid + "] Network redirecting: " + request.name);
                    } else if(stateFlags & WPL.STATE_TRANSFERRING) {
                        inceptor.log("[" + pid + "] Network transferring: " + request.name);
                    }
                }
            }
        },
        onProgressChange: function(webProgress, request, curSelf, maxSelf, curTotal, maxTotal) {
            //if(requestFilter(webProgress, request)) {
                //inceptor.log("[" + pid + "] Progress change: " + request.name);
            //}
        },
        onLocationChange: function(webProgress, request, location) {
            if(requestFilter(webProgress, request)) {
                inceptor.log("[" + pid + "] Location change to " + location.spec);

                var redirect = detectRedirect(request, "onlocation");
                task.updateRedirect(redirect);

                subtask = task.getSubTask(request.name);
                if(subtask) {
                    if(subtask.injector && !subtask.injector.initBeforeStatus) { 
                        subtask.injector.initBefore(webProgress.DOMWindow); 
                    }
                } else {
                    inceptor.log("[" + pid + "] Fail to associate subtask and " + request.name);
                }
            }
        },
        onStatusChange: function(webProgress, request, status, message) {
            if(requestFilter(webProgress, request)) {
                task.updateStatus({msg: message});
                inceptor.log("[" + pid + "] Status change: " + message + " # " + request.name);
            }
        },
        onSecurityChange: function(webProgress, request, state) {
            const WPL = Components.interfaces.nsIWebProgressListener;
            if(requestFilter(webProgress, request)) {
                subtask = task.getSubTask(request.name);
                if(subtask) {
                    var security = null;
                    if (state & WPL.STATE_IS_INSECURE) {
                        security = "none";
                    } else {
                        security = "unknown";
                        if (state & WPL.STATE_IS_SECURE) {
                            if (state & WPL.STATE_SECURE_HIGH) {
                                security = "high";
                            } else if (state & WPL.STATE_SECURE_MED) {
                                security = "medium";
                            } else if (state & WPL.STATE_SECURE_LOW)
                                security = "low";
                            } else if (state & WPL_STATE_IS_BROKEN) {
                                security = "mixed";
                            }
                    }
                    subtask.updateSecurity(security);
                    inceptor.log("[" + pid + "] Security status: " + security + " # " + request.name);
                } else {
                    inceptor.log("[" + pid + "] Fail to associate subtask and " + request.name);
                }
            }
        }
    }        

    function listener() 
    {
        this.init = function(frame)
        {
            try {
                frame.addProgressListener(WebProgressListener,Components.interfaces.nsIWebProgress.NOTIFY_ALL);
            //    inceptor.log("[" + pid + "] Add frame progress listener", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] Fail to add frame progress listener", 0);
            }
        }

        this.destroy = function(frame)
        {
            try {
                frame.removeProgressListener(WebProgressListener);
            //    inceptor.log("[" + pid + "] Remove frame progress listener", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] Fail to remove frame progress listener: " + e, 0);
            }
        }
    };

    return new listener();
};

inceptor.Events = function (task)
{
    var pid = task.pid;
    var subtask = null;

    function getErrorCode(url)
    {
        var error = url.search(/e\=/);
        var duffUrl = url.search(/\&u\=/);
        return decodeURIComponent(url.slice(error + 2, duffUrl));
    }

    function getErrorDescription(url)
    { 
        var desc = url.search(/d\=/);
    
        // desc == -1 if not found; if so, return an empty string
        // instead of what would turn out to be portions of the URI
        if (desc == -1)
          return "";

        return decodeURIComponent(url.slice(desc + 2));
    }

    function scrot(frame, canvas) 
    {
        var w = frame.contentDocument.width;
        var h = frame.contentDocument.height;

        canvas.style.display = "inline";
        canvas.width = w;
        canvas.height = h;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(1, 1);
        ctx.drawWindow(frame.contentWindow, 0, 0, w, h, "rgb(255,255,255)");
        ctx.restore();

        var img = canvas.toDataURL("image/png");
        img = img.split(",")[1].base64decode();

        canvas.style.display = "none";
        canvas.width = 1;
        canvas.height = 1;
        
        inceptor.log("[" + pid + "] Made screenshot");

        return img;
    }

    function onLoad(event) 
    {
        var doc = event.originalTarget;
        var url = doc.location.href;
        if (url == "about:blank" || doc.defaultView.frameElement) return;
        inceptor.log("[" + pid + "] Load event on: " + url, 0);

       // var screenshot = scrot(task.frame, task.canvas);
       // task.screenshot = screenshot;
    }

    function onDOMLoad(event) 
    {
        var doc = event.originalTarget;
        var url = doc.location.href;
        var uri = doc.documentURI;

        inceptor.log("[" + pid + "] Have some DOM for: " + url, 1);

        subtask = task.getSubTask(url);
        if(!subtask) {
            inceptor.log("[" + pid + "] Fail to associate subtask and DOM for: " + url, 1);
            return;
        }

        if(uri.substr(0,14) == "about:neterror") {
            var errorStatus = true;
            var errorCode = getErrorCode(uri);
            var errorDesc = getErrorDescription(uri);
            subtask.updateErrors(errorStatus, errorCode, errorDesc);

            //inceptor.log("[" + pid + "] Insert network error: " + errorCode + " # " + errorDesc, 0);
            return;
        }

        var serializer = new XMLSerializer();
        var domSource = serializer.serializeToString(doc);
        subtask.updateDomSource (domSource);

        var source = doc.documentElement.innerHTML;
        subtask.updateSource (source);

        if(subtask.injector) {
            subtask.injector.initAfter(event.target.defaultView);
        }

    }

    function events() 
    {
        this.init = function(frame)
        {
            try {
                frame.addEventListener("load", onLoad, true);
                frame.addEventListener("DOMContentLoaded", onDOMLoad, true);
            //    inceptor.log("[" + pid + "] Add frame load listeners", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] Fail to add frame event listeners", 0);
            }
        }

        this.destroy = function(frame)
        {
            try {
                frame.removeEventListener("DOMContentLoaded", onDOMLoad, true);
                frame.removeEventListener("load", onLoad, true);
            //    inceptor.log("[" + pid + "] Remove frame event listeners", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] Fail to remove frame event listeners: " + e, 0);
            }
        }
    };

    return new events();
};

inceptor.Injector = function (task, subtask)
{
    var pid = task.pid;

    function unsafeDataSave(type, name, data) {
        if(type == "override") {
            subtask.updateOverride(name, data);
        } else if(type == "statistic") {
            subtask.updateStatistic(name, data);
        }
    }

    function createSandbox(safeWin, unsafeWin) {

        var sandbox = new Components.utils.Sandbox(safeWin);
        sandbox.window = safeWin;
        sandbox.document = sandbox.window.document;
        sandbox.unsafeWindow = unsafeWin;
        sandbox.__proto__ = safeWin;
        sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult;

        sandbox.logger = function(str) { inceptor.log("[" + pid + "] " + str, 1) };        
        sandbox._unsafe_data_save = function(type, name, data) { unsafeDataSave(type, name, data) };
 
        if (Components.utils && Components.utils.Sandbox) {
        //    inceptor.log("[" + pid + "] Inject sandbox created", 1);
            return sandbox;
        } else {
            inceptor.log("[" + pid + "] Fail to create inject sandbox", 1);
            return false;
        }
    }

    function inject(DOMWindow, scripts) {
   
        var script = null;
        var unsafeWin = DOMWindow.wrappedJSObject;
        var safeWin = new XPCNativeWrapper(unsafeWin);
        var safeDoc = safeWin.document;

        var sandbox = createSandbox(safeWin, unsafeWin);

        for (var i = 0; script = scripts[i]; i++) {
            try {
                var mod_script = "(function(){ if(!unsafeWindow." + script['desc'] + "_override) {" + script['body'] + "  unsafeWindow." + script['desc'] + "_override=true;}})()";
                Components.utils.evalInSandbox(mod_script, sandbox);
            //    inceptor.log("[" + pid + "] " + script['desc'] + " injected to " + DOMWindow.location);
            } catch(e) {
                inceptor.log(mod_script);
                inceptor.log("[" + pid + "] Shit with \"" + script['desc'] + "\" injection happened: " + e);
            }
        }
    }

    function loadOverrides() {
        var overrides = [];
        var res = sqLite.select(inceptor.dbName,'SELECT id, desc, body FROM override');
        for(var i = 0; i < res.length; i++) {
            overrides.push(res[i]);
        }
        return overrides;
    }

    function loadStatistics() {
        var statistics = [];
        var res = sqLite.select(inceptor.dbName,'SELECT id, desc, body FROM statistic');
        for(var i = 0; i < res.length; i++) {
            statistics.push(res[i]);
        }
        return statistics;
    }

    function injector() 
    {
        this.initBeforeStatus = false;
        this.initAfterStatus = false;    

        this.initBefore = function(DOMWindow)
        {
        //    inceptor.log("[" + pid + "] Try to add before load injector", 0);
            try {
                var overrides = loadOverrides();
                inject(DOMWindow, overrides);
                this.initBeforeStatus = true;
            //    inceptor.log("[" + pid + "] Before load injector: LOADED", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] Before load injector: FAILED", 0);
            }
        }

        this.initAfter = function(DOMWindow)
        {
         //   inceptor.log("[" + pid + "] Try to add after load injector", 0);
            try {
                var statistics = loadStatistics();
                inject(DOMWindow, statistics);
                this.initAfterStatus = true;
            //    inceptor.log("[" + pid + "] After load injector: OK", 0);
            } catch(e) {
                inceptor.log("[" + pid + "] After load injector: FAILED " + e, 0);
            }
        }
    };

    return new injector();
};


window.addEventListener("load",   inceptor.startup,  false);
window.addEventListener("unload", inceptor.shutdown, false);

// vim: set fdm=marker sw=4 ts=4 et:
