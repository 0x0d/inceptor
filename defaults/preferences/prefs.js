pref("toolkit.defaultChromeURI", "chrome://inceptor/content/inceptor.xul");
pref("toolkit.singletonWindowType", "inceptor");
pref("toolkit.defaultChromeFeatures", "chrome,menubar,toolbar,status,resizable=no,dialog=no");


/* debugging prefs */

// enable output for dump()
pref("browser.dom.window.dump.enabled", true);

pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", false);

// There is no reason not to use the cache within a session, though
pref("nglayout.debug.disable_xul_cache", true);

// This prevents cached versions of XUL and JavaScript files from being saved to disk
pref("nglayout.debug.disable_xul_fastload", true);


// 0=default window, 1=current window/tab, 2=new window, 3=new tab in most recent window

pref("browser.link.open_external", 1);

// handle links targeting new windows

pref("browser.link.open_newwindow", 1);

pref("dom.max_script_run_time", 180);

// 0: no restrictions - divert everything
// 1: don't divert window.open at all
// 2: don't divert window.open with features
pref("browser.link.open_newwindow.restriction", 0);

pref("content.interrupt.parsing", true);
pref("content.max.tokenizing.time", 2250000);
pref("content.maxtextrun", 8191);
pref("content.notify.backoffcount", 5);
pref("content.notify.interval", 750000);
pref("content.notify.ontimer", true);
pref("content.switch.threshold", 750000);

/* ------------------ Warnings and accessibility -------------------- */

// Show error pages instead of an alert window
pref("browser.xul.error_pages.enabled", true);
// Disable useless warnings 
pref("general.warnOnAboutConfig", false);
// Disable CSS errors
pref("layout.css.report_errors", false);
// Disable security warnings
pref("security.warn_entering_secure", false);
pref("security.warn_entering_weak", false);
pref("security.warn_leaving_secure", false);
pref("security.warn_submit_insecure", false);
pref("security.warn_viewing_mixed", false);

// Disable the browser-wide status bar change pref
pref("dom.disable_window_status_change", true);
pref("dom.disable_window_open_feature.status", true);
pref("dom.disable_open_during_load",              true);
// prevent JS from monkeying with window focus, etc
pref("dom.disable_window_flip",                   true);
// disable JS to move and resize existing windows
pref("dom.disable_window_move_resize",            true);

// Disable window.status changes by default
pref("capability.policy.default.Window.status", "noAccess");

// By default, prevent scripts from setting the title of documents
pref("capability.policy.default.HTMLDocument.title.set", "noAccess");

// Disable sidebar-associated functions, including addPanel()
pref("capability.policy.default.Window.sidebar", "noAccess");

// Prevent web pages from triggering File -> Print
pref("capability.policy.default.Window.print", "noAccess");


pref("capability.policy.default.Window.alert", "noAccess");
pref("capability.policy.default.Window.confirm", "noAccess");
pref("capability.policy.default.Window.prompt", "noAccess");


/* --------------- Cookies --------------- */
// 0 = accept all cookies by default
// 1 = only accept from the originating site (block third party cookies)
// 2 = block all cookies by default

pref("network.cookie.cookieBehavior", 0);

// Only used if network.cookie.lifetimePolicy is set to 3
// Sets the number of days that the lifetime of cookies should be limited to. 
pref("network.cookie.lifetime.days", 90);

// Configures the maximum amount of cookies to be stored
// Valid range is from 0-65535, RFC 2109 and 2965 require this to be at least 300 
pref("network.cookie.maxNumber", 1000);

//Configures the maximum amount of cookies to be stored per host
//Valid range is from 0-65535, RFC 2109 and 2965 require this to be at least 20 
pref("network.cookie.maxPerHost", 50);


/* ---------------- Cache Prefs ------------------- */
// Compare the page in cache to the page on the network:
// 1 = Every time I view the page
// 0 = Once per session
// 3 = When the page is out of date (default)
// 2 = Never
pref("browser.cache.check_doc_frequency", 0);

// Disk cache capacity KB
pref("browser.cache.disk.capacity", 0);

// Enabling disk cache
pref("browser.cache.disk.enable", false);

// Enabling memory cache
pref("browser.cache.memory.enable", true);

// Memory cache capacity KB
pref("browser.cache.memory.capacity", 65536);

/* -------------- DNS cache prefs ---------------- */
// DNS Cache expication time in sec
pref("network.dnsCacheExpiration", 3600);

// DNS Cache capacity
pref("network.dnsCacheEntries", 1024);

/* --------------- HTTP Connection Prefs --------------------- */
pref("network.http.use-cache", false);
pref("network.http.max-connections", 48);
pref("network.http.max-connections-per-server", 16);
pref("network.http.max-persistent-connections-per-server", 16);
pref("network.http.max-persistent-connections-per-proxy", 8);

// Prefetch web pages when idle, so that links in web page designed for prefetching can load faster.
pref("network.prefetch-next", false);

// Connection timeout
pref("network.ftp.idleConnectionTimeout", 5);
pref("network.http.connect.timeout", 5);
pref("network.http.request.timeout", 5);

// Keep-alive
pref("network.http.keep-alive", false);
pref("network.http.keep-alive.timeout", 10);
pref("network.http.proxy.keep-alive", false);

// HTTP Pipelining Prefs
pref("network.http.pipelining", true);
pref("network.http.proxy.pipelining", true);
pref("network.http.pipelining.firstrequest", true);
pref("network.http.pipelining.maxrequests", 8);
pref("content.notify.backoffcount", 5);
pref("plugin.expose_full_path", true);
pref("ui.submenuDelay", 0); 

// 0 - Never send the Referer header or set document.referrer.
// 1 - Send the Referer header when clicking on a link, and set document.referrer for the following page.
// 2 -Send the Referer header when clicking on a link or loading an image, and set document.referrer for the following page. (Default) 
pref("network.http.sendRefererHeader", 2);

// Maximum number of redirects to follow per request(only header redirect)
pref("network.http.redirection-limit", 20);

/* ----------------- Proxy prefs ----------------- */

// 0 = direct(Direct connection to the internet)
// 1 = manual(Manual proxy configuration)
// 2 = PAC(Auto-detect proxy settings)
// 3 = mapped to 0 (was old Communicator value for DIRECT)
// 4 = WPAD(Automatic proxy configuration URL)
pref("network.proxy.type", 0);
pref("network.proxy.http","");
pref("network.proxy.http_port",0);
pref("network.proxy.ssl","");
pref("network.proxy.ssl_port",0);
pref("network.proxy.socks","");
pref("network.proxy.socks_port",0);
// 5 (default) and 4
pref("network.proxy.socks_version",5);
// Not use proxies on this adresses
pref("network.proxy.no_proxies_on","localhost, 127.0.0.1");

/* ------------- Misc ------------- */

// ldap
pref("network.protocol-handler.app.ldap", "/bin/true");
pref("network.protocol-handler.warn-external-default", false);
pref("network.protocol-handler.external.ldap", true);

// Rendering Prefs
pref("browser.sessionhistory.max_viewers", 0);
pref("nglayout.initialpaint.delay", 0);

pref("browser.download.useDownloadDir", true);
pref("browser.download.folderList", 2);
pref("browser.download.manager.retention", 0);
pref("browser.download.manager.showWhenStarting", false);
pref("browser.download.downloadDir", "/tmp/1/");
pref("browser.download.dir","/tmp/1/");
pref("browser.download.defaultFolder", "/tmp/1/");
pref("browser.download.lastDir", "/tmp/1/");
pref("browser.download.manager.openDelay", 0);
pref("browser.download.manager.focusWhenStarting", false);
pref("browser.download.manager.showAlertInterval", 0);
pref("browser.download.manager.showAlertOnComplete", false);
pref("browser.download.manager.quitBehavior", 2);
pref("browser.download.manager.closeWhenDone", true);
pref("browser.download.manager.flashCount", 0);
pref("browser.download.manager.useWindow", true);
pref("browser.helperApps.alwaysAsk.force", false);

pref("browser.helperApps.neverAsk.saveToDisk", "application/x-msdos-program, application/x-unknown-application-octet-stream, application/x-unknown, application/octet-stream,  application/vnd.ms-powerpoint, application/excel, application/vnd.ms-publisher, application/x-unknown-message-rfc822, application/vnd.ms-excel, application/msword, application/x-mspublisher, application/x-tar, application/zip, application/x-gzip,application/x-stuffit,application/vnd.ms-works, application/powerpoint, application/rtf, application/postscript, application/x-gtar, video/quicktime, video/x-msvideo, video/mpeg, audio/x-wav, audio/x-midi, audio/x-aiff, application/pdf, application/x-shockwave-flash");

pref("general.appname.override", "Microsoft Internet Explorer");
pref("general.appcodename.override","Microsoft Internet Explorer");
pref("general.appversion.override", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)");
pref("general.platform.override", "Win32");
pref("general.useragent.override","Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)");
pref("general.useragent.vendor","Microsoft");
pref("general.useragent.vendorSub","");

//pref("general.appname.override", "Microsoft Internet Explorer");
//pref("general.appcodename.override","Microsoft Internet Explorer");
//pref("general.appversion.override", "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1)");
//pref("general.platform.override", "Win32");
//pref("general.useragent.override","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1)");
//pref("general.useragent.vendor","Microsoft");
//pref("general.useragent.vendorSub","");


pref("extensions.scriptHook.filters", "{\"include\":[],\"exclude\":[\"chrome://\",\"%APPDIR%\",\"%PROFILEDIR%\",\"XStringBundle\",\"XPCSafeJSObjectWrapper.cpp\"]}");
