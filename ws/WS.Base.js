Core = {
    _copyFunction: function(a) {
        return function() {
            a.apply(this, arguments)
        }
    },
    _createFunction: function() {
        return function() {}
    },
    extend: function() {
        var h = arguments.length == 1 ? null : arguments[0];
        var g = arguments.length == 1 ? arguments[0] : arguments[1];
        var b, e;
        if (arguments.length == 2) {
            if (typeof(h) != "function") {
                throw new Error("Base class is not a function, cannot derive.")
            }
        }
        if (!g) {
            throw new Error("Object definition not provided.")
        }
        var a;
        if (g.$construct) {
            a = g.$construct;
            delete g.$construct
        } else {
            if (h) {
                a = Core._copyFunction(h)
            } else {
                a = Core._createFunction()
            }
        }
        a.$virtual = {};
        a.$super = h;
        if (h) {
            var f = Core._createFunction();
            f.prototype = h.prototype;
            a.prototype = new f()
        }
        a.prototype.constructor = a;
        if (g.$abstract) {
            a.$abstract = {};
            if (h && h.$abstract) {
                for (b in h.$abstract) {
                    a.$abstract[b] = h.$abstract[b]
                }
            }
            if (g.$abstract instanceof Object) {
                for (b in g.$abstract) {
                    a.$abstract[b] = true;
                    a.$virtual[b] = true
                }
            }
            delete g.$abstract
        }
        if (h) {
            for (e in h.$virtual) {
                a.$virtual[e] = h.$virtual[e]
            }
        }
        if (g.$virtual) {
            Core._inherit(a.prototype, g.$virtual, a.$virtual);
            for (e in g.$virtual) {
                a.$virtual[e] = true
            }
            delete g.$virtual
        }
        if (g.hasOwnProperty("toString")) {
            a.prototype.toString = g.toString
        }
        if (g.hasOwnProperty("valueOf")) {
            a.prototype.valueOf = g.valueOf
        }
        delete g.toString;
        delete g.valueOf;
        if (g.$include) {
            var c = g.$include.reverse();
            Core._processMixins(a, c);
            delete g.$include
        }
        var d = null;
        if (g.$load) {
            d = g.$load;
            delete g.$load
        }
        if (g.$static) {
            Core._inherit(a, g.$static);
            delete g.$static
        }
        Core._inherit(a.prototype, g, a.$virtual);
        if (!a.$abstract) {
            this._verifyAbstractImpl(a)
        }
        if (d) {
            d.call(a)
        }
        return a
    },
    get: function(a, c) {
        for (var b = 0; b < c.length; ++b) {
            a = a[c[b]];
            if (!a) {
                return null
            }
        }
        return a
    },
    _isVirtual: function(b, a) {
        switch (a) {
            case "toString":
            case "valueOf":
                return true
        }
        return b[a]
    },
    _inherit: function(a, d, c) {
        for (var b in d) {
            if (c && a[b] !== undefined && !this._isVirtual(c, b)) {
                throw new Error('Cannot override non-virtual property "' + b + '".')
            } else {
                a[b] = d[b]
            }
        }
    },
    method: function(a, b) {
        return function() {
            return b.apply(a, arguments)
        }
    },
    _processMixins: function(b, c) {
        for (var d = 0; d < c.length; ++d) {
            for (var a in c[d]) {
                if (b.prototype[a]) {
                    continue
                }
                b.prototype[a] = c[d][a]
            }
        }
    },
    set: function(a, e, d) {
        var c = null;
        for (var b = 0; b < e.length - 1; ++b) {
            c = a;
            a = a[e[b]];
            if (!a) {
                a = {};
                c[e[b]] = a
            }
        }
        a[e[e.length - 1]] = d
    },
    _verifyAbstractImpl: function(b) {
        var c = b.$super;
        if (!c || !c.$abstract || c.$abstract === true) {
            return
        }
        for (var a in c.$abstract) {
            if (b.prototype[a] == null) {
                throw new Error('Concrete class does not provide implementation of abstract method "' + a + '".')
            }
        }
    }
};
Core.Debug = {
    consoleElement: null,
    useAlertDialog: false,
    consoleWrite: function(b) {
        if (Core.Debug.consoleElement) {
            var a = document.createElement("div");
            a.appendChild(document.createTextNode(b));
            if (Core.Debug.consoleElement.childNodes.length === 0) {
                Core.Debug.consoleElement.appendChild(a)
            } else {
                Core.Debug.consoleElement.insertBefore(a, Core.Debug.consoleElement.firstChild)
            }
        } else {
            if (Core.Debug.useAlertDialog) {
                alert("DEBUG:" + b)
            }
        }
    },
    toString: function(b) {
        var c = "";
        for (var a in b) {
            if (typeof b[a] != "function") {
                c += a + ":" + b[a] + "\n"
            }
        }
        return c
    }
};
Core.Arrays = {
    containsAll: function(f, d, g) {
        if (g && f.length < d.length) {
            return false
        }
        if (d.length === 0) {
            return true
        }
        var e, c;
        for (var b = 0; b < d.length; ++b) {
            e = false;
            c = d[b];
            for (var a = 0; a < f.length; ++a) {
                if (c == f[a]) {
                    e = true;
                    break
                }
            }
            if (!e) {
                return false
            }
        }
        return true
    },
    indexOf: function(c, b) {
        for (var a = 0; a < c.length; ++a) {
            if (b == c[a]) {
                return a
            }
        }
        return -1
    },
    remove: function(c, b) {
        for (var a = 0; a < c.length; ++a) {
            if (b == c[a]) {
                c.splice(a, 1);
                return
            }
        }
    },
    removeDuplicates: function(c) {
        c.sort();
        var b = 0;
        for (var a = c.length - 1; a > 0; --a) {
            if (c[a] == c[a - 1]) {
                c[a] = c[c.length - 1 - b];
                ++b
            }
        }
        if (b > 0) {
            c.length = c.length - b
        }
    }
};
Core.Arrays.LargeMap = Core.extend({
    $static: {
        garbageCollectEnabled: false
    },
    _removeCount: 0,
    garbageCollectionInterval: 250,
    map: null,
    $construct: function() {
        this.map = {}
    },
    _garbageCollect: function() {
        this._removeCount = 0;
        var a = {};
        for (var b in this.map) {
            a[b] = this.map[b]
        }
        this.map = a
    },
    remove: function(a) {
        delete this.map[a];
        if (Core.Arrays.LargeMap.garbageCollectEnabled) {
            ++this._removeCount;
            if (this._removeCount >= this.garbageCollectionInterval) {
                this._garbageCollect()
            }
        }
    },
    toString: function() {
        return Core.Debug.toString(this.map)
    }
});
Core.ListenerList = Core.extend({
    _data: null,
    $construct: function() {
        this._data = []
    },
    addListener: function(a, b) {
        this._data.push(a, b)
    },
    fireEvent: function(d) {
        if (d.type == null) {
            throw new Error("Cannot fire event, type property not set.")
        }
        var a, c = true,
            b = [];
        for (a = 0; a < this._data.length; a += 2) {
            if (this._data[a] == d.type) {
                b.push(this._data[a + 1])
            }
        }
        for (a = 0; a < b.length; ++a) {
            c = b[a](d) && c
        }
        return c
    },
    getListenerTypes: function() {
        var b = [];
        for (var a = 0; a < this._data.length; a += 2) {
            b.push(this._data[a])
        }
        Core.Arrays.removeDuplicates(b);
        return b
    },
    getListeners: function(b) {
        var c = [];
        for (var a = 0; a < this._data.length; a += 2) {
            if (this._data[a] == b) {
                c.push(this._data[a + 1])
            }
        }
        return c
    },
    getListenerCount: function(b) {
        var c = 0;
        for (var a = 0; a < this._data.length; a += 2) {
            if (this._data[a] == b) {
                ++c
            }
        }
        return c
    },
    hasListeners: function(b) {
        for (var a = 0; a < this._data.length; a += 2) {
            if (this._data[a] == b) {
                return true
            }
        }
        return false
    },
    isEmpty: function() {
        return this._data.length === 0
    },
    removeListener: function(b, d) {
        for (var a = 0; a < this._data.length; a += 2) {
            if (this._data[a] == b && d == this._data[a + 1]) {
                var c = this._data.length;
                this._data.splice(a, 2);
                return
            }
        }
    },
    toString: function() {
        var a = "";
        for (var b = 0; b < this._data.length; b += 2) {
            if (b > 0) {
                a += ", "
            }
            a += this._data[b] + ":" + this._data[b + 1]
        }
        return a
    }
});
Core.ResourceBundle = Core.extend({
    $static: {
        getParentLanguageCode: function(a) {
            if (a.indexOf("-") == -1) {
                return null
            } else {
                return a.substring(0, a.indexOf("-"))
            }
        }
    },
    _sourceMaps: null,
    _generatedMaps: null,
    _defaultMap: null,
    $construct: function(a) {
        this._sourceMaps = {};
        this._generatedMaps = {};
        this._defaultMap = a
    },
    get: function(d) {
        var c = d ? this._generatedMaps[d] : this._defaultMap;
        if (c) {
            return c
        }
        c = {};
        var a;
        var e = this._sourceMaps[d];
        if (e) {
            for (a in e) {
                c[a] = e[a]
            }
        }
        var b = Core.ResourceBundle.getParentLanguageCode(d);
        if (b) {
            e = this._sourceMaps[b];
            if (e) {
                for (a in e) {
                    if (c[a] === undefined) {
                        c[a] = e[a]
                    }
                }
            }
        }
        for (a in this._defaultMap) {
            if (c[a] === undefined) {
                c[a] = this._defaultMap[a]
            }
        }
        this._generatedMaps[d] = c;
        return c
    },
    set: function(b, a) {
        this._generatedMaps = {};
        this._sourceMaps[b] = a
    },
    toString: function() {
        var b = "ResourceBundle: ";
        for (var a in this._sourceMaps) {
            b += " " + a
        }
        return b
    }
});
Core.Web = {
    dragInProgress: false,
    init: function() {
        if (Core.Web.initialized) {
            return
        }
        Core.Web.Env._init();
        Core.Web.Measure._calculateExtentSizes();
        Core.Web.Measure.Bounds._initMeasureContainer();
        if (Core.Web.Env.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY) {
            Core.Web.VirtualPosition._init()
        }
        if (Core.Web.Env.ENGINE_MSHTML) {
            Core.Web.DOM.addEventListener(document, "selectstart", Core.Web._selectStartListener, false);
            Core.Web.DOM.addEventListener(document, "dragstart", Core.Web._selectStartListener, false)
        }
        Core.Web.initialized = true
    },
    _selectStartListener: function(a) {
        a = a ? a : window.event;
        if (Core.Web.dragInProgress) {
            Core.Web.DOM.preventEventDefault(a)
        }
    }
};
Core.Web.DOM = {
    _focusPendingElement: null,
    _focusRunnable: null,
    addEventListener: function(d, c, b, a) {
        if (d.addEventListener) {
            d.addEventListener(c, b, a)
        } else {
            if (d.attachEvent) {
                d.attachEvent("on" + c, b)
            }
        }
    },
    createDocument: function(a, d) {
        if (document.implementation && document.implementation.createDocument) {
            var e;
            if (Core.Web.Env.BROWSER_FIREFOX && Core.Web.Env.BROWSER_VERSION_MAJOR == 3 && Core.Web.Env.BROWSER_VERSION_MINOR === 0) {
                e = new DOMParser().parseFromString("<?xml version='1.0' encoding='UTF-8'?><" + d + "/>", "application/xml")
            } else {
                e = document.implementation.createDocument(a, d, null)
            }
            if (!e.documentElement) {
                e.appendChild(e.createElement(d))
            }
            return e
        } else {
            if (window.ActiveXObject) {
                var b = new ActiveXObject("Microsoft.XMLDOM");
                var c = b.createElement(d);
                b.appendChild(c);
                return b
            } else {
                throw new Error("XML DOM creation not supported by browser environment.")
            }
        }
    },
    focusElement: function(a) {
        if (!this._focusRunnable) {
            this._focusRunnable = new(Core.extend(Core.Web.Scheduler.Runnable, {
                repeat: true,
                attempt: 0,
                timeInterval: 25,
                run: function() {
                    a = Core.Web.DOM._focusPendingElement;
                    var b = false;
                    if (Core.Web.DOM.isDisplayed(a)) {
                        b = true;
                        try {
                            a.focus()
                        } catch (c) {}
                    }
                    b |= this.attempt > 25;
                    ++this.attempt;
                    if (b) {
                        Core.Web.DOM._focusPendingElement = null;
                        Core.Web.Scheduler.remove(this)
                    }
                }
            }))()
        }
        if (!(a && a.focus && Core.Web.DOM.isAncestorOf(document.body, a))) {
            Core.Web.DOM._focusPendingElement = null;
            Core.Web.Scheduler.remove(this._focusRunnable);
            return
        }
        this._focusPendingElement = a;
        this._focusRunnable.attempt = 0;
        Core.Web.Scheduler.add(this._focusRunnable)
    },
    getChildElementByTagName: function(a, c) {
        var b = a.firstChild;
        while (b) {
            if (b.nodeType == 1 && b.nodeName == c) {
                return b
            }
            b = b.nextSibling
        }
        return null
    },
    getChildElementsByTagName: function(a, c) {
        var d = [];
        var b = a.firstChild;
        while (b) {
            if (b.nodeType == 1 && b.nodeName == c) {
                d.push(b)
            }
            b = b.nextSibling
        }
        return d
    },
    getEventOffset: function(b) {
        if (typeof b.offsetX == "number") {
            return {
                x: b.offsetX,
                y: b.offsetY
            }
        } else {
            var a = new Core.Web.Measure.Bounds(this.getEventTarget(b));
            return {
                x: b.clientX - a.left,
                y: b.clientY - a.top
            }
        }
    },
    getEventTarget: function(a) {
        return a.target ? a.target : a.srcElement
    },
    getEventRelatedTarget: function(a) {
        return a.relatedTarget ? a.relatedTarget : a.toElement
    },
    isAncestorOf: function(a, c) {
        var b = c;
        while (b != null) {
            if (b == a) {
                return true
            }
            b = b.parentNode
        }
        return false
    },
    isDisplayed: function(a) {
        while (a != null) {
            if (a.nodeType == 1) {
                if (a.style) {
                    if (a.style.visibility == "hidden") {
                        return false
                    }
                    if (a.style.display == "none") {
                        return false
                    }
                }
            }
            if (a == document.body) {
                return true
            }
            a = a.parentNode
        }
        return false
    },
    preventEventDefault: function(a) {
        if (a.preventDefault) {
            a.preventDefault()
        } else {
            a.returnValue = false
        }
    },
    removeAllChildren: function(a) {
        while (a.firstChild) {
            a.removeChild(a.firstChild)
        }
    },
    removeEventListener: function(d, c, b, a) {
        if (d.removeEventListener) {
            d.removeEventListener(c, b, a)
        } else {
            if (d.detachEvent) {
                d.detachEvent("on" + c, b)
            }
        }
    },
    removeNode: function(b) {
        var a = b.parentNode;
        if (!a) {
            return
        }
        if (Core.Web.Env.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE) {
            this._removeNodeRecursive(b)
        } else {
            a.removeChild(b)
        }
    },
    _removeNodeRecursive: function(c) {
        var b = c.firstChild;
        while (b) {
            var a = b.nextSibling;
            this._removeNodeRecursive(b);
            b = a
        }
        c.parentNode.removeChild(c)
    },
    stopEventPropagation: function(a) {
        if (a.stopPropagation) {
            a.stopPropagation()
        } else {
            a.cancelBubble = true
        }
    }
};
Core.Web.Env = {
    ENGINE_PRESTO: null,
    ENGINE_WEBKIT: null,
    ENGINE_KHTML: null,
    ENGINE_MSHTML: null,
    ENGINE_GECKO: null,
    BROWSER_MOZILLA: null,
    BROWSER_OPERA: null,
    BROWSER_KONQUEROR: null,
    BROWSER_FIREFOX: null,
    BROWSER_INTERNET_EXPLORER: null,
    BROWSER_CHROME: null,
    BROWSER_VERSION_MAJOR: null,
    BROWSER_VERSION_MINOR: null,
    ENGINE_VERSION_MAJOR: null,
    ENGINE_VERSION_MINOR: null,
    DECEPTIVE_USER_AGENT: null,
    CSS_FLOAT: "cssFloat",
    MEASURE_OFFSET_EXCLUDES_BORDER: null,
    NOT_SUPPORTED_CSS_OPACITY: null,
    NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS: null,
    NOT_SUPPORTED_INPUT_SELECTION: null,
    NOT_SUPPORTED_RANGE: null,
    PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED: null,
    PROPRIETARY_EVENT_SELECT_START_SUPPORTED: null,
    PROPRIETARY_IE_OPACITY_FILTER_REQUIRED: null,
    PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED: null,
    PROPRIETARY_IE_RANGE: null,
    QUIRK_KEY_CODE_IS_CHAR_CODE: null,
    QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS: null,
    QUIRK_KEY_DOWN_NOT_FIRED_FOR_SPECIAL_KEYS: null,
    QUIRK_CSS_BORDER_COLLAPSE_INSIDE: null,
    QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY: null,
    QUIRK_DELAYED_FOCUS_REQUIRED: null,
    QUIRK_IE_BLANK_SCREEN: null,
    QUIRK_IE_HAS_LAYOUT: null,
    QUIRK_IE_SELECT_LIST_DOM_UPDATE: null,
    QUIRK_IE_SELECT_PERCENT_WIDTH: null,
    QUIRK_IE_SELECT_Z_INDEX: null,
    QUIRK_IE_SECURE_ITEMS: null,
    QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR: null,
    QUIRK_MEASURE_OFFSET_HIDDEN_BORDER: null,
    QUIRK_OPERA_CSS_POSITIONING: null,
    QUIRK_PERFORMANCE_LARGE_DOM_REMOVE: null,
    QUIRK_WEBKIT_DOM_TEXT_ESCAPE: null,
    QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING: null,
    QUIRK_UNLOADED_IMAGE_HAS_SIZE: null,
    _ua: null,
    _uaAlpha: null,
    _init: function() {
        var b = null,
            c = null,
            a = false;
        this._ua = navigator.userAgent.toLowerCase();
        this._uaAlpha = "/" + this._ua.replace(/[^a-z]+/g, "/") + "/";
        if (this._testUAString("opera")) {
            this.BROWSER_OPERA = a = this.ENGINE_PRESTO = true;
            b = this._parseVersionInfo("opera/")
        } else {
            if (this._testUAString("chrome")) {
                this.BROWSER_CHROME = a = this.ENGINE_WEBKIT = true;
                b = this._parseVersionInfo("chrome/")
            } else {
                if (this._testUAString("safari")) {
                    this.BROWSER_SAFARI = a = this.ENGINE_WEBKIT = true;
                    b = this._parseVersionInfo("version/")
                } else {
                    if (this._testUAString("konqueror")) {
                        this.BROWSER_KONQUEROR = a = this.ENGINE_KHTML = true;
                        b = this._parseVersionInfo("konqueror/")
                    } else {
                        if (this._testUAString("firefox")) {
                            this.BROWSER_FIREFOX = this.BROWSER_MOZILLA = a = this.ENGINE_GECKO = true;
                            b = this._parseVersionInfo("firefox/")
                        } else {
                            if (this._testUAString("msie")) {
                                this.BROWSER_INTERNET_EXPLORER = a = this.ENGINE_MSHTML = true;
                                c = b = this._parseVersionInfo("msie ")
                            }
                        }
                    }
                }
            }
        }
        if (!a) {
            if (this._testUAString("presto")) {
                this.ENGINE_PRESTO = true
            } else {
                if (this._testUAString("webkit")) {
                    this.ENGINE_WEBKIT = true
                } else {
                    if (this._testUAString("khtml")) {
                        this.ENGINE_KHTML = true
                    } else {
                        if (this._testUAString("trident")) {
                            this.ENGINE_MSHTML = true
                        } else {
                            if (this._testUAString("gecko")) {
                                this.BROWSER_MOZILLA = this.ENGINE_GECKO = true
                            }
                        }
                    }
                }
            }
        }
        if (!c) {
            if (this.ENGINE_PRESTO) {
                c = this._parseVersionInfo("presto/")
            } else {
                if (this.ENGINE_WEBKIT) {
                    c = this._parseVersionInfo("webkit/")
                } else {
                    if (this.ENGINE_GECKO) {
                        c = this._parseVersionInfo("rv:");
                        if (!b) {
                            b = c
                        }
                    }
                }
            }
        }
        if (b) {
            this.BROWSER_VERSION_MAJOR = b.major;
            this.BROWSER_VERSION_MINOR = b.minor
        }
        if (c) {
            this.ENGINE_VERSION_MAJOR = c.major;
            this.ENGINE_VERSION_MINOR = c.minor
        }
        this.DECEPTIVE_USER_AGENT = this.BROWSER_OPERA || this.BROWSER_SAFARI || this.BROWSER_CHROME || this.BROWSER_KONQUEROR;
        this.MEASURE_OFFSET_EXCLUDES_BORDER = false;
        if (this.BROWSER_INTERNET_EXPLORER) {
            this.CSS_FLOAT = "styleFloat";
            this.QUIRK_KEY_CODE_IS_CHAR_CODE = true;
            this.QUIRK_IE_SECURE_ITEMS = true;
            this.NOT_SUPPORTED_RANGE = true;
            this.NOT_SUPPORTED_INPUT_SELECTION = true;
            this.PROPRIETARY_IE_RANGE = true;
            this.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED = true;
            this.PROPRIETARY_EVENT_SELECT_START_SUPPORTED = true;
            this.QUIRK_DELAYED_FOCUS_REQUIRED = true;
            this.QUIRK_UNLOADED_IMAGE_HAS_SIZE = true;
            this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
            this.QUIRK_IE_BLANK_SCREEN = true;
            this.QUIRK_IE_HAS_LAYOUT = true;
            this.NOT_SUPPORTED_CSS_OPACITY = true;
            this.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED = true;
            if (this.BROWSER_VERSION_MAJOR && this.BROWSER_VERSION_MAJOR < 8) {
                this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING = true;
                this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
                this.QUIRK_CSS_BORDER_COLLAPSE_INSIDE = true;
                this.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR = true;
                this.QUIRK_IE_SELECT_PERCENT_WIDTH = true;
                if (this.BROWSER_VERSION_MAJOR < 7) {
                    this.QUIRK_IE_SELECT_LIST_DOM_UPDATE = true;
                    this.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY = true;
                    this.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED = true;
                    this.QUIRK_IE_SELECT_Z_INDEX = true;
                    Core.Arrays.LargeMap.garbageCollectEnabled = true
                }
            }
        } else {
            if (this.ENGINE_GECKO) {
                this.QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS = true;
                this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
                this.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER = true;
                if (this.BROWSER_FIREFOX) {
                    if (this.BROWSER_VERSION_MAJOR < 2) {
                        this.QUIRK_DELAYED_FOCUS_REQUIRED = true
                    }
                } else {
                    this.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE = true;
                    this.QUIRK_DELAYED_FOCUS_REQUIRED = true
                }
            } else {
                if (this.ENGINE_PRESTO) {
                    this.QUIRK_KEY_CODE_IS_CHAR_CODE = true;
                    this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING = true;
                    if (this.BROWSER_VERSION_MAJOR == 9 && this.BROWSER_VERSION_MINOR >= 50) {
                        this.QUIRK_OPERA_CSS_POSITIONING = true
                    }
                    this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true
                } else {
                    if (this.ENGINE_WEBKIT) {
                        this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
                        if (this.ENGINE_VERSION_MAJOR < 526 || (this.ENGINE_VERSION_MAJOR == 526 && this.ENGINE_VERSION_MINOR < 8)) {
                            this.QUIRK_WEBKIT_DOM_TEXT_ESCAPE = true
                        }
                    }
                }
            }
        }
    },
    _parseVersionInfo: function(e) {
        var d = {};
        var b = this._ua.indexOf(e);
        if (b == -1) {
            return
        }
        var a = this._ua.indexOf(".", b);
        var h = this._ua.length;
        if (a == -1) {
            a = this._ua.length
        } else {
            for (var f = a + 1; f < this._ua.length; f++) {
                var g = this._ua.charAt(f);
                if (isNaN(g)) {
                    h = f;
                    break
                }
            }
        }
        d.major = parseInt(this._ua.substring(b + e.length, a), 10);
        if (a == this._ua.length) {
            d.minor = 0
        } else {
            d.minor = parseInt(this._ua.substring(a + 1, h), 10)
        }
        return d
    },
    _testUAString: function(a) {
        return this._uaAlpha.indexOf("/" + a + "/") != -1
    }
};
Core.Web.Event = {
    Selection: {
        disable: function(a) {
            Core.Web.Event.add(a, "mousedown", Core.Web.Event.Selection._disposeEvent, false);
            if (Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
                Core.Web.Event.add(a, "selectstart", Core.Web.Event.Selection._disposeEvent, false)
            }
        },
        _disposeEvent: function(a) {
            Core.Web.DOM.preventEventDefault(a)
        },
        enable: function(a) {
            Core.Web.Event.remove(a, "mousedown", Core.Web.Event.Selection._disposeEvent, false);
            if (Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
                Core.Web.Event.remove(a, "selectstart", Core.Web.Event.Selection._disposeEvent, false)
            }
        }
    },
    _nextId: 0,
    _listenerCount: 0,
    debugListenerCount: false,
    _capturingListenerMap: new Core.Arrays.LargeMap(),
    _bubblingListenerMap: new Core.Arrays.LargeMap(),
    add: function(c, b, d, a) {
        if (!c.__eventProcessorId) {
            c.__eventProcessorId = ++Core.Web.Event._nextId
        }
        var f;
        if (c.__eventProcessorId == Core.Web.Event._lastId && a == Core.Web.Event._lastCapture) {
            f = Core.Web.Event._lastListenerList
        } else {
            var e = a ? Core.Web.Event._capturingListenerMap : Core.Web.Event._bubblingListenerMap;
            f = e.map[c.__eventProcessorId];
            if (!f) {
                f = new Core.ListenerList();
                e.map[c.__eventProcessorId] = f
            }
            Core.Web.Event._lastId = c.__eventProcessorId;
            Core.Web.Event._lastCapture = a;
            Core.Web.Event._lastListenerList = f
        }
        if (!f.hasListeners(b)) {
            Core.Web.DOM.addEventListener(c, b, Core.Web.Event._processEvent, false);
            ++Core.Web.Event._listenerCount
        }
        f.addListener(b, d)
    },
    _processEvent: function(d) {
        if (Core.Web.Event.debugListenerCount) {
            Core.Debug.consoleWrite("Core.Web.Event listener count: " + Core.Web.Event._listenerCount)
        }
        d = d ? d : window.event;
        if (!d.target && d.srcElement) {
            d.target = d.srcElement
        }
        var f = [];
        var b = d.target;
        while (b) {
            if (b.__eventProcessorId) {
                f.push(b)
            }
            b = b.parentNode
        }
        var g, c, a = true;
        for (c = f.length - 1; c >= 0; --c) {
            g = Core.Web.Event._capturingListenerMap.map[f[c].__eventProcessorId];
            if (g) {
                d.registeredTarget = f[c];
                if (!g.fireEvent(d)) {
                    a = false;
                    break
                }
            }
        }
        if (a) {
            for (c = 0; c < f.length; ++c) {
                g = Core.Web.Event._bubblingListenerMap.map[f[c].__eventProcessorId];
                if (g) {
                    d.registeredTarget = f[c];
                    if (!g.fireEvent(d)) {
                        break
                    }
                }
            }
        }
        Core.Web.DOM.stopEventPropagation(d)
    },
    remove: function(c, b, d, a) {
        Core.Web.Event._lastId = null;
        if (!c.__eventProcessorId) {
            return
        }
        var e = a ? Core.Web.Event._capturingListenerMap : Core.Web.Event._bubblingListenerMap;
        var f = e.map[c.__eventProcessorId];
        if (f) {
            f.removeListener(b, d);
            if (f.isEmpty()) {
                e.remove(c.__eventProcessorId)
            }
            if (!f.hasListeners(b)) {
                Core.Web.DOM.removeEventListener(c, b, Core.Web.Event._processEvent, false);
                --Core.Web.Event._listenerCount
            }
        }
    },
    removeAll: function(a) {
        Core.Web.Event._lastId = null;
        if (!a.__eventProcessorId) {
            return
        }
        Core.Web.Event._removeAllImpl(a, Core.Web.Event._capturingListenerMap);
        Core.Web.Event._removeAllImpl(a, Core.Web.Event._bubblingListenerMap)
    },
    _removeAllImpl: function(c, d) {
        var e = d.map[c.__eventProcessorId];
        if (!e) {
            return
        }
        var b = e.getListenerTypes();
        for (var a = 0; a < b.length; ++a) {
            Core.Web.DOM.removeEventListener(c, b[a], Core.Web.Event._processEvent, false);
            --Core.Web.Event._listenerCount
        }
        d.remove(c.__eventProcessorId)
    },
    toString: function() {
        return "Capturing: " + Core.Web.Event._capturingListenerMap + "\nBubbling: " + Core.Web.Event._bubblingListenerMap
    }
};
Core.Web.HttpConnection = Core.extend({
    _url: null,
    _contentType: null,
    _method: null,
    _messageObject: null,
    _listenerList: null,
    _disposed: false,
    _xmlHttpRequest: null,
    _requestHeaders: null,
    $construct: function(a, d, b, c) {
        this._url = a;
        this._contentType = c;
        this._method = d;
        if (Core.Web.Env.QUIRK_WEBKIT_DOM_TEXT_ESCAPE && b instanceof Document) {
            this._preprocessWebkitDOM(b.documentElement)
        }
        this._messageObject = b;
        this._listenerList = new Core.ListenerList()
    },
    _preprocessWebkitDOM: function(a) {
        if (a.nodeType == 3) {
            var b = a.data;
            b = b.replace(/&/g, "&amp;");
            b = b.replace(/</g, "&lt;");
            b = b.replace(/>/g, "&gt;");
            a.data = b
        } else {
            var c = a.firstChild;
            while (c) {
                this._preprocessWebkitDOM(c);
                c = c.nextSibling
            }
        }
    },
    addResponseListener: function(a) {
        this._listenerList.addListener("response", a)
    },
    connect: function() {
        var b = false;
        if (window.XMLHttpRequest) {
            this._xmlHttpRequest = new XMLHttpRequest()
        } else {
            if (window.ActiveXObject) {
                b = true;
                this._xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP")
            } else {
                throw "Connect failed: Cannot create XMLHttpRequest."
            }
        }
        var a = this;
        this._xmlHttpRequest.onreadystatechange = function() {
            if (!a) {
                return
            }
            try {
                a._processReadyStateChange()
            } finally {
                if (a._disposed) {
                    a = null
                }
            }
        };
        this._xmlHttpRequest.open(this._method, this._url, true);
        if (this._requestHeaders && (b || this._xmlHttpRequest.setRequestHeader)) {
            for (var c in this._requestHeaders) {
                try {
                    this._xmlHttpRequest.setRequestHeader(c, this._requestHeaders[c])
                } catch (d) {
                    throw new Error('Failed to set header "' + c + '"')
                }
            }
        }
        if (this._contentType && (b || this._xmlHttpRequest.setRequestHeader)) {
            this._xmlHttpRequest.setRequestHeader("Content-Type", this._contentType)
        }
        this._xmlHttpRequest.send(this._messageObject ? this._messageObject : null)
    },
    dispose: function() {
        this._listenerList = null;
        this._messageObject = null;
        this._xmlHttpRequest = null;
        this._disposed = true;
        this._requestHeaders = null
    },
    getResponseHeader: function(a) {
        return this._xmlHttpRequest ? this._xmlHttpRequest.getResponseHeader(a) : null
    },
    getAllResponseHeaders: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.getAllResponseHeaders() : null
    },
    getStatus: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.status : null
    },
    getResponseText: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.responseText : null
    },
    getResponseXml: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.responseXML : null
    },
    _processReadyStateChange: function() {
        if (this._disposed) {
            return
        }
        if (this._xmlHttpRequest.readyState == 4) {
            var c;
            try {
                var b = !this._xmlHttpRequest.status || (this._xmlHttpRequest.status >= 200 && this._xmlHttpRequest.status <= 299);
                c = {
                    type: "response",
                    source: this,
                    valid: b
                }
            } catch (a) {
                c = {
                    type: "response",
                    source: this,
                    valid: false,
                    exception: a
                }
            }
            Core.Web.Scheduler.run(Core.method(this, function() {
                this._listenerList.fireEvent(c);
                this.dispose()
            }))
        }
    },
    removeResponseListener: function(a) {
        this._listenerList.removeListener("response", a)
    },
    setRequestHeader: function(b, a) {
        if (!this._requestHeaders) {
            this._requestHeaders = {}
        }
        this._requestHeaders[b] = a
    }
});
Core.Web.Image = {
    _EXPIRE_TIME: 5000,
    _Monitor: Core.extend({
        _processImageLoadRef: null,
        _runnable: null,
        _listener: null,
        _images: null,
        _count: 0,
        _expiration: null,
        _imagesLoadedSinceUpdate: false,
        $construct: function(d, e, a) {
            this._listener = e;
            this._processImageLoadRef = Core.method(this, this._processImageLoad);
            this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._updateProgress), a || 250, true);
            var b = d.getElementsByTagName("img");
            this._images = [];
            for (var c = 0; c < b.length; ++c) {
                if (!b[c].complete && (Core.Web.Env.QUIRK_UNLOADED_IMAGE_HAS_SIZE || (!b[c].height && !b[c].style.height))) {
                    this._images.push(b[c]);
                    Core.Web.Event.add(b[c], "load", this._processImageLoadRef, false)
                }
            }
            this._count = this._images.length;
            if (this._count > 0) {
                this._expiration = new Date().getTime() + Core.Web.Image._EXPIRE_TIME;
                Core.Web.Scheduler.add(this._runnable)
            }
        },
        _processImageLoad: function(b) {
            b = b ? b : window.event;
            var a = Core.Web.DOM.getEventTarget(b);
            this._imagesLoadedSinceUpdate = true;
            Core.Web.Event.remove(a, "load", this._processImageLoadRef, false);
            Core.Arrays.remove(this._images, a);
            --this._count;
            if (this._count === 0) {
                this._stop();
                this._notify()
            }
        },
        _notify: function() {
            Core.Web.Scheduler.run(Core.method(this, function() {
                this._listener({
                    source: this,
                    type: "imageLoad",
                    expired: this._expired,
                    complete: this._expired || this._count === 0
                })
            }))
        },
        _stop: function() {
            Core.Web.Scheduler.remove(this._runnable);
            this._runnable = null;
            for (var a = 0; a < this._images.length; ++a) {
                Core.Web.Event.remove(this._images[a], "load", this._processImageLoadRef, false)
            }
        },
        _updateProgress: function() {
            if (new Date().getTime() > this._expiration) {
                this._expired = true;
                this._stop();
                this._notify();
                return
            }
            if (this._imagesLoadedSinceUpdate) {
                this._imagesLoadedSinceUpdate = false;
                this._notify()
            }
        }
    }),
    monitor: function(d, b, c) {
        var a = new Core.Web.Image._Monitor(d, b, c);
        return a._count > 0
    }
};
Core.Web.Key = {
    _KEY_TABLES: {
        GECKO: {
            59: 186,
            61: 187,
            109: 189
        },
        MAC_GECKO: {},
        PRESTO: {
            59: 186,
            61: 187,
            44: 188,
            45: 189,
            46: 190,
            47: 191,
            96: 192,
            91: 219,
            92: 220,
            93: 221,
            39: 222
        },
        WEBKIT: {}
    },
    _keyTable: null,
    _loadKeyTable: function() {
        if (Core.Web.Env.ENGINE_GECKO) {
            this._keyTable = this._KEY_TABLES.GECKO
        } else {
            if (Core.Web.Env.ENGINE_PRESTO) {
                this._keyTable = this._KEY_TABLES.PRESTO
            } else {
                this._keyTable = {}
            }
        }
    },
    translateKeyCode: function(a) {
        if (!this._keyTable) {
            this._loadKeyTable()
        }
        return this._keyTable[a] || a
    }
};
Core.Web.Library = {
    _loadedLibraries: {},
    evalLine: null,
    Group: Core.extend({
        _listenerList: null,
        _libraries: null,
        _loadedCount: 0,
        _totalCount: 0,
        $construct: function() {
            this._listenerList = new Core.ListenerList();
            this._libraries = []
        },
        add: function(b) {
            if (Core.Web.Library._loadedLibraries[b]) {
                return
            }
            var a = new Core.Web.Library._Item(this, b);
            this._libraries.push(a)
        },
        addLoadListener: function(a) {
            this._listenerList.addListener("load", a)
        },
        hasNewLibraries: function() {
            return this._libraries.length > 0
        },
        _install: function() {
            for (var b = 0; b < this._libraries.length; ++b) {
                try {
                    this._libraries[b]._install()
                } catch (a) {
                    var c = {
                        type: "load",
                        source: this,
                        success: false,
                        ex: a,
                        url: this._libraries[b]._url,
                        cancel: false
                    };
                    try {
                        this._listenerList.fireEvent(c)
                    } finally {
                        if (!c.cancel) {
                            throw new Error('Exception installing library "' + this._libraries[b]._url + '"; ' + a)
                        }
                    }
                }
            }
            this._listenerList.fireEvent({
                type: "load",
                source: this,
                success: true
            })
        },
        _notifyRetrieved: function() {
            ++this._loadedCount;
            if (this._loadedCount == this._totalCount) {
                this._install()
            }
        },
        load: function() {
            this._totalCount = this._libraries.length;
            for (var a = 0; a < this._libraries.length; ++a) {
                this._libraries[a]._retrieve()
            }
        },
        removeLoadListener: function(a) {
            this._listenerList.removeListener("load", a)
        }
    }),
    _Item: Core.extend({
        _url: null,
        _group: null,
        _content: null,
        $construct: function(b, a) {
            this._url = a;
            this._group = b
        },
        _retrieveListener: function(a) {
            if (!a.valid) {
                throw new Error('Invalid HTTP response retrieving library "' + this._url + '", received status: ' + a.source.getStatus())
            }
            this._content = a.source.getResponseText();
            this._group._notifyRetrieved()
        },
        _install: function() {
            if (Core.Web.Library._loadedLibraries[this._url]) {
                return
            }
            Core.Web.Library._loadedLibraries[this._url] = true;
            if (this._content == null) {
                throw new Error("Attempt to install library when no content has been loaded.")
            }
            Core.Web.Library.evalLine = new Error().lineNumber + 1;
            eval(this._content)
        },
        _retrieve: function() {
            var a = new Core.Web.HttpConnection(this._url, "GET");
            a.addResponseListener(Core.method(this, this._retrieveListener));
            a.connect()
        }
    }),
    exec: function(b, c) {
        var d = null;
        for (var a = 0; a < b.length; ++a) {
            if (!Core.Web.Library._loadedLibraries[b[a]]) {
                if (d == null) {
                    d = new Core.Web.Library.Group()
                }
                d.add(b[a])
            }
        }
        if (d == null) {
            Core.Web.Scheduler.run(c);
            return
        }
        d.addLoadListener(c);
        d.load()
    }
};
Core.Web.Measure = {
    _scrollElements: ["div", "body"],
    _hInch: 96,
    _vInch: 96,
    _hEx: 7,
    _vEx: 7,
    _hEm: 13.3333,
    _vEm: 13.3333,
    SCROLL_WIDTH: 17,
    SCROLL_HEIGHT: 17,
    _PARSER: /^(-?\d+(?:\.\d+)?)(.+)?$/,
    extentToPixels: function(d, a) {
        var f = this._PARSER.exec(d);
        if (!f) {
            throw new Error("Invalid Extent: " + d)
        }
        var e = parseFloat(f[1]);
        var b = f[2] ? f[2] : "px";
        if (!b || b == "px") {
            return e
        }
        var c = a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch;
        switch (b) {
            case "%":
                return null;
            case "in":
                return e * (a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch);
            case "cm":
                return e * (a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 2.54;
            case "mm":
                return e * (a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 25.4;
            case "pt":
                return e * (a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 72;
            case "pc":
                return e * (a ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 6;
            case "em":
                return e * (a ? Core.Web.Measure._hEm : Core.Web.Measure._vEm);
            case "ex":
                return e * (a ? Core.Web.Measure._hEx : Core.Web.Measure._vEx)
        }
    },
    _calculateExtentSizes: function() {
        var h = document.getElementsByTagName("body")[0];
        var f = document.createElement("div");
        f.style.width = "4in";
        f.style.height = "4in";
        h.appendChild(f);
        Core.Web.Measure._hInch = f.offsetWidth / 4;
        Core.Web.Measure._vInch = f.offsetHeight / 4;
        h.removeChild(f);
        var b = document.createElement("div");
        b.style.width = "24em";
        b.style.height = "24em";
        h.appendChild(b);
        Core.Web.Measure._hEm = b.offsetWidth / 24;
        Core.Web.Measure._vEm = b.offsetHeight / 24;
        h.removeChild(b);
        var a = document.createElement("div");
        a.style.width = "24ex";
        a.style.height = "24ex";
        h.appendChild(a);
        Core.Web.Measure._hEx = a.offsetWidth / 24;
        Core.Web.Measure._vEx = a.offsetHeight / 24;
        h.removeChild(a);
        var g = document.createElement("div");
        g.style.cssText = "width:500px;height:100px;overflow:auto;";
        var d = document.createElement("div");
        d.style.cssText = "width:100px;height:200px;";
        g.appendChild(d);
        var e = document.createElement("div");
        e.style.cssText = "width:100%;height:10px;";
        g.appendChild(e);
        h.appendChild(g);
        var c = 500 - e.offsetWidth;
        if (c) {
            Core.Web.Measure.SCROLL_WIDTH = Core.Web.Measure.SCROLL_HEIGHT = c
        }
        h.removeChild(g)
    },
    _getScrollOffset: function(b) {
        var a = 0,
            c = 0;
        do {
            if (b.scrollLeft || b.scrollTop) {
                a += b.scrollTop || 0;
                c += b.scrollLeft || 0
            }
            b = b.offsetParent
        } while (b);
        return {
            left: c,
            top: a
        }
    },
    _getCumulativeOffset: function(b) {
        var a = 0,
            d = 0,
            e = true;
        do {
            a += b.offsetTop || 0;
            d += b.offsetLeft || 0;
            if (!e && Core.Web.Env.MEASURE_OFFSET_EXCLUDES_BORDER) {
                if (b.style.borderLeftWidth && b.style.borderLeftStyle != "none") {
                    var c = Core.Web.Measure.extentToPixels(b.style.borderLeftWidth, true);
                    d += c;
                    if (Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER && b.style.overflow == "hidden") {
                        d += c
                    }
                }
                if (b.style.borderTopWidth && b.style.borderTopStyle != "none") {
                    var f = Core.Web.Measure.extentToPixels(b.style.borderTopWidth, false);
                    a += f;
                    if (Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER && b.style.overflow == "hidden") {
                        a += f
                    }
                }
            }
            e = false;
            b = b.offsetParent
        } while (b);
        return {
            left: d,
            top: a
        }
    },
    Bounds: Core.extend({
        $static: {
            FLAG_MEASURE_DIMENSION: 1,
            FLAG_MEASURE_POSITION: 2,
            _initMeasureContainer: function() {
                this._offscreenDiv = document.createElement("div");
                this._offscreenDiv.style.cssText = "position: absolute; top: -1300px; left: -1700px; width: 1600px; height: 1200px;";
                document.body.appendChild(this._offscreenDiv)
            }
        },
        width: null,
        height: null,
        top: null,
        left: null,
        $construct: function(g, e) {
            var b = (e && e.flags) || (Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION | Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION);
            if (g === document.body) {
                return {
                    x: 0,
                    y: 0,
                    height: window.innerHeight || document.documentElement.clientHeight,
                    width: window.innerWidth || document.documentElement.clientWidth
                }
            }
            var a = g;
            while (a && a != document) {
                a = a.parentNode
            }
            var c = a == document;
            var i, f;
            if (b & Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION) {
                if (!c) {
                    i = g.parentNode;
                    f = g.nextSibling;
                    if (i) {
                        i.removeChild(g)
                    }
                    if (e) {
                        if (e.width) {
                            Core.Web.Measure.Bounds._offscreenDiv.width = e.width
                        }
                        if (e.height) {
                            Core.Web.Measure.Bounds._offscreenDiv.height = e.height
                        }
                    }
                    Core.Web.Measure.Bounds._offscreenDiv.appendChild(g);
                    if (e) {
                        Core.Web.Measure.Bounds._offscreenDiv.width = "1600px";
                        Core.Web.Measure.Bounds._offscreenDiv.height = "1200px"
                    }
                }
                this.width = g.offsetWidth;
                this.height = g.offsetHeight;
                if (!c) {
                    Core.Web.Measure.Bounds._offscreenDiv.removeChild(g);
                    if (i) {
                        i.insertBefore(g, f)
                    }
                }
            }
            if (c && (b & Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION)) {
                var d = Core.Web.Measure._getCumulativeOffset(g);
                var h = Core.Web.Measure._getScrollOffset(g);
                this.top = d.top - h.top;
                this.left = d.left - h.left
            }
        },
        toString: function() {
            return (this.left != null ? (this.left + "," + this.top + " : ") : "") + (this.width != null ? ("[" + this.width + "x" + this.height + "]") : "")
        }
    })
};
Core.Web.Scheduler = {
    _runnables: [],
    _threadHandle: null,
    _nextExecution: null,
    add: function(a) {
        Core.Arrays.remove(Core.Web.Scheduler._runnables, a);
        a._nextExecution = new Date().getTime() + (a.timeInterval ? a.timeInterval : 0);
        Core.Web.Scheduler._runnables.push(a);
        Core.Web.Scheduler._setTimeout(a._nextExecution)
    },
    _execute: function() {
        Core.Web.Scheduler._threadHandle = null;
        var d = new Date().getTime();
        var f = Number.MAX_VALUE;
        var c, e;
        for (c = 0; c < Core.Web.Scheduler._runnables.length; ++c) {
            e = Core.Web.Scheduler._runnables[c];
            if (e && e._nextExecution && e._nextExecution <= d) {
                e._nextExecution = null;
                try {
                    e.run()
                } catch (b) {
                    throw (b)
                }
            }
        }
        var g = [];
        for (c = 0; c < Core.Web.Scheduler._runnables.length; ++c) {
            e = Core.Web.Scheduler._runnables[c];
            if (e == null) {
                continue
            }
            if (e._nextExecution) {
                g.push(e);
                var a = e._nextExecution - d;
                if (a < f) {
                    f = a
                }
                continue
            }
            if (e.timeInterval != null && e.repeat) {
                e._nextExecution = d + e.timeInterval;
                g.push(e);
                if (e.timeInterval < f) {
                    f = e.timeInterval
                }
            }
        }
        Core.Web.Scheduler._runnables = g;
        if (f < Number.MAX_VALUE) {
            Core.Web.Scheduler._setTimeout(d + f)
        }
    },
    remove: function(b) {
        var a = Core.Arrays.indexOf(Core.Web.Scheduler._runnables, b);
        Core.Web.Scheduler._runnables[a] = null
    },
    run: function(d, a, c) {
        var b = new Core.Web.Scheduler.MethodRunnable(d, a, c);
        Core.Web.Scheduler.add(b);
        return b
    },
    _setTimeout: function(c) {
        if (Core.Web.Scheduler._threadHandle != null && Core.Web.Scheduler._nextExecution < c) {
            return
        }
        if (Core.Web.Scheduler._threadHandle != null) {
            window.clearTimeout(Core.Web.Scheduler._threadHandle)
        }
        var a = new Date().getTime();
        Core.Web.Scheduler._nextExecution = c;
        var b = c - a > 0 ? c - a : 0;
        Core.Web.Scheduler._threadHandle = window.setTimeout(Core.Web.Scheduler._execute, b)
    },
    update: function(c) {
        if (Core.Arrays.indexOf(Core.Web.Scheduler._runnables, c) == -1) {
            return
        }
        var b = new Date().getTime();
        var a = c.timeInterval ? c.timeInterval : 0;
        c._nextExecution = b + a;
        Core.Web.Scheduler._setTimeout(c._nextExecution)
    }
};
Core.Web.Scheduler.Runnable = Core.extend({
    _nextExecution: null,
    $virtual: {
        timeInterval: null,
        repeat: false
    },
    $abstract: {
        run: function() {}
    }
});
Core.Web.Scheduler.MethodRunnable = Core.extend(Core.Web.Scheduler.Runnable, {
    f: null,
    $construct: function(c, a, b) {
        if (!a && b) {
            throw new Error("Cannot create repeating runnable without time delay:" + c)
        }
        this.f = c;
        this.timeInterval = a;
        this.repeat = !!b
    },
    $virtual: {
        run: function() {
            this.f()
        }
    }
});
Core.Web.VirtualPosition = {
    _OFFSETS_VERTICAL: ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"],
    _OFFSETS_HORIZONTAL: ["paddingLeft", "paddingRight", "marginLeft", "marginRight", "borderLeftWidth", "borderRightWidth"],
    enabled: false,
    _calculateOffsets: function(e, b) {
        var c = 0;
        for (var a = 0; a < e.length; ++a) {
            var d = b[e[a]];
            if (d) {
                if (d.toString().indexOf("px") == -1) {
                    return -1
                }
                c += parseInt(d, 10)
            }
        }
        return c
    },
    _init: function() {
        this.enabled = true
    },
    redraw: function(c) {
        if (!this.enabled) {
            return
        }
        if (!c || !c.parentNode) {
            return
        }
        var f;
        if (this._verifyPixelValue(c.style.top) && this._verifyPixelValue(c.style.bottom)) {
            var b = c.parentNode.offsetHeight;
            if (!isNaN(b)) {
                f = this._calculateOffsets(this._OFFSETS_VERTICAL, c.style);
                if (f != -1) {
                    var e = b - parseInt(c.style.top, 10) - parseInt(c.style.bottom, 10) - f;
                    if (e <= 0) {
                        c.style.height = 0
                    } else {
                        if (c.style.height != e + "px") {
                            c.style.height = e + "px"
                        }
                    }
                }
            }
        }
        if (this._verifyPixelValue(c.style.left) && this._verifyPixelValue(c.style.right)) {
            var d = c.parentNode.offsetWidth;
            if (!isNaN(d)) {
                f = this._calculateOffsets(this._OFFSETS_HORIZONTAL, c.style);
                if (f != -1) {
                    var a = d - parseInt(c.style.left, 10) - parseInt(c.style.right, 10) - f;
                    if (a <= 0) {
                        c.style.width = 0
                    } else {
                        if (c.style.width != a + "px") {
                            c.style.width = a + "px"
                        }
                    }
                }
            }
        }
    },
    _verifyPixelValue: function(b) {
        if (b == null || b === "") {
            return false
        }
        var a = b.toString();
        return a == "0" || a.indexOf("px") != -1
    }
};
Echo = {};
Echo.Application = Core.extend({
    $static: {
        _nextUid: 1,
        generateUid: function() {
            return this._nextUid++
        }
    },
    $abstract: true,
    $virtual: {
        init: function() {},
        dispose: function() {},
        isActive: function() {
            return true
        }
    },
    client: null,
    _idToComponentMap: null,
    _listenerList: null,
    _locale: null,
    _modalComponents: null,
    _styleSheet: null,
    _focusedComponent: null,
    rootComponent: null,
    updateManager: null,
    focusManager: null,
    $construct: function() {
        this._idToComponentMap = new Core.Arrays.LargeMap();
        this._listenerList = new Core.ListenerList();
        this.rootComponent = new Echo.Component();
        this.rootComponent.componentType = "Root";
        this.rootComponent.register(this);
        this._modalComponents = [];
        this.updateManager = new Echo.Update.Manager(this);
        this.focusManager = new Echo.FocusManager(this)
    },
    addListener: function(a, b) {
        this._listenerList.addListener(a, b)
    },
    doDispose: function() {
        this.updateManager.dispose();
        this.dispose()
    },
    doInit: function() {
        this.init()
    },
    _findModalContextRoot: function(a) {
        a = a ? a : this.rootComponent;
        for (var c = a.children.length - 1; c >= 0; --c) {
            var b = this._findModalContextRoot(a.children[c]);
            if (b) {
                return b
            }
        }
        if (a.modalSupport && a.get("modal")) {
            return a
        }
        return null
    },
    fireEvent: function(a) {
        if (this._listenerList == null) {
            return
        }
        this._listenerList.fireEvent(a)
    },
    focusNext: function(a) {
        var b = this.focusManager.find(null, a);
        if (b != null) {
            this.setFocusedComponent(b)
        }
    },
    getComponentByRenderId: function(a) {
        return this._idToComponentMap.map[a]
    },
    getFocusedComponent: function() {
        return this._focusedComponent
    },
    getLayoutDirection: function() {
        return this._layoutDirection ? this._layoutDirection : Echo.LayoutDirection.LTR
    },
    getLocale: function() {
        return this._locale
    },
    getModalContextRoot: function() {
        if (this._modalComponents.length === 0) {
            return null
        } else {
            if (this._modalComponents.length == 1) {
                return this._modalComponents[0]
            }
        }
        return this._findModalContextRoot()
    },
    getStyleSheet: function() {
        return this._styleSheet
    },
    notifyComponentUpdate: function(c, a, b, d, e) {
        if (c.modalSupport && a == "modal") {
            this._setModal(c, d)
        }
        if (this._listenerList.hasListeners("componentUpdate")) {
            this._listenerList.fireEvent({
                type: "componentUpdate",
                parent: c,
                propertyName: a,
                oldValue: b,
                newValue: d
            })
        }
        if (!e) {
            this.updateManager._processComponentUpdate(c, a, b, d)
        }
    },
    _registerComponent: function(a) {
        if (this._idToComponentMap.map[a.renderId]) {
            throw new Error("Component already exists with id: " + a.renderId)
        }
        this._idToComponentMap.map[a.renderId] = a;
        if (a.modalSupport && a.get("modal")) {
            this._setModal(a, true)
        }
    },
    removeListener: function(a, b) {
        this._listenerList.removeListener(a, b)
    },
    setFocusedComponent: function(c) {
        var a = this._focusedComponent;
        while (c != null && !c.focusable) {
            c = c.parent
        }
        if (this._modalComponents.length > 0) {
            var b = this.getModalContextRoot();
            if (!b.isAncestorOf(c)) {
                return
            }
        }
        if (this._focusedComponent == c) {
            return
        }
        this._focusedComponent = c;
        this._listenerList.fireEvent({
            type: "focus",
            source: this,
            oldValue: a,
            newValue: c
        })
    },
    setLayoutDirection: function(a) {
        this._layoutDirection = a;
        this.updateManager._processFullRefresh()
    },
    setLocale: function(a) {
        this._locale = a;
        this.updateManager._processFullRefresh()
    },
    _setModal: function(a, b) {
        Core.Arrays.remove(this._modalComponents, a);
        if (b) {
            this._modalComponents.push(a)
        }
        if (this._modalComponents.length > 0 && this._focusedComponent) {
            var c = this.getModalContextRoot();
            if (!c.isAncestorOf(this._focusedComponent)) {
                if (c.focusable) {
                    this.setFocusedComponent(c)
                } else {
                    this.setFocusedComponent(this.focusManager.findInParent(c, false))
                }
            }
        }
        this.fireEvent({
            source: this,
            type: "modal",
            modal: this._modalComponents.length > 0
        })
    },
    setStyleSheet: function(a) {
        this._styleSheet = a;
        this.updateManager._processFullRefresh()
    },
    _unregisterComponent: function(a) {
        this._idToComponentMap.remove(a.renderId);
        if (a.modalSupport) {
            this._setModal(a, false)
        }
    }
});
Echo.ComponentFactory = {
    _typeToConstructorMap: {},
    newInstance: function(a, c) {
        var d = this._typeToConstructorMap[a];
        if (!d) {
            throw new Error("Type not registered with ComponentFactory: " + a)
        }
        var b = new d();
        b.renderId = c;
        return b
    },
    getConstructor: function(a) {
        return this._typeToConstructorMap[a]
    },
    getSuperType: function(a) {
        var b = this._typeToConstructorMap[a];
        if (!b) {
            return "Component"
        }
        if (b.$super) {
            return b.$super.prototype.componentType
        } else {
            return null
        }
    },
    registerType: function(a, b) {
        if (this._typeToConstructorMap[a]) {
            throw new Error("Type already registered: " + a)
        }
        this._typeToConstructorMap[a] = b
    }
};
Echo.Component = Core.extend({
    $static: {
        _nextRenderId: 0
    },
    $load: function() {
        Echo.ComponentFactory.registerType("Component", this)
    },
    $abstract: true,
    $virtual: {
        componentType: "Component",
        focusable: false,
        getFocusOrder: null,
        pane: false
    },
    _layoutDirection: null,
    _locale: null,
    renderId: null,
    parent: null,
    application: null,
    _listenerList: null,
    _style: null,
    _styleName: null,
    _enabled: true,
    children: null,
    focusNextId: null,
    focusPreviousId: null,
    _localStyle: null,
    $construct: function(d) {
        this.children = [];
        this._localStyle = {};
        if (d) {
            for (var a in d) {
                switch (a) {
                    case "style":
                        this._style = d.style;
                        break;
                    case "styleName":
                        this._styleName = d.styleName;
                        break;
                    case "renderId":
                        this.renderId = d.renderId;
                        break;
                    case "children":
                        for (var c = 0; c < d.children.length; ++c) {
                            this.add(d.children[c])
                        }
                        break;
                    case "events":
                        for (var b in d.events) {
                            this.addListener(b, d.events[b])
                        }
                        break;
                    default:
                        this._localStyle[a] = d[a]
                }
            }
        }
    },
    add: function(b, a) {
        if (!(b instanceof Echo.Component)) {
            throw new Error("Cannot add child: specified component object is not derived from Echo.Component. Parent: " + this + ", Child: " + b)
        }
        if (!b.componentType) {
            throw new Error("Cannot add child: specified component object does not have a componentType property. Parent: " + this + ", Child: " + b)
        }
        if (b.parent) {
            b.parent.remove(b)
        }
        b.parent = this;
        if (a == null || a == this.children.length) {
            this.children.push(b)
        } else {
            this.children.splice(a, 0, b)
        }
        if (this.application) {
            b.register(this.application);
            this.application.notifyComponentUpdate(this, "children", null, b)
        }
        if (b._listenerList && b._listenerList.hasListeners("parent")) {
            b._listenerList.fireEvent({
                type: "parent",
                source: b,
                oldValue: null,
                newValue: this
            })
        }
        if (this._listenerList && this._listenerList.hasListeners("children")) {
            this._listenerList.fireEvent({
                type: "children",
                source: this,
                add: b,
                index: a
            })
        }
    },
    addListener: function(a, b) {
        if (this._listenerList == null) {
            this._listenerList = new Core.ListenerList()
        }
        this._listenerList.addListener(a, b);
        if (this.application) {
            this.application.notifyComponentUpdate(this, "listeners", null, a)
        }
    },
    fireEvent: function(a) {
        if (this._listenerList == null) {
            return
        }
        this._listenerList.fireEvent(a)
    },
    get: function(a) {
        return this._localStyle[a]
    },
    getComponent: function(a) {
        return this.children[a]
    },
    getComponentCount: function() {
        return this.children.length
    },
    getIndex: function(b, a) {
        var c = this._localStyle[b];
        return c ? c[a] : null
    },
    getLayoutDirection: function() {
        return this._layoutDirection
    },
    getLocale: function() {
        return this._locale
    },
    getLocalStyleData: function() {
        return this._localStyle
    },
    getRenderLayoutDirection: function() {
        var a = this;
        while (a) {
            if (a._layoutDirection) {
                return a._layoutDirection
            }
            a = a.parent
        }
        if (this.application) {
            return this.application.getLayoutDirection()
        }
        return null
    },
    getRenderLocale: function() {
        var a = this;
        while (a) {
            if (a._locale) {
                return a._locale
            }
            a = a.parent
        }
        if (this.application) {
            return this.application.getLocale()
        }
        return null
    },
    getStyle: function() {
        return this._style
    },
    getStyleName: function() {
        return this._styleName
    },
    indexOf: function(a) {
        for (var b = 0; b < this.children.length; ++b) {
            if (this.children[b] == a) {
                return b
            }
        }
        return -1
    },
    isActive: function() {
        if (!this.isRenderEnabled()) {
            return false
        }
        if (!this.application || !this.application.isActive()) {
            return false
        }
        var a = this.application.getModalContextRoot();
        if (a != null && !a.isAncestorOf(this)) {
            return false
        }
        return true
    },
    isAncestorOf: function(a) {
        while (a != null && a != this) {
            a = a.parent
        }
        return a == this
    },
    isEnabled: function() {
        return this._enabled
    },
    isRenderEnabled: function() {
        var a = this;
        while (a != null) {
            if (!a._enabled) {
                return false
            }
            a = a.parent
        }
        return true
    },
    register: function(a) {
        if (a && this.application) {
            throw new Error("Attempt to re-register or change registered application of component.")
        }
        var b;
        if (!a) {
            if (this.children != null) {
                for (b = 0; b < this.children.length; ++b) {
                    this.children[b].register(false)
                }
            }
            this.application._unregisterComponent(this);
            if (this.application._focusedComponent == this) {
                this.application.setFocusedComponent(this.parent)
            }
            if (this._listenerList != null && this._listenerList.hasListeners("dispose")) {
                this._listenerList.fireEvent({
                    type: "dispose",
                    source: this
                })
            }
        }
        this.application = a;
        if (a) {
            if (this.renderId == null) {
                this.renderId = "CL." + (++Echo.Component._nextRenderId)
            }
            this.application._registerComponent(this);
            if (this._listenerList != null && this._listenerList.hasListeners("init")) {
                this._listenerList.fireEvent({
                    type: "init",
                    source: this
                })
            }
            if (this.children != null) {
                for (b = 0; b < this.children.length; ++b) {
                    this.children[b].register(a)
                }
            }
        }
    },
    render: function(b, a) {
        var d = this._localStyle[b];
        if (d == null) {
            if (this._style != null) {
                d = this._style[b]
            }
            if (d == null && this.application && this.application._styleSheet) {
                var c = this.application._styleSheet.getRenderStyle(this._styleName != null ? this._styleName : "", this.componentType);
                if (c) {
                    d = c[b]
                }
            }
        }
        return d == null ? a : d
    },
    renderIndex: function(c, b, a) {
        var e = this._localStyle[c];
        var f = e ? e[b] : null;
        if (f == null) {
            if (this._style != null) {
                e = this._style[c];
                f = e ? e[b] : null
            }
            if (f == null && this._styleName && this.application && this.application._styleSheet) {
                var d = this.application._styleSheet.getRenderStyle(this._styleName != null ? this._styleName : "", this.componentType);
                if (d) {
                    e = d[c];
                    f = e ? e[b] : null
                }
            }
        }
        return f == null ? a : f
    },
    remove: function(c) {
        var b;
        var a;
        if (typeof c == "number") {
            a = c;
            b = this.children[a];
            if (!b) {
                throw new Error("Component.remove(): index out of bounds: " + a + ", parent: " + this)
            }
        } else {
            b = c;
            a = this.indexOf(b);
            if (a == -1) {
                return
            }
        }
        if (this.application) {
            b.register(null)
        }
        this.children.splice(a, 1);
        b.parent = null;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "children", b, null)
        }
        if (b._listenerList && b._listenerList.hasListeners("parent")) {
            b._listenerList.fireEvent({
                type: "parent",
                source: b,
                oldValue: this,
                newValue: null
            })
        }
        if (this._listenerList && this._listenerList.hasListeners("children")) {
            this._listenerList.fireEvent({
                type: "children",
                source: this,
                remove: b,
                index: a
            })
        }
    },
    removeAll: function() {
        while (this.children.length > 0) {
            this.remove(this.children.length - 1)
        }
    },
    removeListener: function(a, b) {
        if (this._listenerList == null) {
            return
        }
        this._listenerList.removeListener(a, b);
        if (this.application) {
            this.application.notifyComponentUpdate(this, "listeners", a, null)
        }
    },
    set: function(b, c, d) {
        var a = this._localStyle[b];
        if (a === c) {
            return
        }
        this._localStyle[b] = c;
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({
                type: "property",
                source: this,
                propertyName: b,
                oldValue: a,
                newValue: c
            })
        }
        if (this.application) {
            this.application.notifyComponentUpdate(this, b, a, c, d)
        }
    },
    setEnabled: function(b) {
        var a = this._enabled;
        this._enabled = b;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "enabled", a, b)
        }
    },
    setIndex: function(c, b, e, f) {
        var d = this._localStyle[c];
        var a = null;
        if (d) {
            a = d[b];
            if (a === e) {
                return
            }
        } else {
            d = [];
            this._localStyle[c] = d
        }
        d[b] = e;
        if (this.application) {
            this.application.notifyComponentUpdate(this, c, a, e, f)
        }
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({
                type: "property",
                source: this,
                propertyName: c,
                index: b,
                oldValue: a,
                newValue: e
            })
        }
    },
    setLayoutDirection: function(b) {
        var a = this._layoutDirection;
        this._layoutDirection = b;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "layoutDirection", a, b)
        }
    },
    setLocale: function(b) {
        var a = this._locale;
        this._locale = b;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "locale", a, b)
        }
    },
    setStyle: function(b) {
        var a = this._style;
        this._style = b;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "style", a, b)
        }
    },
    setStyleName: function(b) {
        var a = this._styleName;
        this._styleName = b;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "styleName", a, b)
        }
    },
    toString: function(e) {
        var c = this.renderId + "/" + this.componentType;
        if (e) {
            c += "\n";
            var b = this.getComponentCount();
            c += this.renderId + "/properties:" + this._localStyle + "\n";
            for (var d = 0; d < b; ++d) {
                var a = this.getComponent(d);
                c += this.renderId + "/child:" + a.renderId + "\n";
                c += a.toString(true)
            }
        }
        return c
    }
});
Echo.FocusManager = Core.extend({
    _application: null,
    $construct: function(a) {
        this._application = a
    },
    find: function(h, g) {
        if (!h) {
            h = this._application.getFocusedComponent();
            if (!h) {
                h = this._application.rootComponent
            }
        }
        var f = g ? h.focusPreviousId : h.focusNextId;
        if (f) {
            var j = this._application.getComponentByRenderId(f);
            if (j && j.isActive() && j.focusable) {
                return j
            }
        }
        var b = h;
        var c = {};
        var a = null;
        while (true) {
            var d = null;
            if ((g && h == b) || (a && a.parent == h)) {} else {
                var e = h.getComponentCount();
                if (e > 0) {
                    var i = this._getFocusOrder(h);
                    if (i) {
                        d = h.getComponent(i[g ? e - 1 : 0])
                    } else {
                        d = h.getComponent(g ? e - 1 : 0)
                    }
                    if (c[d.renderId]) {
                        d = null
                    }
                }
            }
            if (d == null) {
                if (h.parent) {
                    d = this._getNextCandidate(h, g)
                }
            }
            if (d == null) {
                d = h.parent
            }
            if (d == null) {
                return null
            }
            a = h;
            h = d;
            c[h.renderId] = true;
            if (h != b && h.isActive() && h.focusable) {
                return h
            }
        }
    },
    findInParent: function(g, d, c) {
        if (!c) {
            c = 1
        }
        var h = {},
            e = this._application.getFocusedComponent();
        if (!e) {
            return null
        }
        h[e.renderId] = true;
        var f = this._getDescendantIndex(g, e);
        if (f == -1) {
            return null
        }
        var a = f;
        var b = e;
        do {
            b = this.find(b, d, h);
            if (b == null || h[b.renderId]) {
                return null
            }
            a = this._getDescendantIndex(g, b);
            h[b.renderId] = true
        } while (Math.abs(a - f) < c && b != e);
        if (b == e) {
            return null
        }
        this._application.setFocusedComponent(b);
        return b
    },
    _getDescendantIndex: function(b, a) {
        while (a.parent != b && a.parent != null) {
            a = a.parent
        }
        if (a.parent == null) {
            return -1
        }
        return b.indexOf(a)
    },
    _getFocusOrder: function(b) {
        var d = b.getFocusOrder ? b.getFocusOrder() : null;
        if (!d) {
            return null
        }
        var a = d.slice().sort();
        for (var c = 1; c < a.length; ++c) {
            if (a[c - 1] >= a[c]) {
                Core.Debug.consoleWrite("Invalid focus order for component " + b + ": " + d);
                return null
            }
        }
        return d
    },
    _getNextCandidate: function(c, b) {
        if (!c.parent) {
            return null
        }
        var e = this._getFocusOrder(c.parent);
        var a, d;
        if (b) {
            a = c.parent.indexOf(c);
            if (e) {
                d = Core.Arrays.indexOf(e, a);
                if (d > 0) {
                    return c.parent.children[e[d - 1]]
                }
            } else {
                if (a > 0) {
                    return c.parent.getComponent(a - 1)
                }
            }
        } else {
            a = c.parent.indexOf(c);
            if (e) {
                d = Core.Arrays.indexOf(e, a);
                if (d < e.length - 1) {
                    return c.parent.children[e[d + 1]]
                }
            } else {
                if (a < c.parent.getComponentCount() - 1) {
                    return c.parent.getComponent(a + 1)
                }
            }
        }
    }
});
Echo.LayoutDirection = Core.extend({
    _ltr: false,
    $construct: function(a) {
        this._ltr = a
    },
    isLeftToRight: function() {
        return this._ltr
    }
});
Echo.LayoutDirection.LTR = new Echo.LayoutDirection(true);
Echo.LayoutDirection.RTL = new Echo.LayoutDirection(false);
Echo.StyleSheet = Core.extend({
    _nameToStyleMap: null,
    _renderCache: null,
    $construct: function(c) {
        this._renderCache = {};
        this._nameToStyleMap = {};
        if (c) {
            for (var b in c) {
                for (var a in c[b]) {
                    this.setStyle(b, a, c[b][a])
                }
            }
        }
    },
    getRenderStyle: function(b, a) {
        var d = this._renderCache[b];
        if (!d) {
            return null
        }
        var c = d[a];
        if (c !== undefined) {
            return c
        } else {
            return this._loadRenderStyle(b, a)
        }
    },
    _loadRenderStyle: function(c, b) {
        var e = this._nameToStyleMap[c];
        if (e == null) {
            this._renderCache[c][b] = null;
            return null
        }
        var d = e[b];
        if (d == null) {
            var a = b;
            while (d == null) {
                a = Echo.ComponentFactory.getSuperType(a);
                if (a == null) {
                    this._renderCache[c][a] = null;
                    return null
                }
                d = e[a]
            }
        }
        this._renderCache[c][b] = d;
        return d
    },
    getStyle: function(b, a) {
        var c = this._nameToStyleMap[b];
        if (c == null) {
            return null
        }
        return c[a]
    },
    setStyle: function(b, a, c) {
        this._renderCache[b] = {};
        var d = this._nameToStyleMap[b];
        if (d == null) {
            d = {};
            this._nameToStyleMap[b] = d
        }
        d[a] = c
    }
});
Echo.Update = {};
Echo.Update.ComponentUpdate = Core.extend({
    $static: {
        PropertyUpdate: function(a, b) {
            this.oldValue = a;
            this.newValue = b
        }
    },
    _manager: null,
    parent: null,
    renderContext: null,
    _addedChildIds: null,
    _propertyUpdates: null,
    _removedChildIds: null,
    _removedDescendantIds: null,
    _updatedLayoutDataChildIds: null,
    _listenerUpdates: null,
    $construct: function(a, b) {
        this._manager = a;
        this.parent = b
    },
    _addChild: function(a) {
        if (!this._addedChildIds) {
            this._addedChildIds = []
        }
        this._addedChildIds.push(a.renderId);
        this._manager._idMap[a.renderId] = a
    },
    _appendRemovedDescendants: function(b) {
        var a;
        if (b._removedDescendantIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = []
            }
            for (a = 0; a < b._removedDescendantIds.length; ++a) {
                this._removedDescendantIds.push(b._removedDescendantIds[a])
            }
        }
        if (b._removedChildIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = []
            }
            for (a = 0; a < b._removedChildIds.length; ++a) {
                this._removedDescendantIds.push(b._removedChildIds[a])
            }
        }
        if (this._removedDescendantIds != null) {
            Core.Arrays.removeDuplicates(this._removedDescendantIds)
        }
    },
    getAddedChildren: function() {
        if (!this._addedChildIds) {
            return null
        }
        var b = [];
        for (var a = 0; a < this._addedChildIds.length; ++a) {
            b[a] = this._manager._idMap[this._addedChildIds[a]]
        }
        return b
    },
    getRemovedChildren: function() {
        if (!this._removedChildIds) {
            return null
        }
        var b = [];
        for (var a = 0; a < this._removedChildIds.length; ++a) {
            b[a] = this._manager._removedIdMap[this._removedChildIds[a]]
        }
        return b
    },
    getRemovedDescendants: function() {
        if (!this._removedDescendantIds) {
            return null
        }
        var b = [];
        for (var a = 0; a < this._removedDescendantIds.length; ++a) {
            b[a] = this._manager._removedIdMap[this._removedDescendantIds[a]]
        }
        return b
    },
    getUpdatedLayoutDataChildren: function() {
        if (!this._updatedLayoutDataChildIds) {
            return null
        }
        var b = [];
        for (var a = 0; a < this._updatedLayoutDataChildIds.length; ++a) {
            b[a] = this._manager._idMap[this._updatedLayoutDataChildIds[a]]
        }
        return b
    },
    hasAddedChildren: function() {
        return this._addedChildIds != null
    },
    hasRemovedChildren: function() {
        return this._removedChildIds != null
    },
    hasUpdatedLayoutDataChildren: function() {
        return this._updatedLayoutDataChildIds != null
    },
    hasUpdatedProperties: function() {
        return this._propertyUpdates != null
    },
    getUpdatedProperty: function(a) {
        if (this._propertyUpdates == null) {
            return null
        }
        return this._propertyUpdates[a]
    },
    isListenerTypeUpdated: function(a) {
        return this._listenerUpdates == null ? false : this._listenerUpdates[a]
    },
    getUpdatedPropertyNames: function() {
        if (this._propertyUpdates == null) {
            return []
        }
        var b = [];
        for (var a in this._propertyUpdates) {
            b.push(a)
        }
        return b
    },
    hasUpdatedPropertyIn: function(b) {
        for (var a in this._propertyUpdates) {
            if (b[a]) {
                return true
            }
        }
        return false
    },
    isUpdatedPropertySetIn: function(b) {
        for (var a in this._propertyUpdates) {
            if (!b[a]) {
                return false
            }
        }
        return true
    },
    _removeChild: function(b) {
        this._manager._removedIdMap[b.renderId] = b;
        if (this._addedChildIds) {
            Core.Arrays.remove(this._addedChildIds, b.renderId)
        }
        if (this._updatedLayoutDataChildIds) {
            Core.Arrays.remove(this._updatedLayoutDataChildIds, b.renderId)
        }
        if (!this._removedChildIds) {
            this._removedChildIds = []
        }
        this._removedChildIds.push(b.renderId);
        for (var a = 0; a < b.children.length; ++a) {
            this._removeDescendant(b.children[a])
        }
    },
    _removeDescendant: function(b) {
        this._manager._removedIdMap[b.renderId] = b;
        if (!this._removedDescendantIds) {
            this._removedDescendantIds = []
        }
        this._removedDescendantIds.push(b.renderId);
        for (var a = 0; a < b.children.length; ++a) {
            this._removeDescendant(b.children[a])
        }
    },
    toString: function() {
        var a = "ComponentUpdate\n";
        a += "- Parent: " + this.parent + "\n";
        a += "- Adds: " + this._addedChildIds + "\n";
        a += "- Removes: " + this._removedChildIds + "\n";
        a += "- DescendantRemoves: " + this._removedDescendantIds + "\n";
        a += "- Properties: " + Core.Debug.toString(this._propertyUpdates) + "\n";
        a += "- LayoutDatas: " + this._updatedLayoutDataChildIds + "\n";
        return a
    },
    _updateLayoutData: function(a) {
        this._manager._idMap[a.renderId] = a;
        if (this._updatedLayoutDataChildIds == null) {
            this._updatedLayoutDataChildIds = []
        }
        this._updatedLayoutDataChildIds.push(a.renderId)
    },
    _updateListener: function(a) {
        if (this._listenerUpdates == null) {
            this._listenerUpdates = {}
        }
        this._listenerUpdates[a] = true
    },
    _updateProperty: function(a, b, d) {
        if (this._propertyUpdates == null) {
            this._propertyUpdates = {}
        }
        var c = new Echo.Update.ComponentUpdate.PropertyUpdate(b, d);
        this._propertyUpdates[a] = c
    }
});
Echo.Update.Manager = Core.extend({
    _componentUpdateMap: null,
    fullRefreshRequired: false,
    application: null,
    _hasUpdates: false,
    _listenerList: null,
    _idMap: null,
    _removedIdMap: null,
    _lastAncestorTestParentId: null,
    $construct: function(a) {
        this._componentUpdateMap = {};
        this.application = a;
        this._listenerList = new Core.ListenerList();
        this._idMap = {};
        this._removedIdMap = {}
    },
    addUpdateListener: function(a) {
        this._listenerList.addListener("update", a)
    },
    _createComponentUpdate: function(a) {
        this._hasUpdates = true;
        var b = this._componentUpdateMap[a.renderId];
        if (!b) {
            b = new Echo.Update.ComponentUpdate(this, a);
            this._componentUpdateMap[a.renderId] = b
        }
        return b
    },
    dispose: function() {
        this.application = null
    },
    _fireUpdate: function() {
        if (!this._listenerList.isEmpty()) {
            this._listenerList.fireEvent({
                type: "update",
                source: this
            })
        }
    },
    getUpdates: function() {
        var b = [];
        for (var a in this._componentUpdateMap) {
            b.push(this._componentUpdateMap[a])
        }
        return b
    },
    hasUpdates: function() {
        return this._hasUpdates
    },
    _isAncestorBeingAdded: function(a) {
        var f = a;
        var d = a.parent;
        var c = d ? d.renderId : null;
        if (c && this._lastAncestorTestParentId == c) {
            return false
        }
        while (d) {
            var e = this._componentUpdateMap[d.renderId];
            if (e && e._addedChildIds) {
                for (var b = 0; b < e._addedChildIds.length; ++b) {
                    if (e._addedChildIds[b] == f.renderId) {
                        return true
                    }
                }
            }
            f = d;
            d = d.parent
        }
        this._lastAncestorTestParentId = c;
        return false
    },
    _processComponentAdd: function(a, c) {
        if (this.fullRefreshRequired) {
            return
        }
        if (this._isAncestorBeingAdded(c)) {
            return
        }
        var b = this._createComponentUpdate(a);
        b._addChild(c)
    },
    _processComponentLayoutDataUpdate: function(a) {
        if (this.fullRefreshRequired) {
            return
        }
        var b = a.parent;
        if (b == null || this._isAncestorBeingAdded(b)) {
            return
        }
        var c = this._createComponentUpdate(b);
        c._updateLayoutData(a)
    },
    _processComponentListenerUpdate: function(a, b) {
        if (this.fullRefreshRequired) {
            return
        }
        if (this._isAncestorBeingAdded(a)) {
            return
        }
        var c = this._createComponentUpdate(a);
        c._updateListener(b)
    },
    _processComponentRemove: function(d, g) {
        if (this.fullRefreshRequired) {
            return
        }
        if (this._isAncestorBeingAdded(d)) {
            return
        }
        var f = this._createComponentUpdate(d);
        f._removeChild(g);
        var b = null;
        for (var a in this._componentUpdateMap) {
            var e = this._componentUpdateMap[a];
            if (g.isAncestorOf(e.parent)) {
                f._appendRemovedDescendants(e);
                if (b == null) {
                    b = []
                }
                b.push(a)
            }
        }
        if (b != null) {
            for (var c = 0; c < b.length; ++c) {
                delete this._componentUpdateMap[b[c]]
            }
        }
    },
    _processComponentPropertyUpdate: function(c, a, b, d) {
        if (this.fullRefreshRequired) {
            return
        }
        if (this._isAncestorBeingAdded(c)) {
            return
        }
        var e = this._createComponentUpdate(c);
        e._updateProperty(a, b, d)
    },
    _processFullRefresh: function() {
        for (var a = 0; a < this.application.rootComponent.children.length; ++a) {
            this._processComponentRemove(this.application.rootComponent, this.application.rootComponent.children[a])
        }
        this.fullRefreshRequired = true;
        var b = this._createComponentUpdate(this.application.rootComponent);
        b.fullRefresh = true;
        this._fireUpdate()
    },
    _processComponentUpdate: function(c, a, b, d) {
        if (a == "children") {
            if (d == null) {
                this._processComponentRemove(c, b)
            } else {
                this._processComponentAdd(c, d)
            }
        } else {
            if (a == "layoutData") {
                this._processComponentLayoutDataUpdate(c)
            } else {
                if (a == "listeners") {
                    this._processComponentListenerUpdate(c, b || d)
                } else {
                    this._processComponentPropertyUpdate(c, a, b, d)
                }
            }
        }
        this._fireUpdate()
    },
    purge: function() {
        this.fullRefreshRequired = false;
        this._componentUpdateMap = {};
        this._idMap = {};
        this._removedIdMap = {};
        this._hasUpdates = false;
        this._lastAncestorTestParentId = null
    },
    removeUpdateListener: function(a) {
        this._listenerList.removeListener("update", a)
    },
    toString: function() {
        var b = "[ UpdateManager ]\n";
        if (this.fullRefreshRequired) {
            b += "fullRefresh"
        } else {
            for (var a in this._componentUpdateMap) {
                b += this._componentUpdateMap[a]
            }
        }
        return b
    }
});
Echo.AbstractButton = Core.extend(Echo.Component, {
    $abstract: true,
    $load: function() {
        Echo.ComponentFactory.registerType("AbstractButton", this);
        Echo.ComponentFactory.registerType("AB", this)
    },
    componentType: "AbstractButton",
    focusable: true,
    $virtual: {
        doAction: function() {
            this.fireEvent({
                type: "action",
                source: this,
                actionCommand: this.get("actionCommand")
            })
        }
    }
});
Echo.Button = Core.extend(Echo.AbstractButton, {
    $load: function() {
        Echo.ComponentFactory.registerType("Button", this);
        Echo.ComponentFactory.registerType("B", this)
    },
    componentType: "Button"
});
Echo.ToggleButton = Core.extend(Echo.AbstractButton, {
    $load: function() {
        Echo.ComponentFactory.registerType("ToggleButton", this);
        Echo.ComponentFactory.registerType("TB", this)
    },
    $abstract: true,
    componentType: "ToggleButton"
});
Echo.CheckBox = Core.extend(Echo.ToggleButton, {
    $load: function() {
        Echo.ComponentFactory.registerType("CheckBox", this);
        Echo.ComponentFactory.registerType("CB", this)
    },
    componentType: "CheckBox"
});
Echo.RadioButton = Core.extend(Echo.ToggleButton, {
    $load: function() {
        Echo.ComponentFactory.registerType("RadioButton", this);
        Echo.ComponentFactory.registerType("RB", this)
    },
    componentType: "RadioButton"
});
Echo.AbstractListComponent = Core.extend(Echo.Component, {
    $abstract: true,
    $load: function() {
        Echo.ComponentFactory.registerType("AbstractListComponent", this);
        Echo.ComponentFactory.registerType("LC", this)
    },
    componentType: "AbstractListComponent",
    focusable: true,
    $virtual: {
        doAction: function() {
            this.fireEvent({
                type: "action",
                source: this,
                actionCommand: this.get("actionCommand")
            })
        }
    }
});
Echo.ListBox = Core.extend(Echo.AbstractListComponent, {
    $static: {
        SINGLE_SELECTION: 0,
        MULTIPLE_SELECTION: 2
    },
    $load: function() {
        Echo.ComponentFactory.registerType("ListBox", this);
        Echo.ComponentFactory.registerType("LB", this)
    },
    componentType: "ListBox"
});
Echo.SelectField = Core.extend(Echo.AbstractListComponent, {
    $load: function() {
        Echo.ComponentFactory.registerType("SelectField", this);
        Echo.ComponentFactory.registerType("SF", this)
    },
    componentType: "SelectField"
});
Echo.Column = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("Column", this);
        Echo.ComponentFactory.registerType("C", this)
    },
    componentType: "Column"
});
Echo.Composite = Core.extend(Echo.Component, {
    $abstract: true,
    $load: function() {
        Echo.ComponentFactory.registerType("Composite", this);
        Echo.ComponentFactory.registerType("CM", this)
    },
    componentType: "Composite"
});
Echo.Panel = Core.extend(Echo.Composite, {
    $load: function() {
        Echo.ComponentFactory.registerType("Panel", this);
        Echo.ComponentFactory.registerType("P", this)
    },
    componentType: "Panel"
});
Echo.ContentPane = Core.extend(Echo.Component, {
    $static: {
        OVERFLOW_AUTO: 0,
        OVERFLOW_HIDDEN: 1,
        OVERFLOW_SCROLL: 2
    },
    $load: function() {
        Echo.ComponentFactory.registerType("ContentPane", this);
        Echo.ComponentFactory.registerType("CP", this)
    },
    componentType: "ContentPane",
    pane: true
});
Echo.Grid = Core.extend(Echo.Component, {
    $static: {
        ORIENTATION_HORIZONTAL: 0,
        ORIENTATION_VERTICAL: 1,
        SPAN_FILL: -1
    },
    $load: function() {
        Echo.ComponentFactory.registerType("Grid", this);
        Echo.ComponentFactory.registerType("G", this)
    },
    componentType: "Grid"
});
Echo.Label = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("Label", this);
        Echo.ComponentFactory.registerType("L", this)
    },
    componentType: "Label"
});
Echo.Row = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("Row", this);
        Echo.ComponentFactory.registerType("R", this)
    },
    componentType: "Row"
});
Echo.SplitPane = Core.extend(Echo.Component, {
    $static: {
        ORIENTATION_HORIZONTAL_LEADING_TRAILING: 0,
        ORIENTATION_HORIZONTAL_TRAILING_LEADING: 1,
        ORIENTATION_HORIZONTAL_LEFT_RIGHT: 2,
        ORIENTATION_HORIZONTAL_RIGHT_LEFT: 3,
        ORIENTATION_VERTICAL_TOP_BOTTOM: 4,
        ORIENTATION_VERTICAL_BOTTOM_TOP: 5,
        DEFAULT_SEPARATOR_POSITION: "50%",
        DEFAULT_SEPARATOR_SIZE_FIXED: 0,
        DEFAULT_SEPARATOR_SIZE_RESIZABLE: 4,
        DEFAULT_SEPARATOR_COLOR: "#3f3f4f",
        OVERFLOW_AUTO: 0,
        OVERFLOW_HIDDEN: 1,
        OVERFLOW_SCROLL: 2
    },
    $load: function() {
        Echo.ComponentFactory.registerType("SplitPane", this);
        Echo.ComponentFactory.registerType("SP", this)
    },
    componentType: "SplitPane",
    pane: true,
    getFocusOrder: function() {
        if (this.children.length < 2) {
            return null
        }
        switch (this.render("orientation")) {
            case Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP:
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING:
                return [1, 0];
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT:
                return this.getRenderLayoutDirection().isLeftToRight() ? null : [1, 0];
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT:
                return this.getRenderLayoutDirection().isLeftToRight() ? [1, 0] : null;
            default:
                return null
        }
    }
});
Echo.TextComponent = Core.extend(Echo.Component, {
    $abstract: true,
    $load: function() {
        Echo.ComponentFactory.registerType("TextComponent", this);
        Echo.ComponentFactory.registerType("TC", this)
    },
    $virtual: {
        doAction: function() {
            this.fireEvent({
                type: "action",
                source: this,
                actionCommand: this.get("actionCommand")
            })
        },
        doKeyDown: function(b) {
            var a = {
                type: "keyDown",
                source: this,
                keyCode: b
            };
            this.fireEvent(a);
            return !a.veto
        },
        doKeyPress: function(c, a) {
            var b = {
                type: "keyPress",
                source: this,
                keyCode: c,
                charCode: a
            };
            this.fireEvent(b);
            return !b.veto
        }
    },
    componentType: "TextComponent",
    focusable: true
});
Echo.TextArea = Core.extend(Echo.TextComponent, {
    $load: function() {
        Echo.ComponentFactory.registerType("TextArea", this);
        Echo.ComponentFactory.registerType("TA", this)
    },
    componentType: "TextArea"
});
Echo.TextField = Core.extend(Echo.TextComponent, {
    $load: function() {
        Echo.ComponentFactory.registerType("TextField", this);
        Echo.ComponentFactory.registerType("TF", this)
    },
    componentType: "TextField"
});
Echo.PasswordField = Core.extend(Echo.TextField, {
    $load: function() {
        Echo.ComponentFactory.registerType("PasswordField", this);
        Echo.ComponentFactory.registerType("PF", this)
    },
    componentType: "PasswordField"
});
Echo.WindowPane = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("WindowPane", this);
        Echo.ComponentFactory.registerType("WP", this)
    },
    $static: {
        DEFAULT_RESOURCE_TIMEOUT: 300,
        DEFAULT_BORDER: {
            color: "#36537a",
            borderInsets: 20,
            contentInsets: 3
        },
        DEFAULT_BACKGROUND: "#ffffff",
        DEFAULT_FOREGROUND: "#000000",
        DEFAULT_CONTROLS_INSETS: 4,
        DEFAULT_CONTROLS_SPACING: 4,
        DEFAULT_HEIGHT: "15em",
        DEFAULT_MINIMUM_WIDTH: 100,
        DEFAULT_MINIMUM_HEIGHT: 100,
        DEFAULT_TITLE_BACKGROUND: "#becafe",
        DEFAULT_TITLE_HEIGHT: 30,
        DEFAULT_TITLE_INSETS: "5px 10px",
        DEFAULT_WIDTH: "30em"
    },
    componentType: "WindowPane",
    modalSupport: true,
    floatingPane: true,
    pane: true,
    focusable: true,
    _preMaximizedState: null,
    userClose: function() {
        this.fireEvent({
            type: "close",
            source: this
        })
    },
    userMaximize: function() {
        if (this.render("width") == "100%" && this.render("height") == "100%") {
            if (this._preMaximizedState) {
                this.set("width", this._preMaximizedState.width);
                this.set("height", this._preMaximizedState.height);
                this.set("positionX", this._preMaximizedState.x);
                this.set("positionY", this._preMaximizedState.y)
            }
        } else {
            this._preMaximizedState = {
                x: this.get("positionX"),
                y: this.get("positionY"),
                width: this.get("width"),
                height: this.get("height")
            };
            this.set("width", "100%");
            this.set("height", "100%")
        }
        this.fireEvent({
            type: "maximize",
            source: this
        })
    },
    userMinimize: function() {
        this.fireEvent({
            type: "minimize",
            source: this
        })
    }
});
Echo.DebugConsole = {
    _installed: false,
    _rendered: false,
    _titleDiv: null,
    _contentDiv: null,
    _div: null,
    _logging: false,
    _maximized: false,
    _mouseMoveRef: null,
    _mouseDownRef: null,
    _addControl: function(b, c) {
        var a = document.createElement("span");
        a.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        a.appendChild(document.createTextNode("[" + b + "]"));
        this._controlsDiv.appendChild(a);
        Core.Web.DOM.addEventListener(a, "click", Core.method(this, c), false)
    },
    _clearListener: function(a) {
        while (this._contentDiv.firstChild) {
            this._contentDiv.removeChild(this._contentDiv.firstChild)
        }
    },
    _closeListener: function(a) {
        this._div.style.display = "none"
    },
    _consoleWrite: function(b) {
        if (!this._logging) {
            return
        }
        if (!this._rendered) {
            this._render()
        }
        var a = document.createElement("div");
        a.appendChild(document.createTextNode(b));
        this._contentDiv.appendChild(a);
        this._contentDiv.scrollTop = 10000000
    },
    _keyListener: function(a) {
        a = a ? a : window.event;
        if (!(a.keyCode == 67 && a.ctrlKey && a.altKey)) {
            return
        }
        this._logging = true;
        this.setVisible(!this.isVisible())
    },
    install: function() {
        if (this._installed) {
            return
        }
        Core.Web.DOM.addEventListener(document, "keydown", Core.method(this, this._keyListener), false);
        Core.Debug.consoleWrite = function(a) {
            Echo.DebugConsole._consoleWrite(a)
        };
        if (document.URL.toString().indexOf("?debug") != -1) {
            this.setVisible(true);
            this._logging = true
        }
        this._installed = true
    },
    isVisible: function() {
        if (!this._rendered) {
            return false
        }
        return this._div.style.display == "block"
    },
    _maximizeListener: function(c) {
        this._maximized = !this._maximized;
        this._div.style.top = "20px";
        this._div.style.right = "20px";
        this._div.style.left = "";
        this._div.style.bottom = "";
        if (this._maximized) {
            var a = document.height || 600;
            var b = document.width || 600;
            this._div.style.width = (b - 50) + "px";
            this._div.style.height = (a - 50) + "px";
            this._contentDiv.style.width = (b - 72) + "px";
            this._contentDiv.style.height = (a - 85) + "px"
        } else {
            this._div.style.width = "300px";
            this._div.style.height = "300px";
            this._contentDiv.style.width = "278px";
            this._contentDiv.style.height = "265px"
        }
    },
    _render: function() {
        var a;
        this._div = document.createElement("div");
        this._div.id = "__DebugConsole__";
        this._div.style.cssText = "display:none;position:absolute;top:20px;right:20px;width:300px;height:300px;background-color:#2f2f3f;border:5px solid #3f6fff;overflow:hidden;z-index:32500;";
        this._titleDiv = document.createElement("div");
        this._titleDiv.style.cssText = "position:relative;margin:1px;height:20px;padding:3px 10px;background-color:#5f5f8f;color:#ffffff;overflow:hidden;cursor:move;";
        Core.Web.DOM.addEventListener(this._titleDiv, "mousedown", Core.method(this, this._titleMouseDown), false);
        Core.Web.Event.Selection.disable(this._titleDiv);
        this._div.appendChild(this._titleDiv);
        var b = document.createElement("div");
        b.style.cssText = "position:absolute;font-weight:bold;";
        b.appendChild(document.createTextNode("Debug Console"));
        this._titleDiv.appendChild(b);
        this._controlsDiv = document.createElement("div");
        this._controlsDiv.style.cssText = "position:absolute;right:0;background-color:#5f5f8f;";
        this._titleDiv.appendChild(this._controlsDiv);
        this._addControl("C", this._clearListener);
        this._addControl("^", this._maximizeListener);
        this._addControl("X", this._closeListener);
        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = "font-family:monospace;font-size:9px;position:absolute;top:28px;left:1px;width:278px;height:265px;padding:3px 10px;background-color:#1f1f2f;overflow:auto;color:#3fff6f;";
        this._div.appendChild(this._contentDiv);
        document.body.appendChild(this._div);
        this._titleMouseUpRef = Core.method(this, this._titleMouseUp);
        this._titleMouseMoveRef = Core.method(this, this._titleMouseMove);
        this._rendered = true
    },
    _titleMouseDown: function(a) {
        this._drag = {
            originX: a.clientX,
            originY: a.clientY,
            initialX: this._div.offsetLeft,
            initialY: this._div.offsetTop
        };
        Core.Web.DOM.preventEventDefault(a);
        Core.Web.DOM.addEventListener(document.body, "mouseup", this._titleMouseUpRef, false);
        Core.Web.DOM.addEventListener(document.body, "mousemove", this._titleMouseMoveRef, false)
    },
    _titleMouseMove: function(a) {
        if (!this._drag) {
            return
        }
        this._div.style.right = this._div.style.bottom = "";
        this._div.style.top = (a.clientY - this._drag.originY + this._drag.initialY) + "px";
        this._div.style.left = (a.clientX - this._drag.originX + this._drag.initialX) + "px"
    },
    _titleMouseUp: function(a) {
        this._drag = null;
        Core.Web.DOM.removeEventListener(document.body, "mouseup", this._titleMouseUpRef, false);
        Core.Web.DOM.removeEventListener(document.body, "mousemove", this._titleMouseMoveRef, false)
    },
    setVisible: function(a) {
        if (!this._rendered) {
            this._render()
        }
        this._div.style.display = a ? "block" : "none"
    }
};
Echo.Render = {
    _loadedPeerCount: 0,
    _nextPeerId: 0,
    _peers: {},
    _disposedComponents: null,
    _componentDepthArraySort: function(d, c) {
        return Echo.Render._getComponentDepth(d.parent) - Echo.Render._getComponentDepth(c.parent)
    },
    _doRenderDisplay: function(b, a) {
        var d, c = b;
        var e = c.parent;
        while (e) {
            if (e.peer.isChildVisible && !e.peer.isChildVisible(c)) {
                return
            }
            c = e;
            e = e.parent
        }
        if (a) {
            Echo.Render._doRenderDisplayImpl(b)
        } else {
            if (b.peer.isChildVisible) {
                for (d = 0; d < b.children.length; ++d) {
                    if (b.peer.isChildVisible(b.children[d])) {
                        Echo.Render._doRenderDisplayImpl(b.children[d])
                    }
                }
            } else {
                for (d = 0; d < b.children.length; ++d) {
                    Echo.Render._doRenderDisplayImpl(b.children[d])
                }
            }
        }
    },
    _doRenderDisplayImpl: function(a) {
        if (!a.peer) {
            return
        }
        if (a.peer.renderDisplay) {
            a.peer.renderDisplay()
        }
        a.peer.displayed = true;
        var b;
        if (a.peer.isChildVisible) {
            for (b = 0; b < a.children.length; ++b) {
                if (a.peer.isChildVisible(a.children[b])) {
                    Echo.Render._doRenderDisplayImpl(a.children[b])
                }
            }
        } else {
            for (b = 0; b < a.children.length; ++b) {
                Echo.Render._doRenderDisplayImpl(a.children[b])
            }
        }
    },
    _getComponentDepth: function(a) {
        var b = -1;
        while (a != null) {
            a = a.parent;
            ++b
        }
        return b
    },
    _loadPeer: function(a, b) {
        if (b.peer) {
            return
        }
        var c = Echo.Render._peers[b.componentType];
        if (!c) {
            throw new Error("Peer not found for: " + b.componentType)
        }++this._loadedPeerCount;
        b.peer = new c();
        b.peer._peerId = this._nextPeerId++;
        b.peer.component = b;
        b.peer.client = a
    },
    notifyResize: function(a) {
        Echo.Render._doRenderDisplay(a, false)
    },
    _processDispose: function(c) {
        var a, b = c.getRemovedDescendants();
        if (b) {
            for (a = 0; a < b.length; ++a) {
                Echo.Render._renderComponentDisposeImpl(c, b[a])
            }
        }
        b = c.getRemovedChildren();
        if (b) {
            for (a = 0; a < b.length; ++a) {
                Echo.Render._renderComponentDisposeImpl(c, b[a])
            }
        }
    },
    processUpdates: function(c) {
        var g = c.application.updateManager;
        if (!g.hasUpdates()) {
            return
        }
        Echo.Render._disposedComponents = {};
        var l = g.getUpdates();
        l.sort(Echo.Render._componentDepthArraySort);
        var h, f, e;
        for (f = 0; f < l.length; ++f) {
            l[f].renderContext = {};
            h = l[f].parent.peer;
            if (h == null && l[f].parent.componentType == "Root") {
                Echo.Render._loadPeer(c, l[f].parent)
            }
        }
        for (f = l.length - 1; f >= 0; --f) {
            if (l[f] == null) {
                continue
            }
            h = l[f].parent.peer;
            Echo.Render._processDispose(l[f])
        }
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("rem")
        }
        for (f = 0; f < l.length; ++f) {
            if (l[f] == null) {
                continue
            }
            h = l[f].parent.peer;
            var m = h.renderUpdate(l[f]);
            if (m) {
                for (e = f + 1; e < l.length; ++e) {
                    if (l[e] != null && l[f].parent.isAncestorOf(l[e].parent)) {
                        l[e] = null
                    }
                }
            }
            Echo.Render._setPeerDisposedState(l[f].parent, false)
        }
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("up")
        }
        var d = [];
        for (f = 0; f < l.length; ++f) {
            if (l[f] == null) {
                continue
            }
            var b = false;
            for (e = 0; e < d.length; ++e) {
                if (d[e].isAncestorOf(l[f].parent)) {
                    b = true;
                    break
                }
            }
            if (b) {
                continue
            }
            if (l[f].renderContext.displayRequired) {
                for (e = 0; e < l[f].renderContext.displayRequired.length; ++e) {
                    d.push(l[f].renderContext.displayRequired[e]);
                    Echo.Render._doRenderDisplay(l[f].renderContext.displayRequired[e], true)
                }
            } else {
                d.push(l[f].parent);
                Echo.Render._doRenderDisplay(l[f].parent, true)
            }
        }
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("disp")
        }
        for (var a in Echo.Render._disposedComponents) {
            var k = Echo.Render._disposedComponents[a];
            Echo.Render._unloadPeer(k)
        }
        Echo.Render._disposedComponents = null;
        g.purge();
        Echo.Render.updateFocus(c)
    },
    registerPeer: function(a, b) {
        if (this._peers[a]) {
            throw new Error("Peer already registered: " + a)
        }
        this._peers[a] = b
    },
    renderComponentAdd: function(c, b, a) {
        if (!b.parent || !b.parent.peer || !b.parent.peer.client) {
            throw new Error("Cannot find reference to the Client with which this component should be associated: cannot load peer.  This is due to the component's parent's peer not being associated with a Client. Component = " + b + ", Parent = " + b.parent + ", Parent Peer = " + (b.parent ? b.parent.peer : "N/A") + ", Parent Peer Client = " + ((b.parent && b.parent.peer) ? b.parent.peer.client : "N/A"))
        }
        Echo.Render._loadPeer(b.parent.peer.client, b);
        Echo.Render._setPeerDisposedState(b, false);
        b.peer.renderAdd(c, a)
    },
    renderComponentDisplay: function(a) {
        this._doRenderDisplay(a, true)
    },
    renderComponentDispose: function(b, a) {
        this._renderComponentDisposeImpl(b, a)
    },
    _renderComponentDisposeImpl: function(c, a) {
        if (!a.peer || a.peer.disposed) {
            return
        }
        Echo.Render._setPeerDisposedState(a, true);
        a.peer.renderDispose(c);
        for (var b = 0; b < a.children.length; ++b) {
            Echo.Render._renderComponentDisposeImpl(c, a.children[b])
        }
    },
    renderComponentHide: function(a) {
        if (!a.peer || a.peer.disposed) {
            return
        }
        if (a.peer.displayed) {
            if (a.peer.renderHide) {
                a.peer.renderHide()
            }
            a.peer.displayed = false;
            for (var b = 0; b < a.children.length; ++b) {
                Echo.Render.renderComponentHide(a.children[b])
            }
        }
    },
    _setPeerDisposedState: function(a, b) {
        if (b) {
            a.peer.disposed = true;
            Echo.Render._disposedComponents[a.peer._peerId] = a
        } else {
            a.peer.disposed = false;
            delete Echo.Render._disposedComponents[a.peer._peerId]
        }
    },
    _unloadPeer: function(a) {
        a.peer.client = null;
        a.peer.component = null;
        a.peer = null;
        --this._loadedPeerCount
    },
    updateFocus: function(a) {
        var b = a.application.getFocusedComponent();
        if (b && b.peer) {
            if (!b.peer.renderFocus) {
                throw new Error("Cannot focus component: " + b + ", peer does not provide renderFocus() implementation.")
            }
            b.peer.renderFocus()
        } else {
            Core.Web.DOM.focusElement(null)
        }
    }
};
Echo.Render.ComponentSync = Core.extend({
    $static: {
        FOCUS_PERMIT_ARROW_UP: 1,
        FOCUS_PERMIT_ARROW_DOWN: 2,
        FOCUS_PERMIT_ARROW_LEFT: 4,
        FOCUS_PERMIT_ARROW_RIGHT: 8,
        FOCUS_PERMIT_ARROW_ALL: 15,
        SIZE_HEIGHT: 1,
        SIZE_WIDTH: 2
    },
    _peerId: null,
    client: null,
    component: null,
    displayed: false,
    disposed: false,
    $construct: function() {},
    $abstract: {
        renderAdd: function(b, a) {},
        renderDispose: function(a) {},
        renderUpdate: function(a) {}
    },
    $virtual: {
        clientKeyDown: null,
        clientKeyPress: null,
        clientKeyUp: null,
        getFocusFlags: null,
        getPreferredSize: null,
        isChildVisible: null,
        renderFocus: null,
        renderHide: null,
        renderDisplay: null
    }
});
Echo.Render.RootSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function() {
        Echo.Render.registerPeer("Root", this)
    },
    renderAdd: function(b, a) {
        throw new Error("Unsupported operation: renderAdd().")
    },
    _renderContent: function(b) {
        Echo.Render.renderComponentDispose(b, b.parent);
        Core.Web.DOM.removeAllChildren(this.client.domainElement);
        for (var a = 0; a < b.parent.children.length; ++a) {
            Echo.Render.renderComponentAdd(b, b.parent.children[a], this.client.domainElement)
        }
    },
    renderDispose: function(a) {},
    renderUpdate: function(d) {
        var b, a = false;
        if (d.fullRefresh || d.hasAddedChildren() || d.hasRemovedChildren()) {
            Echo.Sync.renderComponentDefaults(this.component, this.client.domainElement);
            var c = this.component.render("title");
            if (c) {
                document.title = c
            }
            this._renderContent(d);
            a = true
        } else {
            this.client.domainElement.dir = this.client.application.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl";
            if (d.hasUpdatedProperties()) {
                b = d.getUpdatedProperty("title");
                if (b) {
                    document.title = b.newValue
                }
                b = d.getUpdatedProperty("background");
                if (b) {
                    Echo.Sync.Color.renderClear(b.newValue, this.client.domainElement, "backgroundColor")
                }
                b = d.getUpdatedProperty("foreground");
                if (b) {
                    Echo.Sync.Color.renderClear(b.newValue, this.client.domainElement, "foreground")
                }
                b = d.getUpdatedProperty("font");
                if (b) {
                    Echo.Sync.Font.renderClear(b.newValue, this.client.domainElement)
                }
                Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this.client.domainElement)
            }
        }
        return a
    }
});
Echo.Sync = {
    getEffectProperty: function(b, g, f, c, a, e) {
        var d;
        if (c) {
            d = b.render(f, e)
        }
        if (!d) {
            d = b.render(g, a)
        }
        return d
    },
    renderComponentDefaults: function(c, d) {
        var b;
        if ((b = c.render("foreground"))) {
            d.style.color = b
        }
        if ((b = c.render("background"))) {
            d.style.backgroundColor = b
        }
        var a = c.render("font");
        if (a) {
            Echo.Sync.Font.render(a, d)
        }
        if (c.getLayoutDirection()) {
            d.dir = c.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl"
        }
    }
};
Echo.Sync.Alignment = {
    _HORIZONTALS: {
        left: true,
        center: true,
        right: true,
        leading: true,
        trailing: true
    },
    _VERTICALS: {
        top: true,
        middle: true,
        bottom: true
    },
    getRenderedHorizontal: function(d, b) {
        if (d == null) {
            return null
        }
        var c = b ? b.getRenderLayoutDirection() : Echo.LayoutDirection.LTR;
        var a = typeof(d) == "object" ? d.horizontal : d;
        switch (a) {
            case "leading":
                return c.isLeftToRight() ? "left" : "right";
            case "trailing":
                return c.isLeftToRight() ? "right" : "left";
            default:
                return a in this._HORIZONTALS ? a : null
        }
    },
    getHorizontal: function(a) {
        if (a == null) {
            return null
        }
        if (typeof(a == "string")) {
            return a in this._HORIZONTALS ? a : null
        } else {
            return a.horizontal
        }
    },
    getVertical: function(a) {
        if (a == null) {
            return null
        }
        if (typeof(a == "string")) {
            return a in this._VERTICALS ? a : null
        } else {
            return a.vertical
        }
    },
    render: function(h, e, d, g) {
        if (h == null) {
            return
        }
        var b = Echo.Sync.Alignment.getRenderedHorizontal(h, g);
        var c = typeof(h) == "object" ? h.vertical : h;
        var a;
        switch (b) {
            case "left":
                a = "left";
                break;
            case "center":
                a = "center";
                break;
            case "right":
                a = "right";
                break;
            default:
                a = "";
                break
        }
        var f;
        switch (c) {
            case "top":
                f = "top";
                break;
            case "middle":
                f = "middle";
                break;
            case "bottom":
                f = "bottom";
                break;
            default:
                f = "";
                break
        }
        if (d) {
            e.align = a;
            e.vAlign = f
        } else {
            e.style.textAlign = a;
            e.style.verticalAlign = f
        }
    }
};
Echo.Sync.Border = {
    _PARSER_PX: new RegExp("^(-?\\d+px)?(?:^|$|(?= )) ?(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)?(?:^|$|(?= )) ?(#[0-9a-fA-F]{6})?$"),
    _PARSER: new RegExp("^(-?\\d+(?:\\.\\d*)?(?:px|pt|pc|cm|mm|in|em|ex))?(?:^|$|(?= )) ?(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)?(?:^|$|(?= )) ?(#[0-9a-fA-F]{6})?$"),
    _TEST_EXTENT_PX: /^-?\d+px$/,
    compose: function(c, d, a) {
        if (typeof c == "number") {
            c += "px"
        }
        var b = [];
        if (c) {
            b.push(c)
        }
        if (d) {
            b.push(d)
        }
        if (a) {
            b.push(a)
        }
        return b.join(" ")
    },
    isMultisided: function(a) {
        return (a && (a.top || a.bottom || a.left || a.right)) ? true : false
    },
    parse: function(a) {
        if (!a) {
            return {}
        }
        if (typeof(a) == "string") {
            var b = this._PARSER.exec(a);
            return {
                size: b[1],
                style: b[2],
                color: b[3]
            }
        } else {
            return Echo.Sync.Border.parse(a.top || a.right || a.bottom || a.left)
        }
    },
    render: function(a, b, d) {
        if (!a) {
            return
        }
        d = d ? d : "border";
        if (typeof(a) == "string") {
            if (this._PARSER_PX.test(a)) {
                b.style[d] = a
            } else {
                var c = this._PARSER.exec(a);
                if (c == null) {
                    throw new Error('Invalid border: "' + a + '"')
                }
                this.render(Echo.Sync.Extent.toPixels(c[1]) + "px " + c[2] + " " + c[3], b, d)
            }
        } else {
            this.render(a.top, b, d + "Top");
            if (a.right !== null) {
                this.render(a.right || a.top, b, d + "Right")
            }
            if (a.bottom !== null) {
                this.render(a.bottom || a.top, b, d + "Bottom")
            }
            if (a.left !== null) {
                this.render(a.left || a.right || a.top, b, d + "Left")
            }
        }
    },
    renderClear: function(a, b) {
        if (a) {
            if (a instanceof Object) {
                b.style.border = ""
            }
            this.render(a, b)
        } else {
            b.style.border = ""
        }
    },
    getPixelSize: function(b, a) {
        if (!b) {
            return 0
        }
        if (typeof(b) == "string") {
            var d = this._PARSER.exec(b)[1];
            if (d == null) {
                return 0
            } else {
                if (this._TEST_EXTENT_PX.test(d)) {
                    return parseInt(d, 10)
                } else {
                    return Echo.Sync.Extent.toPixels(d)
                }
            }
        } else {
            if (typeof(b) == "object") {
                while (true) {
                    var c = this.getPixelSize(b[a]);
                    if (c == null) {
                        switch (a) {
                            case "left":
                                a = "right";
                                continue;
                            case "right":
                            case "bottom":
                                a = "top";
                                continue
                        }
                    }
                    return c
                }
            }
        }
    }
};
Echo.Sync.Color = {
    adjust: function(h, e, d, c) {
        var j = parseInt(h.substring(1), 16);
        var i = Math.floor(j / 65536) + e;
        var f = Math.floor(j / 256) % 256 + d;
        var a = j % 256 + c;
        return this.toHex(i, f, a)
    },
    blend: function(c, b, d) {
        d = d < 0 ? 0 : (d > 1 ? 1 : d);
        var g = parseInt(c.substring(1), 16);
        var e = parseInt(b.substring(1), 16);
        var h = Math.round(Math.floor(g / 65536) * (1 - d) + Math.floor(e / 65536) * d);
        var f = Math.round(Math.floor(g / 256) % 256 * (1 - d) + Math.floor(e / 256) % 256 * d);
        var a = Math.round((g % 256) * (1 - d) + (e % 256) * d);
        return this.toHex(h, f, a)
    },
    render: function(a, b, c) {
        if (a) {
            b.style[c] = a
        }
    },
    renderClear: function(a, b, c) {
        b.style[c] = a ? a : ""
    },
    renderFB: function(b, c) {
        var a;
        if ((a = b.render("foreground"))) {
            c.style.color = a
        }
        if ((a = b.render("background"))) {
            c.style.backgroundColor = a
        }
    },
    toHex: function(c, b, a) {
        if (c < 0) {
            c = 0
        } else {
            if (c > 255) {
                c = 255
            }
        }
        if (b < 0) {
            b = 0
        } else {
            if (b > 255) {
                b = 255
            }
        }
        if (a < 0) {
            a = 0
        } else {
            if (a > 255) {
                a = 255
            }
        }
        return "#" + (c < 16 ? "0" : "") + c.toString(16) + (b < 16 ? "0" : "") + b.toString(16) + (a < 16 ? "0" : "") + a.toString(16)
    }
};
Echo.Sync.Extent = {
    _PARSER: /^(-?\d+(?:\.\d+)?)(.+)?$/,
    _FORMATTED_INT_PIXEL_TEST: /^(-?\d+px *)$/,
    _FORMATTED_DECIMAL_PIXEL_TEST: /^(-?\d+(.\d+)?px *)$/,
    isPercent: function(a) {
        if (a == null || typeof(a) == "number") {
            return false
        } else {
            var b = this._PARSER.exec(a);
            if (!b) {
                return false
            }
            return b[2] == "%"
        }
    },
    render: function(e, c, f, b, d) {
        var a = Echo.Sync.Extent.toCssValue(e, b, d);
        if (a !== "") {
            c.style[f] = a
        }
    },
    toCssValue: function(c, a, b) {
        switch (typeof(c)) {
            case "number":
                return Math.round(c) + "px";
            case "string":
                if (this._FORMATTED_INT_PIXEL_TEST.test(c)) {
                    return c
                } else {
                    if (this._FORMATTED_DECIMAL_PIXEL_TEST.test(c)) {
                        return Math.round(parseFloat(c)) + "px"
                    } else {
                        if (this.isPercent(c)) {
                            return b ? c : ""
                        } else {
                            var d = this.toPixels(c, a);
                            return d == null ? "" : this.toPixels(c, a) + "px"
                        }
                    }
                }
                break
        }
        return ""
    },
    toPixels: function(b, a) {
        if (b == null) {
            return 0
        } else {
            if (typeof(b) == "number") {
                return Math.round(b)
            } else {
                return Math.round(Core.Web.Measure.extentToPixels(b, a))
            }
        }
    }
};
Echo.Sync.FillImage = {
    _REPEAT_VALUES: {
        "0": "no-repeat",
        x: "repeat-x",
        y: "repeat-y",
        xy: "repeat",
        "no-repeat": "no-repeat",
        "repeat-x": "repeat-x",
        "repeat-y": "repeat-y",
        repeat: "repeat"
    },
    FLAG_ENABLE_IE_PNG_ALPHA_FILTER: 1,
    getPosition: function(b) {
        if (b.x || b.y) {
            var a, c;
            if (Echo.Sync.Extent.isPercent(b.x)) {
                a = b.x
            } else {
                a = Echo.Sync.Extent.toPixels(b.x, true) + "px"
            }
            if (Echo.Sync.Extent.isPercent(b.y)) {
                c = b.y
            } else {
                c = Echo.Sync.Extent.toPixels(b.y, false) + "px"
            }
            return a + " " + c
        } else {
            return null
        }
    },
    getRepeat: function(a) {
        if (this._REPEAT_VALUES[a.repeat]) {
            return this._REPEAT_VALUES[a.repeat]
        } else {
            return null
        }
    },
    getUrl: function(a) {
        if (a == null) {
            return null
        }
        return typeof(a) == "object" ? a.url : a
    },
    render: function(f, e, c) {
        if (f == null) {
            return
        }
        var b = typeof(f) == "object";
        var d = b ? f.url : f;
        if (Core.Web.Env.QUIRK_IE_SECURE_ITEMS && document.location.protocol == "https:") {
            if (d.substring(0, 5) != "http:" && d.substring(0, 6) != "https:") {
                d = document.location.protocol + "//" + document.location.hostname + (document.location.port ? (":" + document.location.port) : "") + d
            }
        }
        if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED && c && (c & this.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
            e.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d + "', sizingMethod='scale')"
        } else {
            e.style.backgroundImage = "url(" + d + ")"
        }
        if (b) {
            var a = Echo.Sync.FillImage.getPosition(f);
            e.style.backgroundPosition = a ? a : "";
            e.style.backgroundRepeat = this._REPEAT_VALUES[f.repeat] ? this._REPEAT_VALUES[f.repeat] : ""
        }
    },
    renderClear: function(c, b, a) {
        if (c) {
            this.render(c, b, a)
        } else {
            if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
                b.style.filter = ""
            }
            b.style.backgroundImage = "";
            b.style.backgroundPosition = "";
            b.style.backgroundRepeat = ""
        }
    }
};
Echo.Sync.FillImageBorder = {
    _NAMES: ["top", "topRight", "right", "bottomRight", "bottom", "bottomLeft", "left", "topLeft"],
    _MAP: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    _PROTOTYPES: [],
    _createSegment: function(b, a) {
        var c = document.createElement("div");
        c.style.cssText = "font-size:1px;line-height:0;position:absolute;" + a;
        b.appendChild(c)
    },
    _createPrototype: function(a) {
        var b = document.createElement("div");
        if (Core.Web.Env.QUIRK_IE_HAS_LAYOUT) {
            b.style.zoom = 1
        }
        if (a & 1) {
            this._createSegment(b, "top:0;");
            if (a & 2) {
                this._createSegment(b, "top:0;right:0;")
            }
        }
        if (a & 2) {
            this._createSegment(b, "right:0;");
            if (a & 4) {
                this._createSegment(b, "bottom:0;right:0;")
            }
        }
        if (a & 4) {
            this._createSegment(b, "bottom:0;");
            if (a & 8) {
                this._createSegment(b, "bottom:0;left:0;")
            }
        }
        if (a & 8) {
            this._createSegment(b, "left:0;");
            if (a & 1) {
                this._createSegment(b, "top:0;left:0;")
            }
        }
        return b
    },
    getBorder: function(c) {
        var a = [];
        var b = c.firstChild;
        while (b) {
            if (b.__FIB_segment != null) {
                a[b.__FIB_segment] = b
            }
            b = b.nextSibling
        }
        return a
    },
    getContainerContent: function(b) {
        if (!b.__FIB_hasContent) {
            return null
        }
        var a = b.firstChild;
        while (a) {
            if (a.__FIB_content) {
                return a
            }
            a = a.nextSibling
        }
        return null
    },
    renderContainer: function(a, e) {
        a = a || {};
        e = e || {};
        var j = Echo.Sync.Insets.toPixels(a.borderInsets);
        var p = (j.left && 8) | (j.bottom && 4) | (j.right && 2) | (j.top && 1);
        var c = this._MAP[p];
        var h = this._PROTOTYPES[p] ? this._PROTOTYPES[p] : this._PROTOTYPES[p] = this._createPrototype(p);
        var b, d, l, o, k, n = null,
            g = [],
            m = null,
            r, f;
        if (e.update) {
            b = e.update;
            d = b.firstChild;
            while (d) {
                r = d;
                d = d.nextSibling;
                if (r.__FIB_segment != null) {
                    m = d;
                    b.removeChild(r)
                }
                if (r.__FIB_content) {
                    n = r
                }
            }
            d = h.firstChild;
            while (d) {
                l = d.cloneNode(true);
                if (!o) {
                    o = l
                }
                if (m) {
                    b.insertBefore(l, m)
                } else {
                    b.appendChild(l)
                }
                d = d.nextSibling
            }
        } else {
            b = h.cloneNode(true);
            o = b.firstChild;
            if (e.content || e.child) {
                n = document.createElement("div");
                n.__FIB_content = true;
                if (e.child) {
                    n.appendChild(e.child)
                }
                b.__FIB_hasContent = true;
                b.appendChild(n)
            }
            if (e.absolute) {
                b.__FIB_absolute = true;
                b.style.position = "absolute"
            } else {
                b.style.position = "relative";
                if (n) {
                    n.style.position = "relative";
                    if (Core.Web.Env.QUIRK_IE_HAS_LAYOUT) {
                        n.style.zoom = 1
                    }
                }
            }
        }
        b.__key = p;
        d = o;
        for (k = 0; k < 8; ++k) {
            if (!c[k]) {
                continue
            }
            d.__FIB_segment = k;
            g[k] = d;
            if (a.color) {
                d.style.backgroundColor = a.color
            }
            if (k === 0 || k === 1 || k === 7) {
                d.style.height = j.top + "px"
            } else {
                if (k >= 3 && k <= 5) {
                    d.style.height = j.bottom + "px"
                }
            }
            if (k >= 1 && k <= 3) {
                d.style.width = j.right + "px"
            } else {
                if (k >= 5) {
                    d.style.width = j.left + "px"
                }
            }
            Echo.Sync.FillImage.render(a[this._NAMES[k]], d, Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER);
            d = d.nextSibling
        }
        if (j.top) {
            g[0].style.left = j.left + "px";
            g[0].style.right = j.right + "px"
        }
        if (j.right) {
            g[2].style.top = j.top + "px";
            g[2].style.bottom = j.bottom + "px"
        }
        if (j.bottom) {
            g[4].style.left = j.left + "px";
            g[4].style.right = j.right + "px"
        }
        if (j.left) {
            g[6].style.top = j.top + "px";
            g[6].style.bottom = j.bottom + "px"
        }
        if (b.__FIB_absolute) {
            if (n) {
                var q = Echo.Sync.Insets.toPixels(a.contentInsets);
                n.style.position = "absolute";
                n.style.overflow = "auto";
                n.style.top = q.top + "px";
                n.style.right = q.right + "px";
                n.style.bottom = q.bottom + "px";
                n.style.left = q.left + "px"
            }
        } else {
            if (n) {
                Echo.Sync.Insets.render(a.contentInsets, n, "padding")
            }
            if (!e.update) {
                b.style.position = "relative";
                if (n) {
                    n.style.position = "relative"
                }
            }
        }
        return b
    },
    renderContainerDisplay: function(d) {
        var c;
        if (Core.Web.VirtualPosition.enabled) {
            if (d.__FIB_absolute) {
                Core.Web.VirtualPosition.redraw(d);
                if ((c = this.getContainerContent(d))) {
                    Core.Web.VirtualPosition.redraw(c)
                }
            }
            var a = this.getBorder(d);
            for (var b = 0; b < 8; b += 2) {
                if (a[b]) {
                    Core.Web.VirtualPosition.redraw(a[b])
                }
            }
        }
    }
};
Echo.Sync.Font = {
    render: function(a, b) {
        if (!a) {
            return
        }
        if (a.typeface) {
            if (a.typeface instanceof Array) {
                b.style.fontFamily = a.typeface.join(",")
            } else {
                b.style.fontFamily = a.typeface
            }
        }
        if (a.size) {
            b.style.fontSize = Echo.Sync.Extent.toCssValue(a.size)
        }
        if (a.bold) {
            b.style.fontWeight = "bold"
        }
        if (a.italic) {
            b.style.fontStyle = "italic"
        }
        if (a.underline) {
            b.style.textDecoration = "underline"
        } else {
            if (a.overline) {
                b.style.textDecoration = "overline"
            } else {
                if (a.lineThrough) {
                    b.style.textDecoration = "line-through"
                }
            }
        }
    },
    renderClear: function(a, b) {
        if (a) {
            this.render(a, b);
            if (!a.typeface) {
                b.style.fontFamily = ""
            }
            if (!a.underline) {
                b.style.textDecoration = ""
            }
            if (!a.bold) {
                b.style.fontWeight = ""
            }
            if (!a.size) {
                b.style.fontSize = ""
            }
            if (!a.italic) {
                b.style.fontStyle = ""
            }
        } else {
            b.style.fontFamily = "";
            b.style.fontSize = "";
            b.style.fontWeight = "";
            b.style.fontStyle = "";
            b.style.textDecoration = ""
        }
    }
};
Echo.Sync.ImageReference = {
    getUrl: function(a) {
        return a ? (typeof(a) == "string" ? a : a.url) : null
    },
    renderImg: function(a, b) {
        if (!a) {
            return
        }
        if (typeof(a) == "string") {
            b.src = a
        } else {
            b.src = a.url;
            if (a.width) {
                b.style.width = Echo.Sync.Extent.toCssValue(a.width, true)
            }
            if (a.height) {
                b.style.height = Echo.Sync.Extent.toCssValue(a.height, false)
            }
        }
    }
};
Echo.Sync.Insets = {
    _FORMATTED_PIXEL_INSETS: /^(-?\d+px *){1,4}$/,
    _ZERO: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    _INDEX_MAPS: {
        1: [0, 0, 0, 0],
        2: [0, 1, 0, 1],
        3: [0, 1, 2, 1],
        4: [0, 1, 2, 3]
    },
    render: function(a, b, d) {
        switch (typeof(a)) {
            case "number":
                b.style[d] = Math.round(a) + "px";
                break;
            case "string":
                if (this._FORMATTED_PIXEL_INSETS.test(a)) {
                    b.style[d] = a
                } else {
                    var c = this.toPixels(a);
                    b.style[d] = c.top + "px " + c.right + "px " + c.bottom + "px " + c.left + "px"
                }
                break
        }
    },
    renderPosition: function(a, b) {
        var c = this.toPixels(a);
        b.style.top = c.top + "px";
        b.style.right = c.right + "px";
        b.style.bottom = c.bottom + "px";
        b.style.left = c.left + "px"
    },
    toCssValue: function(a) {
        switch (typeof(a)) {
            case "number":
                return a + "px";
            case "string":
                if (this._FORMATTED_PIXEL_INSETS.test(a)) {
                    return a
                } else {
                    var b = this.toPixels(a);
                    return b.top + "px " + b.right + "px " + b.bottom + "px " + b.left + "px"
                }
                break
        }
        return ""
    },
    toPixels: function(a) {
        if (a == null) {
            return this._ZERO
        } else {
            if (typeof(a) == "number") {
                a = Math.round(a);
                return {
                    top: a,
                    right: a,
                    bottom: a,
                    left: a
                }
            }
        }
        a = a.split(" ");
        var b = this._INDEX_MAPS[a.length];
        return {
            top: Echo.Sync.Extent.toPixels(a[b[0]], false),
            right: Echo.Sync.Extent.toPixels(a[b[1]], true),
            bottom: Echo.Sync.Extent.toPixels(a[b[2]], false),
            left: Echo.Sync.Extent.toPixels(a[b[3]], true)
        }
    }
};
Echo.Sync.LayoutDirection = {
    render: function(b, a) {
        if (b) {
            a.dir = b.isLeftToRight() ? "ltr" : "rtl"
        }
    }
};
Echo.Sync.TriCellTable = Core.extend({
    $static: {
        INVERTED: 1,
        VERTICAL: 2,
        LEADING_TRAILING: 0,
        TRAILING_LEADING: 1,
        TOP_BOTTOM: 2,
        BOTTOM_TOP: 3,
        _createTablePrototype: function() {
            var b = document.createElement("table");
            b.style.borderCollapse = "collapse";
            b.style.padding = "0";
            var a = document.createElement("tbody");
            b.appendChild(a);
            return b
        },
        getInvertedOrientation: function(c, b, a) {
            return this.getOrientation(c, b, a) ^ this.INVERTED
        },
        getOrientation: function(e, d, b) {
            var a = e.render(d, b);
            var c;
            if (a) {
                switch (Echo.Sync.Alignment.getRenderedHorizontal(a, e)) {
                    case "left":
                        return this.LEADING_TRAILING;
                    case "right":
                        return this.TRAILING_LEADING
                }
                switch (Echo.Sync.Alignment.getVertical(a, e)) {
                    case "top":
                        return this.TOP_BOTTOM;
                    case "bottom":
                        return this.BOTTOM_TOP
                }
            }
            return e.getRenderLayoutDirection().isLeftToRight() ? this.TRAILING_LEADING : this.LEADING_TRAILING
        }
    },
    $load: function() {
        this._tablePrototype = this._createTablePrototype()
    },
    tableElement: null,
    tbodyElement: null,
    $construct: function(c, b, a, d) {
        this.tableElement = Echo.Sync.TriCellTable._tablePrototype.cloneNode(true);
        this.tbodyElement = this.tableElement.firstChild;
        if (a == null) {
            this._configure2(c, b)
        } else {
            this._configure3(c, b, a, d)
        }
    },
    _addColumn: function(a, b) {
        if (b != null) {
            a.appendChild(b)
        }
    },
    _addRow: function(b) {
        if (b == null) {
            return
        }
        var a = document.createElement("tr");
        a.appendChild(b);
        this.tbodyElement.appendChild(a)
    },
    _addSpacer: function(b, d, c) {
        var a = document.createElement("div");
        if (c) {
            a.style.cssText = "width:1px;height:" + d + "px;font-size:1px;line-height:0;"
        } else {
            a.style.cssText = "width:" + d + "px;height:1px;font-size:1px;line-height:0;"
        }
        b.appendChild(a)
    },
    _configure2: function(c, a) {
        this.tdElements = [document.createElement("td"), document.createElement("td")];
        this.tdElements[0].style.padding = "0";
        this.tdElements[1].style.padding = "0";
        this.marginTdElements = [];
        if (a) {
            this.marginTdElements[0] = document.createElement("td");
            this.marginTdElements[0].style.padding = "0";
            if ((c & Echo.Sync.TriCellTable.VERTICAL) === 0) {
                this.marginTdElements[0].style.width = a + "px";
                this._addSpacer(this.marginTdElements[0], a, false)
            } else {
                this.marginTdElements[0].style.height = a + "px";
                this._addSpacer(this.marginTdElements[0], a, true)
            }
        }
        if (c & Echo.Sync.TriCellTable.VERTICAL) {
            if (c & Echo.Sync.TriCellTable.INVERTED) {
                this._addRow(this.tdElements[1]);
                this._addRow(this.marginTdElements[0]);
                this._addRow(this.tdElements[0])
            } else {
                this._addRow(this.tdElements[0]);
                this._addRow(this.marginTdElements[0]);
                this._addRow(this.tdElements[1])
            }
        } else {
            var b = document.createElement("tr");
            if (c & Echo.Sync.TriCellTable.INVERTED) {
                this._addColumn(b, this.tdElements[1]);
                this._addColumn(b, this.marginTdElements[0]);
                this._addColumn(b, this.tdElements[0])
            } else {
                this._addColumn(b, this.tdElements[0]);
                this._addColumn(b, this.marginTdElements[0]);
                this._addColumn(b, this.tdElements[1])
            }
            this.tbodyElement.appendChild(b)
        }
    },
    _configure3: function(g, d, c, h) {
        this.tdElements = [];
        for (var b = 0; b < 3; ++b) {
            this.tdElements[b] = document.createElement("td");
            this.tdElements[b].style.padding = "0"
        }
        this.marginTdElements = [];
        if (d || h != null) {
            if (d && d > 0) {
                this.marginTdElements[0] = document.createElement("td");
                if (g & Echo.Sync.TriCellTable.VERTICAL) {
                    this.marginTdElements[0].style.height = d + "px";
                    this._addSpacer(this.marginTdElements[0], d, true)
                } else {
                    this.marginTdElements[0].style.width = d + "px";
                    this._addSpacer(this.marginTdElements[0], d, false)
                }
            }
            if (h != null && h > 0) {
                this.marginTdElements[1] = document.createElement("td");
                if (g & Echo.Sync.TriCellTable.VERTICAL) {
                    this.marginTdElements[1].style.height = h + "px";
                    this._addSpacer(this.marginTdElements[1], h, true)
                } else {
                    this.marginTdElements[1].style.width = h + "px";
                    this._addSpacer(this.marginTdElements[1], h, false)
                }
            }
        }
        if (g & Echo.Sync.TriCellTable.VERTICAL) {
            if (c & Echo.Sync.TriCellTable.VERTICAL) {
                if (c & Echo.Sync.TriCellTable.INVERTED) {
                    this._addRow(this.tdElements[2]);
                    this._addRow(this.marginTdElements[1])
                }
                if (g & Echo.Sync.TriCellTable.INVERTED) {
                    this._addRow(this.tdElements[1]);
                    this._addRow(this.marginTdElements[0]);
                    this._addRow(this.tdElements[0])
                } else {
                    this._addRow(this.tdElements[0]);
                    this._addRow(this.marginTdElements[0]);
                    this._addRow(this.tdElements[1])
                }
                if (!(c & Echo.Sync.TriCellTable.INVERTED)) {
                    this._addRow(this.marginTdElements[1]);
                    this._addRow(this.tdElements[2])
                }
            } else {
                var f = (d && d > 0) ? 3 : 2;
                this.tdElements[2].rowSpan = f;
                if (this.marginTdElements[1]) {
                    this.marginTdElements[1].rowSpan = f
                }
                var e = document.createElement("tr");
                if (c & Echo.Sync.TriCellTable.INVERTED) {
                    this._addColumn(e, this.tdElements[2]);
                    this._addColumn(e, this.marginTdElements[1]);
                    if (g & Echo.Sync.TriCellTable.INVERTED) {
                        this._addColumn(e, this.tdElements[1])
                    } else {
                        this._addColumn(e, this.tdElements[0])
                    }
                } else {
                    if (g & Echo.Sync.TriCellTable.INVERTED) {
                        this._addColumn(e, this.tdElements[1])
                    } else {
                        this._addColumn(e, this.tdElements[0])
                    }
                    this._addColumn(e, this.marginTdElements[1]);
                    this._addColumn(e, this.tdElements[2])
                }
                this.tbodyElement.appendChild(e);
                this._addRow(this.marginTdElements[0]);
                if (g & Echo.Sync.TriCellTable.INVERTED) {
                    this._addRow(this.tdElements[0])
                } else {
                    this._addRow(this.tdElements[1])
                }
            }
        } else {
            if (c & Echo.Sync.TriCellTable.VERTICAL) {
                var a = d ? 3 : 2;
                this.tdElements[2].setAttribute("colspan", a);
                if (this.marginTdElements[1] != null) {
                    this.marginTdElements[1].setAttribute("colspan", a)
                }
                if (c & Echo.Sync.TriCellTable.INVERTED) {
                    this._addRow(this.tdElements[2]);
                    this._addRow(this.marginTdElements[1])
                }
                e = document.createElement("tr");
                if ((g & Echo.Sync.TriCellTable.INVERTED) === 0) {
                    this._addColumn(e, this.tdElements[0]);
                    this._addColumn(e, this.marginTdElements[0]);
                    this._addColumn(e, this.tdElements[1])
                } else {
                    this._addColumn(e, this.tdElements[1]);
                    this._addColumn(e, this.marginTdElements[0]);
                    this._addColumn(e, this.tdElements[0])
                }
                this.tbodyElement.appendChild(e);
                if (!(c & Echo.Sync.TriCellTable.INVERTED)) {
                    this._addRow(this.marginTdElements[1]);
                    this._addRow(this.tdElements[2])
                }
            } else {
                e = document.createElement("tr");
                if (c & Echo.Sync.TriCellTable.INVERTED) {
                    this._addColumn(e, this.tdElements[2]);
                    this._addColumn(e, this.marginTdElements[1])
                }
                if (g & Echo.Sync.TriCellTable.INVERTED) {
                    this._addColumn(e, this.tdElements[1]);
                    this._addColumn(e, this.marginTdElements[0]);
                    this._addColumn(e, this.tdElements[0])
                } else {
                    this._addColumn(e, this.tdElements[0]);
                    this._addColumn(e, this.marginTdElements[0]);
                    this._addColumn(e, this.tdElements[1])
                }
                if (!(c & Echo.Sync.TriCellTable.INVERTED)) {
                    this._addColumn(e, this.marginTdElements[1]);
                    this._addColumn(e, this.tdElements[2])
                }
                this.tbodyElement.appendChild(e)
            }
        }
    }
});
Echo.Serial = {
    _translatorMap: {},
    _translatorTypeData: [],
    addPropertyTranslator: function(b, a) {
        this._translatorMap[b] = a
    },
    addPropertyTranslatorByType: function(b, a) {
        this._translatorTypeData.push(b, a)
    },
    getPropertyTranslator: function(a) {
        return this._translatorMap[a]
    },
    getPropertyTranslatorByType: function(b) {
        for (var a = 0; a < this._translatorTypeData.length; a += 2) {
            if (this._translatorTypeData[a] == b) {
                return this._translatorTypeData[a + 1]
            }
        }
        return null
    },
    loadComponent: function(d, c, g, h) {
        if (!c.nodeName == "c") {
            throw new Error("Element is not a component.")
        }
        var i = c.getAttribute("t");
        var b = c.getAttribute("i");
        var j = Echo.ComponentFactory.newInstance(i, b);
        var f = j.getLocalStyleData();
        var e = c.firstChild;
        while (e) {
            if (e.nodeType == 1) {
                switch (e.nodeName) {
                    case "c":
                        var a = this.loadComponent(d, e, g, h);
                        j.add(a);
                        break;
                    case "p":
                        this.loadProperty(d, e, j, f, g);
                        break;
                    case "s":
                        j.setStyleName(e.firstChild ? e.firstChild.nodeValue : null);
                        break;
                    case "sr":
                        j.setStyle(h ? h[e.firstChild.nodeValue] : null);
                        break;
                    case "e":
                        this._loadComponentEvent(d, e, j);
                        break;
                    case "en":
                        j.setEnabled(e.firstChild.nodeValue == "true");
                        break;
                    case "locale":
                        j.setLocale(e.firstChild ? e.firstChild.nodeValue : null);
                        break;
                    case "dir":
                        j.setLayoutDirection(e.firstChild ? (e.firstChild.nodeValue == "rtl" ? Echo.LayoutDirection.RTL : Echo.LayoutDirection.LTR) : null);
                        break;
                    case "f":
                        if (e.getAttribute("n")) {
                            j.focusNextId = e.getAttribute("n")
                        }
                        if (e.getAttribute("p")) {
                            j.focusPreviousId = e.getAttribute("p")
                        }
                }
            }
            e = e.nextSibling
        }
        return j
    },
    _loadComponentEvent: function(a, c, b) {
        if (a.addComponentListener) {
            var d = c.getAttribute("t");
            a.addComponentListener(b, d)
        }
    },
    loadProperty: function(d, k, e, h, i) {
        var a = k.getAttribute("n");
        var j = k.getAttribute("t");
        var g = k.getAttribute("x");
        var l;
        if (j) {
            var f = Echo.Serial._translatorMap[j];
            if (!f) {
                throw new Error("Translator not available for property type: " + j)
            }
            l = f.toProperty(d, k)
        } else {
            if (i) {
                var c = k.getAttribute("r");
                if (c) {
                    l = i[c]
                } else {
                    l = Echo.Serial.String.toProperty(d, k)
                }
            } else {
                l = Echo.Serial.String.toProperty(d, k)
            }
        }
        if (a) {
            if (h) {
                if (g == null) {
                    h[a] = l
                } else {
                    var m = h[a];
                    if (!m) {
                        m = [];
                        h[a] = m
                    }
                    m[g] = l
                }
            } else {
                if (g == null) {
                    e.set(a, l)
                } else {
                    e.setIndex(a, g, l)
                }
            }
        } else {
            var b = k.getAttribute("m");
            if (g == null) {
                e[b](l)
            } else {
                e[b](g, l)
            }
        }
    },
    loadStyleSheet: function(c, b, a) {
        var g = new Echo.StyleSheet();
        var f = b.firstChild;
        while (f) {
            if (f.nodeType == 1) {
                if (f.nodeName == "s") {
                    var e = {};
                    var d = f.firstChild;
                    while (d) {
                        if (d.nodeType == 1) {
                            if (d.nodeName == "p") {
                                this.loadProperty(c, d, null, e, a)
                            }
                        }
                        d = d.nextSibling
                    }
                    g.setStyle(f.getAttribute("n") || "", f.getAttribute("t"), e)
                }
            }
            f = f.nextSibling
        }
        return g
    },
    storeProperty: function(a, b, d) {
        if (d == null) {} else {
            if (typeof(d) == "object") {
                var c = null;
                if (d.className) {
                    c = this._translatorMap[d.className]
                } else {
                    c = this.getPropertyTranslatorByType(d.constructor)
                }
                if (!c || !c.toXml) {
                    return
                }
                c.toXml(a, b, d)
            } else {
                b.appendChild(b.ownerDocument.createTextNode(d.toString()))
            }
        }
    }
};
Echo.Serial.PropertyTranslator = Core.extend({
    $abstract: true,
    $static: {
        toProperty: function(a, b) {
            return null
        },
        toXml: null
    }
});
Echo.Serial.Null = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            return null
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("0", this)
    }
});
Echo.Serial.Boolean = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            return b.firstChild.data == "true"
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("b", this)
    }
});
Echo.Serial.Integer = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            return parseInt(b.firstChild.data, 10)
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("i", this)
    }
});
Echo.Serial.Number = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            return parseFloat(b.firstChild.data)
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("n", this)
    }
});
Echo.Serial.String = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            var d = b.firstChild;
            if (!d) {
                return ""
            }
            var c = d.data;
            while (d.nextSibling) {
                d = d.nextSibling;
                c += d.data
            }
            return c
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("s", this)
    }
});
Echo.Serial.Date = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        _expr: /(\d{4})\.(\d{2}).(\d{2})/,
        toProperty: function(b, c) {
            var d = Echo.Serial.String.toProperty(b, c);
            var a = this._expr.exec(d);
            if (!a) {
                return null
            }
            return new Date(a[1], parseInt(a[2], 10) - 1, a[3])
        },
        toXml: function(a, b, c) {
            b.appendChild(b.ownerDocument.createTextNode(c.getFullYear() + "." + (c.getMonth() + 1) + "." + c.getDate()))
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("d", this);
        Echo.Serial.addPropertyTranslatorByType(Date, this)
    }
});
Echo.Serial.Map = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            var d = {};
            var c = b.firstChild;
            while (c) {
                if (c.nodeType != 1) {
                    continue
                }
                Echo.Serial.loadProperty(a, c, null, d, null);
                c = c.nextSibling
            }
            return d
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("m", this)
    }
});
Echo.Serial.Alignment = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        _HORIZONTAL_MAP: {
            leading: "leading",
            trailing: "trailing",
            left: "left",
            center: "center",
            right: "right"
        },
        _VERTICAL_MAP: {
            top: "top",
            center: "middle",
            bottom: "bottom"
        },
        toProperty: function(a, c) {
            var d = Core.Web.DOM.getChildElementByTagName(c, "a");
            var e = this._HORIZONTAL_MAP[d.getAttribute("h")];
            var b = this._VERTICAL_MAP[d.getAttribute("v")];
            if (e) {
                if (b) {
                    return {
                        horizontal: e,
                        vertical: b
                    }
                }
                return e
            }
            if (b) {
                return b
            }
            return null
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("Alignment", this);
        Echo.Serial.addPropertyTranslator("AL", this)
    }
});
Echo.Serial.Border = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            if (b.firstChild.nodeType == 3) {
                return b.firstChild.data
            } else {
                if (b.getAttribute("v")) {
                    return b.getAttribute("v")
                } else {
                    var d = Core.Web.DOM.getChildElementByTagName(b, "b");
                    var c = {};
                    var e = d.getAttribute("t");
                    if (e) {
                        c.top = e;
                        e = d.getAttribute("r");
                        if (e) {
                            c.right = e;
                            e = d.getAttribute("b");
                            if (e) {
                                c.bottom = e;
                                e = d.getAttribute("l");
                                if (e) {
                                    c.left = e
                                }
                            }
                        }
                    } else {
                        throw new Error("Invalid multi-sided border: no sides set.")
                    }
                    return c
                }
            }
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("Border", this);
        Echo.Serial.addPropertyTranslator("BO", this)
    }
});
Echo.Serial.FillImage = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        parseElement: function(b, c) {
            var d = c.getAttribute("u");
            if (b.decompressUrl) {
                d = b.decompressUrl(d)
            }
            var e = c.getAttribute("r");
            var a = c.getAttribute("x");
            var f = c.getAttribute("y");
            if (e || a || f) {
                return {
                    url: d,
                    repeat: e,
                    x: a,
                    y: f
                }
            } else {
                return d
            }
        },
        toProperty: function(a, b) {
            var c = Core.Web.DOM.getChildElementByTagName(b, "fi");
            return this.parseElement(a, c)
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("FillImage", this);
        Echo.Serial.addPropertyTranslator("FI", this)
    }
});
Echo.Serial.FillImageBorder = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        _NAMES: ["topLeft", "top", "topRight", "left", "right", "bottomLeft", "bottom", "bottomRight"],
        _parseElement: function(a, e) {
            var d = {
                contentInsets: e.getAttribute("ci") ? e.getAttribute("ci") : null,
                borderInsets: e.getAttribute("bi") ? e.getAttribute("bi") : null,
                color: e.getAttribute("bc")
            };
            var c = e.firstChild;
            var b = 0;
            while (c) {
                if (c.nodeType == 1) {
                    if (c.nodeName == "fi") {
                        d[this._NAMES[b]] = Echo.Serial.FillImage.parseElement(a, c);
                        ++b
                    } else {
                        if (c.nodeName == "null-fi") {
                            ++b
                        }
                    }
                }
                c = c.nextSibling
            }
            if (!(b === 0 || b == 8)) {
                throw new Error("Invalid FillImageBorder image count: " + b)
            }
            return d
        },
        toProperty: function(a, b) {
            var c = Core.Web.DOM.getChildElementByTagName(b, "fib");
            return Echo.Serial.FillImageBorder._parseElement(a, c)
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("FillImageBorder", this);
        Echo.Serial.addPropertyTranslator("FIB", this)
    }
});
Echo.Serial.Font = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(b, d) {
            var g = Core.Web.DOM.getChildElementByTagName(d, "f");
            var a = Core.Web.DOM.getChildElementsByTagName(g, "tf");
            var c = {};
            if (a.length > 1) {
                c.typeface = [];
                for (var f = 0; f < a.length; ++f) {
                    c.typeface[f] = a[f].firstChild.data
                }
            } else {
                if (a.length == 1) {
                    c.typeface = a[0].firstChild.data
                }
            }
            var e = g.getAttribute("sz");
            if (e) {
                c.size = e
            }
            if (g.getAttribute("bo")) {
                c.bold = true
            }
            if (g.getAttribute("it")) {
                c.italic = true
            }
            if (g.getAttribute("un")) {
                c.underline = true
            }
            if (g.getAttribute("ov")) {
                c.overline = true
            }
            if (g.getAttribute("lt")) {
                c.lineThrough = true
            }
            return c
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("Font", this);
        Echo.Serial.addPropertyTranslator("F", this)
    }
});
Echo.Serial.ImageReference = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(b, c) {
            var d;
            if (c.firstChild.nodeType == 1) {
                var f = c.firstChild;
                d = f.firstChild.data;
                if (b.decompressUrl) {
                    d = b.decompressUrl(d)
                }
                var e = f.getAttribute("w");
                e = e ? e : null;
                var a = f.getAttribute("h");
                a = a ? a : null;
                if (e || a) {
                    return {
                        url: d,
                        width: e,
                        height: a
                    }
                } else {
                    return d
                }
            } else {
                d = c.firstChild.data;
                return b.decompressUrl ? b.decompressUrl(d) : d
            }
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("ImageReference", this);
        Echo.Serial.addPropertyTranslator("I", this)
    }
});
Echo.Serial.LayoutData = Core.extend(Echo.Serial.PropertyTranslator, {
    $static: {
        toProperty: function(a, b) {
            var d = {};
            var c = b.firstChild;
            while (c) {
                if (c.nodeType == 1) {
                    if (c.nodeName == "p") {
                        Echo.Serial.loadProperty(a, c, null, d)
                    }
                }
                c = c.nextSibling
            }
            return d
        }
    },
    $load: function() {
        Echo.Serial.addPropertyTranslator("LayoutData", this);
        Echo.Serial.addPropertyTranslator("L", this)
    }
});
Echo.Client = Core.extend({
    $static: {
        DEFAULT_CONFIGURATION: {
            "StopError.Message": "This application has been stopped due to an error.",
            "WaitIndicator.Text": "Please wait...",
            "Action.Continue": "Continue",
            "Action.Restart": "Restart Application"
        },
        STYLE_CRITICAL: 0,
        STYLE_MESSAGE: 1,
        _activeClients: [],
        _globalWindowResizeListener: function(b) {
            for (var a = 0; a < Echo.Client._activeClients.length; ++a) {
                Echo.Client._activeClients[a]._windowResizeListener(b)
            }
        },
        windowId: null
    },
    $load: function() {
        Core.Web.DOM.addEventListener(window, "resize", this._globalWindowResizeListener, false);
        var b = /EchoWindowId=([0-9a-f]*\.[0-9a-f]*);/i;
        var a = b.exec(window.name || "");
        this.windowId = a && a[1];
        if (!this.windowId) {
            this.windowId = new Date().getTime().toString(16) + "." + parseInt(Math.random() * 4294967296, 10).toString(16);
            window.name = (window.name || "") + ";EchoWindowId=" + this.windowId + ";"
        }
    },
    configuration: null,
    designMode: false,
    domainElement: null,
    application: null,
    _lastInputRestrictionId: 0,
    _inputRestrictionCount: 0,
    _inputRestrictionListeners: null,
    _inputRescriptionMap: null,
    _keyFocusedComponentId: null,
    _lastKeyCode: null,
    _processKeyRef: null,
    _waitIndicatorActive: false,
    _processApplicationFocusRef: null,
    parent: null,
    _waitIndicator: null,
    _preWaitIndicatorDelay: 500,
    _waitIndicatorRunnable: null,
    _failed: false,
    $construct: function() {
        this.configuration = {};
        for (var a in Echo.Client.DEFAULT_CONFIGURATION) {
            this.configuration[a] = Echo.Client.DEFAULT_CONFIGURATION[a]
        }
        this._inputRestrictionMap = {};
        this._processKeyRef = Core.method(this, this._processKey);
        this._processApplicationFocusRef = Core.method(this, this._processApplicationFocus);
        this._waitIndicator = new Echo.Client.DefaultWaitIndicator();
        this._waitIndicatorRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._waitIndicatorActivate), this._preWaitIndicatorDelay, false)
    },
    $abstract: true,
    $virtual: {
        getResourceUrl: function(a, b) {
            if (this.parent) {
                return this.parent.getResourceUrl(a, b)
            } else {
                return null
            }
        },
        verifyInput: function(a) {
            if (this._inputRestrictionCount !== 0) {
                return false
            }
            if (a) {
                return a.isActive()
            } else {
                return this.application.isActive()
            }
        },
        dispose: function() {
            this.configure(null, null);
            this._setWaitVisible(false)
        }
    },
    addElement: function(a) {
        Core.Web.Event.add(a, "keypress", this._processKeyRef, false);
        Core.Web.Event.add(a, "keydown", this._processKeyRef, false);
        Core.Web.Event.add(a, "keyup", this._processKeyRef, false)
    },
    configure: function(a, b) {
        if (this.application) {
            Core.Arrays.remove(Echo.Client._activeClients, this);
            this.removeElement(this.domainElement);
            this.application.removeListener("focus", this._processApplicationFocusRef);
            this.application.doDispose();
            this.application.client = null
        }
        this.application = a;
        this.domainElement = b;
        if (this.application) {
            this.application.client = this;
            this.application.doInit();
            this.application.addListener("focus", this._processApplicationFocusRef);
            this.addElement(this.domainElement);
            Echo.Client._activeClients.push(this)
        }
    },
    createInputRestriction: function() {
        this._setWaitVisible(true);
        var a = (++this._lastInputRestrictionId).toString();
        ++this._inputRestrictionCount;
        this._inputRestrictionMap[a] = true;
        return a
    },
    displayError: function(n, o, i, h, g, b) {
        n = n || document.body;
        var f = this.createInputRestriction();
        this._setWaitVisible(false);
        var k = document.createElement("div");
        k.style.cssText = "position:absolute;z-index:32766;width:100%;height:100%;background-color:#000000;opacity:0.75";
        if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            k.style.filter = "alpha(opacity=75)"
        }
        n.appendChild(k);
        var a = document.createElement("div");
        a.style.cssText = "position:absolute;z-index:32767;width:100%;height:100%;overflow:hidden;";
        n.appendChild(a);
        var e = document.createElement("div");
        e.style.cssText = "color:#ffffff;padding:20px 40px 0px;" + (b === Echo.Client.STYLE_MESSAGE ? "border-bottom:4px solid #1f1faf;background-color:#1f1f5f" : "border-bottom:4px solid #af1f1f;background-color:#5f1f1f");
        if (o) {
            var m = document.createElement("div");
            m.style.cssText = "font-weight: bold; margin-bottom:20px;";
            m.appendChild(document.createTextNode(o));
            e.appendChild(m)
        }
        if (i) {
            var l = document.createElement("div");
            l.style.cssText = "max-height:10em;overflow:auto;margin-bottom:20px;";
            l.appendChild(document.createTextNode(i));
            e.appendChild(l)
        }
        a.appendChild(e);
        if (h) {
            var d = document.createElement("div");
            d.tabIndex = "0";
            d.style.cssText = "margin-bottom:20px;cursor:pointer;font-weight:bold;padding:2px 10px;" + (b === Echo.Client.STYLE_MESSAGE ? "border: 1px outset #2f2faf;background-color:#2f2faf;" : "border: 1px outset #af2f2f;background-color:#af2f2f;");
            d.appendChild(document.createTextNode(h));
            e.appendChild(d);
            var c = Core.method(this, function(p) {
                if (p.type != "keypress" || p.keyCode == 13) {
                    try {
                        Core.Web.DOM.removeEventListener(d, "click", c, false);
                        Core.Web.DOM.removeEventListener(d, "keypress", c, false);
                        a.parentNode.removeChild(a);
                        k.parentNode.removeChild(k);
                        this.removeInputRestriction(f)
                    } finally {
                        if (g) {
                            g()
                        }
                    }
                }
            });
            Core.Web.DOM.addEventListener(d, "click", c, false);
            Core.Web.DOM.addEventListener(d, "keypress", c, false);
            Core.Web.DOM.focusElement(d)
        }
        var j = document.createElement("div");
        j.style.cssText = "position:absolute;top:2px;right:8px;color:#ffffff;font-weight:bold;cursor:pointer;";
        j.appendChild(document.createTextNode("x"));
        Core.Web.DOM.addEventListener(j, "click", Core.method(this, function() {
            k.parentNode.removeChild(k);
            a.parentNode.removeChild(a)
        }), false);
        a.appendChild(j)
    },
    exec: function(b, c) {
        var a = this.createInputRestriction();
        Core.Web.Library.exec(b, Core.method(this, function(d) {
            if (d && !d.success) {
                this.fail("Cannot install library: " + d.url + " Exception: " + d.ex);
                return
            }
            this.removeInputRestriction(a);
            c()
        }))
    },
    fail: function(b) {
        if (this._failed) {
            return
        }
        this._failed = true;
        var a = this.domainElement;
        try {
            this.dispose()
        } finally {
            if (this.configuration["StopError.URI"]) {
                window.location.href = this.configuration["StopError.URI"]
            } else {
                this.displayError(a, this.configuration["StopError.Message"], b, this.configuration["Action.Restart"], function() {
                    window.location.reload()
                })
            }
        }
    },
    forceRedraw: function() {
        if (this.parent) {
            this.parent.forceRedraw()
        } else {
            if (Core.Web.Env.QUIRK_IE_BLANK_SCREEN) {
                if (this.domainElement && this.domainElement.offsetHeight === 0) {
                    var a = document.documentElement.style.display || "";
                    document.documentElement.style.display = "none";
                    document.documentElement.style.display = a
                }
            }
        }
    },
    getWaitIndicator: function() {
        return this._waitIndicator
    },
    _processApplicationFocus: function(b) {
        var a = this.application.getFocusedComponent();
        if (a && a.peer && a.peer.renderFocus) {
            a.peer.renderFocus()
        }
    },
    _processKey: function(c) {
        var a = c.type == "keyup",
            b = c.type == "keypress",
            g = this.application.getFocusedComponent(),
            f = true,
            d = null,
            i;
        if (b) {
            i = this._lastKeyCode
        } else {
            i = this._lastKeyCode = Core.Web.Key.translateKeyCode(c.keyCode)
        }
        if (!a) {
            if (i == 8) {
                var h = c.target.nodeName ? c.target.nodeName.toLowerCase() : null;
                if (h != "input" && h != "textarea") {
                    Core.Web.DOM.preventEventDefault(c)
                }
            } else {
                if (!b && i == 9) {
                    this.application.focusNext(c.shiftKey);
                    Core.Web.DOM.preventEventDefault(c)
                }
            }
            if (b && Core.Web.Env.QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS && !c.charCode) {
                return true
            }
        }
        if (!g) {
            return true
        }
        if (a || b) {
            if (this._keyFocusedComponentId != g.renderId) {
                return true
            }
        } else {
            this._keyFocusedComponentId = g.renderId
        }
        var j = b ? "clientKeyPress" : (a ? "clientKeyUp" : "clientKeyDown");
        while (g && f) {
            if (g.peer && g.peer[j]) {
                if (!d) {
                    d = {
                        type: c.type,
                        source: this,
                        keyCode: i,
                        domEvent: c
                    };
                    if (b) {
                        d.charCode = Core.Web.Env.QUIRK_KEY_CODE_IS_CHAR_CODE ? c.keyCode : c.charCode
                    }
                }
                f = g.peer[j](d)
            }
            g = g.parent
        }
        return true
    },
    processUpdates: function() {
        var b = null;
        try {
            b = this.createInputRestriction();
            Echo.Render.processUpdates(this);
            this.removeInputRestriction(b);
            this.forceRedraw()
        } catch (a) {
            if (a.lineNumber) {
                Core.Debug.consoleWrite("Reported Line #: " + a.lineNumber);
                Core.Debug.consoleWrite("Evaluated Line #: " + (a.lineNumber - Core.Web.Library.evalLine) + " (if evaluated script)")
            }
            if (a.stack) {
                Core.Debug.consoleWrite("Exception: " + a + ", Stack Trace: " + a.stack)
            }
            this.fail("Exception during Client.processUpdates(): " + a.message);
            throw (a)
        }
    },
    registerRestrictionListener: function(b, a) {
        if (!this._inputRestrictionListeners) {
            this._inputRestrictionListeners = {}
        }
        this._inputRestrictionListeners[b.renderId] = a
    },
    removeInputRestriction: function(c) {
        if (this._inputRestrictionMap[c] === undefined) {
            return
        }
        delete this._inputRestrictionMap[c];
        --this._inputRestrictionCount;
        if (this._inputRestrictionCount === 0) {
            this._setWaitVisible(false);
            if (this._inputRestrictionListeners) {
                var b = this._inputRestrictionListeners;
                this._inputRestrictionListeners = null;
                for (var a in b) {
                    b[a]()
                }
            }
        }
    },
    _setWaitVisible: function(a) {
        if (a) {
            if (!this._waitIndicatorActive) {
                this._waitIndicatorActive = true;
                Core.Web.Scheduler.add(this._waitIndicatorRunnable)
            }
        } else {
            if (this._waitIndicatorActive) {
                this._waitIndicatorActive = false;
                Core.Web.Scheduler.remove(this._waitIndicatorRunnable);
                this._waitIndicator.deactivate(this);
                this.forceRedraw()
            }
        }
    },
    setWaitIndicator: function(a) {
        if (this._waitIndicator) {
            this._setWaitVisible(false);
            if (this._waitIndicator.dispose) {
                this._waitIndicator.dispose(this)
            }
        }
        this._waitIndicator = a
    },
    removeElement: function(a) {
        Core.Web.Event.remove(a, "keypress", this._processKeyRef, false);
        Core.Web.Event.remove(a, "keydown", this._processKeyRef, false);
        Core.Web.Event.remove(a, "keyup", this._processKeyRef, false)
    },
    _waitIndicatorActivate: function() {
        this._waitIndicator.activate(this)
    },
    _windowResizeListener: function(a) {
        if (this.application.rootComponent.peer) {
            Echo.Render.notifyResize(this.application.rootComponent)
        }
    }
});
Echo.Client.Timer = Core.extend({
    _times: null,
    _labels: null,
    $construct: function() {
        this._times = [new Date().getTime()];
        this._labels = ["Start"]
    },
    mark: function(a) {
        this._times.push(new Date().getTime());
        this._labels.push(a)
    },
    toString: function() {
        var a = "";
        for (var b = 1; b < this._times.length; ++b) {
            var c = this._times[b] - this._times[b - 1];
            a += this._labels[b] + ":" + c + " "
        }
        a += "TOT:" + (this._times[this._times.length - 1] - this._times[0]) + "ms";
        return a
    }
});
Echo.Client.WaitIndicator = Core.extend({
    $abstract: {
        activate: function(a) {},
        deactivate: function(a) {}
    },
    $virtual: {
        dispose: null
    }
});
Echo.Client.DefaultWaitIndicator = Core.extend(Echo.Client.WaitIndicator, {
    $construct: function() {
        this._divElement = document.createElement("div");
        this._divElement.style.cssText = "display: none;z-index:32000;position:absolute;top:30px;right:30px;width:200px;padding:20px;border:1px outset #abcdef;background-color:#abcdef;color:#000000;text-align:center;";
        this._textNode = document.createTextNode("");
        this._divElement.appendChild(this._textNode);
        this._fadeRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._tick), 50, true);
        document.body.appendChild(this._divElement)
    },
    activate: function(a) {
        if (a.configuration["WaitIndicator.Background"]) {
            this._divElement.style.backgroundColor = a.configuration["WaitIndicator.Background"];
            this._divElement.style.borderColor = a.configuration["WaitIndicator.Background"]
        }
        if (a.configuration["WaitIndicator.Foreground"]) {
            this._divElement.style.color = a.configuration["WaitIndicator.Foreground"]
        }
        this._textNode.nodeValue = a.configuration["WaitIndicator.Text"];
        this._divElement.style.display = "block";
        Core.Web.Scheduler.add(this._fadeRunnable);
        this._opacity = 0
    },
    deactivate: function(a) {
        this._divElement.style.display = "none";
        Core.Web.Scheduler.remove(this._fadeRunnable)
    },
    dispose: function(a) {
        if (this._divElement && this._divElement.parentNode) {
            this._divElement.parentNode.removeChild(this._divElement)
        }
        this._divElement = null;
        this._textNode = null
    },
    _tick: function() {
        ++this._opacity;
        var a = 1 - (Math.abs((this._opacity % 40) - 20) / 30);
        if (!Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            this._divElement.style.opacity = a
        }
    }
});
Echo.FreeClient = Core.extend(Echo.Client, {
    _processUpdateRef: null,
    _doRenderRef: null,
    _resourcePaths: null,
    _renderPending: false,
    $construct: function(a, b) {
        Echo.Client.call(this);
        this._doRenderRef = Core.method(this, this._doRender);
        this._processUpdateRef = Core.method(this, this._processUpdate);
        this.configure(a, b);
        this._processUpdate()
    },
    addResourcePath: function(a, b) {
        if (!this._resourcePaths) {
            this._resourcePaths = {}
        }
        this._resourcePaths[a] = b
    },
    dispose: function() {
        this.application.updateManager.removeUpdateListener(this._processUpdateRef);
        Echo.Render.renderComponentDispose(null, this.application.rootComponent);
        Echo.Client.prototype.dispose.call(this)
    },
    _doRender: function() {
        if (this.application) {
            this.processUpdates();
            this._renderPending = false
        }
    },
    getResourceUrl: function(a, b) {
        if (this._resourcePaths && this._resourcePaths[a]) {
            return this._resourcePaths[a] + b
        } else {
            return Echo.Client.prototype.getResourceUrl.call(this, a, b)
        }
    },
    init: function() {
        Core.Web.init();
        this.application.updateManager.addUpdateListener(this._processUpdateRef)
    },
    loadStyleSheet: function(a) {
        var b = new Core.Web.HttpConnection(a, "GET");
        b.addResponseListener(Core.method(this, this._processStyleSheet));
        b.connect()
    },
    _processStyleSheet: function(b) {
        if (!b.valid) {
            throw new Error("Received invalid response from StyleSheet HTTP request.")
        }
        var a = b.source.getResponseXml().documentElement;
        var c = Echo.Serial.loadStyleSheet(this, a);
        this.application.setStyleSheet(c)
    },
    _processUpdate: function(a) {
        if (!this._renderPending) {
            this._renderPending = true;
            Core.Web.Scheduler.run(this._doRenderRef)
        }
    }
});
Echo.Sync.ArrayContainer = Core.extend(Echo.Render.ComponentSync, {
    $abstract: {
        cellElementNodeName: null,
        renderChildLayoutData: function(b, a) {}
    },
    $virtual: {
        prevFocusKey: null,
        prevFocusFlag: null,
        nextFocusKey: null,
        nextFocusFlag: null,
        invertFocusRtl: false
    },
    element: null,
    containerElement: null,
    spacingPrototype: null,
    cellSpacing: null,
    _childIdToElementMap: null,
    clientKeyDown: function(f) {
        switch (f.keyCode) {
            case this.prevFocusKey:
            case this.nextFocusKey:
                var a = f.keyCode == this.prevFocusKey;
                if (this.invertFocusRtl && !this.component.getRenderLayoutDirection().isLeftToRight()) {
                    a = !a
                }
                var c = this.client.application.getFocusedComponent();
                if (c && c.peer && c.peer.getFocusFlags) {
                    var d = c.peer.getFocusFlags();
                    if ((a && d & this.prevFocusFlag) || (!a && d & this.nextFocusFlag)) {
                        var b = this.client.application.focusManager.findInParent(this.component, a);
                        if (b) {
                            this.client.application.setFocusedComponent(b);
                            Core.Web.DOM.preventEventDefault(f.domEvent);
                            return false
                        }
                    }
                }
                break
        }
        return true
    },
    _renderAddChild: function(g, f, b) {
        var a = document.createElement(this.cellElementNodeName);
        this._childIdToElementMap[f.renderId] = a;
        Echo.Render.renderComponentAdd(g, f, a);
        this.renderChildLayoutData(f, a);
        if (b != null) {
            var d;
            if (this.containerElement.childNodes.length >= 3 && this.cellSpacing) {
                d = (this.containerElement.childNodes.length + 1) / 2
            } else {
                d = this.containerElement.childNodes.length
            }
            if (b == d) {
                b = null
            }
        }
        if (b == null || !this.containerElement.firstChild) {
            if (this.cellSpacing && this.containerElement.firstChild) {
                this.containerElement.appendChild(this.spacingPrototype.cloneNode(false))
            }
            this.containerElement.appendChild(a)
        } else {
            var e = this.cellSpacing ? b * 2 : b;
            var c = this.containerElement.childNodes[e];
            this.containerElement.insertBefore(a, c);
            if (this.cellSpacing) {
                this.containerElement.insertBefore(this.spacingPrototype.cloneNode(false), c)
            }
        }
    },
    renderAddChildren: function(d) {
        this._childIdToElementMap = {};
        var a = this.component.getComponentCount();
        for (var b = 0; b < a; ++b) {
            var c = this.component.getComponent(b);
            this._renderAddChild(d, c)
        }
    },
    renderDispose: function(a) {
        this.element = null;
        this.containerElement = null;
        this._childIdToElementMap = null;
        this.spacingPrototype = null
    },
    _renderRemoveChild: function(c, b) {
        var a = this._childIdToElementMap[b.renderId];
        if (!a) {
            return
        }
        if (this.cellSpacing) {
            if (a.previousSibling) {
                this.containerElement.removeChild(a.previousSibling)
            } else {
                if (a.nextSibling) {
                    this.containerElement.removeChild(a.nextSibling)
                }
            }
        }
        this.containerElement.removeChild(a);
        delete this._childIdToElementMap[b.renderId]
    },
    renderUpdate: function(g) {
        var c, d = false;
        if (g.hasUpdatedProperties() || g.hasUpdatedLayoutDataChildren()) {
            d = true
        } else {
            var a = g.getRemovedChildren();
            if (a) {
                for (c = 0; c < a.length; ++c) {
                    this._renderRemoveChild(g, a[c])
                }
            }
            var e = g.getAddedChildren();
            if (e) {
                for (c = 0; c < e.length; ++c) {
                    this._renderAddChild(g, e[c], this.component.indexOf(e[c]))
                }
            }
        }
        if (d) {
            var b = this.element;
            var f = b.parentNode;
            Echo.Render.renderComponentDispose(g, g.parent);
            f.removeChild(b);
            this.renderAdd(g, f)
        }
        return d
    }
});
Echo.Sync.Column = Core.extend(Echo.Sync.ArrayContainer, {
    $load: function() {
        Echo.Render.registerPeer("Column", this)
    },
    cellElementNodeName: "div",
    prevFocusKey: 38,
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP,
    nextFocusKey: 40,
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN,
    renderAdd: function(b, a) {
        this.element = this.containerElement = document.createElement("div");
        this.element.id = this.component.renderId;
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";
        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");
        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0"
        }
        this.renderAddChildren(b);
        a.appendChild(this.element)
    },
    renderChildLayoutData: function(c, a) {
        var b = c.render("layoutData");
        if (b) {
            Echo.Sync.Color.render(b.background, a, "backgroundColor");
            Echo.Sync.FillImage.render(b.backgroundImage, a);
            Echo.Sync.Insets.render(b.insets, a, "padding");
            Echo.Sync.Alignment.render(b.alignment, a, true, this.component);
            if (b.height) {
                a.style.height = Echo.Sync.Extent.toPixels(b.height, false) + "px"
            }
        }
    }
});
Echo.Sync.Row = Core.extend(Echo.Sync.ArrayContainer, {
    $static: {
        _createRowPrototype: function() {
            var c = document.createElement("div");
            c.style.outlineStyle = "none";
            c.tabIndex = "-1";
            var b = document.createElement("table");
            b.style.borderCollapse = "collapse";
            c.appendChild(b);
            var a = document.createElement("tbody");
            b.appendChild(a);
            a.appendChild(document.createElement("tr"));
            return c
        },
        _rowPrototype: null
    },
    $load: function() {
        this._rowPrototype = this._createRowPrototype();
        Echo.Render.registerPeer("Row", this)
    },
    cellElementNodeName: "td",
    prevFocusKey: 37,
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT,
    nextFocusKey: 39,
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT,
    invertFocusRtl: true,
    renderAdd: function(b, a) {
        this.element = Echo.Sync.Row._rowPrototype.cloneNode(true);
        this.element.id = this.component.renderId;
        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.element, true, this.component);
        this.containerElement = this.element.firstChild.firstChild.firstChild;
        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("td");
            this.spacingPrototype.style.padding = 0;
            this.spacingPrototype.style.width = this.cellSpacing + "px"
        }
        this.renderAddChildren(b);
        a.appendChild(this.element)
    },
    renderChildLayoutData: function(d, b) {
        var c = d.render("layoutData");
        var a;
        if (c) {
            a = c.insets;
            Echo.Sync.Color.render(c.background, b, "backgroundColor");
            Echo.Sync.FillImage.render(c.backgroundImage, b);
            Echo.Sync.Alignment.render(c.alignment, b, true, this.component);
            if (c.width) {
                if (Echo.Sync.Extent.isPercent(c.width)) {
                    b.style.width = c.width;
                    if (this.element.firstChild.style.width != "100%") {
                        this.element.firstChild.style.width = "100%"
                    }
                } else {
                    b.style.width = Echo.Sync.Extent.toPixels(c.width, true) + "px"
                }
            }
        }
        if (!a) {
            a = 0
        }
        Echo.Sync.Insets.render(a, b, "padding")
    }
});
Echo.Sync.Button = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        _defaultIconTextMargin: 5,
        _prototypeButton: null,
        _createPrototypeButton: function() {
            var a = document.createElement("div");
            a.tabIndex = "0";
            a.style.outlineStyle = "none";
            a.style.cursor = "pointer";
            return a
        }
    },
    $load: function() {
        this._prototypeButton = this._createPrototypeButton();
        Echo.Render.registerPeer("Button", this)
    },
    enabled: null,
    div: null,
    _textElement: null,
    iconImg: null,
    _processRolloverExitRef: null,
    _processInitEventRef: null,
    _focused: false,
    $construct: function() {
        this._processInitEventRef = Core.method(this, this._processInitEvent)
    },
    $virtual: {
        doAction: function() {
            this.component.doAction()
        },
        renderContent: function() {
            var e = this.component.render("text");
            var d = Echo.Sync.getEffectProperty(this.component, "icon", "disabledIcon", !this.enabled);
            if (e != null) {
                if (d) {
                    var a = this.component.render("iconTextMargin", Echo.Sync.Button._defaultIconTextMargin);
                    var c = Echo.Sync.TriCellTable.getOrientation(this.component, "textPosition");
                    var b = new Echo.Sync.TriCellTable(c, Echo.Sync.Extent.toPixels(a));
                    this.renderButtonText(b.tdElements[0], e);
                    this.iconImg = this.renderButtonIcon(b.tdElements[1], d);
                    this.div.appendChild(b.tableElement)
                } else {
                    this.renderButtonText(this.div, e)
                }
            } else {
                if (d) {
                    this.iconImg = this.renderButtonIcon(this.div, d)
                }
            }
        },
        setHighlightState: function(j, f) {
            var h = this.component && this.component.application && this.component.application.getFocusedComponent() == this.component;
            var k = f ? "pressed" : (j ? "rollover" : "focused");
            var b = h || f || j;
            var g = Echo.Sync.getEffectProperty(this.component, "foreground", k + "Foreground", b);
            var c = Echo.Sync.getEffectProperty(this.component, "background", k + "Background", b);
            var i = Echo.Sync.getEffectProperty(this.component, "backgroundImage", k + "BackgroundImage", b);
            var d = Echo.Sync.getEffectProperty(this.component, "font", k + "Font", b);
            var e = Echo.Sync.getEffectProperty(this.component, "border", k + "Border", b);
            Echo.Sync.Color.renderClear(g, this.div, "color");
            Echo.Sync.Color.renderClear(c, this.div, "backgroundColor");
            Echo.Sync.FillImage.renderClear(i, this.div, "backgroundColor");
            if (b) {
                Echo.Sync.Insets.render(this.getInsetsForBorder(this.component.render(k + "Border")), this.div, "padding")
            } else {
                Echo.Sync.Insets.render(this.component.render("insets"), this.div, "padding")
            }
            Echo.Sync.Border.renderClear(e, this.div);
            if (this._textElement) {
                Echo.Sync.Font.renderClear(d, this._textElement)
            }
            if (this.iconImg) {
                var a = Echo.Sync.ImageReference.getUrl(Echo.Sync.getEffectProperty(this.component, "icon", k + "Icon", b));
                if (a != this.iconImg.src) {
                    this.iconImg.src = a
                }
            }
        }
    },
    _addEventListeners: function() {
        this._processRolloverExitRef = Core.method(this, this._processRolloverExit);
        Core.Web.Event.remove(this.div, "focus", this._processInitEventRef);
        Core.Web.Event.remove(this.div, "mouseover", this._processInitEventRef);
        Core.Web.Event.add(this.div, "click", Core.method(this, this._processClick), false);
        if (this.component.render("rolloverEnabled")) {
            Core.Web.Event.add(this.div, Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseenter" : "mouseover", Core.method(this, this._processRolloverEnter), false);
            Core.Web.Event.add(this.div, Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseleave" : "mouseout", Core.method(this, this._processRolloverExit), false)
        }
        if (this.component.render("pressedEnabled")) {
            Core.Web.Event.add(this.div, "mousedown", Core.method(this, this._processPress), false);
            Core.Web.Event.add(this.div, "mouseup", Core.method(this, this._processRelease), false)
        }
        Core.Web.Event.add(this.div, "focus", Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this.div, "blur", Core.method(this, this._processBlur), false);
        Core.Web.Event.Selection.disable(this.div)
    },
    clientKeyDown: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        if (a.keyCode == 13) {
            this.doAction();
            return false
        } else {
            return true
        }
    },
    getFocusFlags: function() {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_ALL
    },
    getInsetsForBorder: function(c) {
        var b = this.component.render("border");
        if (!c) {
            return this.component.render("insets")
        }
        var d = Echo.Sync.Insets.toPixels(this.component.render("insets"));
        for (var a in d) {
            d[a] += Echo.Sync.Border.getPixelSize(b, a) - Echo.Sync.Border.getPixelSize(c, a);
            if (d[a] < 0) {
                d[a] = 0
            }
        }
        return d.top + " " + d.right + " " + d.bottom + " " + d.left
    },
    _processBlur: function(a) {
        this.setHighlightState(false, false)
    },
    _processClick: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        this.client.application.setFocusedComponent(this.component);
        this.doAction()
    },
    _processFocus: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        this.client.application.setFocusedComponent(this.component);
        this.setHighlightState(false, false)
    },
    _processInitEvent: function(a) {
        this._addEventListeners();
        switch (a.type) {
            case "focus":
                this._processFocus(a);
                break;
            case "mouseover":
                if (this.component.render("rolloverEnabled")) {
                    this._processRolloverEnter(a)
                }
                break
        }
    },
    _processPress: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        Core.Web.DOM.preventEventDefault(a);
        this.setHighlightState(false, true)
    },
    _processRelease: function(a) {
        if (!this.client) {
            return true
        }
        this.setHighlightState(false, false)
    },
    _processRolloverEnter: function(a) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true
        }
        this.client.application.addListener("focus", this._processRolloverExitRef);
        this.setHighlightState(true, false);
        return true
    },
    _processRolloverExit: function(a) {
        if (!this.client || !this.client.application) {
            return true
        }
        if (this._processRolloverExitRef) {
            this.client.application.removeListener("focus", this._processRolloverExitRef)
        }
        this.setHighlightState(false, false);
        return true
    },
    renderAdd: function(e, b) {
        this.enabled = this.component.isRenderEnabled();
        this.div = Echo.Sync.Button._prototypeButton.cloneNode(false);
        this.div.id = this.component.renderId;
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this.div);
        if (this.enabled) {
            Echo.Sync.Color.renderFB(this.component, this.div);
            Echo.Sync.Border.render(this.component.render("border"), this.div);
            Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this.div)
        } else {
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), this.div, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), this.div, "backgroundColor");
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", true), this.div);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component, "backgroundImage", "disabledBackgroundImage", true), this.div)
        }
        Echo.Sync.Insets.render(this.component.render("insets"), this.div, "padding");
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.div, true, this.component);
        var d = this.component.render("toolTipText");
        if (d) {
            this.div.title = d
        }
        var c = this.component.render("width");
        if (c) {
            this.div.style.width = Echo.Sync.Extent.toCssValue(c, true, true)
        }
        var a = this.component.render("height");
        if (a) {
            this.div.style.height = Echo.Sync.Extent.toCssValue(a, false);
            this.div.style.overflow = "hidden"
        }
        this.renderContent();
        if (this.enabled) {
            Core.Web.Event.add(this.div, "focus", this._processInitEventRef, false);
            Core.Web.Event.add(this.div, "mouseover", this._processInitEventRef, false)
        }
        b.appendChild(this.div)
    },
    renderButtonText: function(a, c) {
        this._textElement = a;
        var b = this.component.render("textAlignment");
        if (b) {
            Echo.Sync.Alignment.render(b, a, true, this.component)
        }
        if (this.enabled) {
            Echo.Sync.Font.render(this.component.render("font"), this._textElement)
        } else {
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true), this._textElement)
        }
        a.appendChild(document.createTextNode(c));
        if (!this.component.render("lineWrap", true)) {
            a.style.whiteSpace = "nowrap"
        }
    },
    renderButtonIcon: function(a, b) {
        var d = this.component.render("alignment");
        if (d) {
            Echo.Sync.Alignment.render(d, a, true, this.component)
        }
        var c = document.createElement("img");
        Echo.Sync.ImageReference.renderImg(b, c);
        a.appendChild(c);
        return c
    },
    renderDispose: function(a) {
        if (this._processRolloverExitRef) {
            this.client.application.removeListener("focus", this._processRolloverExitRef)
        }
        Core.Web.Event.removeAll(this.div);
        this._focused = false;
        this.div = null;
        this._textElement = null;
        this.iconImg = null
    },
    renderFocus: function() {
        if (this._focused) {
            return
        }
        Core.Web.DOM.focusElement(this.div);
        this._focused = true
    },
    renderUpdate: function(c) {
        var a = this.div;
        var b = a.parentNode;
        this.renderDispose(c);
        b.removeChild(a);
        this.renderAdd(c, b);
        return false
    }
});
Echo.Sync.Composite = Core.extend(Echo.Render.ComponentSync, {
    $load: function() {
        Echo.Render.registerPeer("Composite", this)
    },
    div: null,
    contentDiv: null,
    $virtual: {
        renderStyle: function() {
            Echo.Sync.renderComponentDefaults(this.component, this.div)
        }
    },
    renderAdd: function(b, a) {
        this.div = this.contentDiv = document.createElement("div");
        this.div.id = this.component.renderId;
        if (this.component.children.length !== 0) {
            this.renderStyle();
            Echo.Render.renderComponentAdd(b, this.component.children[0], this.contentDiv)
        }
        a.appendChild(this.div)
    },
    renderDispose: function(a) {
        this.contentDiv = null;
        this.div = null
    },
    renderUpdate: function(c) {
        var a = this.div;
        var b = a.parentNode;
        Echo.Render.renderComponentDispose(c, c.parent);
        b.removeChild(a);
        this.renderAdd(c, b);
        return true
    }
});
Echo.Sync.Panel = Core.extend(Echo.Sync.Composite, {
    $load: function() {
        Echo.Render.registerPeer("Panel", this)
    },
    renderDisplay: function() {
        if (this._imageBorder) {
            Echo.Sync.FillImageBorder.renderContainerDisplay(this.div)
        }
    },
    renderStyle: function() {
        this._imageBorder = this.component.render("imageBorder");
        var e = this.component.children.length !== 0 ? this.component.children[0] : null;
        var b = this.component.render("width");
        var a = this.component.render("height");
        if (Echo.Sync.Extent.isPercent(a)) {
            a = null
        }
        if (e && e.pane) {
            this.div.style.position = "relative";
            if (!a) {
                a = "10em"
            }
        }
        if (b || a) {
            this.contentDiv.style.overflow = "hidden";
            if (a && this._imageBorder) {
                var d = Echo.Sync.Insets.toPixels(this._imageBorder.contentInsets);
                var c = Echo.Sync.Extent.toPixels(a) - d.top - d.bottom;
                if (!e || !e.pane) {
                    d = Echo.Sync.Insets.toPixels(this.component.render("insets"));
                    c -= d.top + d.bottom
                }
                this.contentDiv.style.height = c + "px"
            }
        }
        if (this._imageBorder) {
            this.div = Echo.Sync.FillImageBorder.renderContainer(this._imageBorder, {
                child: this.contentDiv
            })
        } else {
            Echo.Sync.Border.render(this.component.render("border"), this.contentDiv)
        }
        Echo.Sync.renderComponentDefaults(this.component, this.contentDiv);
        if (!e || !e.pane) {
            Echo.Sync.Insets.render(this.component.render("insets"), this.contentDiv, "padding")
        }
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.contentDiv, true, this.component);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this.contentDiv);
        Echo.Sync.Extent.render(b, this.div, "width", true, true);
        Echo.Sync.Extent.render(a, this.div, "height", false, false)
    }
});
Echo.Sync.ContentPane = Core.extend(Echo.Render.ComponentSync, {
    $load: function() {
        Echo.Render.registerPeer("ContentPane", this)
    },
    _floatingPaneStack: null,
    _zIndexRenderRequired: false,
    $construct: function() {
        this._floatingPaneStack = []
    },
    getSize: function() {
        return new Core.Web.Measure.Bounds(this._div)
    },
    raise: function(a) {
        if (this._floatingPaneStack[this._floatingPaneStack.length - 1] == a) {
            return
        }
        Core.Arrays.remove(this._floatingPaneStack, a);
        this._floatingPaneStack.push(a);
        this._renderFloatingPaneZIndices();
        this._storeFloatingPaneZIndices()
    },
    renderAdd: function(g, a) {
        var d;
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.position = "absolute";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "hidden";
        this._div.style.zIndex = "0";
        Echo.Sync.renderComponentDefaults(this.component, this._div);
        var c = this.component.render("background");
        var e = this.component.render("backgroundImage");
        Echo.Sync.FillImage.render(e, this._div);
        if (!c && !e) {
            Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._div)
        }
        this._childIdToElementMap = {};
        var b = this.component.getComponentCount();
        for (d = 0; d < b; ++d) {
            var f = this.component.getComponent(d);
            this._renderAddChild(g, f)
        }
        this._pendingScrollX = this.component.render("horizontalScroll");
        this._pendingScrollY = this.component.render("verticalScroll");
        a.appendChild(this._div);
        if (this._zIndexRenderRequired) {
            this._renderFloatingPaneZIndices()
        }
    },
    _renderAddChild: function(c, a) {
        var e = document.createElement("div");
        this._childIdToElementMap[a.renderId] = e;
        e.style.position = "absolute";
        if (a.floatingPane) {
            var h = a.render("zIndex");
            if (h != null) {
                var j = false;
                var d = 0;
                while (d < this._floatingPaneStack.length && !j) {
                    var f = this._floatingPaneStack[d].render("zIndex");
                    if (f != null && f > h) {
                        this._floatingPaneStack.splice(d, 0, a);
                        j = true
                    }++d
                }
                if (!j) {
                    this._floatingPaneStack.push(a)
                }
            } else {
                this._floatingPaneStack.push(a)
            }
            e.style.zIndex = "1";
            e.style.left = e.style.top = 0;
            this._zIndexRenderRequired = true
        } else {
            var b = this.component.render("insets", 0);
            var g = Echo.Sync.Insets.toPixels(b);
            e.style.zIndex = "0";
            e.style.left = g.left + "px";
            e.style.top = g.top + "px";
            e.style.bottom = g.bottom + "px";
            e.style.right = g.right + "px";
            if (a.pane) {
                e.style.overflow = "hidden"
            } else {
                switch (this.component.render("overflow")) {
                    case Echo.ContentPane.OVERFLOW_HIDDEN:
                        e.style.overflow = "hidden";
                        break;
                    case Echo.ContentPane.OVERFLOW_SCROLL:
                        e.style.overflow = "scroll";
                        break;
                    default:
                        e.style.overflow = "auto";
                        break
                }
            }
        }
        Echo.Render.renderComponentAdd(c, a, e);
        this._div.appendChild(e)
    },
    renderDisplay: function() {
        var h = this._div.firstChild;
        while (h) {
            Core.Web.VirtualPosition.redraw(h);
            h = h.nextSibling
        }
        if (this._pendingScrollX || this._pendingScrollY) {
            var c = this.component.getComponentCount();
            for (var d = 0; d < c; ++d) {
                h = this.component.getComponent(d);
                if (!h.floatingPane) {
                    var f = this._childIdToElementMap[h.renderId];
                    var b, e;
                    if (this._pendingScrollX) {
                        var a = Echo.Sync.Extent.toPixels(this._pendingScrollX);
                        if (Echo.Sync.Extent.isPercent(this._pendingScrollX) || a < 0) {
                            e = a < 0 ? 100 : parseInt(this._pendingScrollX, 10);
                            b = Math.round((f.scrollWidth - f.offsetWidth) * e / 100);
                            if (b > 0) {
                                f.scrollLeft = b;
                                if (Core.Web.Env.ENGINE_MSHTML) {
                                    b = Math.round((f.scrollWidth - f.offsetWidth) * e / 100);
                                    f.scrollLeft = b
                                }
                            }
                        } else {
                            f.scrollLeft = a
                        }
                        this._pendingScrollX = null
                    }
                    if (this._pendingScrollY) {
                        var g = Echo.Sync.Extent.toPixels(this._pendingScrollY);
                        if (Echo.Sync.Extent.isPercent(this._pendingScrollY) || g < 0) {
                            e = g < 0 ? 100 : parseInt(this._pendingScrollY, 10);
                            b = Math.round((f.scrollHeight - f.offsetHeight) * e / 100);
                            if (b > 0) {
                                f.scrollTop = b;
                                if (Core.Web.Env.ENGINE_MSHTML) {
                                    b = Math.round((f.scrollHeight - f.offsetHeight) * e / 100);
                                    f.scrollTop = b
                                }
                            }
                        } else {
                            f.scrollTop = g
                        }
                        this._pendingScrollY = null
                    }
                    break
                }
            }
        }
    },
    renderDispose: function(a) {
        this._childIdToElementMap = null;
        this._div = null
    },
    _renderFloatingPaneZIndices: function() {
        for (var b = 0; b < this._floatingPaneStack.length; ++b) {
            var a = this._childIdToElementMap[this._floatingPaneStack[b].renderId];
            a.style.zIndex = 2 + b
        }
        this._zIndexRenderRequired = false
    },
    _renderRemoveChild: function(d, c) {
        if (c.floatingPane) {
            Core.Arrays.remove(this._floatingPaneStack, c)
        }
        var a = this._childIdToElementMap[c.renderId];
        if (!a) {
            return
        }
        var b = false;
        if (c.peer.renderContentPaneRemove) {
            b = c.peer.renderContentPaneRemove(this._childIdToElementMap[c.renderId], Core.method(this, function() {
                a.parentNode.removeChild(a)
            }))
        }
        if (!b) {
            a.parentNode.removeChild(a)
        }
        delete this._childIdToElementMap[c.renderId]
    },
    renderUpdate: function(g) {
        var c, d = false;
        if (g.hasUpdatedProperties() || g.hasUpdatedLayoutDataChildren()) {
            d = true
        } else {
            var a = g.getRemovedChildren();
            if (a) {
                for (c = 0; c < a.length; ++c) {
                    this._renderRemoveChild(g, a[c])
                }
            }
            var e = g.getAddedChildren();
            g.renderContext.displayRequired = [];
            if (e) {
                for (c = 0; c < e.length; ++c) {
                    if (!e[c].floatingPane) {
                        g.renderContext.displayRequired = null
                    }
                    this._renderAddChild(g, e[c], this.component.indexOf(e[c]));
                    if (g.renderContext.displayRequired) {
                        g.renderContext.displayRequired.push(e[c])
                    }
                }
                if (this._zIndexRenderRequired) {
                    this._renderFloatingPaneZIndices()
                }
            }
        }
        if (d) {
            this._floatingPaneStack = [];
            var b = this._div;
            var f = b.parentNode;
            Echo.Render.renderComponentDispose(g, g.parent);
            f.removeChild(b);
            this.renderAdd(g, f)
        }
        return d
    },
    _storeFloatingPaneZIndices: function() {
        for (var a = 0; a < this._floatingPaneStack.length; ++a) {
            this._floatingPaneStack[a].set("zIndex", a)
        }
    }
});
Echo.Sync.Grid = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        _createPrototypeTable: function() {
            var c = document.createElement("div");
            var a = document.createElement("table");
            a.style.outlineStyle = "none";
            a.tabIndex = "-1";
            a.style.borderCollapse = "collapse";
            var b = document.createElement("colgroup");
            a.appendChild(b);
            a.appendChild(document.createElement("tbody"));
            c.appendChild(a);
            return c
        },
        Processor: Core.extend({
            $static: {
                Cell: Core.extend({
                    xSpan: null,
                    ySpan: null,
                    index: null,
                    component: null,
                    $construct: function(c, b, d, a) {
                        this.component = c;
                        this.index = b;
                        this.xSpan = d;
                        this.ySpan = a
                    }
                })
            },
            cellArrays: null,
            grid: null,
            gridXSize: null,
            gridYSize: null,
            xExtents: null,
            yExtents: null,
            horizontalOrientation: null,
            $construct: function(b) {
                this.grid = b;
                this.cellArrays = [];
                this.horizontalOrientation = b.render("orientation") != Echo.Grid.ORIENTATION_VERTICAL;
                var a = this.createCells();
                if (a == null) {
                    this.gridXSize = 0;
                    this.gridYSize = 0;
                    return
                }
                this.renderCellMatrix(a);
                this.calculateExtents();
                this.reduceY();
                this.reduceX()
            },
            addExtents: function(e, c, d) {
                var f = Echo.Sync.Extent.isPercent(e),
                    g = Echo.Sync.Extent.isPercent(c);
                if (f || g) {
                    if (f && g) {
                        return (parseFloat(e) + parseFloat(c)) + "%"
                    } else {
                        return f ? e : c
                    }
                } else {
                    return Echo.Sync.Extent.toPixels(e) + Echo.Sync.Extent.toPixels(c)
                }
            },
            calculateExtents: function() {
                var c, b = this.horizontalOrientation ? "columnWidth" : "rowHeight",
                    a = this.horizontalOrientation ? "rowHeight" : "columnWidth";
                this.xExtents = [];
                for (c = 0; c < this.gridXSize; ++c) {
                    this.xExtents.push(this.grid.renderIndex(b, c))
                }
                this.yExtents = [];
                for (c = 0; c < this.gridYSize; ++c) {
                    this.yExtents.push(this.grid.renderIndex(a, c))
                }
            },
            createCells: function() {
                var b = this.grid.getComponentCount();
                if (b === 0) {
                    return null
                }
                var c = [];
                for (var d = 0; d < b; ++d) {
                    var g = this.grid.getComponent(d);
                    var f = g.render("layoutData");
                    if (f) {
                        var e = this.horizontalOrientation ? f.columnSpan : f.rowSpan;
                        var a = this.horizontalOrientation ? f.rowSpan : f.columnSpan;
                        c.push(new Echo.Sync.Grid.Processor.Cell(g, d, e ? e : 1, a ? a : 1))
                    } else {
                        c.push(new Echo.Sync.Grid.Processor.Cell(g, d, 1, 1))
                    }
                }
                return c
            },
            _getCellArray: function(a) {
                while (a >= this.cellArrays.length) {
                    this.cellArrays.push([])
                }
                return this.cellArrays[a]
            },
            getColumnCount: function() {
                return this.horizontalOrientation ? this.gridXSize : this.gridYSize
            },
            getCell: function(a, b) {
                if (this.horizontalOrientation) {
                    return this.cellArrays[b][a]
                } else {
                    return this.cellArrays[a][b]
                }
            },
            getRowCount: function() {
                return this.horizontalOrientation ? this.gridYSize : this.gridXSize
            },
            reduceX: function() {
                var c = [],
                    b = 1,
                    g, e = this.cellArrays[0].length;
                while (b < e) {
                    g = 0;
                    var f = true;
                    while (g < this.cellArrays.length) {
                        if (this.cellArrays[g][b] != this.cellArrays[g][b - 1]) {
                            f = false;
                            break
                        }++g
                    }
                    if (f) {
                        c[b] = true
                    }++b
                }
                if (c.length === 0) {
                    return
                }
                for (var a = this.gridXSize - 1; a >= 1; --a) {
                    if (!c[a]) {
                        continue
                    }
                    for (g = 0; g < this.gridYSize; ++g) {
                        if (g === 0 || this.cellArrays[g][a - 1] != this.cellArrays[g - 1][a - 1]) {
                            if (this.cellArrays[g][a - 1] != null) {
                                --this.cellArrays[g][a - 1].xSpan
                            }
                        }
                        this.cellArrays[g].splice(a, 1)
                    }
                    var d = this.xExtents.splice(a, 1)[0];
                    if (d) {
                        this.xExtents[a - 1] = this.addExtents(this.xExtents[a - 1], d, this.horizontalOrientation ? true : false)
                    }--this.gridXSize
                }
            },
            reduceY: function() {
                var h = [],
                    e = 1,
                    g, j = this.cellArrays.length,
                    i, c = this.cellArrays[0];
                while (e < j) {
                    i = c;
                    c = this.cellArrays[e];
                    g = 0;
                    var f = true;
                    while (g < c.length) {
                        if (c[g] != i[g]) {
                            f = false;
                            break
                        }++g
                    }
                    if (f) {
                        h[e] = true
                    }++e
                }
                if (h.length === 0) {
                    return
                }
                for (var d = this.gridYSize - 1; d >= 0; --d) {
                    if (!h[d]) {
                        continue
                    }
                    var b = this.cellArrays[d - 1];
                    for (g = 0; g < this.gridXSize; ++g) {
                        if (g === 0 || b[g] != b[g - 1]) {
                            if (b[g] != null) {
                                --b[g].ySpan
                            }
                        }
                    }
                    this.cellArrays.splice(d, 1);
                    var a = this.yExtents.splice(d, 1)[0];
                    if (a) {
                        this.yExtents[d - 1] = this.addExtents(this.yExtents[d - 1], a, this.horizontalOrientation ? false : true)
                    }--this.gridYSize
                }
            },
            renderCellMatrix: function(i) {
                this.gridXSize = parseInt(this.grid.render("size", 2), 10);
                var g = 0,
                    f = 0,
                    b, e, h = this._getCellArray(f);
                for (var c = 0; c < i.length; ++c) {
                    if (i[c].xSpan == Echo.Grid.SPAN_FILL || i[c].xSpan > this.gridXSize - g) {
                        i[c].xSpan = this.gridXSize - g
                    }
                    if (i[c].xSpan < 1) {
                        i[c].xSpan = 1
                    }
                    if (i[c].ySpan < 1) {
                        i[c].ySpan = 1
                    }
                    if (i[c].xSpan != 1 || i[c].ySpan != 1) {
                        for (b = 1; b < i[c].xSpan; ++b) {
                            if (h[g + b] != null) {
                                i[c].xSpan = b;
                                break
                            }
                        }
                        for (e = 0; e < i[c].ySpan; ++e) {
                            var d = this._getCellArray(f + e);
                            for (b = 0; b < i[c].xSpan; ++b) {
                                d[g + b] = i[c]
                            }
                        }
                    }
                    h[g] = i[c];
                    if (c < i.length - 1) {
                        var a = false;
                        while (!a) {
                            if (g < this.gridXSize - 1) {
                                ++g
                            } else {
                                g = 0;
                                ++f;
                                h = this._getCellArray(f)
                            }
                            a = h[g] == null
                        }
                    }
                }
                this.gridYSize = this.cellArrays.length
            }
        })
    },
    $load: function() {
        this._prototypeTable = this._createPrototypeTable();
        Echo.Render.registerPeer("Grid", this)
    },
    _columnCount: null,
    _rowCount: null,
    clientKeyDown: function(f) {
        var a, c, d, b;
        switch (f.keyCode) {
            case 37:
            case 39:
                a = this.component.getRenderLayoutDirection().isLeftToRight() ? f.keyCode == 37 : f.keyCode == 39;
                c = this.client.application.getFocusedComponent();
                if (c && c.peer && c.peer.getFocusFlags) {
                    d = c.peer.getFocusFlags();
                    if ((a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT) || (!a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                        b = this.client.application.focusManager.findInParent(this.component, a);
                        if (b) {
                            this.client.application.setFocusedComponent(b);
                            Core.Web.DOM.preventEventDefault(f.domEvent);
                            return false
                        }
                    }
                }
                break;
            case 38:
            case 40:
                a = f.keyCode == 38;
                c = this.client.application.getFocusedComponent();
                if (c && c.peer && c.peer.getFocusFlags) {
                    d = c.peer.getFocusFlags();
                    if ((a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP) || (!a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                        b = this.client.application.focusManager.findInParent(this.component, a, this._columnCount);
                        if (b) {
                            this.client.application.setFocusedComponent(b);
                            Core.Web.DOM.preventEventDefault(f.domEvent);
                            return false
                        }
                    }
                }
                break
        }
        return true
    },
    renderAdd: function(o, j) {
        var g = new Echo.Sync.Grid.Processor(this.component),
            m = Echo.Sync.Insets.toCssValue(this.component.render("insets", 0)),
            f, l = this.component.render("border", ""),
            u = this.component.render("width"),
            r = this.component.render("height"),
            n, z;
        f = Echo.Sync.Insets.toPixels(m);
        this._columnCount = g.getColumnCount();
        this._rowCount = g.getRowCount();
        this._div = Echo.Sync.Grid._prototypeTable.cloneNode(true);
        this._div.id = this.component.renderId;
        var y = this._div.firstChild;
        Echo.Sync.renderComponentDefaults(this.component, y);
        Echo.Sync.Border.render(l, y);
        y.style.padding = m;
        if (u && Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(u)) {
            this._div.style.zoom = 1
        }
        if (u) {
            if (Echo.Sync.Extent.isPercent(u)) {
                y.style.width = u
            } else {
                y.style.width = Echo.Sync.Extent.toCssValue(u, true)
            }
        }
        if (r) {
            if (Echo.Sync.Extent.isPercent(r)) {
                y.style.height = r
            } else {
                y.style.height = Echo.Sync.Extent.toCssValue(r, false)
            }
        }
        var t = y.firstChild;
        for (z = 0; z < this._columnCount; ++z) {
            var k = document.createElement("col");
            u = g.xExtents[z];
            if (u != null) {
                if (Echo.Sync.Extent.isPercent(u)) {
                    k.style.width = u.toString()
                } else {
                    var x = Echo.Sync.Extent.toPixels(u, true);
                    if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
                        x -= f.left + f.right;
                        if (x < 0) {
                            x = 0
                        }
                    }
                    k.style.width = x + "px"
                }
            }
            t.appendChild(k)
        }
        var b = t.nextSibling;
        var q = parseInt(this.component.render("size", 2), 10);
        var c;
        var e = {};
        var a, s;
        if (g.horizontalOrientation) {
            a = "colSpan";
            s = "rowSpan"
        } else {
            a = "rowSpan";
            s = "colSpan"
        }
        var w = document.createElement("td");
        Echo.Sync.Border.render(l, w);
        w.style.padding = m;
        for (var p = 0; p < this._rowCount; ++p) {
            c = document.createElement("tr");
            r = g.yExtents[p];
            if (r) {
                c.style.height = Echo.Sync.Extent.toCssValue(r, false)
            }
            b.appendChild(c);
            for (z = 0; z < this._columnCount; ++z) {
                var d = g.getCell(z, p);
                if (d == null) {
                    n = document.createElement("td");
                    c.appendChild(n);
                    continue
                }
                if (e[d.component.renderId]) {
                    continue
                }
                e[d.component.renderId] = true;
                n = w.cloneNode(false);
                if (d.xSpan > 1) {
                    n.setAttribute(a, d.xSpan)
                }
                if (d.ySpan > 1) {
                    n.setAttribute(s, d.ySpan)
                }
                var v = d.component.render("layoutData");
                if (v) {
                    var i = g.xExtents[z];
                    if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING && i && !Echo.Sync.Extent.isPercent(i)) {
                        var h = Echo.Sync.Insets.toPixels(v.insets);
                        if (f.left + f.right < h.left + h.right) {
                            n.style.width = (Echo.Sync.Extent.toPixels(i) - (h.left + h.right)) + "px"
                        }
                    }
                    Echo.Sync.Insets.render(v.insets, n, "padding");
                    Echo.Sync.Alignment.render(v.alignment, n, true, this.component);
                    Echo.Sync.FillImage.render(v.backgroundImage, n);
                    Echo.Sync.Color.render(v.background, n, "backgroundColor")
                }
                Echo.Render.renderComponentAdd(o, d.component, n);
                c.appendChild(n)
            }
        }
        j.appendChild(this._div)
    },
    renderDispose: function(a) {
        this._div = null
    },
    renderUpdate: function(c) {
        var a = this._div;
        var b = a.parentNode;
        Echo.Render.renderComponentDispose(c, c.parent);
        b.removeChild(a);
        this.renderAdd(c, b);
        return true
    }
});
Echo.Sync.Label = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        _defaultIconTextMargin: 5
    },
    $load: function() {
        Echo.Render.registerPeer("Label", this)
    },
    _node: null,
    _formatWhitespace: function(e, c) {
        e = e.replace(/\t/g, " \u00a0 \u00a0");
        e = e.replace(/ {2}/g, " \u00a0");
        var b = e.split("\n");
        for (var d = 0; d < b.length; d++) {
            var a = b[d];
            if (d > 0) {
                c.appendChild(document.createElement("br"))
            }
            if (a.length > 0) {
                c.appendChild(document.createTextNode(a))
            }
        }
    },
    renderAdd: function(g, l) {
        this._containerElement = l;
        var k = this.component.render("icon"),
            m = this.component.render("text"),
            i = this.component.render("foreground"),
            b = this.component.render("background"),
            a = this.component.render("toolTipText"),
            h;
        if (m != null) {
            var n = this.component.render("lineWrap", true);
            var f = this.component.render("formatWhitespace", false) && (m.indexOf(" ") != -1 || m.indexOf("\n") != -1 || m.indexOf("\t") != -1);
            if (k) {
                var e = this.component.render("iconTextMargin", Echo.Sync.Label._defaultIconTextMargin);
                var c = Echo.Sync.TriCellTable.getOrientation(this.component, "textPosition");
                var j = new Echo.Sync.TriCellTable(c, Echo.Sync.Extent.toPixels(e));
                h = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(k, h);
                if (f) {
                    this._formatWhitespace(m, j.tdElements[0])
                } else {
                    j.tdElements[0].appendChild(document.createTextNode(m))
                }
                if (!n) {
                    j.tdElements[0].style.whiteSpace = "nowrap"
                }
                j.tdElements[1].appendChild(h);
                this._node = j.tableElement;
                this._node.id = this.component.renderId;
                Echo.Sync.renderComponentDefaults(this.component, this._node)
            } else {
                var d = this.component.render("font");
                if (!this.client.designMode && !a && !d && n && !i && !b && !f && !this.component.getLayoutDirection()) {
                    this._node = document.createTextNode(m)
                } else {
                    this._node = document.createElement("span");
                    this._node.id = this.component.renderId;
                    if (f) {
                        this._formatWhitespace(m, this._node)
                    } else {
                        this._node.appendChild(document.createTextNode(m))
                    }
                    if (!n) {
                        this._node.style.whiteSpace = "nowrap"
                    }
                    Echo.Sync.renderComponentDefaults(this.component, this._node)
                }
            }
        } else {
            if (k) {
                h = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(k, h);
                this._node = document.createElement("span");
                this._node.id = this.component.renderId;
                this._node.appendChild(h);
                Echo.Sync.Color.render(this.component.render("background"), this._node, "backgroundColor")
            } else {
                if (this.client.designMode) {
                    this._node = document.createElement("span");
                    this._node.id = this.component.renderId
                } else {
                    this._node = null
                }
            }
        }
        if (this._node) {
            if (a) {
                this._node.title = a
            }
            l.appendChild(this._node)
        }
    },
    renderDispose: function(a) {
        this._containerElement = null;
        this._node = null
    },
    renderUpdate: function(a) {
        if (this._node) {
            this._node.parentNode.removeChild(this._node)
        }
        this.renderAdd(a, this._containerElement);
        return false
    }
});
Echo.Sync.SplitPane = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        ChildPane: Core.extend({
            minimumSize: 0,
            maximumSize: null,
            component: null,
            layoutData: null,
            scrollLeft: 0,
            scrollTop: 0,
            scrollRequired: false,
            _permanentSizes: false,
            _peer: null,
            $construct: function(b, a) {
                this._peer = b;
                this.component = a;
                this.layoutData = a.render("layoutData")
            },
            loadDisplayData: function() {
                if (this._permanentSizes) {
                    return
                }
                var a;
                this._permanentSizes = true;
                if (this.layoutData) {
                    if (this.layoutData.minimumSize) {
                        if (Echo.Sync.Extent.isPercent(this.layoutData.minimumSize)) {
                            a = this._peer._getSize();
                            this.minimumSize = Math.round((this._peer._orientationVertical ? a.height : a.width) * parseInt(this.layoutData.minimumSize, 10) / 100);
                            this._permanentSizes = false
                        } else {
                            this.minimumSize = Math.round(Echo.Sync.Extent.toPixels(this.layoutData.minimumSize, !this._peer._orientationVertical))
                        }
                    }
                    if (this.layoutData.maximumSize) {
                        if (Echo.Sync.Extent.isPercent(this.layoutData.maximumSize)) {
                            a = this._peer._getSize();
                            this.maximumSize = Math.round((this._peer._orientationVertical ? a.height : a.width) * parseInt(this.layoutData.maximumSize, 10) / 100);
                            this._permanentSizes = false
                        } else {
                            this.maximumSize = Math.round(Echo.Sync.Extent.toPixels(this.layoutData.maximumSize, !this._peer._orientationVertical))
                        }
                    }
                }
            },
            loadScrollPositions: function(a) {
                a.scrollLeft = this.scrollLeft;
                a.scrollTop = this.scrollTop
            },
            storeScrollPositions: function(a) {
                this.scrollLeft = a.scrollLeft;
                this.scrollTop = a.scrollTop
            }
        })
    },
    $load: function() {
        Echo.Render.registerPeer("SplitPane", this)
    },
    _childPanes: null,
    _paneDivs: null,
    _separatorDiv: null,
    _autoPositioned: false,
    _overlay: null,
    _redisplayRequired: false,
    _requested: null,
    _rendered: null,
    _processSeparatorMouseMoveRef: null,
    _processSeparatorMouseUpRef: null,
    _initialAutoSizeComplete: false,
    _size: null,
    $construct: function() {
        this._childPanes = [];
        this._paneDivs = [];
        this._processSeparatorMouseMoveRef = Core.method(this, this._processSeparatorMouseMove);
        this._processSeparatorMouseUpRef = Core.method(this, this._processSeparatorMouseUp)
    },
    clientKeyDown: function(f) {
        var a, c, d, b;
        switch (f.keyCode) {
            case 37:
            case 39:
                if (!this._orientationVertical) {
                    a = (f.keyCode == 37) ^ (!this._orientationTopLeft);
                    c = this.client.application.getFocusedComponent();
                    if (c && c.peer && c.peer.getFocusFlags) {
                        d = c.peer.getFocusFlags();
                        if ((a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT) || (!a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                            b = this.client.application.focusManager.findInParent(this.component, a);
                            if (b) {
                                this.client.application.setFocusedComponent(b);
                                Core.Web.DOM.preventEventDefault(f.domEvent);
                                return false
                            }
                        }
                    }
                }
                break;
            case 38:
            case 40:
                if (this._orientationVertical) {
                    a = (f.keyCode == 38) ^ (!this._orientationTopLeft);
                    c = this.client.application.getFocusedComponent();
                    if (c && c.peer && c.peer.getFocusFlags) {
                        d = c.peer.getFocusFlags();
                        if ((a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP) || (!a && d & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                            b = this.client.application.focusManager.findInParent(this.component, a);
                            if (b) {
                                this.client.application.setFocusedComponent(b);
                                Core.Web.DOM.preventEventDefault(f.domEvent);
                                return false
                            }
                        }
                    }
                }
                break
        }
        return true
    },
    _getBoundedSeparatorPosition: function(a) {
        if (this._childPanes[1]) {
            var b = this._orientationVertical ? this._getSize().height : this._getSize().width;
            if (a > b - this._childPanes[1].minimumSize - this._separatorSize) {
                a = b - this._childPanes[1].minimumSize - this._separatorSize
            } else {
                if (this._childPanes[1].maximumSize != null && a < b - this._childPanes[1].maximumSize - this._separatorSize) {
                    a = b - this._childPanes[1].maximumSize - this._separatorSize
                }
            }
        }
        if (this._childPanes[0]) {
            if (a < this._childPanes[0].minimumSize) {
                a = this._childPanes[0].minimumSize
            } else {
                if (this._childPanes[0].maximumSize != null && a > this._childPanes[0].maximumSize) {
                    a = this._childPanes[0].maximumSize
                }
            }
        }
        return a
    },
    _getInsetsSizeAdjustment: function(a, d) {
        if (!d || d.insets == null) {
            return 0
        }
        var c = Echo.Sync.Insets.toPixels(d.insets);
        var b;
        if (this._orientationVertical) {
            b = c.top + c.bottom
        } else {
            b = c.left + c.right
        }
        if (a != null && b > a) {
            b = a
        }
        return b
    },
    getPreferredSize: function(h) {
        if (this.component.children.length === 0) {
            return null
        }
        var e, b, g;
        h = h || (Echo.Render.ComponentSync.SIZE_WIDTH | Echo.Render.ComponentSync.SIZE_HEIGHT);
        var f;
        if (this.component.children[0].peer.getPreferredSize) {
            f = this.component.children[0].peer.getPreferredSize(h) || {}
        } else {
            if (!this.component.children[0].pane && (h & Echo.Render.ComponentSync.SIZE_HEIGHT) && this._paneDivs[0].firstChild) {
                e = new Core.Web.Measure.Bounds(this._paneDivs[0].firstChild);
                f = {
                    height: e.height === 0 ? null : e.height
                };
                if (f.height) {
                    g = this.component.children[0].render("layoutData");
                    if (g && g.insets) {
                        b = Echo.Sync.Insets.toPixels(g.insets);
                        f.height += b.top + b.bottom
                    }
                }
            } else {
                f = {}
            }
        }
        var d;
        if (this.component.children.length == 1) {
            d = {
                width: 0,
                height: 0
            }
        } else {
            if (this.component.children[1].peer.getPreferredSize) {
                d = this.component.children[1].peer.getPreferredSize(h) || {}
            } else {
                if (!this.component.children[1].pane && (h & Echo.Render.ComponentSync.SIZE_HEIGHT) && this._paneDivs[1].firstChild) {
                    e = new Core.Web.Measure.Bounds(this._paneDivs[1].firstChild);
                    d = {
                        height: e.height === 0 ? null : e.height
                    };
                    if (d.height) {
                        g = this.component.children[1].render("layoutData");
                        if (g && g.insets) {
                            b = Echo.Sync.Insets.toPixels(g.insets);
                            d.height += b.top + b.bottom
                        }
                    }
                } else {
                    d = {}
                }
            }
        }
        var a = null;
        if ((h & Echo.Render.ComponentSync.SIZE_HEIGHT) && f.height != null && d.height != null) {
            if (this._orientationVertical) {
                a = f.height + d.height + this._separatorSize
            } else {
                a = f.height > d.height ? f.height : d.height
            }
        }
        var c = null;
        if ((h & Echo.Render.ComponentSync.SIZE_WIDTH) && f.width != null && d.width != null) {
            if (this._orientationVertical) {
                c = f.width > d.width ? f.width : d.width
            } else {
                c = f.width + d.width + this._separatorSize
            }
        }
        return {
            height: a,
            width: c
        }
    },
    _getSize: function() {
        if (!this._size) {
            this._size = new Core.Web.Measure.Bounds(this._splitPaneDiv)
        }
        return this._size
    },
    _hasRelocatedChildren: function(f) {
        var c = this._childPanes[0] ? this._childPanes[0].component : null;
        var b = this._childPanes[1] ? this._childPanes[1].component : null;
        var a = this.component.getComponentCount();
        var e = a > 0 ? this.component.getComponent(0) : null;
        var d = a > 1 ? this.component.getComponent(1) : null;
        return (c != null && c == d) || (b != null && b == e)
    },
    _loadRenderData: function() {
        var a = this.component.render("orientation", Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING);
        switch (a) {
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING:
                this._orientationTopLeft = this.component.getRenderLayoutDirection().isLeftToRight();
                this._orientationVertical = false;
                break;
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING:
                this._orientationTopLeft = !this.component.getRenderLayoutDirection().isLeftToRight();
                this._orientationVertical = false;
                break;
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT:
                this._orientationTopLeft = true;
                this._orientationVertical = false;
                break;
            case Echo.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT:
                this._orientationTopLeft = false;
                this._orientationVertical = false;
                break;
            case Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM:
                this._orientationTopLeft = true;
                this._orientationVertical = true;
                break;
            case Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP:
                this._orientationTopLeft = false;
                this._orientationVertical = true;
                break;
            default:
                throw new Error("Invalid orientation: " + a)
        }
        this._resizable = this.component.render("resizable");
        this._autoPositioned = this.component.render("autoPositioned");
        this._requested = this.component.render("separatorPosition");
        var b = this._resizable ? Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_RESIZABLE : Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_FIXED;
        var c = this.component.render(this._orientationVertical ? "separatorHeight" : "separatorWidth", b);
        this._separatorSize = Echo.Sync.Extent.toPixels(c, this._orientationVertical);
        if (this._separatorSize == null) {
            this._separatorSize = b
        }
        this._separatorVisible = this._resizable || (this.component.render("separatorVisible", true) && this._separatorSize > 0);
        if (!this._separatorVisible) {
            this._separatorSize = 0
        }
        if (this._separatorSize > 0) {
            this._separatorColor = this.component.render("separatorColor", Echo.SplitPane.DEFAULT_SEPARATOR_COLOR);
            this._separatorRolloverColor = this.component.render("separatorRolloverColor") || Echo.Sync.Color.adjust(this._separatorColor, 32, 32, 32);
            this._separatorImage = this.component.render(this._orientationVertical ? "separatorVerticalImage" : "separatorHorizontalImage");
            this._separatorRolloverImage = this.component.render(this._orientationVertical ? "separatorVerticalRolloverImage" : "separatorHorizontalRolloverImage")
        }
    },
    _overlayAdd: function() {
        if (this._overlay) {
            return
        }
        this._overlay = document.createElement("div");
        this._overlay.style.cssText = "position:absolute;z-index:32600;width:100%;height:100%;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay);
        document.body.appendChild(this._overlay)
    },
    _overlayRemove: function() {
        if (!this._overlay) {
            return
        }
        document.body.removeChild(this._overlay);
        this._overlay = null
    },
    _processSeparatorMouseDown: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        Core.Web.DOM.preventEventDefault(a);
        Core.Web.dragInProgress = true;
        this._dragInitPosition = this._rendered;
        if (this._orientationVertical) {
            this._dragInitMouseOffset = a.clientY
        } else {
            this._dragInitMouseOffset = a.clientX
        }
        Core.Web.Event.add(document.body, "mousemove", this._processSeparatorMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processSeparatorMouseUpRef, true);
        this._overlayAdd()
    },
    _processSeparatorMouseMove: function(a) {
        var b = this._orientationVertical ? a.clientY : a.clientX;
        this._rendered = this._getBoundedSeparatorPosition(this._orientationTopLeft ? this._dragInitPosition + b - this._dragInitMouseOffset : this._dragInitPosition - b + this._dragInitMouseOffset);
        this._redraw(this._rendered)
    },
    _processSeparatorMouseUp: function(a) {
        Core.Web.DOM.preventEventDefault(a);
        this._overlayRemove();
        Core.Web.dragInProgress = false;
        this._removeSeparatorListeners();
        this.component.set("separatorPosition", this._rendered);
        this._requested = this._rendered;
        if (this._paneDivs[0]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[0])
        }
        if (this._paneDivs[1]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[1])
        }
        Echo.Render.notifyResize(this.component)
    },
    _processSeparatorRolloverEnter: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        if (this._separatorRolloverImage) {
            Echo.Sync.FillImage.render(this._separatorRolloverImage, this._separatorDiv, 0)
        } else {
            Echo.Sync.Color.render(this._separatorRolloverColor, this._separatorDiv, "backgroundColor")
        }
    },
    _processSeparatorRolloverExit: function(a) {
        if (this._separatorRolloverImage) {
            Echo.Sync.FillImage.renderClear(this._separatorImage, this._separatorDiv, 0)
        } else {
            Echo.Sync.Color.render(this._separatorColor, this._separatorDiv, "backgroundColor")
        }
    },
    _redraw: function(b) {
        var e = 0;
        if (this.component.getComponentCount() > 0) {
            var d = this.component.getComponent(0).render("layoutData");
            e = this._getInsetsSizeAdjustment(b, d)
        }
        var a = this._orientationVertical ? "height" : "width";
        var c = this._orientationVertical ? (this._orientationTopLeft ? "top" : "bottom") : (this._orientationTopLeft ? "left" : "right");
        if (this._paneDivs[0]) {
            this._paneDivs[0].style[a] = (b - e) + "px"
        }
        if (this._paneDivs[1]) {
            this._paneDivs[1].style[c] = (b + this._separatorSize) + "px"
        }
        if (this._separatorDiv) {
            this._separatorDiv.style[c] = b + "px"
        }
    },
    _removeSeparatorListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processSeparatorMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processSeparatorMouseUpRef, true)
    },
    renderAdd: function(h, a) {
        this._initialAutoSizeComplete = false;
        this._loadRenderData();
        var b = this.component.getComponentCount();
        if (b > 2) {
            throw new Error("Cannot render SplitPane with more than two child components.")
        }
        var f = b < 1 ? null : this.component.getComponent(0);
        var d = b < 2 ? null : this.component.getComponent(1);
        this._splitPaneDiv = document.createElement("div");
        this._splitPaneDiv.id = this.component.renderId;
        this._splitPaneDiv.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;right:0;bottom:0;";
        Echo.Sync.renderComponentDefaults(this.component, this._splitPaneDiv);
        if (this._separatorVisible) {
            this._separatorDiv = document.createElement("div");
            this._separatorDiv.style.cssText = "position:absolute;font-size:1px;line-height:0;z-index:2;";
            Echo.Sync.Color.render(this._separatorColor, this._separatorDiv, "backgroundColor");
            var e = null;
            if (this._orientationVertical) {
                e = this._orientationTopLeft ? "s-resize" : "n-resize";
                this._separatorDiv.style.width = "100%";
                this._separatorDiv.style.height = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this._separatorImage, this._separatorDiv, 0)
            } else {
                e = this._orientationTopLeft ? "e-resize" : "w-resize";
                this._separatorDiv.style.height = "100%";
                this._separatorDiv.style.width = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this._separatorImage, this._separatorDiv, 0)
            }
            if (this._resizable && e) {
                this._separatorDiv.style.cursor = e
            }
            this._splitPaneDiv.appendChild(this._separatorDiv)
        } else {
            this._separatorDiv = null
        }
        for (var c = 0; c < b && c < 2; ++c) {
            var g = this.component.getComponent(c);
            this._renderAddChild(h, g, c)
        }
        a.appendChild(this._splitPaneDiv);
        if (this._resizable) {
            Core.Web.Event.add(this._separatorDiv, "mousedown", Core.method(this, this._processSeparatorMouseDown), false);
            Core.Web.Event.add(this._separatorDiv, "mouseover", Core.method(this, this._processSeparatorRolloverEnter), false);
            Core.Web.Event.add(this._separatorDiv, "mouseout", Core.method(this, this._processSeparatorRolloverExit), false)
        }
    },
    _renderAddChild: function(f, e, b) {
        var d = this.component.indexOf(e);
        var a = document.createElement("div");
        this._paneDivs[b] = a;
        a.style.cssText = "position: absolute; overflow: auto; z-index: 1;";
        var c = e.render("layoutData");
        if (c) {
            Echo.Sync.Alignment.render(c.alignment, a, false, this.component);
            Echo.Sync.Color.render(c.background, a, "backgroundColor");
            Echo.Sync.FillImage.render(c.backgroundImage, a);
            if (!e.pane) {
                Echo.Sync.Insets.render(c.insets, a, "padding");
                switch (c.overflow) {
                    case Echo.SplitPane.OVERFLOW_HIDDEN:
                        a.style.overflow = "hidden";
                        break;
                    case Echo.SplitPane.OVERFLOW_SCROLL:
                        a.style.overflow = "scroll";
                        break
                }
            }
        }
        if (e.pane) {
            a.style.overflow = "hidden"
        }
        if (this._orientationVertical) {
            a.style.left = 0;
            a.style.right = 0;
            if ((this._orientationTopLeft && b === 0) || (!this._orientationTopLeft && b == 1)) {
                a.style.top = 0
            } else {
                a.style.bottom = 0
            }
        } else {
            a.style.top = "0";
            a.style.bottom = "0";
            if ((this._orientationTopLeft && b === 0) || (!this._orientationTopLeft && b == 1)) {
                a.style.left = 0
            } else {
                a.style.right = 0
            }
        }
        Echo.Render.renderComponentAdd(f, e, a);
        this._splitPaneDiv.appendChild(a);
        if (this._childPanes[b] && this._childPanes[b].component == e) {
            this._childPanes[b].scrollRequired = true
        } else {
            this._childPanes[b] = new Echo.Sync.SplitPane.ChildPane(this, e)
        }
    },
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._splitPaneDiv);
        Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        Core.Web.VirtualPosition.redraw(this._paneDivs[1]);
        this._size = null;
        if (this._childPanes[0]) {
            this._childPanes[0].loadDisplayData()
        }
        if (this._childPanes[1]) {
            this._childPanes[1].loadDisplayData()
        }
        var a = this._requested;
        if (a == null && this._autoPositioned && this._paneDivs[0]) {
            if (this.component.children[0].peer.getPreferredSize) {
                var c = this.component.children[0].peer.getPreferredSize(this._orientationVertical ? Echo.Render.ComponentSync.SIZE_HEIGHT : Echo.Render.ComponentSync.SIZE_WIDTH);
                a = c ? (this._orientationVertical ? c.height : c.width) : null
            }
            if (a == null && this._orientationVertical && !this.component.children[0].pane) {
                this._paneDivs[0].style.height = "";
                var d = new Core.Web.Measure.Bounds(this._paneDivs[0]);
                a = d.height
            }
            if (a != null && !this._initialAutoSizeComplete) {
                this._initialAutoSizeComplete = true;
                var f = Core.method(this, function() {
                    if (this.component) {
                        Echo.Render.renderComponentDisplay(this.component)
                    }
                });
                Core.Web.Image.monitor(this._paneDivs[0], f)
            }
        }
        if (a == null) {
            a = Echo.SplitPane.DEFAULT_SEPARATOR_POSITION
        }
        if (Echo.Sync.Extent.isPercent(a)) {
            var b = this._orientationVertical ? this._getSize().height : this._getSize().width;
            a = Math.round((parseInt(a, 10) / 100) * b)
        } else {
            a = Math.round(Echo.Sync.Extent.toPixels(a, !this._orientationVertical))
        }
        this._rendered = this._getBoundedSeparatorPosition(a);
        this._redraw(this._rendered);
        Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        Core.Web.VirtualPosition.redraw(this._paneDivs[1]);
        for (var e = 0; e < this._childPanes.length; ++e) {
            if (this._childPanes[e] && this._childPanes[e].scrollRequired && this._paneDivs[e]) {
                this._childPanes[e].loadScrollPositions(this._paneDivs[e]);
                this._childPanes[e].scrollRequired = false
            }
        }
    },
    renderDispose: function(b) {
        this._overlayRemove();
        for (var a = 0; a < 2; ++a) {
            if (this._paneDivs[a]) {
                if (this._childPanes[a]) {
                    this._childPanes[a].storeScrollPositions(this._paneDivs[a])
                }
                this._paneDivs[a] = null
            }
        }
        if (this._separatorDiv) {
            Core.Web.Event.removeAll(this._separatorDiv);
            this._separatorDiv = null
        }
        Core.Web.Event.removeAll(this._splitPaneDiv);
        this._splitPaneDiv = null
    },
    _renderRemoveChild: function(c, b) {
        var a;
        if (this._childPanes[0] && this._childPanes[0].component == b) {
            a = 0
        } else {
            if (this._childPanes[1] && this._childPanes[1].component == b) {
                a = 1
            } else {
                return
            }
        }
        this._childPanes[a] = null;
        Core.Web.DOM.removeNode(this._paneDivs[a]);
        this._paneDivs[a] = null
    },
    renderUpdate: function(g) {
        var d = false,
            c;
        if (this._hasRelocatedChildren()) {
            d = true
        } else {
            if (g.hasUpdatedProperties() || g.hasUpdatedLayoutDataChildren()) {
                if (g.isUpdatedPropertySetIn({
                        separatorPosition: true
                    })) {
                    this._requested = this.component.render("separatorPosition")
                } else {
                    d = true
                }
            }
        }
        if (!d && (g.hasAddedChildren() || g.hasRemovedChildren())) {
            var a = g.getRemovedChildren();
            if (a) {
                for (c = 0; c < a.length; ++c) {
                    this._renderRemoveChild(g, a[c])
                }
            }
            var e = g.getAddedChildren();
            if (e) {
                for (c = 0; c < e.length; ++c) {
                    this._renderAddChild(g, e[c], this.component.indexOf(e[c]))
                }
            }
        }
        if (d) {
            var b = this._splitPaneDiv;
            var f = b.parentNode;
            Echo.Render.renderComponentDispose(g, g.parent);
            f.removeChild(b);
            this.renderAdd(g, f)
        }
        return d
    }
});
Echo.Sync.TextComponent = Core.extend(Echo.Render.ComponentSync, {
    $abstract: true,
    $virtual: {
        getSupportedPartialProperties: function() {
            return ["text", "editable", "selectionStart", "selectionEnd"]
        },
        processBlur: function(a) {
            this._focused = false;
            this._storeSelection();
            this._storeValue();
            return true
        },
        processFocus: function(a) {
            this._focused = true;
            if (this.client) {
                if (this.component.isActive()) {
                    this.client.application.setFocusedComponent(this.component)
                } else {
                    this._resetFocus()
                }
            }
            return false
        },
        sanitizeInput: function() {
            var a = this.component.render("maximumLength", -1);
            if (a >= 0) {
                if (this.input.value && this.input.value.length > a) {
                    this.input.value = this.input.value.substring(0, a)
                }
            }
        }
    },
    input: null,
    container: null,
    _focused: false,
    _lastProcessedValue: null,
    percentWidth: false,
    _selectionStart: 0,
    _selectionEnd: 0,
    _renderStyle: function() {
        if (this.component.isRenderEnabled()) {
            Echo.Sync.renderComponentDefaults(this.component, this.input);
            Echo.Sync.Border.render(this.component.render("border"), this.input);
            Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this.input)
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this.input);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), this.input, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), this.input, "backgroundColor");
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", true), this.input);
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true), this.input);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component, "backgroundImage", "disabledBackgroundImage", true), this.input)
        }
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.input, false, null);
        Echo.Sync.Insets.render(this.component.render("insets"), this.input, "padding");
        var d = this.component.render("focusEffectEnabled", true);
        if (!d) {
            this.input.style.outline = "none"
        }
        var b = this.component.render("width");
        this.percentWidth = Echo.Sync.Extent.isPercent(b);
        if (b) {
            if (this.percentWidth) {
                this.input.style.width = "5px"
            } else {
                this.input.style.width = Echo.Sync.Extent.toCssValue(b, true)
            }
        }
        var a = this.component.render("height");
        if (a) {
            this.input.style.height = Echo.Sync.Extent.toCssValue(a, false)
        }
        var c = this.component.render("toolTipText");
        if (c) {
            this.input.title = c
        }
    },
    _addEventHandlers: function() {
        Core.Web.Event.add(this.input, "keydown", Core.method(this, this._processKeyDown), false);
        Core.Web.Event.add(this.input, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this.input, "focus", Core.method(this, this.processFocus), false);
        Core.Web.Event.add(this.input, "blur", Core.method(this, this.processBlur), false)
    },
    _adjustPercentWidth: function(a, d, b) {
        var c = (100 - (100 * d / b)) * a / 100;
        return c > 0 ? c : 0
    },
    clientKeyDown: function(a) {
        this._storeValue(a);
        if (this.client && this.component.isActive()) {
            if (!this.component.doKeyDown(a.keyCode)) {
                Core.Web.DOM.preventEventDefault(a.domEvent)
            }
        }
        return true
    },
    clientKeyPress: function(a) {
        this._storeValue(a);
        if (this.client && this.component.isActive()) {
            if (!this.component.doKeyPress(a.keyCode, a.charCode)) {
                Core.Web.DOM.preventEventDefault(a.domEvent)
            }
        }
        return true
    },
    clientKeyUp: function(a) {
        this._storeSelection();
        this._storeValue(a);
        return true
    },
    _processClick: function(a) {
        if (!this.client || !this.component.isActive()) {
            Core.Web.DOM.preventEventDefault(a);
            return true
        }
        this.client.application.setFocusedComponent(this.component);
        this._storeSelection();
        return false
    },
    _processKeyDown: function(a) {
        if (!this.component.isActive()) {
            Core.Web.DOM.preventEventDefault(a)
        }
        return true
    },
    _processRestrictionsClear: function() {
        if (!this.client) {
            return
        }
        if (!this.client.verifyInput(this.component) || this.input.readOnly) {
            this.input.value = this.component.get("text");
            return
        }
        this.component.set("text", this.input.value, true)
    },
    _resetFocus: function() {
        var b = document.createElement("div");
        b.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;";
        var a = document.createElement("input");
        a.type = "text";
        b.appendChild(a);
        document.body.appendChild(b);
        a.focus();
        document.body.removeChild(b);
        b = null;
        a = null;
        this.client.forceRedraw();
        Echo.Render.updateFocus(this.client)
    },
    renderAddToParent: function(a) {
        if (Core.Web.Env.ENGINE_MSHTML && this.percentWidth) {
            this.container = document.createElement("div");
            this.container.appendChild(this.input);
            a.appendChild(this.container)
        } else {
            a.appendChild(this.input)
        }
    },
    renderDisplay: function() {
        var d = this.component.render("width");
        if (d && Echo.Sync.Extent.isPercent(d) && this.input.parentNode.offsetWidth) {
            var b = this.component.render("border");
            var c = b ? (Echo.Sync.Border.getPixelSize(b, "left") + Echo.Sync.Border.getPixelSize(b, "right")) : 4;
            var a = this.component.render("insets");
            if (a) {
                var e = Echo.Sync.Insets.toPixels(a);
                c += e.left + e.right
            }
            if (Core.Web.Env.ENGINE_MSHTML) {
                c += 1;
                if (this.container) {
                    this.container.style.width = this._adjustPercentWidth(100, Core.Web.Measure.SCROLL_WIDTH, this.input.parentNode.offsetWidth) + "%"
                } else {
                    c += Core.Web.Measure.SCROLL_WIDTH
                }
            } else {
                if (Core.Web.Env.BROWSER_CHROME && this.input.nodeName.toLowerCase() == "textarea") {
                    c += 3
                } else {
                    if (Core.Web.Env.BROWSER_SAFARI && this.input.nodeName.toLowerCase() == "input") {
                        c += 1
                    } else {
                        if (Core.Web.Env.ENGINE_PRESTO) {
                            c += 1
                        }
                    }
                }
            }
            this.input.style.width = this._adjustPercentWidth(parseInt(d, 10), c, this.input.parentNode.offsetWidth) + "%"
        }
    },
    renderDispose: function(a) {
        Core.Web.Event.removeAll(this.input);
        this._focused = false;
        this.input = null;
        this.container = null
    },
    renderFocus: function() {
        if (this._focused) {
            return
        }
        this._focused = true;
        Core.Web.DOM.focusElement(this.input)
    },
    renderUpdate: function(g) {
        var c = !Core.Arrays.containsAll(this.getSupportedPartialProperties(), g.getUpdatedPropertyNames(), true);
        if (c) {
            var a = this.container ? this.container : this.input;
            var f = a.parentNode;
            this.renderDispose(g);
            f.removeChild(a);
            this.renderAdd(g, f)
        } else {
            if (g.hasUpdatedProperties()) {
                var e = g.getUpdatedProperty("text");
                if (e) {
                    var d = e.newValue == null ? "" : e.newValue;
                    if (d != this._lastProcessedValue) {
                        this.input.value = d;
                        this._lastProcessedValue = d
                    }
                }
                var b = g.getUpdatedProperty("editable");
                if (b != null) {
                    this.input.readOnly = !b.newValue
                }
            }
        }
        return false
    },
    _storeSelection: function() {
        var a, b;
        if (!this.component) {
            return
        }
        if (!Core.Web.Env.NOT_SUPPORTED_INPUT_SELECTION) {
            this._selectionStart = this.input.selectionStart;
            this._selectionEnd = this.input.selectionEnd
        } else {
            if (Core.Web.Env.PROPRIETARY_IE_RANGE) {
                a = document.selection.createRange();
                if (a.parentElement() != this.input) {
                    return
                }
                b = a.duplicate();
                if (this.input.nodeName.toLowerCase() == "textarea") {
                    b.moveToElementText(this.input)
                } else {
                    b.expand("textedit")
                }
                b.setEndPoint("EndToEnd", a);
                this._selectionStart = b.text.length - a.text.length;
                this._selectionEnd = this._selectionStart + a.text.length
            } else {
                return
            }
        }
        this.component.set("selectionStart", this._selectionStart, true);
        this.component.set("selectionEnd", this._selectionEnd, true)
    },
    _storeValue: function(a) {
        if (!this.client || !this.component.isActive()) {
            if (a) {
                Core.Web.DOM.preventEventDefault(a)
            }
            return
        }
        this.sanitizeInput();
        if (!this.client.verifyInput(this.component)) {
            this.client.registerRestrictionListener(this.component, Core.method(this, this._processRestrictionsClear));
            return
        }
        this.component.set("text", this.input.value, true);
        this._lastProcessedValue = this.input.value;
        if (a && a.keyCode == 13 && a.type == "keydown") {
            this.component.doAction()
        }
    }
});
Echo.Sync.TextArea = Core.extend(Echo.Sync.TextComponent, {
    $load: function() {
        Echo.Render.registerPeer("TextArea", this)
    },
    renderAdd: function(b, a) {
        this.input = document.createElement("textarea");
        this.input.id = this.component.renderId;
        if (!this.component.render("editable", true)) {
            this.input.readOnly = true
        }
        this._renderStyle(this.input);
        this.input.style.overflow = "auto";
        this._addEventHandlers(this.input);
        if (this.component.get("text")) {
            this.input.value = this.component.get("text")
        }
        this.renderAddToParent(a)
    }
});
Echo.Sync.TextField = Core.extend(Echo.Sync.TextComponent, {
    $load: function() {
        Echo.Render.registerPeer("TextField", this)
    },
    $virtual: {
        _type: "text"
    },
    getFocusFlags: function() {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN
    },
    renderAdd: function(c, a) {
        this.input = document.createElement("input");
        this.input.id = this.component.renderId;
        if (!this.component.render("editable", true)) {
            this.input.readOnly = true
        }
        this.input.type = this._type;
        var b = this.component.render("maximumLength", -1);
        if (b >= 0) {
            this.input.maxLength = b
        }
        this._renderStyle(this.input);
        this._addEventHandlers(this.input);
        if (this.component.get("text")) {
            this.input.value = this.component.get("text")
        }
        this.renderAddToParent(a)
    },
    sanitizeInput: function() {}
});
Echo.Sync.PasswordField = Core.extend(Echo.Sync.TextField, {
    $load: function() {
        Echo.Render.registerPeer("PasswordField", this)
    },
    _type: "password"
});
Echo.Sync.WindowPane = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        CURSORS: ["n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize"],
        PARTIAL_PROPERTIES: {
            background: true,
            backgroundImage: true,
            border: true,
            closable: true,
            closeIcon: true,
            closeIconInsets: true,
            controlsInsets: true,
            font: true,
            foreground: true,
            height: true,
            icon: true,
            iconInsets: true,
            insets: true,
            maximizeEnabled: true,
            maximizeIcon: true,
            maximumHeight: true,
            maximumWidth: true,
            minimizeEnabled: true,
            minimizeIcon: true,
            minimumHeight: true,
            minimumWidth: true,
            movable: true,
            positionX: true,
            positionY: true,
            resizable: true,
            title: true,
            titleBackground: true,
            titleBackgroundImage: true,
            titleFont: true,
            titleForeground: true,
            titleHeight: true,
            titleInsets: true,
            width: true
        },
        NON_RENDERED_PROPERTIES: {
            zIndex: true
        },
        PARTIAL_PROPERTIES_POSITION_SIZE: {
            positionX: true,
            positionY: true,
            width: true,
            height: true
        },
        FadeRunnable: Core.extend(Core.Web.Scheduler.Runnable, {
            timeInterval: 20,
            repeat: true,
            _directionOut: false,
            _div: null,
            _completeMethod: null,
            _time: null,
            $construct: function(d, c, a, b) {
                this._directionOut = c;
                this._div = d;
                this._completeMethod = b;
                this._time = a
            },
            run: function() {
                if (!this._startTime) {
                    this._startTime = new Date().getTime()
                }
                var a = (new Date().getTime() - this._startTime) / this._time;
                if (a > 1) {
                    a = 1
                }
                this._div.style.opacity = this._directionOut ? 1 - a : a;
                if (a === 1) {
                    this.repeat = false;
                    if (this._completeMethod) {
                        this._completeMethod();
                        this._completeMethod = null
                    }
                }
            }
        })
    },
    $load: function() {
        Echo.Render.registerPeer("WindowPane", this)
    },
    _initialRenderDisplayComplete: false,
    _displayed: false,
    _requested: null,
    _rendered: null,
    _dragInit: null,
    _dragOrigin: null,
    _resizeIncrement: null,
    _containerSize: null,
    _processBorderMouseMoveRef: null,
    _processBorderMouseUpRef: null,
    _processTitleBarMouseMoveRef: null,
    _processTitleBarMouseUpRef: null,
    _controlIcons: null,
    _overlay: null,
    _closeAnimationTime: null,
    _opening: false,
    _imageWaitStartTime: null,
    $construct: function() {
        this._processBorderMouseMoveRef = Core.method(this, this._processBorderMouseMove);
        this._processBorderMouseUpRef = Core.method(this, this._processBorderMouseUp);
        this._processTitleBarMouseMoveRef = Core.method(this, this._processTitleBarMouseMove);
        this._processTitleBarMouseUpRef = Core.method(this, this._processTitleBarMouseUp)
    },
    _centerIcon: function() {
        if (!this._titleIconImg || !this._titleIconImg.complete || !this._titleIconImg.height) {
            return
        }
        var b = Echo.Sync.Insets.toPixels(this.component.render("iconInsets"));
        var a = parseInt(this._titleBarDiv.style.height, 10) - b.top - b.bottom - this._titleIconImg.height;
        if (a <= 0) {
            return
        }
        this._titleIconDiv.style.paddingTop = Math.floor(a / 2) + "px"
    },
    _imageLoadListener: function(a) {
        if (!this.component) {
            return
        }
        if (this._titleIconImgLoading && this._titleIconImg.complete) {
            this._titleIconImgLoading = false;
            this._titleBarDiv.style.height = "";
            this._titleBarHeight = new Core.Web.Measure.Bounds(this._titleBarDiv).height || Echo.Sync.Extent.toPixels(Echo.WindowPane.DEFAULT_TITLE_HEIGHT);
            this._titleBarDiv.style.height = this._titleBarHeight + "px";
            this._contentDiv.style.top = (this._contentInsets.top + this._titleBarHeight) + "px"
        }
        if (a.complete) {
            this._imageWaitStartTime = null
        }
        Echo.Render.renderComponentDisplay(this.component)
    },
    _loadPositionAndSize: function() {
        this._requested = {
            x: this.component.render("positionX", "50%"),
            y: this.component.render("positionY", "50%"),
            contentWidth: this.component.render("contentWidth"),
            contentHeight: this.component.render("contentHeight")
        };
        this._requested.width = this.component.render("width", this._requested.contentWidth ? null : Echo.WindowPane.DEFAULT_WIDTH);
        this._requested.height = this.component.render("height")
    },
    _loadContainerSize: function() {
        this._containerSize = this.component.parent.peer.getSize()
    },
    _overlayAdd: function() {
        if (this._overlay) {
            return
        }
        this._overlay = document.createElement("div");
        this._overlay.style.cssText = "position:absolute;z-index:32600;width:100%;height:100%;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay);
        document.body.appendChild(this._overlay)
    },
    _overlayRemove: function() {
        if (!this._overlay) {
            return
        }
        document.body.removeChild(this._overlay);
        this._overlay = null
    },
    _processBorderMouseDown: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(a);
        this._overlayAdd();
        this._loadContainerSize();
        this._dragInit = {
            x: this._rendered.x,
            y: this._rendered.y,
            width: this._rendered.width,
            height: this._rendered.height
        };
        this._dragOrigin = {
            x: a.clientX,
            y: a.clientY
        };
        switch (a.target) {
            case this._borderDivs[0]:
                this._resizeIncrement = {
                    x: 0,
                    y: -1
                };
                break;
            case this._borderDivs[1]:
                this._resizeIncrement = {
                    x: 1,
                    y: -1
                };
                break;
            case this._borderDivs[2]:
                this._resizeIncrement = {
                    x: 1,
                    y: 0
                };
                break;
            case this._borderDivs[3]:
                this._resizeIncrement = {
                    x: 1,
                    y: 1
                };
                break;
            case this._borderDivs[4]:
                this._resizeIncrement = {
                    x: 0,
                    y: 1
                };
                break;
            case this._borderDivs[5]:
                this._resizeIncrement = {
                    x: -1,
                    y: 1
                };
                break;
            case this._borderDivs[6]:
                this._resizeIncrement = {
                    x: -1,
                    y: 0
                };
                break;
            case this._borderDivs[7]:
                this._resizeIncrement = {
                    x: -1,
                    y: -1
                };
                break
        }
        Core.Web.Event.add(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processBorderMouseUpRef, true)
    },
    _processBorderMouseMove: function(a) {
        this._setBounds({
            x: this._resizeIncrement.x == -1 ? this._dragInit.x + a.clientX - this._dragOrigin.x : null,
            y: this._resizeIncrement.y == -1 ? this._dragInit.y + a.clientY - this._dragOrigin.y : null,
            width: this._dragInit.width + (this._resizeIncrement.x * (a.clientX - this._dragOrigin.x)),
            height: this._dragInit.height + (this._resizeIncrement.y * (a.clientY - this._dragOrigin.y))
        }, true);
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div)
    },
    _processBorderMouseUp: function(a) {
        Core.Web.DOM.preventEventDefault(a);
        Core.Web.dragInProgress = false;
        this._overlayRemove();
        this._removeBorderListeners();
        this.component.set("positionX", this._rendered.x);
        this.component.set("positionY", this._rendered.y);
        this.component.set("width", this._rendered.width);
        this.component.set("height", this._rendered.height);
        this._requested = {
            x: this._rendered.x,
            y: this._rendered.y,
            width: this._rendered.width,
            height: this._rendered.height
        };
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
        Echo.Render.notifyResize(this.component)
    },
    _processControlClick: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        switch (a.registeredTarget._controlData.name) {
            case "close":
                this.component.userClose();
                break;
            case "maximize":
                this.component.userMaximize();
                Echo.Render.processUpdates(this.client);
                break;
            case "minimize":
                this.component.userMinimize();
                break
        }
    },
    _processControlRolloverEnter: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        Echo.Sync.ImageReference.renderImg(a.registeredTarget._controlData.rolloverIcon, a.registeredTarget.firstChild)
    },
    _processControlRolloverExit: function(a) {
        Echo.Sync.ImageReference.renderImg(a.registeredTarget._controlData.icon, a.registeredTarget.firstChild)
    },
    renderContentPaneRemove: function(a, b) {
        if (this._closeAnimationTime > 0) {
            Core.Web.Scheduler.add(new Echo.Sync.WindowPane.FadeRunnable(a, true, this._closeAnimationTime, b));
            return true
        } else {
            return false
        }
    },
    clientKeyDown: function(a) {
        if (a.keyCode == 27) {
            if (this.component.render("closable", true)) {
                this.component.userClose();
                Core.Web.DOM.preventEventDefault(a.domEvent);
                return false
            }
        }
        return true
    },
    _processFocusClick: function(a) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        this.component.parent.peer.raise(this.component);
        return true
    },
    _processTitleBarMouseDown: function(b) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        var a = b.target;
        while (a != b.registeredTarget) {
            if (a._controlData) {
                return
            }
            a = a.parentNode
        }
        this.component.parent.peer.raise(this.component);
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(b);
        this._overlayAdd();
        this._loadContainerSize();
        this._dragInit = {
            x: this._rendered.x,
            y: this._rendered.y
        };
        this._dragOrigin = {
            x: b.clientX,
            y: b.clientY
        };
        Core.Web.Event.add(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processTitleBarMouseUpRef, true)
    },
    _processTitleBarMouseMove: function(a) {
        this._setBounds({
            x: this._dragInit.x + a.clientX - this._dragOrigin.x,
            y: this._dragInit.y + a.clientY - this._dragOrigin.y
        }, true)
    },
    _processTitleBarMouseUp: function(a) {
        Core.Web.dragInProgress = false;
        this._overlayRemove();
        this._removeTitleBarListeners();
        this.component.set("positionX", this._rendered.x);
        this.component.set("positionY", this._rendered.y);
        this._requested.x = this._rendered.x;
        this._requested.y = this._rendered.y
    },
    _redraw: function() {
        if (this._rendered.width <= 0 || this._rendered.height <= 0) {
            return
        }
        var b = this._rendered.width - this._borderInsets.left - this._borderInsets.right;
        var a = this._rendered.height - this._borderInsets.top - this._borderInsets.bottom;
        this._div.style.left = this._rendered.x + "px";
        this._div.style.top = this._rendered.y + "px";
        this._div.style.width = this._rendered.width + "px";
        this._div.style.height = this._rendered.height + "px";
        this._titleBarDiv.style.width = (this._rendered.width - this._contentInsets.left - this._contentInsets.right) + "px";
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv)
    },
    _removeBorderListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processBorderMouseUpRef, true)
    },
    _removeTitleBarListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processTitleBarMouseUpRef, true)
    },
    renderAdd: function(d, b) {
        this._opening = d.parent == this.component.parent;
        this._rtl = !this.component.getRenderLayoutDirection().isLeftToRight();
        this._closeAnimationTime = Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY ? 0 : this.component.render("closeAnimationTime", 0);
        this._contentDiv = document.createElement("div");
        var c = this.component.getComponentCount();
        if (c == 1) {
            Echo.Render.renderComponentAdd(d, this.component.getComponent(0), this._contentDiv)
        } else {
            if (c > 1) {
                throw new Error("Too many children: " + c)
            }
        }
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            this._maskDiv = document.createElement("div");
            this._maskDiv.style.cssText = "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth:0;";
            var a = document.createElement("iframe");
            a.style.cssText = "width:100%;height:100%;";
            a.src = this.client.getResourceUrl("Echo", "resource/Blank.html");
            this._maskDiv.appendChild(a)
        }
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._div);
        this._renderAddFrame(b)
    },
    _renderAddFrame: function(f) {
        this._initialRenderDisplayComplete = false;
        this._loadPositionAndSize();
        this._minimumWidth = Echo.Sync.Extent.toPixels(this.component.render("minimumWidth", Echo.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
        this._minimumHeight = Echo.Sync.Extent.toPixels(this.component.render("minimumHeight", Echo.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
        this._maximumWidth = Echo.Sync.Extent.toPixels(this.component.render("maximumWidth"), true);
        this._maximumHeight = Echo.Sync.Extent.toPixels(this.component.render("maximumHeight"), false);
        this._resizable = this.component.render("resizable", true);
        var o = this.component.render("border", Echo.WindowPane.DEFAULT_BORDER);
        this._borderInsets = Echo.Sync.Insets.toPixels(o.borderInsets);
        this._contentInsets = Echo.Sync.Insets.toPixels(o.contentInsets);
        var e = this.component.render("movable", true);
        var g = this.component.render("closable", true);
        var h = this.component.render("maximizeEnabled", false);
        var c = this.component.render("minimizeEnabled", false);
        var d = g || h || c;
        var b = this.component.render("ieAlphaRenderBorder") ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        this._div = Echo.Sync.FillImageBorder.renderContainer(o, {
            absolute: true
        });
        this._div.id = this.component.renderId;
        this._div.tabIndex = "0";
        this._div.style.outlineStyle = "none";
        this._div.style.overflow = "hidden";
        this._div.style.zIndex = 1;
        if (!this._displayed) {
            this._div.style.visibility = "hidden"
        }
        this._borderDivs = Echo.Sync.FillImageBorder.getBorder(this._div);
        var a = this._resizable ? Core.method(this, this._processBorderMouseDown) : null;
        for (var q = 0; q < 8; ++q) {
            if (this._borderDivs[q]) {
                if (this._resizable) {
                    this._borderDivs[q].style.zIndex = 2;
                    this._borderDivs[q].style.cursor = Echo.Sync.WindowPane.CURSORS[q];
                    Core.Web.Event.add(this._borderDivs[q], "mousedown", a, true)
                }
            }
        }
        var l = this.component.render("titleInsets", Echo.WindowPane.DEFAULT_TITLE_INSETS);
        this._titleBarDiv = document.createElement("div");
        this._titleBarDiv.style.position = "absolute";
        this._titleBarDiv.style.zIndex = 3;
        var r = this.component.render("icon");
        if (r) {
            this._titleIconDiv = document.createElement("div");
            this._titleIconDiv.style[Core.Web.Env.CSS_FLOAT] = this._rtl ? "right" : "left";
            var m = this.component.render("iconInsets");
            if (m) {
                Echo.Sync.Insets.render(m, this._titleIconDiv, "padding")
            } else {
                var s = Echo.Sync.Insets.toPixels(l);
                if (this._rtl) {
                    this._titleIconDiv.style.paddingRight = s.right + "px"
                } else {
                    this._titleIconDiv.style.paddingLeft = s.left + "px"
                }
            }
            this._titleBarDiv.appendChild(this._titleIconDiv);
            this._titleIconImg = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(r, this._titleIconImg);
            this._titleIconDiv.appendChild(this._titleIconImg);
            this._titleIconImgLoading = true
        }
        var t = this.component.render("title");
        var j = document.createElement("div");
        if (r) {
            j.style[Core.Web.Env.CSS_FLOAT] = this._rtl ? "right" : "left"
        }
        j.style.whiteSpace = "nowrap";
        Echo.Sync.Font.render(this.component.render("titleFont"), j);
        Echo.Sync.Insets.render(l, j, "padding");
        j.appendChild(document.createTextNode(t ? t : "\u00a0"));
        this._titleBarDiv.appendChild(j);
        var n = this.component.render("titleHeight");
        if (n) {
            this._titleBarHeight = Echo.Sync.Extent.toPixels(n)
        }
        if (!n) {
            this._titleBarHeight = new Core.Web.Measure.Bounds(this._titleBarDiv).height || Echo.Sync.Extent.toPixels(Echo.WindowPane.DEFAULT_TITLE_HEIGHT)
        }
        this._titleBarDiv.style.top = this._contentInsets.top + "px";
        this._titleBarDiv.style.left = this._contentInsets.left + "px";
        this._titleBarDiv.style.height = this._titleBarHeight + "px";
        this._titleBarDiv.style.overflow = "hidden";
        if (e) {
            this._titleBarDiv.style.cursor = "move";
            Core.Web.Event.add(this._titleBarDiv, "mousedown", Core.method(this, this._processTitleBarMouseDown), true)
        }
        Echo.Sync.Color.render(this.component.render("titleForeground"), this._titleBarDiv, "color");
        var p = this.component.render("titleBackground");
        var k = this.component.render("titleBackgroundImage");
        if (p) {
            this._titleBarDiv.style.backgroundColor = p
        }
        if (k) {
            Echo.Sync.FillImage.render(k, this._titleBarDiv)
        }
        if (!p && !k) {
            this._titleBarDiv.style.backgroundColor = Echo.WindowPane.DEFAULT_TITLE_BACKGROUND
        }
        if (d) {
            this._controlDiv = document.createElement("div");
            this._controlDiv.style.cssText = "position:absolute;top:0;";
            this._controlDiv.style[this._rtl ? "left" : "right"] = 0;
            Echo.Sync.Insets.render(this.component.render("controlsInsets", Echo.WindowPane.DEFAULT_CONTROLS_INSETS), this._controlDiv, "margin");
            this._titleBarDiv.appendChild(this._controlDiv);
            if (g) {
                this._renderControlIcon("close", this.client.getResourceUrl("Echo", "resource/WindowPaneClose.gif"), "[X]")
            }
            if (h) {
                this._renderControlIcon("maximize", this.client.getResourceUrl("Echo", "resource/WindowPaneMaximize.gif"), "[+]")
            }
            if (c) {
                this._renderControlIcon("minimize", this.client.getResourceUrl("Echo", "resource/WindowPaneMinimize.gif"), "[-]")
            }
        }
        this._div.appendChild(this._titleBarDiv);
        this._contentDiv.style.cssText = "position:absolute;z-index:2;top:" + (this._contentInsets.top + this._titleBarHeight) + "px;bottom:" + this._contentInsets.bottom + "px;left:" + this._contentInsets.left + "px;right:" + this._contentInsets.right + "px;overflow:" + ((this.component.children.length === 0 || this.component.children[0].pane) ? "hidden;" : "auto;");
        Echo.Sync.Font.renderClear(this.component.render("font"), this._contentDiv);
        if (this.component.children.length > 0 && !this.component.children[0].pane) {
            Echo.Sync.Insets.render(this.component.render("insets"), this._contentDiv, "padding")
        }
        Echo.Sync.Color.render(this.component.render("background", Echo.WindowPane.DEFAULT_BACKGROUND), this._contentDiv, "backgroundColor");
        Echo.Sync.Color.render(this.component.render("foreground", Echo.WindowPane.DEFAULT_FOREGROUND), this._contentDiv, "color");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._contentDiv);
        this._div.appendChild(this._contentDiv);
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            this._div.appendChild(this._maskDiv)
        }
        Core.Web.Event.add(this._div, "click", Core.method(this, this._processFocusClick), true);
        f.appendChild(this._div)
    },
    _renderControlIcon: function(d, h, b) {
        var a = document.createElement("div"),
            g = this.component.render(d + "Icon", h),
            f = this.component.render(d + "RolloverIcon");
        var e = Echo.Sync.Extent.toCssValue(this.component.render("controlsSpacing", Echo.WindowPane.DEFAULT_CONTROLS_SPACING));
        a.style.cssText = this._rtl ? ("float:left;cursor:pointer;margin-right:" + e) : ("float:right;cursor:pointer;margin-left:" + e);
        Echo.Sync.Insets.render(this.component.render(d + "Insets"), a, "padding");
        if (g) {
            var c = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(g, c);
            a.appendChild(c);
            if (f) {
                Core.Web.Event.add(a, "mouseover", Core.method(this, this._processControlRolloverEnter), false);
                Core.Web.Event.add(a, "mouseout", Core.method(this, this._processControlRolloverExit), false)
            }
        } else {
            a.appendChild(document.createTextNode(b))
        }
        Core.Web.Event.add(a, "click", Core.method(this, this._processControlClick), false);
        this._controlDiv.appendChild(a);
        if (this._controlIcons == null) {
            this._controlIcons = []
        }
        this._controlIcons.push(a);
        a._controlData = {
            name: d,
            icon: g,
            rolloverIcon: f
        }
    },
    renderDisplay: function() {
        this._loadContainerSize();
        this._setBounds(this._requested, false);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
        this._centerIcon();
        var a = parseInt(this.component.render("resourceTimeout"), 10) || Echo.WindowPane.DEFAULT_RESOURCE_TIMEOUT;
        if (!this._initialRenderDisplayComplete) {
            this._initialRenderDisplayComplete = true;
            if (a) {
                if (Core.Web.Image.monitor(this._div, Core.method(this, this._imageLoadListener))) {
                    this._imageWaitStartTime = new Date().getTime()
                }
            }
        }
        if (!this._displayed) {
            if (this._imageWaitStartTime && new Date().getTime() > this._imageWaitStartTime + a) {
                this._imageWaitStartTime = null
            }
            if (!this._imageWaitStartTime) {
                this._displayed = true;
                var b = (Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY || !this._opening) ? 0 : this.component.render("openAnimationTime", 0);
                if (b > 0) {
                    Core.Web.Scheduler.add(new Echo.Sync.WindowPane.FadeRunnable(this._div, false, b, null));
                    this._div.style.opacity = 0
                }
                this._div.style.visibility = ""
            }
        }
    },
    renderDispose: function(a) {
        this._overlayRemove();
        this._renderDisposeFrame();
        this._maskDiv = null;
        this._contentDiv = null;
        this._controlDiv = null
    },
    _renderDisposeFrame: function() {
        var a;
        Core.Web.Event.removeAll(this._div);
        for (a = 0; a < 8; ++a) {
            if (this._borderDivs[a]) {
                Core.Web.Event.removeAll(this._borderDivs[a])
            }
        }
        this._borderDivs = null;
        if (this._controlIcons != null) {
            for (a = 0; a < this._controlIcons.length; ++a) {
                Core.Web.Event.removeAll(this._controlIcons[a])
            }
            this._controlIcons = null
        }
        Core.Web.Event.removeAll(this._titleBarDiv);
        this._titleBarDiv = null;
        this._titleIconDiv = null;
        this._titleIconImg = null;
        this._titleIconImgLoading = false;
        this._div = null
    },
    renderFocus: function() {
        Core.Web.DOM.focusElement(this._div)
    },
    renderUpdate: function(c) {
        if (c.hasAddedChildren() || c.hasRemovedChildren()) {} else {
            if (c.isUpdatedPropertySetIn(Echo.Sync.WindowPane.NON_RENDERED_PROPERTIES)) {
                return false
            } else {
                if (c.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES_POSITION_SIZE)) {
                    this._loadPositionAndSize();
                    return false
                } else {
                    if (c.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES)) {
                        this._renderUpdateFrame();
                        return false
                    }
                }
            }
        }
        var a = this._div;
        var b = a.parentNode;
        Echo.Render.renderComponentDispose(c, c.parent);
        b.removeChild(a);
        this.renderAdd(c, b);
        return true
    },
    _renderUpdateFrame: function() {
        var a = this._div;
        var b = a.parentNode;
        this._renderDisposeFrame();
        b.removeChild(a);
        this._renderAddFrame(b)
    },
    _setBounds: function(h, f) {
        var b = {},
            i = false;
        if (f) {
            if (h.x != null && h.x < 0) {
                h.x = 0
            }
            if (h.y != null && h.y < 0) {
                h.y = 0
            }
        }
        if (h.width != null) {
            b.width = Math.round(Echo.Sync.Extent.isPercent(h.width) ? (parseInt(h.width, 10) * this._containerSize.width / 100) : Echo.Sync.Extent.toPixels(h.width, true))
        } else {
            if (h.contentWidth != null) {
                b.contentWidth = Math.round(Echo.Sync.Extent.isPercent(h.contentWidth) ? (parseInt(h.contentWidth, 10) * this._containerSize.width / 100) : Echo.Sync.Extent.toPixels(h.contentWidth, true));
                b.width = this._contentInsets.left + this._contentInsets.right + b.contentWidth
            }
        }
        if (h.height != null) {
            b.height = Math.round(Echo.Sync.Extent.isPercent(h.height) ? (parseInt(h.height, 10) * this._containerSize.height / 100) : Echo.Sync.Extent.toPixels(h.height, false))
        } else {
            if (h.contentHeight != null) {
                b.contentHeight = Math.round(Echo.Sync.Extent.isPercent(h.contentHeight) ? (parseInt(h.contentHeight, 10) * this._containerSize.height / 100) : Echo.Sync.Extent.toPixels(h.contentHeight, false));
                b.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + b.contentHeight
            } else {
                if (!f) {
                    i = true;
                    if (this.component.children[0]) {
                        var a = b.contentWidth ? b.contentWidth : b.width - (this._contentInsets.left + this._contentInsets.right);
                        var d = this._contentDiv.style.cssText;
                        if (this.component.children[0].peer.getPreferredSize) {
                            this._contentDiv.style.cssText = "position:absolute;width:" + a + "px;height:" + this._containerSize.height + "px";
                            var c = this.component.children[0].peer.getPreferredSize(Echo.Render.ComponentSync.SIZE_HEIGHT);
                            if (c && c.height) {
                                b.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + c.height
                            }
                            this._contentDiv.style.cssText = d
                        }
                        if (!b.height && !this.component.children[0].pane) {
                            var e = Echo.Sync.Insets.toPixels(this.component.render("insets"));
                            this._contentDiv.style.position = "static";
                            this._contentDiv.style.width = (a - e.left - e.right) + "px";
                            this._contentDiv.style.height = "";
                            this._contentDiv.style.padding = "";
                            var g = new Core.Web.Measure.Bounds(this._contentDiv).height;
                            if (g) {
                                b.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + g + e.top + e.bottom
                            }
                            this._contentDiv.style.cssText = d
                        }
                    }
                    if (!b.height) {
                        b.height = Echo.Sync.Extent.toPixels(Echo.WindowPane.DEFAULT_HEIGHT, false)
                    }
                }
            }
        }
        if (h.x != null) {
            if (Echo.Sync.Extent.isPercent(h.x)) {
                b.x = Math.round((this._containerSize.width - b.width) * (parseInt(h.x, 10) / 100));
                if (b.x < 0) {
                    b.x = 0
                }
            } else {
                b.x = Math.round(Echo.Sync.Extent.toPixels(h.x, true));
                if (b.x < 0) {
                    b.x += this._containerSize.width - b.width
                }
            }
        }
        if (h.y != null) {
            if (Echo.Sync.Extent.isPercent(h.y)) {
                b.y = Math.round((this._containerSize.height - b.height) * (parseInt(h.y, 10) / 100));
                if (b.y < 0) {
                    b.y = 0
                }
            } else {
                b.y = Math.round(Echo.Sync.Extent.toPixels(h.y, false));
                if (b.y < 0) {
                    b.y += this._containerSize.height - b.height
                }
            }
        }
        if (this._rendered == null) {
            this._rendered = {}
        }
        if (b.width != null) {
            if (this._resizable && b.width > this._containerSize.width) {
                b.width = this._containerSize.width
            }
            if (this._maximumWidth && b.width > this._maximumWidth) {
                if (f && b.x != null) {
                    b.x += (b.width - this._maximumWidth)
                }
                b.width = this._maximumWidth
            }
            if (b.width < this._minimumWidth) {
                if (f && b.x != null) {
                    b.x += (b.width - this._minimumWidth)
                }
                b.width = this._minimumWidth
            }
            this._rendered.width = Math.round(b.width)
        }
        if (b.height != null) {
            if ((i || this._resizable) && b.height > this._containerSize.height) {
                b.height = this._containerSize.height
            }
            if (this._maximumHeight && b.height > this._maximumHeight) {
                if (f && b.y != null) {
                    b.y += (b.height - this._maximumHeight)
                }
                b.height = this._maximumHeight
            }
            if (b.height < this._minimumHeight) {
                if (f && b.y != null) {
                    b.y += (b.height - this._minimumHeight)
                }
                b.height = this._minimumHeight
            }
            this._rendered.height = Math.round(b.height)
        }
        if (b.x != null) {
            if (this._containerSize.width > 0 && b.x > this._containerSize.width - this._rendered.width) {
                b.x = this._containerSize.width - this._rendered.width
            }
            if (b.x < 0) {
                b.x = 0
            }
            this._rendered.x = Math.round(b.x)
        }
        if (b.y != null) {
            if (this._containerSize.height > 0 && b.y > this._containerSize.height - this._rendered.height) {
                b.y = this._containerSize.height - this._rendered.height
            }
            if (b.y < 0) {
                b.y = 0
            }
            this._rendered.y = Math.round(b.y)
        }
        this._redraw()
    }
});
Extras = {
    uniqueId: 0
};
Extras.Serial = {
    PROPERTY_TYPE_PREFIX: "Extras.Serial."
};
Extras.Sync = {};
Extras.Sync.Animation = Core.extend({
    stepIndex: 0,
    startTime: null,
    endTime: null,
    _listenerList: null,
    _runnable: null,
    $virtual: {
        runTime: 0,
        sleepInterval: 10
    },
    $abstract: {
        init: function() {},
        complete: function(a) {},
        step: function(a) {}
    },
    _doStep: function() {
        var a = new Date().getTime();
        if (a < this.endTime) {
            if (this.stepIndex === 0) {
                this.init()
            } else {
                this.step((a - this.startTime) / this.runTime)
            }++this.stepIndex;
            Core.Web.Scheduler.add(this._runnable)
        } else {
            this.complete(false);
            if (this._completeMethod) {
                this._completeMethod(false)
            }
        }
    },
    abort: function() {
        Core.Web.Scheduler.remove(this._runnable);
        this.complete(true);
        if (this._completeMethod) {
            this._completeMethod(true)
        }
    },
    start: function(a) {
        this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._doStep), this.sleepInterval, false);
        this.startTime = new Date().getTime();
        this.endTime = this.startTime + this.runTime;
        this._completeMethod = a;
        Core.Web.Scheduler.add(this._runnable)
    }
});
Extras.MenuComponent = Core.extend(Echo.Component, {
    $abstract: true,
    modalSupport: true,
    focusable: true,
    doAction: function(a) {
        var b = a.getItemPositionPath().join(".");
        if (a instanceof Extras.ToggleOptionModel) {
            this._toggleItem(a)
        }
        this.fireEvent({
            type: "action",
            source: this,
            data: b,
            modelId: a.modelId
        })
    },
    _toggleItem: function(c) {
        var a = this.get("model");
        var e = this.get("stateModel");
        if (c.groupId) {
            var d = a.findItemGroup(c.groupId);
            for (var b = 0; b < d.length; ++b) {
                e.setSelected(d[b].modelId, false)
            }
        }
        if (e) {
            e.setSelected(c.modelId, !e.isSelected(c.modelId))
        }
    }
});
Extras.ContextMenu = Core.extend(Extras.MenuComponent, {
    $static: {
        ACTIVATION_MODE_CLICK: 1,
        ACTIVATION_MODE_CONTEXT_CLICK: 2
    },
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ContextMenu", this)
    },
    componentType: "Extras.ContextMenu"
});
Extras.DropDownMenu = Core.extend(Extras.MenuComponent, {
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DropDownMenu", this)
    },
    componentType: "Extras.DropDownMenu"
});
Extras.MenuBarPane = Core.extend(Extras.MenuComponent, {
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.MenuBarPane", this)
    },
    componentType: "Extras.MenuBarPane"
});
Extras.ItemModel = Core.extend({
    $abstract: true,
    modelId: null,
    parent: null
});
Extras.MenuModel = Core.extend(Extras.ItemModel, {
    text: null,
    icon: null,
    items: null,
    $construct: function(e, d, c, a) {
        this.modelId = e;
        this.id = Extras.uniqueId++;
        this.parent = null;
        this.text = d;
        this.icon = c;
        if (a) {
            for (var b = 0; b < a.length; ++b) {
                a[b].parent = this
            }
        }
        this.items = a ? a : []
    },
    addItem: function(a) {
        this.items.push(a);
        a.parent = this
    },
    findItem: function(c) {
        var a;
        for (a = 0; a < this.items.length; ++a) {
            if (this.items[a].id == c) {
                return this.items[a]
            }
        }
        for (a = 0; a < this.items.length; ++a) {
            if (this.items[a] instanceof Extras.MenuModel) {
                var b = this.items[a].findItem(c);
                if (b) {
                    return b
                }
            }
        }
        return null
    },
    findItemGroup: function(c) {
        var d = [];
        for (var b = 0; b < this.items.length; ++b) {
            if (this.items[b] instanceof Extras.MenuModel) {
                var e = this.items[b].findItemGroup(c);
                for (var a = 0; a < e.length; ++a) {
                    d.push(e[a])
                }
            } else {
                if (this.items[b].groupId == c) {
                    d.push(this.items[b])
                }
            }
        }
        return d
    },
    getItemModelFromPositions: function(b) {
        var c = this;
        for (var a = 0; a < b.length; ++a) {
            c = c.items[parseInt(b[a], 10)]
        }
        return c
    },
    indexOfItem: function(b) {
        for (var a = 0; a < this.items.length; ++a) {
            if (this.items[a] == b) {
                return a
            }
        }
        return -1
    },
    toString: function() {
        return 'MenuModel "' + this.text + '" Items:' + this.items.length
    }
});
Extras.OptionModel = Core.extend(Extras.ItemModel, {
    text: null,
    icon: null,
    $construct: function(c, b, a) {
        this.modelId = c;
        this.id = Extras.uniqueId++;
        this.parent = null;
        this.text = b;
        this.icon = a
    },
    getItemPositionPath: function() {
        var b = [];
        var a = this;
        while (a.parent != null) {
            b.unshift(a.parent.indexOfItem(a));
            a = a.parent
        }
        return b
    },
    toString: function() {
        return 'OptionModel "' + this.text + '"'
    }
});
Extras.ToggleOptionModel = Core.extend(Extras.OptionModel, {
    $construct: function(b, a) {
        Extras.OptionModel.call(this, b, a, null)
    }
});
Extras.RadioOptionModel = Core.extend(Extras.ToggleOptionModel, {
    groupId: null,
    $construct: function(c, b, a) {
        Extras.ToggleOptionModel.call(this, c, b);
        this.groupId = a
    }
});
Extras.SeparatorModel = Core.extend(Extras.ItemModel, {});
Extras.MenuStateModel = Core.extend({
    _disabledItems: null,
    _selectedItems: null,
    $construct: function() {
        this._disabledItems = [];
        this._selectedItems = []
    },
    $virtual: {
        isEnabled: function(b) {
            if (b) {
                for (var a = 0; a < this._disabledItems.length; a++) {
                    if (this._disabledItems[a] == b) {
                        return false
                    }
                }
            }
            return true
        },
        isSelected: function(b) {
            if (b) {
                for (var a = 0; a < this._selectedItems.length; a++) {
                    if (this._selectedItems[a] == b) {
                        return true
                    }
                }
            }
            return false
        },
        setEnabled: function(b, a) {
            if (a) {
                Core.Arrays.remove(this._disabledItems, b)
            } else {
                if (Core.Arrays.indexOf(this._disabledItems, b) == -1) {
                    this._disabledItems.push(b)
                }
            }
        },
        setSelected: function(b, a) {
            if (a) {
                if (Core.Arrays.indexOf(this._selectedItems, b) == -1) {
                    this._selectedItems.push(b)
                }
            } else {
                Core.Arrays.remove(this._selectedItems, b)
            }
        }
    }
});
Extras.Sync.Menu = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        DEFAULTS: {
            foreground: "#000000",
            background: "#cfcfcf",
            disabledForeground: "#7f7f7f",
            selectionForeground: "#ffffff",
            selectionBackground: "#3f3f3f",
            border: "1px outset #cfcfcf"
        }
    },
    menuModel: null,
    stateModel: null,
    element: null,
    _openMenuPath: null,
    _maskDeployed: false,
    _processMaskClickRef: null,
    _overlay: null,
    $construct: function() {
        this._processMaskClickRef = Core.method(this, this._processMaskClick);
        this._openMenuPath = []
    },
    $abstract: {
        getSubMenuPosition: function(a) {},
        renderMain: function(a) {}
    },
    $virtual: {
        activate: function() {
            if (this.component.get("active")) {
                return false
            }
            this.component.set("modal", true);
            this.component.set("active", true);
            this.addMask();
            this.client.application.setFocusedComponent(this.component);
            Core.Web.DOM.focusElement(this.element);
            return true
        },
        activateItem: function(a) {
            if (this.stateModel && !this.stateModel.isEnabled(a.modelId)) {
                return
            }
            if (a instanceof Extras.OptionModel) {
                this.deactivate();
                this.processAction(a)
            } else {
                if (a instanceof Extras.MenuModel) {
                    this._openMenu(a)
                }
            }
        },
        processAction: function(a) {
            this.component.doAction(a)
        }
    },
    addMenu: function(a) {
        this._openMenuPath.push(a)
    },
    addMask: function() {
        if (this.maskDeployed) {
            return
        }
        this.maskDeployed = true;
        this._overlayAdd(new Core.Web.Measure.Bounds(this.element));
        Core.Web.Event.add(document.body, "click", this._processMaskClickRef, false);
        Core.Web.Event.add(document.body, "contextmenu", this._processMaskClickRef, false)
    },
    clientKeyDown: function(a) {
        if (a.keyCode == 27) {
            this.deactivate();
            return false
        }
        return true
    },
    closeAll: function() {
        while (this._openMenuPath.length > 0) {
            var a = this._openMenuPath.pop();
            a.close()
        }
    },
    closeDescendants: function(a) {
        while (a != this._openMenuPath[this._openMenuPath.length - 1]) {
            var b = this._openMenuPath.pop();
            b.close()
        }
    },
    deactivate: function() {
        this.component.set("modal", false);
        if (!this.component.get("active")) {
            return
        }
        this.component.set("active", false);
        this.closeAll();
        this.removeMask()
    },
    isOpen: function(b) {
        for (var a = 0; a < this._openMenuPath.length; ++a) {
            if (this._openMenuPath[a].menuModel == b) {
                return true
            }
        }
        return false
    },
    _overlayAdd: function(e) {
        this._overlayRemove();
        var b = e.top + e.height,
            d = e.left + e.width,
            a = new Core.Web.Measure.Bounds(document.body);
        this._overlay = {};
        if (e.top > 0) {
            this._overlay.top = document.createElement("div");
            this._overlay.top.style.cssText = "position:absolute;z-index:30000;top:0;left:0;width:100%;height:" + e.top + "px;";
            document.body.appendChild(this._overlay.top)
        }
        if (b < a.height) {
            this._overlay.bottom = document.createElement("div");
            this._overlay.bottom.style.cssText = "position:absolute;z-index:30000;bottom:0;left:0;width:100%;top:" + b + "px;";
            document.body.appendChild(this._overlay.bottom)
        }
        if (e.left > 0) {
            this._overlay.left = document.createElement("div");
            this._overlay.left.style.cssText = "position:absolute;z-index:30000;left:0;width:" + e.left + "px;top:" + e.top + "px;height:" + e.height + "px;";
            document.body.appendChild(this._overlay.left)
        }
        if (d < a.width) {
            this._overlay.right = document.createElement("div");
            this._overlay.right.style.cssText = "position:absolute;z-index:30000;right:0;left:" + d + "px;top:" + e.top + "px;height:" + e.height + "px;";
            document.body.appendChild(this._overlay.right)
        }
        for (var c in this._overlay) {
            Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay[c]);
            Core.Web.VirtualPosition.redraw(this._overlay[c])
        }
        this.client.forceRedraw()
    },
    _overlayRemove: function() {
        if (!this._overlay) {
            return
        }
        for (var a in this._overlay) {
            document.body.removeChild(this._overlay[a])
        }
        this._overlay = null;
        this.client.forceRedraw()
    },
    _openMenu: function(f) {
        if (this.isOpen(f)) {
            return
        }
        var b = new Extras.Sync.Menu.RenderedMenu(this, f);
        b.create();
        var c = null;
        for (var d = 0; d < this._openMenuPath.length; ++d) {
            if (this._openMenuPath[d].menuModel == f.parent) {
                c = this._openMenuPath[d];
                break
            }
        }
        if (c == null) {
            c = this
        } else {
            this.closeDescendants(c)
        }
        var a = c.getSubMenuPosition(f);
        var e = new Core.Web.Measure.Bounds(document.body);
        if (a.x + b.width > e.width) {
            a.x = e.width - b.width;
            if (a.x < 0) {
                a.x = 0
            }
        }
        if (a.y + b.height > e.height) {
            a.y = e.height - b.height;
            if (a.y < 0) {
                a.y = 0
            }
        }
        b.open(a.x, a.y);
        this.addMenu(b)
    },
    _processMaskClick: function(a) {
        this.deactivate();
        return true
    },
    removeMask: function() {
        if (!this.maskDeployed) {
            return
        }
        this._overlayRemove();
        this.maskDeployed = false;
        Core.Web.Event.remove(document.body, "click", this._processMaskClickRef, false);
        Core.Web.Event.remove(document.body, "contextmenu", this._processMaskClickRef, false)
    },
    renderAdd: function(b, a) {
        this.menuModel = this.component.get("model");
        this.stateModel = this.component.get("stateModel");
        this.element = this.renderMain(b);
        this.element.tabIndex = "-1";
        this.element.style.outlineStyle = "none";
        a.appendChild(this.element)
    },
    renderDispose: function(a) {
        this.deactivate();
        this.element = null
    },
    renderFocus: function() {
        Core.Web.DOM.focusElement(this.element)
    },
    renderHide: function() {
        this.deactivate()
    },
    renderUpdate: function(c) {
        if (c.isUpdatedPropertySetIn({
                active: true,
                modal: true
            })) {
            return
        }
        var a = this.element;
        var b = a.parentNode;
        Echo.Render.renderComponentDispose(c, c.parent);
        b.removeChild(a);
        this.renderAdd(c, b);
        return false
    }
});
Extras.Sync.Menu.RenderedMenu = Core.extend({
    $static: {
        DEFAULTS: {
            iconTextMargin: 5,
            menuInsets: "2px",
            menuItemInsets: "1px 12px"
        },
        FadeAnimation: Core.extend(Extras.Sync.Animation, {
            _element: null,
            $construct: function(b, a) {
                this._element = b;
                this.runTime = a
            },
            init: function() {},
            step: function(a) {
                this._element.style.opacity = a
            },
            complete: function(a) {
                this._element.style.opacity = 1
            }
        })
    },
    menuSync: null,
    component: null,
    client: null,
    element: null,
    itemElements: null,
    menuModel: null,
    width: null,
    height: null,
    _activeItem: null,
    stateModel: null,
    $construct: function(b, a) {
        this.menuSync = b;
        this.menuModel = a;
        this.component = this.menuSync.component;
        this.client = this.menuSync.client;
        this.stateModel = this.menuSync.stateModel;
        this.itemElements = {}
    },
    close: function() {
        Core.Web.Event.removeAll(this.element);
        document.body.removeChild(this.element);
        this.client.forceRedraw();
        this.element = null;
        this.itemElements = null;
        this._activeItem = null
    },
    create: function() {
        var v, A, D, w, s, B;
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.zIndex = 30050;
        var c = (Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100)) / 100;
        var k = document.createElement("div");
        k.style.cssText = "position:relative;z-index:10;";
        this.element.appendChild(k);
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), k);
        Echo.Sync.Insets.render(Extras.Sync.Menu.RenderedMenu.DEFAULTS.menuInsets, k, "padding");
        Echo.Sync.Border.render(this.component.render("menuBorder", Extras.Sync.Menu.DEFAULTS.border), k);
        var a;
        var f = this.component.render("menuForeground");
        if (f) {
            a = f
        } else {
            a = this.component.render("foreground", Extras.Sync.Menu.DEFAULTS.foreground)
        }
        Echo.Sync.Color.render(a, k, "color");
        var m = this.component.render("menuFont");
        if (!m) {
            m = this.component.render("font")
        }
        if (m) {
            Echo.Sync.Font.render(m, k)
        }
        var t;
        if (c < 1) {
            t = document.createElement("div");
            t.style.cssText = "position:absolute;z-index:1;width:100%;height:100%;top:0;bottom:0;";
            t.style.opacity = c;
            this.element.appendChild(t)
        } else {
            t = this.element
        }
        var x;
        var o = this.component.render("menuBackground");
        if (o) {
            x = o
        } else {
            x = this.component.render("background", Extras.Sync.Menu.DEFAULTS.background)
        }
        Echo.Sync.Color.render(x, t, "backgroundColor");
        var b;
        var r = this.component.render("menuBackgroundImage");
        if (r) {
            b = r
        } else {
            if (o == null) {
                b = this.component.render("backgroundImage")
            }
        }
        if (b) {
            Echo.Sync.FillImage.render(b, t, null)
        }
        var d = document.createElement("table");
        d.style.borderCollapse = "collapse";
        k.appendChild(d);
        var h = document.createElement("tbody");
        d.appendChild(h);
        var n = this.menuModel.items;
        var j = false;
        for (v = 0; v < n.length; ++v) {
            A = n[v];
            if (A.icon || A instanceof Extras.ToggleOptionModel) {
                j = true;
                break
            }
        }
        var u, p;
        if (j) {
            var y = Echo.Sync.Insets.toPixels(Extras.Sync.Menu.RenderedMenu.DEFAULTS.menuItemInsets);
            p = "0px 0px 0px " + y.left + "px";
            u = y.top + "px " + y.right + "px " + y.bottom + "px " + y.left + "px"
        } else {
            u = Extras.Sync.Menu.RenderedMenu.DEFAULTS.menuItemInsets
        }
        for (v = 0; v < n.length; ++v) {
            A = n[v];
            if (A instanceof Extras.OptionModel || A instanceof Extras.MenuModel) {
                B = document.createElement("tr");
                this.itemElements[A.id] = B;
                B.style.cursor = "pointer";
                h.appendChild(B);
                if (j) {
                    s = document.createElement("td");
                    Echo.Sync.Insets.render(p, s, "padding");
                    if (A instanceof Extras.ToggleOptionModel) {
                        var l;
                        var q = this.stateModel && this.stateModel.isSelected(A.modelId);
                        if (A instanceof Extras.RadioOptionModel) {
                            l = q ? "image/menu/RadioOn.gif" : "image/menu/RadioOff.gif"
                        } else {
                            l = q ? "image/menu/ToggleOn.gif" : "image/menu/ToggleOff.gif"
                        }
                        D = document.createElement("img");
                        D.src = this.client.getResourceUrl("Extras", l);
                        s.appendChild(D)
                    } else {
                        if (A.icon) {
                            D = document.createElement("img");
                            Echo.Sync.ImageReference.renderImg(A.icon, D);
                            s.appendChild(D)
                        }
                    }
                    B.appendChild(s)
                }
                w = document.createElement("td");
                Echo.Sync.Insets.render(u, w, "padding");
                w.style.whiteSpace = "nowrap";
                if (this.stateModel && !this.stateModel.isEnabled(A.modelId)) {
                    Echo.Sync.Color.render(this.component.render("disabledForeground", Extras.Sync.Menu.DEFAULTS.disabledForeground), w, "color")
                }
                w.appendChild(document.createTextNode(A.text));
                B.appendChild(w);
                if (A instanceof Extras.MenuModel) {
                    var g = document.createElement("td");
                    g.style.textAlign = "right";
                    D = document.createElement("img");
                    var z = this.component.render("menuExpandIcon", this.client.getResourceUrl("Extras", "image/menu/ArrowRight.gif"));
                    D.setAttribute("src", z.url ? z.url : z);
                    D.setAttribute("alt", "");
                    g.appendChild(D);
                    B.appendChild(g)
                } else {
                    w.colSpan = 2
                }
            } else {
                if (A instanceof Extras.SeparatorModel) {
                    if (v === 0 || v === n.length - 1 || n[v - 1] instanceof Extras.SeparatorModel || n[v + 1] instanceof Extras.SeparatorModel) {
                        continue
                    }
                    B = document.createElement("tr");
                    h.appendChild(B);
                    w = document.createElement("td");
                    w.colSpan = j ? 3 : 2;
                    w.style.padding = "3px 0px";
                    var C = document.createElement("div");
                    C.style.cssText = "border-top:1px solid #a7a7a7;height:0;font-size:1px;line-height:0";
                    w.appendChild(C);
                    B.appendChild(w)
                }
            }
        }
        var e = new Core.Web.Measure.Bounds(this.element);
        this.width = e.width;
        this.height = e.height
    },
    _getItemElement: function(a) {
        if (a == null) {
            return null
        }
        while (a.nodeName.toLowerCase() != "tr") {
            if (a == this.element) {
                return null
            }
            a = a.parentNode
        }
        return a
    },
    _getItemModel: function(c) {
        var b = null;
        c = this._getItemElement(c);
        if (c == null) {
            return null
        }
        for (var a in this.itemElements) {
            if (this.itemElements[a] == c) {
                b = a;
                break
            }
        }
        if (b == null) {
            return null
        } else {
            return this.menuModel.findItem(b)
        }
    },
    getSubMenuPosition: function(c) {
        var d = this.itemElements[c.id];
        var b = new Core.Web.Measure.Bounds(d);
        var a = new Core.Web.Measure.Bounds(this.element);
        return {
            x: a.left + a.width,
            y: b.top
        }
    },
    open: function(a, d) {
        this.element.style.left = a + "px";
        this.element.style.top = d + "px";
        var c = this.component.render("animationTime", 0);
        if (c && !Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY) {
            this.element.style.opacity = 0;
            var b = new Extras.Sync.Menu.RenderedMenu.FadeAnimation(this.element, c);
            b.start()
        }
        document.body.appendChild(this.element);
        this.client.forceRedraw();
        Core.Web.Event.add(this.element, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this.element, "mouseover", Core.method(this, this._processItemEnter), false);
        Core.Web.Event.add(this.element, "mouseout", Core.method(this, this._processItemExit), false);
        Core.Web.Event.Selection.disable(this.element)
    },
    _processClick: function(b) {
        Core.Web.DOM.preventEventDefault(b);
        var a = this._getItemModel(Core.Web.DOM.getEventTarget(b));
        if (a) {
            this._setActiveItem(a, true)
        }
    },
    _processItemEnter: function(a) {
        this._processRollover(a, true)
    },
    _processItemExit: function(a) {
        this._processRollover(a, false)
    },
    _processRollover: function(d, c) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true
        }
        var a = this._getItemElement(Core.Web.DOM.getEventTarget(d));
        if (!a) {
            return
        }
        var b = this._getItemModel(a);
        if (!b) {
            return
        }
        if (this.stateModel && !this.stateModel.isEnabled(b.modelId)) {
            return
        }
        if (c) {
            this._setActiveItem(b, false)
        }
    },
    _setActiveItem: function(a, b) {
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null
        }
        if (a instanceof Extras.MenuModel) {
            this.menuSync.activateItem(a)
        } else {
            if (b) {
                this.menuSync.activateItem(a);
                return
            } else {
                this.menuSync.closeDescendants(this)
            }
        }
        if (a) {
            this._activeItem = a;
            this._setItemHighlight(this._activeItem, true)
        }
    },
    _setItemHighlight: function(b, c) {
        var a = this.itemElements[b.id];
        if (c) {
            Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), a);
            Echo.Sync.Color.render(this.component.render("selectionBackground", Extras.Sync.Menu.DEFAULTS.selectionBackground), a, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("selectionForeground", Extras.Sync.Menu.DEFAULTS.selectionForeground), a, "color")
        } else {
            a.style.backgroundImage = "";
            a.style.backgroundColor = "";
            a.style.color = ""
        }
    }
});
Extras.Sync.ContextMenu = Core.extend(Extras.Sync.Menu, {
    $load: function() {
        Echo.Render.registerPeer("Extras.ContextMenu", this)
    },
    _mouseX: null,
    _mouseY: null,
    getSubMenuPosition: function(a) {
        return {
            x: this._mouseX,
            y: this._mouseY
        }
    },
    _processContextClick: function(a) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true
        }
        Core.Web.DOM.preventEventDefault(a);
        this._mouseX = a.pageX || (a.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        this._mouseY = a.pageY || (a.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        this.activate();
        this.activateItem(this.menuModel)
    },
    renderDispose: function(a) {
        Core.Web.Event.removeAll(this.element);
        Extras.Sync.Menu.prototype.renderDispose.call(this, a)
    },
    renderMain: function(d) {
        var c = document.createElement("div");
        c.id = this.component.renderId;
        var a = this.component.render("activationMode", Extras.ContextMenu.ACTIVATION_MODE_CONTEXT_CLICK);
        if (a & Extras.ContextMenu.ACTIVATION_MODE_CLICK) {
            Core.Web.Event.add(c, "click", Core.method(this, this._processContextClick), false)
        }
        if (a & Extras.ContextMenu.ACTIVATION_MODE_CONTEXT_CLICK) {
            Core.Web.Event.add(c, "contextmenu", Core.method(this, this._processContextClick), false)
        }
        var b = this.component.getComponentCount();
        if (b > 0) {
            Echo.Render.renderComponentAdd(d, this.component.getComponent(0), c)
        }
        return c
    },
    renderUpdate: function(f) {
        if (f.isUpdatedPropertySetIn({
                active: true,
                modal: true,
                stateModel: true,
                model: true
            })) {
            var b = f.getRemovedChildren();
            if (b) {
                Core.Web.DOM.removeNode(this.element.firstChild)
            }
            var e = f.getAddedChildren();
            if (e) {
                Echo.Render.renderComponentAdd(f, e[0], this.element)
            }
            var a = f.getUpdatedProperty("model");
            var c = f.getUpdatedProperty("stateModel");
            var d = this.maskDeployed && (a || c);
            if (d) {
                this.deactivate()
            }
            if (a) {
                this.menuModel = a.newValue
            }
            if (c) {
                this.stateModel = c.newValue
            }
            if (d) {
                this.activate();
                this.activateItem(this.menuModel)
            }
            return false
        }
        Extras.Sync.Menu.prototype.renderUpdate.call(this, f);
        return true
    }
});
Extras.Sync.DropDownMenu = Core.extend(Extras.Sync.Menu, {
    $load: function() {
        Echo.Render.registerPeer("Extras.DropDownMenu", this)
    },
    _contentDiv: null,
    _selectedItem: null,
    _createSelectionContent: function(c) {
        var a;
        if (c.icon) {
            if (c.text) {
                var d = document.createElement("table");
                d.style.cssText = "border-collapse:collapse;padding:0;";
                var b = document.createElement("tbody");
                var e = document.createElement("tr");
                var g = document.createElement("td");
                g.style.cssText = "padding:0vertical-align:top;";
                a = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(c.icon, a);
                g.appendChild(a);
                e.appendChild(g);
                g = document.createElement("td");
                g.style.cssText = "padding:width:3px;";
                var f = document.createElement("div");
                f.style.cssText = "width:3px";
                g.appendChild(f);
                e.appendChild(g);
                g = document.createElement("td");
                g.style.cssText = "padding:0vertical-align:top;";
                g.appendChild(document.createTextNode(c.text));
                e.appendChild(g);
                b.appendChild(e);
                d.appendChild(b);
                return d
            } else {
                a = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(c.icon, a);
                return a
            }
        } else {
            return document.createTextNode(c.text ? c.text : "\u00a0")
        }
    },
    getSubMenuPosition: function(a) {
        var b = new Core.Web.Measure.Bounds(this.element);
        return {
            x: b.left,
            y: b.top + b.height
        }
    },
    processAction: function(a) {
        if (this.component.render("selectionEnabled")) {
            this._setSelection(a)
        }
        var b = a.getItemPositionPath().join(".");
        this.component.set("selection", b);
        Extras.Sync.Menu.prototype.processAction.call(this, a)
    },
    _processClick: function(a) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true
        }
        Core.Web.DOM.preventEventDefault(a);
        this.activate();
        this.activateItem(this.menuModel)
    },
    renderDispose: function(a) {
        Core.Web.Event.removeAll(this.element);
        this._contentDiv = null;
        Extras.Sync.Menu.prototype.renderDispose.call(this, a)
    },
    renderMain: function() {
        var e = document.createElement("div");
        e.id = this.component.renderId;
        e.style.cssText = "overflow:hidden;cursor:pointer;";
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), e);
        Echo.Sync.Color.render(this.component.render("foreground", Extras.Sync.Menu.DEFAULTS.foreground), e, "color");
        Echo.Sync.Color.render(this.component.render("background", Extras.Sync.Menu.DEFAULTS.background), e, "backgroundColor");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), e);
        Echo.Sync.Border.render(this.component.render("border", Extras.Sync.Menu.DEFAULTS.border), e);
        Echo.Sync.Extent.render(this.component.render("width"), e, "width", true, true);
        Echo.Sync.Extent.render(this.component.render("height"), e, "height", false, true);
        var f = document.createElement("div");
        f.style.cssText = "float:right;position:relative;";
        e.appendChild(f);
        var c = document.createElement("div");
        c.style.cssText = "position:absolute;top:2px;right:2px;";
        var b = this.component.render("expandIcon", this.client.getResourceUrl("Extras", "image/menu/ArrowDown.gif"));
        var d = document.createElement("img");
        Echo.Sync.ImageReference.renderImg(b, d);
        c.appendChild(d);
        f.appendChild(c);
        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = "float:left;";
        if (!this.component.render("lineWrap")) {
            this._contentDiv.style.whiteSpace = "nowrap"
        }
        Echo.Sync.Insets.render(this.component.render("insets", "2px 5px"), this._contentDiv, "padding");
        e.appendChild(this._contentDiv);
        var g = document.createElement("div");
        g.style.cssText = "clear:both;";
        e.appendChild(g);
        Core.Web.Event.add(e, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.Selection.disable(e);
        if (this.component.render("selectionEnabled")) {
            var h = this.component.render("selection");
            if (h) {
                this._selectedItem = this.menuModel.getItemModelFromPositions(h.split("."))
            }
        } else {
            this._selectedItem = null
        }
        if (this._selectedItem) {
            this._contentDiv.appendChild(this._createSelectionContent(this._selectedItem))
        } else {
            var a = this.component.render("selectionText");
            this._contentDiv.appendChild(document.createTextNode(a ? a : "\u00a0"))
        }
        if (!this.component.render("height")) {
            var i = new Core.Web.Measure.Bounds(this._contentDiv);
            f.style.height = i.height + "px"
        }
        return e
    },
    _setSelection: function(b) {
        this._selectedItem = b;
        for (var a = this._contentDiv.childNodes.length - 1; a >= 0; --a) {
            this._contentDiv.removeChild(this._contentDiv.childNodes[a])
        }
        this._contentDiv.appendChild(this._createSelectionContent(b))
    }
});
Extras.Sync.MenuBarPane = Core.extend(Extras.Sync.Menu, {
    $static: {
        DEFAULTS: {
            itemInsets: "0px 12px",
            insets: "3px 0px"
        }
    },
    $load: function() {
        Echo.Render.registerPeer("Extras.MenuBarPane", this)
    },
    _activeItem: null,
    _menuBarTable: null,
    _menuBarBorderHeight: null,
    itemElements: null,
    $construct: function() {
        Extras.Sync.Menu.call(this);
        this.itemElements = {}
    },
    activate: function() {
        if (Extras.Sync.Menu.prototype.activate.call(this)) {
            this.addMenu(this)
        }
    },
    close: function() {
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null
        }
    },
    _getItemElement: function(a) {
        if (a == null) {
            return null
        }
        while (a.nodeName.toLowerCase() != "td") {
            if (a == this.element) {
                return null
            }
            a = a.parentNode
        }
        return a
    },
    _getItemModel: function(c) {
        var b = null;
        c = this._getItemElement(c);
        if (c == null) {
            return null
        }
        for (var a in this.itemElements) {
            if (this.itemElements[a] == c) {
                b = a;
                break
            }
        }
        if (b == null) {
            return null
        } else {
            return this.menuModel.findItem(b)
        }
    },
    getPreferredSize: function() {
        this._menuBarTable.style.height = "";
        var a = Echo.Sync.Insets.toPixels(this.component.render("insets", Extras.Sync.MenuBarPane.DEFAULTS.insets));
        return {
            height: new Core.Web.Measure.Bounds(this.element).height + a.top + a.bottom
        }
    },
    getSubMenuPosition: function(d) {
        var b = this.itemElements[d.id];
        if (!b) {
            throw new Error("Invalid menu: " + d)
        }
        var a = new Core.Web.Measure.Bounds(this.element);
        var c = new Core.Web.Measure.Bounds(b);
        return {
            x: c.left,
            y: a.top + a.height
        }
    },
    _processClick: function(b) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true
        }
        Core.Web.DOM.preventEventDefault(b);
        var a = this._getItemModel(Core.Web.DOM.getEventTarget(b));
        if (a) {
            if (a instanceof Extras.OptionModel) {
                this.deactivate();
                this.processAction(a)
            } else {
                this.activate();
                this._setActiveItem(a, true)
            }
        } else {
            this.deactivate()
        }
    },
    _processItemEnter: function(a) {
        this._processRollover(a, true)
    },
    _processItemExit: function(a) {
        this._processRollover(a, false)
    },
    _processRollover: function(d, c) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true
        }
        var a = this._getItemElement(Core.Web.DOM.getEventTarget(d));
        if (!a) {
            return
        }
        var b = this._getItemModel(a);
        if (this.stateModel && !this.stateModel.isEnabled(b.modelId)) {
            return
        }
        if (this.component.get("active")) {
            if (c) {
                this._setActiveItem(b, b instanceof Extras.MenuModel)
            }
        } else {
            this._setItemHighlight(b, c)
        }
    },
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.element);
        var b = new Core.Web.Measure.Bounds(this.element.parentNode);
        var a = b.height - this._menuBarBorderHeight;
        this._menuBarTable.style.height = a <= 0 ? "" : a + "px"
    },
    renderDispose: function(a) {
        this._menuBarTable = null;
        Core.Web.Event.removeAll(this.element);
        Extras.Sync.Menu.prototype.renderDispose.call(this, a)
    },
    renderMain: function(d) {
        var b = document.createElement("div");
        b.id = this.component.renderId;
        b.style.cssText = "overflow:hidden;";
        Echo.Sync.renderComponentDefaults(this.component, b);
        var c = this.component.render("border", Extras.Sync.Menu.DEFAULTS.border);
        var k = Echo.Sync.Border.isMultisided(c);
        this._menuBarBorderHeight = Echo.Sync.Border.getPixelSize(c, "top") + Echo.Sync.Border.getPixelSize(c, "bottom");
        Echo.Sync.Border.render(k ? c.top : c, b, "borderTop");
        Echo.Sync.Border.render(k ? c.bottom : c, b, "borderBottom");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), b);
        this._menuBarTable = document.createElement("table");
        this._menuBarTable.style.borderCollapse = "collapse";
        b.appendChild(this._menuBarTable);
        var g = document.createElement("tbody");
        this._menuBarTable.appendChild(g);
        var a = document.createElement("tr");
        g.appendChild(a);
        if (this.menuModel == null || this.menuModel.items.length === 0) {
            a.appendChild(this._createMenuBarItem("\u00a0", null))
        } else {
            var f = this.menuModel.items;
            for (var e = 0; e < f.length; ++e) {
                var j = f[e];
                if (j instanceof Extras.OptionModel || j instanceof Extras.MenuModel) {
                    var h = this._createMenuBarItem(j.text, j.icon);
                    a.appendChild(h);
                    this.itemElements[j.id] = h
                }
            }
            Core.Web.Event.add(b, "click", Core.method(this, this._processClick), false);
            Core.Web.Event.add(b, "mouseover", Core.method(this, this._processItemEnter), false);
            Core.Web.Event.add(b, "mouseout", Core.method(this, this._processItemExit), false)
        }
        Core.Web.Event.Selection.disable(b);
        return b
    },
    _createMenuBarItem: function(d, b) {
        var f = document.createElement("td");
        f.style.padding = "0px";
        f.style.cursor = "pointer";
        var e = document.createElement("div");
        e.style.whiteSpace = "nowrap";
        Echo.Sync.Insets.render(Extras.Sync.MenuBarPane.DEFAULTS.itemInsets, e, "padding");
        f.appendChild(e);
        if (b) {
            var a = document.createElement("img");
            a.style.verticalAlign = "middle";
            a.src = b;
            e.appendChild(a);
            if (d) {
                a.style.paddingRight = "1ex"
            }
        }
        if (d) {
            var c = document.createElement("span");
            c.style.verticalAlign = "middle";
            c.appendChild(document.createTextNode(d));
            e.appendChild(c)
        }
        return f
    },
    _setActiveItem: function(a, b) {
        if (this._activeItem == a) {
            return
        }
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null
        }
        if (b) {
            this.activateItem(a)
        }
        if (a) {
            this._activeItem = a;
            this._setItemHighlight(this._activeItem, true)
        }
    },
    _setItemHighlight: function(b, c) {
        var a = this.itemElements[b.id];
        if (c) {
            Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), a);
            Echo.Sync.Color.render(this.component.render("selectionBackground", Extras.Sync.Menu.DEFAULTS.selectionBackground), a, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("selectionForeground", Extras.Sync.Menu.DEFAULTS.selectionForeground), a, "color")
        } else {
            a.style.backgroundImage = "";
            a.style.backgroundColor = "";
            a.style.color = ""
        }
    }
});

function jsSHA(R, Q) {
    jsSHA.charSize = 16;
    jsSHA.b64pad = "=";
    jsSHA.hexCase = 0;
    var H = null;
    var y = null;
    var n = function(p) {
        var o = [];
        var s = (1 << jsSHA.charSize) - 1;
        var r = p.length * jsSHA.charSize;
        for (var q = 0; q < r; q += jsSHA.charSize) {
            o[q >> 5] |= (p.charCodeAt(q / jsSHA.charSize) & s) << (32 - jsSHA.charSize - q % 32)
        }
        return o
    };
    var l = function(p) {
        var o = [];
        var s = p.length;
        for (var q = 0; q < s; q += 2) {
            var r = parseInt(p.substr(q, 2), 16);
            if (!isNaN(r)) {
                o[q >> 3] |= r << (24 - (4 * (q % 8)))
            } else {
                return "INVALID HEX STRING"
            }
        }
        return o
    };
    var j = null;
    var h = null;
    if ("HEX" === Q) {
        if (0 !== (R.length % 2)) {
            return "TEXT MUST BE IN BYTE INCREMENTS"
        }
        j = R.length * 4;
        h = l(R)
    } else {
        if (("ASCII" === Q) || ("undefined" === typeof(Q))) {
            j = R.length * jsSHA.charSize;
            h = n(R)
        } else {
            return "UNKNOWN TEXT INPUT TYPE"
        }
    }
    var K = function(p) {
        var o = jsSHA.hexCase ? "0123456789ABCDEF" : "0123456789abcdef";
        var s = "";
        var r = p.length * 4;
        for (var q = 0; q < r; q++) {
            s += o.charAt((p[q >> 2] >> ((3 - q % 4) * 8 + 4)) & 15) + o.charAt((p[q >> 2] >> ((3 - q % 4) * 8)) & 15)
        }
        return s
    };
    var z = function(p) {
        var o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var v = "";
        var u = p.length * 4;
        for (var r = 0; r < u; r += 3) {
            var s = (((p[r >> 2] >> 8 * (3 - r % 4)) & 255) << 16) | (((p[r + 1 >> 2] >> 8 * (3 - (r + 1) % 4)) & 255) << 8) | ((p[r + 2 >> 2] >> 8 * (3 - (r + 2) % 4)) & 255);
            for (var q = 0; q < 4; q++) {
                if (r * 8 + q * 6 > p.length * 32) {
                    v += jsSHA.b64pad
                } else {
                    v += o.charAt((s >> 6 * (3 - q)) & 63)
                }
            }
        }
        return v
    };
    var x = function(o, p) {
        if (p < 32) {
            return (o >>> p) | (o << (32 - p))
        } else {
            return o
        }
    };
    var t = function(o, p) {
        if (p < 32) {
            return o >>> p
        } else {
            return 0
        }
    };
    var m = function(o, q, p) {
        return (o & q) ^ (~o & p)
    };
    var k = function(o, q, p) {
        return (o & q) ^ (o & p) ^ (q & p)
    };
    var i = function(o) {
        return x(o, 2) ^ x(o, 13) ^ x(o, 22)
    };
    var g = function(o) {
        return x(o, 6) ^ x(o, 11) ^ x(o, 25)
    };
    var f = function(o) {
        return x(o, 7) ^ x(o, 18) ^ t(o, 3)
    };
    var e = function(o) {
        return x(o, 17) ^ x(o, 19) ^ t(o, 10)
    };
    var d = function(p, r) {
        var q = (p & 65535) + (r & 65535);
        var o = (p >>> 16) + (r >>> 16) + (q >>> 16);
        return ((o & 65535) << 16) | (q & 65535)
    };
    var c = function(p, o, u, s) {
        var r = (p & 65535) + (o & 65535) + (u & 65535) + (s & 65535);
        var q = (p >>> 16) + (o >>> 16) + (u >>> 16) + (s >>> 16) + (r >>> 16);
        return ((q & 65535) << 16) | (r & 65535)
    };
    var b = function(p, o, v, u, s) {
        var r = (p & 65535) + (o & 65535) + (v & 65535) + (u & 65535) + (s & 65535);
        var q = (p >>> 16) + (o >>> 16) + (v >>> 16) + (u >>> 16) + (s >>> 16) + (r >>> 16);
        return ((q & 65535) << 16) | (r & 65535)
    };
    var a = function(B, A, w) {
        var o = [];
        var M, L, J, I, G, F, E, D;
        var v, s;
        var q;
        var p = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
        if (w === "SHA-224") {
            q = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]
        } else {
            q = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]
        }
        B[A >> 5] |= 128 << (24 - A % 32);
        B[((A + 1 + 64 >> 9) << 4) + 15] = A;
        var u = B.length;
        for (var C = 0; C < u; C += 16) {
            M = q[0];
            L = q[1];
            J = q[2];
            I = q[3];
            G = q[4];
            F = q[5];
            E = q[6];
            D = q[7];
            for (var r = 0; r < 64; r++) {
                if (r < 16) {
                    o[r] = B[r + C]
                } else {
                    o[r] = c(e(o[r - 2]), o[r - 7], f(o[r - 15]), o[r - 16])
                }
                v = b(D, g(G), m(G, F, E), p[r], o[r]);
                s = d(i(M), k(M, L, J));
                D = E;
                E = F;
                F = G;
                G = d(I, v);
                I = J;
                J = L;
                L = M;
                M = d(v, s)
            }
            q[0] = d(M, q[0]);
            q[1] = d(L, q[1]);
            q[2] = d(J, q[2]);
            q[3] = d(I, q[3]);
            q[4] = d(G, q[4]);
            q[5] = d(F, q[5]);
            q[6] = d(E, q[6]);
            q[7] = d(D, q[7])
        }
        switch (w) {
            case "SHA-224":
                return [q[0], q[1], q[2], q[3], q[4], q[5], q[6]];
            case "SHA-256":
                return q;
            default:
                return []
        }
    };
    this.getHash = function(p, o) {
        var r = null;
        var q = h.slice();
        switch (o) {
            case "HEX":
                r = K;
                break;
            case "B64":
                r = z;
                break;
            default:
                return "FORMAT NOT RECOGNIZED"
        }
        switch (p) {
            case "SHA-224":
                if (H === null) {
                    H = a(q, j, p)
                }
                return r(H);
            case "SHA-256":
                if (y === null) {
                    y = a(q, j, p)
                }
                return r(y);
            default:
                return "HASH NOT RECOGNIZED"
        }
    };
    this.getHMAC = function(D, C, B, A) {
        var w = null;
        var v = null;
        var u = [];
        var s = [];
        var q = null;
        var p = null;
        var o = null;
        switch (A) {
            case "HEX":
                w = K;
                break;
            case "B64":
                w = z;
                break;
            default:
                return "FORMAT NOT RECOGNIZED"
        }
        switch (B) {
            case "SHA-224":
                o = 224;
                break;
            case "SHA-256":
                o = 256;
                break;
            default:
                return "HASH NOT RECOGNIZED"
        }
        if ("HEX" === C) {
            if (0 !== (D.length % 2)) {
                return "KEY MUST BE IN BYTE INCREMENTS"
            }
            v = l(D);
            p = D.length * 4
        } else {
            if ("ASCII" === C) {
                v = n(D);
                p = D.length * jsSHA.charSize
            } else {
                return "UNKNOWN KEY INPUT TYPE"
            }
        }
        if (512 < p) {
            v = a(v, p, B);
            v[15] &= 4294967040
        } else {
            if (512 > p) {
                v[15] &= 4294967040
            }
        }
        for (var r = 0; r <= 15; r++) {
            u[r] = v[r] ^ 909522486;
            s[r] = v[r] ^ 1549556828
        }
        q = a(u.concat(h), 512 + j, B);
        q = a(s.concat(q), 512 + o, B);
        return (w(q))
    }
}
WS = {
    URL_PASS_EXPR: /(\?|&)p=([0-9a-z]+)/,
    STORED_PASS_EXPR: /WSPass=([0-9a-z]+);?/,
    _COOKIE: /WSPref\=(.*?)(?:;|$)/,
    LINK_URL_DOC: "http://android.nextapp.com/site/websharing/doc",
    LINK_URL_DOC_FAQ: "http://android.nextapp.com/site/websharing/doc/faq",
    MODULE_ABOUT: ["lib/extras/Application.TabPane.js", "lib/extras/Sync.TabPane.js", "app/About.js"],
    MODULE_PREFERENCE_EDITOR: ["lib/echo/Sync.ToggleButton.js", "app/PreferenceEditor.js"],
    MODULE_WORKSPACE: ["lib/extras/Application.TabPane.js", "lib/extras/Sync.TabPane.js", "lib/xfile/XFile.js", "app/EventContainer.js", "app/Slider.js", "app/Workspace.js", "app/UploadMonitor.js"],
    MODULE_FILE_BROWSER: ["lib/echo/Sync.List.js", "lib/echo/Sync.ToggleButton.js", "lib/extras/Application.AccordionPane.js", "lib/extras/Application.Viewer.js", "lib/extras/Application.ListViewer.js", "lib/extras/Application.FlowViewer.js", "lib/extras/Sync.AccordionPane.js", "lib/extras/Sync.Viewer.js", "lib/extras/Sync.ListViewer.js", "lib/extras/Sync.FlowViewer.js", "app/Flow.js", "app/ViewerUtil.js", "app/FileBrowser.js"],
    MODULE_DISPLAY_IMAGE: ["app/ImageDisplay.js"],
    MODULE_DISPLAY_TEXT: ["app/TextDisplay.js"],
    MODULE_HTML5_VIDEO_PLAYER: ["app/VideoPlayer.js", "app/Html5VideoPlayer.js"],
    MODULE_FLASH_VIDEO_PLAYER: ["app/VideoPlayer.js", "lib/flowplayer/flowplayer-3.2.12.min.js", "app/FlashVideoPlayer.js"],
    MODULE_PHOTOS: ["lib/extras/Application.Viewer.js", "lib/extras/Application.ListViewer.js", "lib/extras/Application.FlowViewer.js", "lib/extras/Sync.Viewer.js", "lib/extras/Sync.ListViewer.js", "lib/extras/Sync.FlowViewer.js", "app/ViewerUtil.js", "app/ImageDisplay.js", "app/Photos.js"],
    MODULE_MUSIC: ["lib/soundmanager/soundmanager2.js", "lib/soundmanager/config.js", "lib/echo/Sync.ToggleButton.js", "lib/extras/Application.Viewer.js", "lib/extras/Application.ListViewer.js", "lib/extras/Application.FlowViewer.js", "lib/extras/Sync.Viewer.js", "lib/extras/Sync.ListViewer.js", "lib/extras/Sync.FlowViewer.js", "app/TrackDescription.js", "app/Slider.js", "app/ViewerUtil.js", "app/RGB.js", "app/Music.js"],
    MODULE_VIDEOS: ["lib/extras/Application.Viewer.js", "lib/extras/Application.FlowViewer.js", "lib/extras/Sync.Viewer.js", "lib/extras/Sync.FlowViewer.js", "app/ViewerUtil.js", "app/Videos.js"],
    MODULE_STATUS: ["lib/echo/Sync.List.js", "lib/informagen/CapacityBar.js", "app/Status.js"],
    MODULE_UPGRADE: ["app/Upgrade.js"],
    MODULE_UPLOAD: ["lib/filetransfer/Application.UploadSelect.js", "lib/filetransfer/Sync.UploadSelect.js", "lib/filetransfer/Application.MultipleUploadSelect.js", "lib/filetransfer/SWFUpload.js", "lib/filetransfer/Sync.MultipleUploadSelect.js", "app/Upload.js"],
    MODULE_LOCALE: {
        fr: ["app/Resource_fr.js"]
    },
    accessMonitor: null,
    pref: {},
    storage: [],
    mediaIndices: [],
    uploadManager: null,
    loadPrefs: function() {
        WS.pref.multipleUpload = true;
        WS.pref.fileListView = false;
        WS.pref.videoAuto = true;
        try {
            var b = WS._COOKIE.exec(document.cookie);
            if (b && b[1]) {
                var c = decodeURIComponent(b[1]);
                var a = c.split(",");
                if (a.length >= 1) {
                    WS.pref.multipleUpload = a[0] == "1";
                    WS.pref.videoAuto = a[1] == "3";
                    WS.pref.videoHtml5 = a[1] == "2";
                    WS.pref.videoFlash = a[1] == "1";
                    WS.pref.fileListView = a[2] == "1";
                    WS.pref.fileStorageBase = a[3];
                    WS.pref.mediaIndex = a[4];
                    WS.pref.quickTipsDisable = a[5]
                }
                WS.savePrefs()
            }
        } catch (d) {
            alert("Failed to retrieve preferences: " + d)
        }
    },
    savePrefs: function() {
        var b = new Date();
        b.setFullYear(b.getFullYear() + 1);
        var a = [WS.pref.animationEnabled ? 1 : 0, WS.pref.videoFlash ? 1 : (WS.pref.videoHtml5 ? 2 : (WS.pref.videoAuto ? 3 : 0)), WS.pref.fileListView ? 1 : 0, WS.pref.fileStorageBase || "external", WS.pref.mediaIndex || "default", WS.pref.quickTipsDisable ? 1 : 0];
        var c = a.join(",");
        document.cookie = "WSPref=" + encodeURIComponent(c) + ";" + b.toGMTString()
    },
    SERVER_URL: "/service/",
    user: null,
    flashAvailable: false,
    getResources: function() {
        return {
            m: WS.Messages.get(WS.locale),
            i: WS.Images.get(WS.locale)
        }
    },
    _getStoredPassword: function() {
        var a = window.name || "";
        var b = WS.STORED_PASS_EXPR.exec(a);
        return b ? b[1] : null
    },
    init: function(a, e) {
        if (this._processUrlPassword()) {
            return
        }
        Core.Web.init();
        WS.loadPrefs();
        if (Core.Web.Env.ENGINE_MSHTML) {
            document.documentElement.style.overflow = "hidden";
            if (Core.Web.Env.ENGINE_VERSION_MAJOR <= 6) {
                WS.Server.retryTimes = [5000, 15000]
            }
        }
        if (Echo.DebugConsole) {
            Echo.DebugConsole.install()
        }
        if (Core.Web.Env.ENGINE_MSHTML) {
            try {
                this.flashAvailable = !!(new ActiveXObject("ShockwaveFlash.ShockwaveFlash.9"))
            } catch (g) {}
        } else {
            if (navigator.plugins) {
                for (var f = 0; f < navigator.plugins.length; ++f) {
                    if (/flash/gi.test(navigator.plugins[f].name)) {
                        var d = /[0-9]+/g.exec(navigator.plugins[f].description);
                        if (d) {
                            var c = parseInt(d[0], 10);
                            this.flashAvailable = c >= 9
                        }
                    }
                }
            }
        }
        this.clientId = new Date().getTime().toString(36) + "_" + parseInt(Math.random() * (1 << 30), 10).toString(36);
        this.accessMonitor = new WS.AccessMonitor();
        var h = new WS.App(this._getStoredPassword());
        var b = new Echo.FreeClient(h, document.getElementById(a));
        b.addResourcePath("Echo", "lib/echo/");
        b.addResourcePath("Extras", "lib/extras/");
        b.addResourcePath("FileTransfer", "lib/filetransfer/");
        b.addResourcePath("WS", "app/");
        WS.Style.init();
        h.setStyleSheet(WS.Style.styleSheet);
        b.init()
    },
    _processUrlPassword: function() {
        var b = document.URL.toString();
        var a = WS.URL_PASS_EXPR.exec(b);
        if (!a) {
            return false
        }
        this.storePassword(a[2]);
        var c = b.replace(WS.URL_PASS_EXPR, a[1] + "pr=1");
        window.location.href = c;
        return true
    },
    setAccessTimeout: function(a) {
        this.accessMonitor.setAccessTimeout(a)
    },
    storePassword: function(b) {
        var a = window.name || "";
        if (!/;$/.test(a)) {
            a += ";"
        }
        a = a.replace(WS.STORED_PASS_EXPR, "");
        if (b) {
            a += "WSPass=" + b + ";"
        }
        window.name = a
    },
    touch: function(a) {
        this.accessMonitor.touch(a)
    }
};
WS.App = Core.extend(Echo.Application, {
    $static: {
        _activeApp: null,
        displayError: function(b, a) {
            if (this._activeApp) {
                this._activeApp.displayError(b, a)
            } else {
                alert("Error\n\n" + (b || "") + "\n\n" + (a || ""))
            }
        }
    },
    server: null,
    content: null,
    $construct: function(a) {
        Echo.Application.call(this);
        this._password = a;
        if (!this._password) {
            this._displayWelcome(false)
        }
        WS.App._activeApp = this
    },
    displayError: function(d, c) {
        var b = WS.getResources();
        var a = new WS.Dialog(d || b.m["Generic.ErrorDialog.Title"], null, c || b.m["Generic.ErrorDialog.Message"], b.i["Dialog.Error"], WS.Dialog.CONTROLS_OK);
        this.content.add(a)
    },
    displayVideo: function(d, c, b) {
        var a;
        if (WS.pref.videoAuto) {
            if (d in WS.ContentType.CONTENT_TYPES_VIDEO_HTML5) {
                this._displayVideoHtml5(c, b)
            } else {
                this._displayVideoFlash(c, b)
            }
        } else {
            if (WS.pref.videoFlash) {
                this._displayVideoFlash(c, b)
            } else {
                if (WS.pref.videoHtml5) {
                    this._displayVideoHtml5(c, b)
                }
            }
        }
    },
    _displayVideoFlash: function(b, a) {
        this.client.exec(WS.MODULE_FLASH_VIDEO_PLAYER, Core.method(this, function() {
            var c = new WS.FlashVideoPlayerWindow(b);
            c.addListener("download", Core.method(this, function(d) {
                top.location = a
            }));
            c.addListener("switchToHtml5", Core.method(this, function(d) {
                this._displayVideoHtml5(b, a)
            }));
            this.content.add(c)
        }))
    },
    _displayVideoHtml5: function(b, a) {
        this.client.exec(WS.MODULE_HTML5_VIDEO_PLAYER, Core.method(this, function() {
            var c = new WS.Html5VideoPlayerWindow(b);
            c.addListener("download", Core.method(this, function(d) {
                top.location = a
            }));
            c.addListener("switchToFlash", Core.method(this, function(d) {
                this._displayVideoFlash(b, a)
            }));
            this.content.add(c)
        }))
    },
    _display: function(a) {
        if (this.content && this.content.dispose) {
            this.content.dispose()
        }
        this.rootComponent.removeAll();
        this.content = a;
        this.rootComponent.add(this.content);
        if (this.content && this.content.init) {
            this.content.init()
        }
    },
    _displayWorkspace: function() {
        this.client.exec(WS.MODULE_WORKSPACE, Core.method(this, function() {
            var a = new WS.Workspace();
            a.addListener("exit", Core.method(this, this._processExit));
            this._display(a)
        }))
    },
    _displayWelcome: function(b) {
        var a = new WS.WelcomeScreen(b);
        a.addListener("authRequest", Core.method(this, this._processAuthRequest));
        this._display(a)
    },
    _processExpire: function(a) {
        if (a) {
            this._sessionExpired()
        }
    },
    _processTouch: function(c) {
        var a = WS.Synchronize.getTouchUrl();
        var b = new Core.Web.HttpConnection(a, "GET");
        b.addResponseListener(Core.method(this, this._processTouchResponse));
        b.connect()
    },
    _processTouchResponse: function(a) {
        WS.accessMonitor.touch(false)
    },
    _processAuthRequest: function(b) {
        var a = new WS.Synchronize.Auth(this.server);
        a.login(Core.method(this, function(d, c) {
            if (d) {
                WS.storePassword(b.password);
                this._displayWorkspace()
            } else {
                if (c) {
                    this._sessionExpired()
                } else {
                    b.source.displayInvalidLogin()
                }
            }
        }), b.password)
    },
    init: function() {
        Echo.Application.prototype.init.call(this);
        WS.accessMonitor.onServerKeepAliveListener = Core.method(this, this._processTouch);
        WS.accessMonitor.onExpireListener = Core.method(this, this._processExpire);
        this.server = new WS.Server(this.client, WS.SERVER_URL);
        this.server.addListener("error", Core.method(this, function(c) {
            var b = "Could not communicate with server.";
            if (this.client) {
                this.client.fail(b)
            } else {
                alert(b)
            }
        }));
        var a = new WS.Synchronize.Auth(this.server);
        a.load(Core.method(this, this._processInit2))
    },
    _processInit2: function() {
        if (WS.locale && WS.MODULE_LOCALE[WS.locale]) {
            this.client.exec(WS.MODULE_LOCALE[WS.locale], Core.method(this, function() {
                this._processInit3()
            }))
        } else {
            this._processInit3()
        }
    },
    _processInit3: function() {
        if (!this._password) {
            this._processInit4();
            return
        }
        var a = new WS.Synchronize.Auth(this.server);
        a.login(Core.method(this, function(c, b) {
            if (c) {
                this._displayWorkspace()
            } else {
                if (b) {
                    this._sessionExpired()
                } else {
                    WS.storePassword(null);
                    this._displayWelcome(false)
                }
            }
            this._processInit4()
        }), this._password)
    },
    _processInit4: function() {
        if (this.content && this.content.start) {
            this.content.start()
        }
    },
    _processExit: function(b) {
        WS.storePassword(null);
        var a = new WS.Synchronize.Auth(this.server);
        a.logout(Core.method(this, function() {
            this._displayWelcome(true)
        }))
    },
    _sessionExpired: function() {
        this.client.displayError(null, "Session Expired", null, "Continue", function() {
            window.location.reload()
        }, Echo.Client.STYLE_MESSAGE)
    }
});
WS.AccessMonitor = Core.extend({
    _timeout: 0,
    _runnable: null,
    onExpireListener: null,
    onServerKeepAliveListener: null,
    _lastAccessTime: 0,
    _queued: false,
    $construct: function() {
        this._lastAccessTime = new Date().getTime();
        this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._check), 1000, false)
    },
    _check: function() {
        this._queued = false;
        if (this._timeout <= 0) {
            return
        }
        var c = this._lastAccessTime + (this._timeout * 1000);
        var b = new Date().getTime();
        var a = c - b;
        if (a < 0) {
            if (this.onExpireListener) {
                this.onExpireListener(true)
            }
        } else {
            if (a < 60 * 1000) {
                if (this.onExpireListener) {
                    this.onExpireListener(false)
                }
                this._queueCheck()
            } else {
                this._queueCheck()
            }
        }
    },
    _queueCheck: function() {
        Core.Web.Scheduler.remove(this._runnable);
        Core.Web.Scheduler.add(this._runnable);
        this._queued = true
    },
    setAccessTimeout: function(a) {
        this.touch();
        this._timeout = a;
        this._queueCheck()
    },
    touch: function(a) {
        if (a) {
            var c = this._lastAccessTime + (this._timeout * 1000);
            var b = c - new Date().getTime();
            if (b < 60 * 1000) {
                if (this.onServerKeepAliveListener) {
                    this.onServerKeepAliveListener()
                } else {
                    Core.Debug.consoleWrite("Keep alive required and no listener configured.")
                }
            }
        } else {
            this._lastAccessTime = new Date().getTime()
        }
    }
});
WS.ContentType = Core.extend({
    $static: {
        CONTENT_TYPES_VIDEO: {
            "video/mp4": true,
            "video/3gpp": true,
            "video/avi": true,
            "video/x-ms-wmv": true,
            "video/x-m4v": true,
            "video/ogg": true,
            "video/webm": true,
            "video/x-matroska": true
        },
        CONTENT_TYPES_VIDEO_HTML5: {
            "video/mp4": true,
            "video/ogg": true,
            "video/webm": true,
            "video/x-matroska": true
        },
        _extensionToDescriptor: {},
        Descriptor: Core.extend({
            $construct: function(a, d, c, b) {
                this.name = a;
                this.iconName = d;
                this.extensions = b;
                this.contentType = c
            },
            canDisplayAsImage: function() {
                return this.contentType in {
                    "image/jpeg": true,
                    "image/gif": true,
                    "image/png": true
                }
            },
            canDisplayAsText: function() {
                return this.contentType && this.contentType.indexOf("text/") === 0
            },
            canDisplayAsVideo: function() {
                return this.contentType in WS.ContentType.CONTENT_TYPES_VIDEO
            }
        }),
        getContentType: function(a) {
            var b = this.getDescriptor(a);
            return b == null ? null : b.contentType
        },
        getDescriptor: function(a) {
            var b = a.lastIndexOf(".");
            if (b !== -1) {
                a = a.substring(b + 1)
            }
            a = a.toLowerCase();
            return this._extensionToDescriptor[a]
        },
        _register: function(b) {
            for (var a = 0; a < b.extensions.length; ++a) {
                var c = b.extensions[a];
                if (!this._extensionToDescriptor[c]) {
                    this._extensionToDescriptor[c] = b
                }
            }
        }
    },
    $load: function() {
        this._register(new this.Descriptor("Microsoft Word Document", "document", "application/msword", ["doc", "dot", "docx"]));
        this._register(new this.Descriptor("Microsoft Excel Document", "spreadsheet", "application/vnd.ms-excel", ["xla", "xlc", "xlm", "xls", "xlt", "xlw", "xlsx"]));
        this._register(new this.Descriptor("Microsoft PowerPouint Document", "presentation", "application/vnd.ms-powerpoint", ["pot", "pps", "ppt", "pptx"]));
        this._register(new this.Descriptor("PDF Document", "document", "application/pdf", ["pdf"]));
        this._register(new this.Descriptor("Rich Text Document", "document", "application/rtf", ["rtf"]));
        this._register(new this.Descriptor("Tar/GZip Archive", "package_archive", "application/x-compressed", ["tgz"]));
        this._register(new this.Descriptor("Compressed Archive", "package_archive", "application/x-compress", ["z"]));
        this._register(new this.Descriptor("Zip Archive", "package_archive", "application/zip", ["zip"]));
        this._register(new this.Descriptor("Jar Archive", "package_archive", "application/jar", ["jar", "ear", "war"]));
        this._register(new this.Descriptor("Android Package", "package_android", "application/vnd.android.package-archive", ["apk"]));
        this._register(new this.Descriptor("GZip Archive", "package_archive", "application/x-gzip", ["gz", "gzip"]));
        this._register(new this.Descriptor("HTML Document", "text_html", "text/html", ["html", "html"]));
        this._register(new this.Descriptor("Text Document", "text", "text/plain", ["txt", "text"]));
        this._register(new this.Descriptor("Source Code", "text_source", "text/plain", ["c", "h", "m", "cpp", "pas", "java", "js", "php", "css", "pl", "sql", "xml"]));
        this._register(new this.Descriptor("MPEG Video", "video", "video/mpeg", ["mp2", "mpa", "mpe", "mpeg", "mpg", "mpv2"]));
        this._register(new this.Descriptor("Ogg Audio", "audio", "audio/ogg", ["oga"]));
        this._register(new this.Descriptor("Ogg Video", "video", "video/ogg", ["ogv"]));
        this._register(new this.Descriptor("Matroska Video", "video", "video/x-matroska", ["mkv"]));
        this._register(new this.Descriptor("MP4 Video", "video", "video/mp4", ["mp4"]));
        this._register(new this.Descriptor("M4V Video", "video", "video/x-m4v", ["m4v"]));
        this._register(new this.Descriptor("3GPP Video", "video", "video/3gpp", ["3gp", "3gpp"]));
        this._register(new this.Descriptor("WebM Video", "video", "video/webm", ["webm"]));
        this._register(new this.Descriptor("Windows Media Video", "video", "video/x-ms-wmv", ["wmv"]));
        this._register(new this.Descriptor("Windows Media Audio", "music", "audio/x-ms-wma", ["wma"]));
        this._register(new this.Descriptor("WAVE Audio", "music", "audio/wav", ["wav"]));
        this._register(new this.Descriptor("MP3 Audio", "music", "audio/mpeg", ["mp3"]));
        this._register(new this.Descriptor("JPEG Image", "image", "image/jpeg", ["jpg", "jpeg", "jpe"]));
        this._register(new this.Descriptor("TIFF Image", "image", "image/tiff", ["tif", "tiff"]));
        this._register(new this.Descriptor("GIF Image", "image", "image/gif", ["gif"]));
        this._register(new this.Descriptor("BMP Image", "image", "image/bmp", ["bmp"]));
        this._register(new this.Descriptor("PNG Image", "image", "image/png", ["png"]));
        this._register(new this.Descriptor("SVG Image", "image", "image/svg+xml", ["svg"]));
        this._register(new this.Descriptor("Icon Image", "image", "image/x-icon", ["ico"]));
        this._register(new this.Descriptor("Windows Executable", "executable", "application/octet-stream", ["exe", "com"]));
        this._register(new this.Descriptor("Windows Library", "executable", "application/octet-stream", ["dll"]));
        this._register(new this.Descriptor("Mac OS Disk Image", "package_archive", "application/octet-stream", ["dmg"]));
        this._register(new this.Descriptor("Debian Software Package", "package_archive", "application/octet-stream", ["deb"]));
        this._register(new this.Descriptor("RPM Software Package", "package_archive", "application/octet-stream", ["rpm"]))
    }
});
WS.Util = {
    _TRIM_LEADING: /^\s*/,
    _TRIM_TRAILING: /\s*$/,
    COMPACT_URL_XML_REPLACE_TABLE: {
        "(": "<",
        "<": "(",
        ")": ">",
        ">": ")",
        "~": "=",
        "=": "~",
        "!": "/",
        "/": "!",
        _: " ",
        " ": "_",
        "'": '"',
        '"': "'"
    },
    charReplace: function(d, e) {
        var a = "";
        for (var b = 0; b < d.length; ++b) {
            var c = d.charAt(b);
            a += c in e ? e[c] : c
        }
        return a
    },
    encodeURIComponent: function(a) {
        a = a || "";
        return encodeURIComponent(a).replace(/'/g, "%27")
    },
    formatDate: function(f, d) {
        var c = new Date(d);
        var b = [];
        var e = c.getHours();
        var a = c.getMinutes();
        b.push(c.getDate());
        b.push("/");
        b.push(f.m["Generic.Months.Short"][c.getMonth()]);
        b.push("/");
        b.push(c.getFullYear());
        b.push(" ");
        b.push(e < 10 ? "0" : "");
        b.push(e);
        b.push(":");
        b.push(a < 10 ? "0" : "");
        b.push(a);
        return b.join("")
    },
    formatTimeMSS: function(b) {
        b = Math.round(b);
        var a = ((b - b % 60) / 60);
        b = b % 60;
        return a + ":" + (b < 10 ? "0" : "") + b
    },
    formatDecimal: function(b) {
        var a = Math.round(b * 10);
        return Math.floor(a / 10) + "." + (a % 10)
    },
    formatBytes: function(a) {
        if (a < 1024) {
            return a + " bytes"
        } else {
            if (a < 1024 * 1024) {
                return WS.Util.formatDecimal(a / 1024) + " KiB"
            } else {
                if (a < 1024 * 1024 * 1024) {
                    return WS.Util.formatDecimal(a / (1024 * 1024)) + " MiB"
                } else {
                    return WS.Util.formatDecimal(a / (1024 * 1024 * 1024)) + " GiB"
                }
            }
        }
    },
    formatTimeRemaining: function(c) {
        c = Math.round(c);
        var a = Math.floor(c / 3600);
        var b = Math.floor(c / 60) % 60;
        var d = c % 60;
        if (a > 0) {
            return a + (b < 10 ? ":0" : ":") + b + (d < 10 ? ":0" : ":") + d + " remaining"
        } else {
            return b + (d < 10 ? ":0" : ":") + d + " remaining"
        }
    },
    formatBytesSecond: function(a) {
        if (a < 1024) {
            return a + " bytes/s"
        } else {
            if (a < 1024 * 1024) {
                return WS.Util.formatDecimal(a / 1024) + " KiB/s"
            } else {
                if (a < 1024 * 1024 * 1024) {
                    return WS.Util.formatDecimal(a / (1024 * 1024)) + " MiB/s"
                } else {
                    return WS.Util.formatDecimal(a / (1024 * 1024 * 1024)) + " GiB/s"
                }
            }
        }
    },
    trim: function(a) {
        return a.replace(WS.Util._TRIM_LEADING, "").replace(WS.Util._TRIM_TRAILING, "")
    }
};
WS.DOM = {};
WS.DOM.toString = function(a) {
    return WS.DOM._renderNode(a.documentElement)
};
WS.DOM._escapeText = function(a) {
    a = a.replace(/&/g, "&amp;");
    a = a.replace(/"/g, "&quot;");
    a = a.replace(/</g, "&lt;");
    a = a.replace(/>/g, "&gt;");
    return a
};
WS.DOM._renderNode = function(e) {
    var a;
    switch (e.nodeType) {
        case 1:
            a = "<" + e.nodeName;
            for (var c = 0; c < e.attributes.length; ++c) {
                a += " " + e.attributes[c].name + '="' + WS.DOM._escapeText(e.attributes[c].value) + '"'
            }
            var d = "";
            var b = e.firstChild;
            while (b) {
                d += WS.DOM._renderNode(b);
                b = b.nextSibling
            }
            if (d) {
                a += ">" + d + "</" + e.nodeName + ">"
            } else {
                a += "/>"
            }
            break;
        case 3:
            a = WS.DOM._escapeText(e.nodeValue);
            break;
        default:
            a = ""
    }
    return a
};
WS.Dialog = Core.extend(Echo.WindowPane, {
    $static: {
        CONTROLS_OK: [{
            resourceKey: "Generic.Ok",
            actionCommand: "ok"
        }],
        CONTROLS_OK_CANCEL: [{
            resourceKey: "Generic.Ok",
            actionCommand: "ok"
        }, {
            resourceKey: "Generic.Cancel",
            actionCommand: "cancel"
        }],
        CONTROLS_YES_NO: [{
            resourceKey: "Generic.Yes",
            actionCommand: "yes"
        }, {
            resourceKey: "Generic.No",
            actionCommand: "no"
        }]
    },
    _controlsRow: null,
    _contentContainer: null,
    $construct: function(f, g, d, j, h, b) {
        var a = WS.getResources();
        var e = [];
        if (j) {
            e.push(new Echo.Label({
                icon: j
            }))
        }
        if (d) {
            if (d instanceof Echo.Component) {
                e.push(d)
            } else {
                e.push(new Echo.Label({
                    text: d,
                    formatWhitespace: true
                }))
            }
        }
        Echo.WindowPane.call(this, {
            styleName: "Default",
            modal: true,
            resizable: false,
            closable: false,
            title: f,
            icon: g,
            width: "32em",
            events: {
                close: Core.method(this, this._processCancel),
                init: Core.method(this, function(k) {
                    if (this._controlsRow.children.length > 0) {
                        var i = this.application.getFocusedComponent();
                        if (!i || this == i || !this.isAncestorOf(i)) {
                            this.application.setFocusedComponent(this._controlsRow.children[0])
                        }
                    }
                })
            },
            children: [new Echo.SplitPane({
                styleName: "ControlPane.SplitBottom",
                children: [this._controlsRow = new Echo.Row({
                    styleName: "ControlPane"
                }), new Echo.Row({
                    layoutData: {
                        background: "#f5f5f5"
                    },
                    insets: 20,
                    cellSpacing: 20,
                    children: e
                })]
            })]
        });
        if (!h) {
            h = WS.Dialog.CONTROLS_OK
        }
        for (var c = 0; c < h.length; ++c) {
            this._controlsRow.add(new Echo.Button({
                styleName: "ControlPane",
                text: a.m[h[c].resourceKey],
                icon: h[c].icon || a.i[h[c].resourceKey],
                actionCommand: h[c].actionCommand,
                events: {
                    action: Core.method(this, this._processControlAction)
                }
            }))
        }
        if (b) {
            this.addListener("action", b)
        }
    },
    _processControlAction: function(a) {
        this.parent.remove(this);
        this.fireEvent({
            source: this,
            type: "action",
            actionCommand: a.actionCommand
        })
    }
});
WS.HtmlLabel = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("WS.HtmlLabel", this)
    },
    componentType: "WS.HtmlLabel"
});
WS.HtmlLabelSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function() {
        Echo.Render.registerPeer("WS.HtmlLabel", this)
    },
    _spanElement: null,
    renderAdd: function(b, a) {
        this._spanElement = document.createElement("span");
        Echo.Sync.Font.render(this.component.render("font"), this._spanElement);
        Echo.Sync.Color.renderFB(this.component, this._spanElement);
        this._spanElement.innerHTML = this.component.render("html", "");
        a.appendChild(this._spanElement)
    },
    renderDispose: function(a) {
        this._spanElement = null
    },
    renderUpdate: function(c) {
        var a = this._spanElement;
        var b = a.parentNode;
        this.renderDispose(c);
        b.removeChild(a);
        this.renderAdd(c, b);
        return false
    }
});
WS.IFrame = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("WS.IFrame", this)
    },
    componentType: "WS.IFrame",
    pane: true
});
WS.IFrameSync = Core.extend(Echo.Render.ComponentSync, {
    $load: function() {
        Echo.Render.registerPeer("WS.IFrame", this)
    },
    _iframe: null,
    renderAdd: function(b, a) {
        this._iframe = document.createElement("iframe");
        this._iframe.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
        this._iframe.src = this.component.get("src") || "about:blank";
        this._iframe.style.border = "0px none";
        this._iframe.frameBorder = "0";
        a.appendChild(this._iframe)
    },
    renderDispose: function(a) {
        this._iframe = null
    },
    renderUpdate: function(c) {
        var a = this._iframe;
        var b = a.parentNode;
        this.renderDispose(c);
        b.removeChild(a);
        this.renderAdd(c, b);
        return false
    }
});
WS.Server = Core.extend({
    $static: {
        retryTimes: [1500, 3500, 10000]
    },
    document: null,
    baseUrl: null,
    _nextMessageId: 0,
    _nextDirectiveId: 0,
    _listenerList: null,
    _waiting: false,
    _currentMessage: null,
    _nextMessage: null,
    $construct: function(a, b) {
        this._client = a;
        this.baseUrl = b;
        this._listenerList = new Core.ListenerList()
    },
    addListener: function(b, a) {
        this._listenerList.addListener(b, a)
    },
    fail: function(a) {
        this._client.fail(a)
    },
    _firePresync: function() {
        this._listenerList.fireEvent({
            source: this,
            type: "presync"
        })
    },
    _getMessage: function() {
        if (this._nextMessage) {
            return this._nextMessage
        } else {
            if (!this._currentMessage) {
                this._currentMessage = new WS.Server.Message(this._client, this)
            }
            return this._currentMessage
        }
    },
    invoke: function(d, b, a) {
        var c = this._getMessage();
        this.document = c.document;
        return c.addDirective(d, b, a)
    },
    _notifyComplete: function() {
        this._currentMessage = this._nextMessage;
        this._nextMessage = null;
        this._waiting = false
    },
    _notifyError: function(a) {
        if (this._listenerList.hasListeners("error")) {
            this._listenerList.fireEvent({
                source: this,
                type: "error",
                ex: a
            })
        } else {
            alert("Could not communicate with server.  Press you browser's reload/refresh button to restart the application.")
        }
    },
    _notifyProcessing: function() {
        this._waiting = true;
        this._nextMessage = new WS.Server.Message(this._client, this)
    },
    removeListener: function(b, a) {
        this._listenerList.removeListener(b, a)
    }
});
WS.Server.Security = {
    hashPassword: function(a) {
        return new jsSHA(a + WS.authUid, "ASCII").getHash("SHA-256", "B64")
    },
    signUrl: function(b) {
        if (!WS.authUid || !WS.user || !WS.user.password) {
            return b
        }
        var a = new jsSHA(b, "ASCII");
        var c = a.getHMAC("HMAC:" + WS.user.password + WS.authUid, "ASCII", "SHA-256", "B64");
        c = WS.Util.encodeURIComponent(c);
        if (b.indexOf("?") === -1) {
            return b + "?a=" + c
        } else {
            return b + "&a=" + c
        }
    },
    signString: function(b) {
        if (!WS.authUid || !WS.user || !WS.user.password) {
            return ""
        }
        var a = new jsSHA(b, "ASCII");
        var c = a.getHMAC("HMAC:" + WS.user.password + WS.authUid, "ASCII", "SHA-256", "B64");
        return c
    },
    signStringForUrl: function(a) {
        var b = this.signString(a);
        return WS.Util.encodeURIComponent(b)
    }
};
WS.Server.Message = Core.extend({
    $static: {
        Runnable: Core.extend(Core.Web.Scheduler.Runnable, {
            message: null,
            $construct: function(a) {
                this.message = a
            },
            run: function() {
                this.message._send()
            }
        }),
        WAIT_INTERVAL: 200
    },
    document: null,
    _responseProcessors: null,
    _runnable: null,
    _server: null,
    _scheduledTime: null,
    id: null,
    _inputRestrictionId: null,
    $construct: function(a, b) {
        this._client = a;
        this._server = b;
        this.id = this._server._nextMessageId++;
        this.document = Core.Web.DOM.createDocument(null, "q");
        this.document.documentElement.setAttribute("id", this.id);
        this._responseProcessors = {};
        this._runnable = new WS.Server.Message.Runnable(this)
    },
    addDirective: function(f, c, b) {
        b = b || {};
        if (f == null) {
            this._schedule(b.maximumDelay);
            return
        }
        var g = this._server._nextDirectiveId++;
        if (b.block) {
            if (this._inputRestrictionId == null) {
                this._inputRestrictionId = this._client.createInputRestriction()
            }
        }
        if (b.replace) {
            var e = this.document.documentElement.firstChild;
            while (e) {
                if (e.nodeType === 1 && e.nodeName === f) {
                    var d = e;
                    e = e.nextSibling;
                    this.document.documentElement.removeChild(d)
                } else {
                    e = e.nextSibling
                }
            }
        }
        var a = this.document.createElement(f);
        a.setAttribute("id", g);
        this.document.documentElement.appendChild(a);
        if (c) {
            this._responseProcessors[g] = c
        }
        this._schedule(b.maximumDelay);
        return a
    },
    _processInvalidResponse: function(a) {
        if (a.source.getStatus() === 401) {
            this._server.fail("[ Access Denied ]")
        } else {
            this._server.fail("Invalid response received from server: " + a.source.getStatus() + "\n" + a.source.getResponseText())
        }
    },
    _processResponse: function(c) {
        try {
            if (!c.valid) {
                this._processInvalidResponse(c);
                return
            }
            var a = c.source.getResponseXml();
            if (!a || !a.documentElement) {
                this._server._notifyError();
                return
            }
            var b = a.documentElement.firstChild;
            while (b) {
                if (b.nodeType == 1) {
                    var d = b.getAttribute("id");
                    if (this._responseProcessors[d]) {
                        this._responseProcessors[d]({
                            source: this,
                            element: b
                        })
                    }
                }
                b = b.nextSibling
            }
            this._server._notifyComplete()
        } finally {
            if (this._inputRestrictionId != null) {
                this._client.removeInputRestriction(this._inputRestrictionId)
            }
        }
    },
    _schedule: function(a) {
        a = a ? a : 0;
        var b = new Date().getTime() + a;
        if (!this._scheduledTime) {
            this._scheduledTime = b;
            this._runnable.timeInterval = a;
            Core.Web.Scheduler.add(this._runnable)
        } else {
            if (b < this._scheduledTime) {
                this._scheduledTime = b;
                this._runnable.timeInterval = a;
                Core.Web.Scheduler.update(this._runnable)
            }
        }
    },
    _send: function() {
        if (this._server._waiting) {
            this._runnable.timeInterval = WS.Server.Message.WAIT_INTERVAL;
            Core.Web.Scheduler.add(this._runnable);
            return
        }
        this._server._firePresync();
        var b = WS.DOM.toString(this.document);
        var a = this._server.baseUrl + "?a=" + WS.Server.Security.signStringForUrl(b);
        var e = null;
        if (b.length < 255) {
            var d = Math.floor(Math.random() * 1073741824).toString(36) + new Date().getTime().toString(36);
            b = WS.Util.charReplace(b, WS.Util.COMPACT_URL_XML_REPLACE_TABLE);
            a += "&z=" + d + "&c=" + WS.clientId + "&q=" + WS.Util.encodeURIComponent(b)
        } else {
            a += "&c=" + WS.clientId;
            e = b
        }
        WS.touch();
        var c = new WS.Server.MessageConnection(this.id, a, e, Core.method(this, this._processResponse));
        c.connect();
        this._server._notifyProcessing()
    }
});
WS.Server.MessageConnection = Core.extend({
    $static: {
        RetryRunnable: Core.extend(Core.Web.Scheduler.Runnable, {
            conn: null,
            $construct: function(a) {
                this.conn = a
            },
            run: function() {
                ++this.conn._retryIndex;
                this.conn._loadNextRetry();
                this.conn._openConnection()
            }
        })
    },
    _processed: false,
    _retryIndex: 0,
    _retryRunnable: null,
    $construct: function(d, a, c, b) {
        this._id = d;
        this._url = a;
        this._postXml = c;
        this._processor = b
    },
    connect: function() {
        if (this._id !== 0) {
            this._loadNextRetry()
        }
        this._openConnection()
    },
    _loadNextRetry: function() {
        if (this._retryIndex >= WS.Server.retryTimes.length) {
            return
        }
        if (!this._retryRunnable) {
            this._retryRunnable = new WS.Server.MessageConnection.RetryRunnable(this)
        }
        this._retryRunnable.timeInterval = WS.Server.retryTimes[this._retryIndex];
        Core.Web.Scheduler.add(this._retryRunnable)
    },
    _openConnection: function() {
        var a = this._url + "&y=" + this._retryIndex;
        var b;
        if (this._postXml) {
            b = new Core.Web.HttpConnection(a, "POST", this._postXml, "text/xml")
        } else {
            b = new Core.Web.HttpConnection(a, "GET")
        }
        b.addResponseListener(Core.method(this, this._processResponse));
        b.connect()
    },
    _processResponse: function(a) {
        if (this._retryRunnable) {
            Core.Web.Scheduler.remove(this._retryRunnable)
        }
        if (this._processed) {
            return
        }
        this._processed = true;
        this._processor(a)
    }
});
WS.Server.DOM = {
    getPropertyElementValue: function(b, a) {
        if (b == null) {
            return null
        }
        var c = b.firstChild;
        while (c) {
            if (c.nodeName == a) {
                c = c.firstChild;
                var d = "";
                while (c) {
                    if (c.nodeType == 3) {
                        d += c.nodeValue
                    }
                    c = c.nextSibling
                }
                return d === "" ? null : d
            }
            c = c.nextSibling
        }
        return null
    },
    setPropertyElementValue: function(b, a, d) {
        var c = b.ownerDocument.createElement(a);
        if (d != null) {
            c.appendChild(b.ownerDocument.createTextNode(d))
        }
        b.appendChild(c);
        return c
    }
};
WS.Synchronize = Core.extend({
    $static: {
        getUploadStoreStatusUrl: function(a) {
            var b = WS.SERVER_URL + "uploadstorestatus?upload-group-id=" + a;
            return WS.Server.Security.signUrl(b)
        },
        getTouchUrl: function() {
            var a = WS.SERVER_URL + "touch";
            return WS.Server.Security.signUrl(a)
        }
    },
    storageBase: null,
    mediaIndex: null,
    server: null,
    $construct: function(a) {
        this.server = a;
        this.storageBase = WS.pref.fileStorageBase || "external";
        this.mediaIndex = WS.pref.mediaIndex || "default"
    }
});
WS.Synchronize.Audio = Core.extend(WS.Synchronize, {
    getArtUrl: function(b) {
        var a = WS.SERVER_URL + "audioart?id=" + b;
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    getDownloadUrl: function(b) {
        var d, c;
        if (b.trackIds) {
            c = "tracks";
            d = b.trackIds
        } else {
            if (b.albumIds) {
                c = "albums";
                d = b.albumIds
            }
        }
        var a = WS.SERVER_URL + "audiodownload?" + c + "=" + d.join(",");
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    getHtml5UploadUrl: function() {
        var a = WS.SERVER_URL + "upload5";
        a += "?base=" + this.storageBase;
        return WS.Server.Security.signUrl(a)
    },
    getUploadUrl: function(a) {
        var b = WS.SERVER_URL + "upload";
        if (a) {
            b += ";jsessionid=" + WS.session
        }
        if (this.mediaIndex) {
            b += "?media=" + this.mediaIndex
        }
        return b
    },
    getUrl: function(a) {
        return WS.Server.Security.signUrl(WS.SERVER_URL + "audio?id=" + a.id + "&media=" + this.mediaIndex)
    },
    listAlbums: function(c, e, d) {
        var a = Core.method(this, function(n) {
            var k = n.element.firstChild;
            var m = parseInt(k.getAttribute("count"), 10);
            var h = [];
            var j = k.firstChild;
            while (j) {
                var l = {
                    index: parseInt(WS.Server.DOM.getPropertyElementValue(j, "index"), 10),
                    id: WS.Server.DOM.getPropertyElementValue(j, "id"),
                    name: WS.Server.DOM.getPropertyElementValue(j, "name"),
                    artist: WS.Server.DOM.getPropertyElementValue(j, "artist"),
                    art: WS.Server.DOM.getPropertyElementValue(j, "art")
                };
                h.push(l);
                j = j.nextSibling
            }
            var g = parseInt(k.getAttribute("start-index"), 10);
            var i = parseInt(k.getAttribute("end-index"), 10);
            c({
                count: m,
                items: h,
                startIndex: e,
                endIndex: d
            })
        });
        var f = this.server.invoke("audio", a, {
            replace: true
        });
        var b = f.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "albums");
        b.setAttribute("start-index", e);
        b.setAttribute("end-index", d);
        f.appendChild(b)
    },
    listArtists: function(c, e, d) {
        var a = Core.method(this, function(n) {
            var k = n.element.firstChild;
            var m = parseInt(k.getAttribute("count"), 10);
            var h = [];
            var j = k.firstChild;
            while (j) {
                var l = {
                    index: parseInt(WS.Server.DOM.getPropertyElementValue(j, "index"), 10),
                    id: WS.Server.DOM.getPropertyElementValue(j, "id"),
                    name: WS.Server.DOM.getPropertyElementValue(j, "name")
                };
                h.push(l);
                j = j.nextSibling
            }
            var g = parseInt(k.getAttribute("start-index"), 10);
            var i = parseInt(k.getAttribute("end-index"), 10);
            c({
                count: m,
                items: h,
                startIndex: e,
                endIndex: d
            })
        });
        var f = this.server.invoke("audio", a, {
            replace: true
        });
        var b = f.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "artists");
        b.setAttribute("start-index", e);
        b.setAttribute("end-index", d);
        f.appendChild(b)
    },
    listPlaylists: function(c, e, d) {
        var a = Core.method(this, function(n) {
            var k = n.element.firstChild;
            var m = parseInt(k.getAttribute("count"), 10);
            var h = [];
            var j = k.firstChild;
            while (j) {
                var l = {
                    index: parseInt(WS.Server.DOM.getPropertyElementValue(j, "index"), 10),
                    id: WS.Server.DOM.getPropertyElementValue(j, "id"),
                    name: WS.Server.DOM.getPropertyElementValue(j, "name")
                };
                h.push(l);
                j = j.nextSibling
            }
            var g = parseInt(k.getAttribute("start-index"), 10);
            var i = parseInt(k.getAttribute("end-index"), 10);
            c({
                count: m,
                items: h,
                startIndex: e,
                endIndex: d
            })
        });
        var f = this.server.invoke("audio", a, {
            replace: true
        });
        var b = f.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "playlists");
        b.setAttribute("start-index", e);
        b.setAttribute("end-index", d);
        f.appendChild(b)
    },
    listTracks: function(c, e, f, d) {
        var a = Core.method(this, function(o) {
            var l = o.element.firstChild;
            var n = parseInt(l.getAttribute("count"), 10);
            var i = [];
            var k = l.firstChild;
            while (k) {
                var m = {
                    index: parseInt(WS.Server.DOM.getPropertyElementValue(k, "index"), 10),
                    id: WS.Server.DOM.getPropertyElementValue(k, "id"),
                    name: WS.Server.DOM.getPropertyElementValue(k, "name"),
                    artist: WS.Server.DOM.getPropertyElementValue(k, "artist"),
                    album: WS.Server.DOM.getPropertyElementValue(k, "album"),
                    duration: WS.Server.DOM.getPropertyElementValue(k, "duration"),
                    type: WS.Server.DOM.getPropertyElementValue(k, "type")
                };
                i.push(m);
                k = k.nextSibling
            }
            var h = parseInt(l.getAttribute("start-index"), 10);
            var j = parseInt(l.getAttribute("end-index"), 10);
            c({
                count: n,
                items: i,
                startIndex: f,
                endIndex: d
            })
        });
        var g = this.server.invoke("audio", a, {
            replace: true
        });
        var b = g.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "tracks");
        b.setAttribute("start-index", f);
        b.setAttribute("end-index", d);
        g.appendChild(b);
        if (e) {
            if (e.artist) {
                WS.Server.DOM.setPropertyElementValue(b, "artist", e.artist)
            }
            if (e.album) {
                WS.Server.DOM.setPropertyElementValue(b, "album", e.album)
            }
            if (e.playlist) {
                WS.Server.DOM.setPropertyElementValue(b, "playlist", e.playlist)
            }
        }
    },
    uploadStore: function(b, c, f) {
        var a = Core.method(this, function(g) {
            b(g.element.firstChild.nodeValue)
        });
        var e = this.server.invoke("audio", a, {
            block: true
        });
        var d = e.ownerDocument.createElement("upload-store");
        d.setAttribute("base", c);
        WS.Server.DOM.setPropertyElementValue(d, "upload-id", f);
        e.appendChild(d)
    },
    uploadStore5: function(f, a, b) {
        var e = Core.method(this, function(i) {
            f(i.element.firstChild.nodeValue)
        });
        var h = this.server.invoke("audio", e, {
            block: false
        });
        var g = h.ownerDocument.createElement("upload-store-5");
        g.setAttribute("upload-group-id", a);
        h.appendChild(g);
        for (var d = 0; d < b.length; ++d) {
            var c = h.ownerDocument.createElement("item");
            c.setAttribute("base", b[d].storageBase);
            g.appendChild(c);
            WS.Server.DOM.setPropertyElementValue(c, "upload-id", b[d].uploadId);
            WS.Server.DOM.setPropertyElementValue(c, "item-path", b[d].itemPath);
            WS.Server.DOM.setPropertyElementValue(c, "storage-path", b[d].storagePath)
        }
    }
});
WS.Synchronize.Auth = Core.extend(WS.Synchronize, {
    load: function(d) {
        var b = Core.method(this, function(h) {
            WS.authUid = WS.Server.DOM.getPropertyElementValue(h.element, "uid");
            WS.directAccess = WS.Server.DOM.getPropertyElementValue(h.element, "direct") == "1";
            WS.lite = WS.Server.DOM.getPropertyElementValue(h.element, "lite") == "1";
            WS.version = WS.Server.DOM.getPropertyElementValue(h.element, "version");
            WS.locale = WS.Server.DOM.getPropertyElementValue(h.element, "locale");
            WS.quickTips = WS.Server.DOM.getPropertyElementValue(h.element, "tips") == "1";
            WS.setAccessTimeout(parseInt(WS.Server.DOM.getPropertyElementValue(h.element, "timeout"), 10));
            var g = h.element.getElementsByTagName("storage");
            if (g && g[0]) {
                var f = g[0].firstChild;
                while (f) {
                    switch (f.nodeName) {
                        case "storage-base":
                            WS.storage.push({
                                name: f.getAttribute("name"),
                                displayName: f.firstChild.nodeValue
                            });
                            break;
                        case "media-index":
                            WS.mediaIndices.push({
                                name: f.getAttribute("name"),
                                displayName: f.firstChild.nodeValue
                            });
                            break
                    }
                    f = f.nextSibling
                }
            }
            d()
        });
        var a = this.server.invoke("auth", b, {
            block: true
        });
        var c = this.server.document.createElement("load");
        a.appendChild(c)
    },
    login: function(e, c) {
        var a = WS.Server.Security.hashPassword(c);
        var d = Core.method(this, function(k) {
            var g = WS.Server.DOM.getPropertyElementValue(k.element, "status");
            switch (g) {
                case "accept":
                    WS.session = WS.Server.DOM.getPropertyElementValue(k.element, "session");
                    WS.user = {
                        owner: WS.Server.DOM.getPropertyElementValue(k.element, "owner") == "true",
                        password: c,
                        permissions: {}
                    };
                    var j = k.element.getElementsByTagName("permission");
                    for (var h = 0; h < j.length; ++h) {
                        WS.user.permissions[j[h].firstChild.nodeValue] = true
                    }
                    e(true);
                    break;
                case "decline":
                    e(false);
                    break;
                case "invaliduid":
                    e(false, true);
                    break;
                default:
                    throw new Error("Invalid server authentication response.")
            }
        });
        var b = this.server.invoke("auth", d, {
            block: true
        });
        var f = this.server.document.createElement("login");
        b.appendChild(f);
        WS.Server.DOM.setPropertyElementValue(f, "passhash", a);
        WS.Server.DOM.setPropertyElementValue(f, "uid", WS.authUid)
    },
    logout: function(c) {
        var b = Core.method(this, function(g) {
            var f = WS.Server.DOM.getPropertyElementValue(g.element, "status");
            if (f == "exit") {
                WS.user = null;
                c(true)
            } else {
                throw new Error("Invalid server authentication response.")
            }
        });
        var a = this.server.invoke("auth", b, {
            block: true
        });
        var d = this.server.document.createElement("logout");
        a.appendChild(d)
    }
});
WS.Synchronize.File = Core.extend(WS.Synchronize, {
    $static: {
        processThumbnailData: function(b, a) {
            a.thumbnailReady = b.getAttribute("thumbnail-state") == "ready";
            if (a.thumbnailReady) {
                a.thumbnailContentType = b.getAttribute("thumbnail-type");
                a.thumbnailWidth = parseInt(b.getAttribute("thumbnail-width"), 10);
                a.thumbnailHeight = parseInt(b.getAttribute("thumbnail-height"), 10)
            } else {
                a.thumbnailAvailable = b.getAttribute("thumbnail-state") == "available"
            }
        }
    },
    deleteFile: function(e, h, a) {
        var d = Core.method(this, function(i) {
            e(i.element.firstChild.nodeValue)
        });
        var g = this.server.invoke("file", d, {
            block: true
        });
        var f = g.ownerDocument.createElement("delete");
        if (this.storageBase) {
            f.setAttribute("base", this.storageBase)
        }
        f.setAttribute("path", h);
        g.appendChild(f);
        for (var c = 0; c < a.length; ++c) {
            var b = g.ownerDocument.createElement("item");
            b.appendChild(g.ownerDocument.createTextNode(a[c]));
            f.appendChild(b)
        }
    },
    getUrl: function(d, b, a) {
        d = WS.Util.encodeURIComponent(d);
        var c = WS.SERVER_URL + "file?path=" + d;
        if (b) {
            c += "&attach=1"
        }
        if (a) {
            c += "&cutoff=" + a
        }
        if (this.storageBase) {
            c += "&base=" + this.storageBase
        }
        return WS.Server.Security.signUrl(c)
    },
    getThumbnailUrl: function(b) {
        b = WS.Util.encodeURIComponent(b);
        var a = WS.SERVER_URL + "thumbnail?path=" + b;
        if (this.storageBase) {
            a += "&base=" + this.storageBase
        }
        return WS.Server.Security.signUrl(a)
    },
    getThumbnailGenerationUrl: function(b) {
        b = WS.Util.encodeURIComponent(b);
        var a = WS.SERVER_URL + "thumbnailgen?path=" + b;
        if (this.storageBase) {
            a += "&base=" + this.storageBase
        }
        return WS.Server.Security.signUrl(a)
    },
    getStreamUrl: function(b) {
        b = WS.Util.encodeURIComponent(b);
        var a = WS.SERVER_URL + "stream?path=" + b;
        if (this.storageBase) {
            a += "&base=" + this.storageBase
        }
        return WS.Server.Security.signUrl(a)
    },
    getDownloadUrl: function(c) {
        var a = [WS.SERVER_URL, "download?"];
        for (var b = 0; b < c.length; ++b) {
            a.push("path=" + WS.Util.encodeURIComponent(c[b]));
            if (b < c.length - 1) {
                a.push("&")
            }
        }
        if (this.storageBase) {
            a.push("&base=" + this.storageBase)
        }
        return WS.Server.Security.signUrl(a.join(""))
    },
    getHtml5UploadUrl: function() {
        var a = WS.SERVER_URL + "upload5";
        a += "?base=" + this.storageBase;
        return WS.Server.Security.signUrl(a)
    },
    getUploadUrl: function(a) {
        var b = WS.SERVER_URL + "upload";
        if (a) {
            b += ";jsessionid=" + WS.session
        }
        if (this.storageBase) {
            b += "?base=" + this.storageBase
        }
        return b
    },
    listFiles: function(c, f, g, e) {
        var a = Core.method(this, function(m) {
            var n = WS.Server.DOM.getPropertyElementValue(m.element, "error");
            if (n) {
                c({
                    error: n
                })
            } else {
                var p = m.element.firstChild;
                var l = parseInt(p.getAttribute("count"), 10);
                var h = [];
                var i = p.firstChild;
                while (i) {
                    var j = {
                        name: i.firstChild.nodeValue
                    };
                    if (i.getAttribute("directory") == "true") {
                        j.directory = true
                    } else {
                        j.size = parseInt(i.getAttribute("size"), 10)
                    }
                    j.date = parseInt(i.getAttribute("date"), 10) * 1000;
                    WS.Synchronize.File.processThumbnailData(i, j);
                    h.push(j);
                    i = i.nextSibling
                }
                var q = p.getAttribute("path");
                var o = parseInt(p.getAttribute("start-index"), 10);
                var k = parseInt(p.getAttribute("end-index"), 10);
                c({
                    path: q,
                    count: l,
                    files: h,
                    startIndex: g,
                    endIndex: e
                })
            }
        });
        var d = this.server.invoke("file", a, {
            replace: true
        });
        var b = WS.Server.DOM.setPropertyElementValue(d, "list", f.path);
        if (f.showHidden) {
            b.setAttribute("hidden", true)
        }
        if (this.storageBase) {
            b.setAttribute("base", this.storageBase)
        }
        b.setAttribute("start-index", g);
        b.setAttribute("end-index", e);
        d.appendChild(b)
    },
    newFolder: function(d, c, f) {
        var a = Core.method(this, function(g) {
            d(g.element.firstChild.nodeValue)
        });
        var e = this.server.invoke("file", a, {
            block: true
        });
        var b = WS.Server.DOM.setPropertyElementValue(e, "new-folder", f);
        if (this.storageBase) {
            b.setAttribute("base", this.storageBase)
        }
        b.setAttribute("parent", c)
    },
    relocateFiles: function(g, e, a, j, h, b) {
        var f = Core.method(this, function(i) {
            g(i.element.firstChild.nodeValue)
        });
        var c = this.server.invoke("file", f, {
            block: true
        });
        var l = c.ownerDocument.createElement(b ? "copy" : "move");
        l.setAttribute("source-base", e);
        l.setAttribute("source", a);
        l.setAttribute("target-base", this.storageBase);
        l.setAttribute("target", h);
        c.appendChild(l);
        for (var k = 0; k < j.length; ++k) {
            var d = c.ownerDocument.createElement("item");
            d.appendChild(c.ownerDocument.createTextNode(j[k]));
            l.appendChild(d)
        }
    },
    renameFile: function(c, e, a) {
        var b = Core.method(this, function(g) {
            c(g.element.firstChild.nodeValue)
        });
        var d = this.server.invoke("file", b, {
            block: true
        });
        var f = WS.Server.DOM.setPropertyElementValue(d, "rename", a);
        if (this.storageBase) {
            f.setAttribute("base", this.storageBase)
        }
        f.setAttribute("path", e)
    },
    uploadStore: function(b, g, d, f) {
        var a = Core.method(this, function(h) {
            b(h.element.firstChild.nodeValue)
        });
        var c = this.server.invoke("file", a, {
            block: true
        });
        var e = c.ownerDocument.createElement("upload-store");
        e.setAttribute("base", d);
        c.appendChild(e);
        WS.Server.DOM.setPropertyElementValue(e, "upload-id", g);
        WS.Server.DOM.setPropertyElementValue(e, "storage-path", f)
    },
    uploadStore5: function(f, a, b) {
        var e = Core.method(this, function(i) {
            f(i.element.firstChild.nodeValue)
        });
        var g = this.server.invoke("file", e, {
            block: false
        });
        var h = g.ownerDocument.createElement("upload-store-5");
        h.setAttribute("upload-group-id", a);
        g.appendChild(h);
        for (var d = 0; d < b.length; ++d) {
            if (b[d].uploadId == null) {
                continue
            }
            var c = g.ownerDocument.createElement("item");
            c.setAttribute("base", b[d].storageBase);
            h.appendChild(c);
            WS.Server.DOM.setPropertyElementValue(c, "upload-id", b[d].uploadId);
            WS.Server.DOM.setPropertyElementValue(c, "item-path", b[d].itemPath);
            WS.Server.DOM.setPropertyElementValue(c, "storage-path", b[d].storagePath)
        }
    }
});
WS.Synchronize.Image = Core.extend(WS.Synchronize, {
    deleteImage: function(e, d) {
        var c = Core.method(this, function(h) {
            e(h.element.firstChild.nodeValue)
        });
        var g = this.server.invoke("image", c, {
            block: true
        });
        var f = g.ownerDocument.createElement("delete");
        if (this.mediaIndex) {
            f.setAttribute("media", this.mediaIndex)
        }
        g.appendChild(f);
        for (var b = 0; b < d.length; ++b) {
            var a = g.ownerDocument.createElement("item");
            a.appendChild(g.ownerDocument.createTextNode(d[b]));
            f.appendChild(a)
        }
    },
    getDownloadUrl: function(b) {
        var d, c;
        if (b.imageIds) {
            c = "images";
            d = b.imageIds
        } else {
            if (b.folderIds) {
                c = "folders";
                d = b.folderIds
            }
        }
        var a = WS.SERVER_URL + "imagedownload?" + c + "=" + d.join(",");
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    getUrl: function(c, a) {
        var b = WS.SERVER_URL + "image?id=" + c.id + "&date=" + c.date;
        if (a) {
            b += "&thumb=1"
        }
        if (this.mediaIndex) {
            b += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(b)
    },
    listFolders: function(c, f, d) {
        var a = Core.method(this, function(n) {
            var h = n.element.firstChild;
            var m = parseInt(h.getAttribute("count"), 10);
            var k = [];
            var j = h.firstChild;
            while (j) {
                var l = {
                    id: WS.Server.DOM.getPropertyElementValue(j, "id"),
                    name: WS.Server.DOM.getPropertyElementValue(j, "name")
                };
                k.push(l);
                j = j.nextSibling
            }
            var g = parseInt(h.getAttribute("start-index"), 10);
            var i = parseInt(h.getAttribute("end-index"), 10);
            c({
                count: m,
                folders: k,
                startIndex: f,
                endIndex: d
            })
        });
        var e = this.server.invoke("image", a, {
            replace: true
        });
        var b = e.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "folders");
        b.setAttribute("start-index", f);
        b.setAttribute("end-index", d);
        e.appendChild(b)
    },
    listImages: function(c, e, g, d) {
        var a = Core.method(this, function(n) {
            var o = n.element.firstChild;
            var l = parseInt(o.getAttribute("count"), 10);
            var h = [];
            var k = o.firstChild;
            while (k) {
                var m = {
                    id: WS.Server.DOM.getPropertyElementValue(k, "id"),
                    date: WS.Server.DOM.getPropertyElementValue(k, "date"),
                    thumbWidth: parseInt(WS.Server.DOM.getPropertyElementValue(k, "thumb-width"), 10),
                    thumbHeight: parseInt(WS.Server.DOM.getPropertyElementValue(k, "thumb-height"), 10),
                    contentType: WS.Server.DOM.getPropertyElementValue(k, "type")
                };
                h.push(m);
                k = k.nextSibling
            }
            var i = parseInt(o.getAttribute("start-index"), 10);
            var j = parseInt(o.getAttribute("end-index"), 10);
            c({
                count: l,
                images: h,
                startIndex: g,
                endIndex: d
            })
        });
        var f = this.server.invoke("image", a, {
            replace: true
        });
        var b = f.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "images");
        if (e) {
            if (e.folder) {
                b.setAttribute("folder", e.folder)
            } else {
                if (e.all) {
                    b.setAttribute("all", "1")
                }
            }
        }
        b.setAttribute("start-index", g);
        b.setAttribute("end-index", d);
        f.appendChild(b)
    }
});
WS.Synchronize.Status = Core.extend(WS.Synchronize, {
    getStatus: function(b, c) {
        var a = Core.method(this, function(g) {
            var d = {
                battery: parseInt(WS.Server.DOM.getPropertyElementValue(g.element, "battery"), 10),
                processorUsage: parseInt(WS.Server.DOM.getPropertyElementValue(g.element, "processor-usage"), 10),
                charging: WS.Server.DOM.getPropertyElementValue(g.element, "charging") == "true",
                wireless: parseInt(WS.Server.DOM.getPropertyElementValue(g.element, "wireless"), 10),
                storage: []
            };
            var f = g.element.firstChild;
            while (f) {
                if (f.nodeName == "storage") {
                    d.storage.push({
                        name: f.getAttribute("name"),
                        displayName: f.getAttribute("display-name"),
                        available: f.getAttribute("available"),
                        capacity: f.getAttribute("capacity")
                    })
                }
                f = f.nextSibling
            }
            b(d)
        });
        this.server.invoke("status", a)
    }
});
WS.Synchronize.Video = Core.extend(WS.Synchronize, {
    thumbSupport: false,
    deleteVideo: function(e, g) {
        var c = Core.method(this, function(h) {
            e(h.element.firstChild.nodeValue)
        });
        var d = this.server.invoke("video", c, {
            block: true
        });
        var f = d.ownerDocument.createElement("delete");
        if (this.mediaIndex) {
            f.setAttribute("media", this.mediaIndex)
        }
        d.appendChild(f);
        for (var b = 0; b < g.length; ++b) {
            var a = d.ownerDocument.createElement("item");
            a.appendChild(d.ownerDocument.createTextNode(g[b]));
            f.appendChild(a)
        }
    },
    getDownloadUrl: function(b) {
        var d, c;
        if (b.videoIds) {
            c = "videos";
            d = b.videoIds
        }
        var a = WS.SERVER_URL + "videodownload?" + c + "=" + d.join(",");
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    getThumbUrl: function(b) {
        var a = WS.SERVER_URL + "videothumb?id=" + b.id;
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    getUrl: function(b) {
        var a = WS.SERVER_URL + "video?id=" + b.id;
        if (this.mediaIndex) {
            a += "&media=" + this.mediaIndex
        }
        return WS.Server.Security.signUrl(a)
    },
    listVideos: function(d, f, g, e) {
        var a = Core.method(this, function(o) {
            var n = o.element.firstChild;
            if (!this.thumbSupport && n.getAttribute("thumbs") == "1") {
                this.thumbSupport = true
            }
            var m = parseInt(n.getAttribute("count"), 10);
            var k = [];
            var j = n.firstChild;
            while (j) {
                var l = {
                    id: WS.Server.DOM.getPropertyElementValue(j, "id"),
                    contentType: WS.Server.DOM.getPropertyElementValue(j, "type"),
                    title: WS.Server.DOM.getPropertyElementValue(j, "title")
                };
                k.push(l);
                j = j.nextSibling
            }
            var h = parseInt(n.getAttribute("start-index"), 10);
            var i = parseInt(n.getAttribute("end-index"), 10);
            d({
                count: m,
                videos: k,
                startIndex: g,
                endIndex: e
            })
        });
        var c = this.server.invoke("video", a, {
            replace: true
        });
        var b = c.ownerDocument.createElement("list");
        if (this.mediaIndex) {
            b.setAttribute("media", this.mediaIndex)
        }
        b.setAttribute("type", "videos");
        if (f) {
            if (f.all) {
                b.setAttribute("all", "1")
            }
        }
        b.setAttribute("start-index", g);
        b.setAttribute("end-index", e);
        c.appendChild(b)
    }
});
WS.BackgroundFader = Core.extend(Echo.Component, {
    $load: function() {
        Echo.ComponentFactory.registerType("WS.BackgroundFader", this)
    },
    pane: true,
    componentType: "WS.BackgroundFader"
});
WS.BackgroundFader.Sync = Core.extend(Echo.Render.ComponentSync, {
    $static: {
        Runnable: Core.extend(Core.Web.Scheduler.Runnable, {
            startTime: null,
            repeat: true,
            $construct: function(a) {
                this._bgDiv = a
            },
            run: function() {
                if (!this.startTime) {
                    this.startTime = new Date().getTime()
                }
                var a = (new Date().getTime() - this.startTime) / 2000;
                if (a < 1) {
                    this.timeInterval = 100;
                    this._bgDiv.style.opacity = Math.floor(100 * a * a) / 100
                } else {
                    this.repeat = false;
                    this._bgDiv.style.opacity = 1;
                    this._bgDiv = null
                }
            },
            timeInterval: 100
        })
    },
    $load: function() {
        Echo.Render.registerPeer("WS.BackgroundFader", this)
    },
    _runnable: null,
    _bgDiv: null,
    $construct: function() {
        this._canFade = !Core.Web.Env.ENGINE_MSHTML
    },
    renderAdd: function(f, b) {
        this._div = document.createElement("div");
        this._bgDiv = document.createElement("div");
        this._bgDiv.id = this.component.renderId;
        this._bgDiv.style.cssText = "position:absolute;width:100%;height:100%;";
        Echo.Sync.Color.renderFB(this.component, this._bgDiv);
        Echo.Sync.Font.render(this.component.render("font"), this._bgDiv);
        Echo.Sync.FillImage.render(this.component.render("image"), this._bgDiv);
        this._div.appendChild(this._bgDiv);
        if (this.component.children.length > 0) {
            var e = this.component.children[0];
            var a = document.createElement("div");
            Echo.Render.renderComponentAdd(f, e, a);
            this._div.appendChild(a)
        }
        var d = this.component.render("image");
        if (this._canFade && d) {
            this._bgDiv.style.opacity = 0;
            this._runnable = new WS.BackgroundFader.Sync.Runnable(this._bgDiv);
            Core.Web.Scheduler.add(this._runnable);
            var c = document.createElement("img");
            c.src = Echo.Sync.FillImage.getUrl(d)
        }
        b.appendChild(this._div)
    },
    renderDispose: function(a) {
        if (this._runnable) {
            Core.Web.Scheduler.remove(this._runnable)
        }
        this._bgDiv = null;
        this._div = null
    },
    renderUpdate: function(c) {
        var a = this._div;
        var b = a.parentNode;
        Echo.Render.renderComponentDispose(c, c.parent);
        b.removeChild(a);
        this.renderAdd(c, b);
        return true
    }
});
WS.Style = {
    styleSheet: null,
    shadowBorder: null,
    shadowBorderHighlight: null,
    FG_LIST_ROLLOVER: "#000000",
    BG_LIST_ROLLOVER: "#f5f5f5",
    BG_LIST_SELECTION: "#a8dff4",
    FG_LIST_SELECTION: "#000000",
    BG_LIST_PRESSED: "#0099CC",
    BG_ROLLOVER: "#33B5E5",
    BG_PRESSED: "#0099CC",
    BG_FOCUSED: "#cfcfcf",
    BG_SELECTION: "#a8dff4",
    BG_DIALOG: "#f5f5f5",
    ROBOTO_LIGHT: ["RobotoLight", "Helvetica", "sans-serif"],
    init: function() {
        var a = Core.Web.Env.ENGINE_MSHTML && Core.Web.Env.ENGINE_VERSION_MAJOR == 6;
        this.shadowBorder = a ? {
            contentInsets: 4,
            borderInsets: 20,
            color: "#0d0d1d"
        } : {
            contentInsets: "7px 13px 13px 7px",
            borderInsets: "17px 23px 23px 17px",
            topLeft: "image/imageborder/shadow/BorderTopLeft.png",
            top: "image/imageborder/shadow/BorderTop.png",
            topRight: "image/imageborder/shadow/BorderTopRight.png",
            left: "image/imageborder/shadow/BorderLeft.png",
            right: "image/imageborder/shadow/BorderRight.png",
            bottomLeft: "image/imageborder/shadow/BorderBottomLeft.png",
            bottom: "image/imageborder/shadow/BorderBottom.png",
            bottomRight: "image/imageborder/shadow/BorderBottomRight.png"
        };
        this.shadowBorderRound = a ? {
            contentInsets: 4,
            borderInsets: 20,
            color: "#0d0d1d"
        } : {
            background: WS.Style.BG_DIALOG,
            contentInsets: "10px 18px 14px 16px",
            borderInsets: "15px 18px 19px 16px",
            topLeft: "image/imageborder/shadowround/BorderTopLeft.png",
            top: "image/imageborder/shadowround/BorderTop.png",
            topRight: "image/imageborder/shadowround/BorderTopRight.png",
            left: "image/imageborder/shadowround/BorderLeft.png",
            right: "image/imageborder/shadowround/BorderRight.png",
            bottomLeft: "image/imageborder/shadowround/BorderBottomLeft.png",
            bottom: "image/imageborder/shadowround/BorderBottom.png",
            bottomRight: "image/imageborder/shadowround/BorderBottomRight.png"
        };
        this.shadowBorderRoundDark = a ? {
            contentInsets: 4,
            borderInsets: 20,
            color: "#0d0d1d"
        } : {
            background: WS.Style.BG_DIALOG,
            contentInsets: "10px 18px 14px 16px",
            borderInsets: "15px 18px 19px 16px",
            topLeft: "image/imageborder/shadowrounddark/BorderTopLeft.png",
            top: "image/imageborder/shadowrounddark/BorderTop.png",
            topRight: "image/imageborder/shadowrounddark/BorderTopRight.png",
            left: "image/imageborder/shadowrounddark/BorderLeft.png",
            right: "image/imageborder/shadowrounddark/BorderRight.png",
            bottomLeft: "image/imageborder/shadowrounddark/BorderBottomLeft.png",
            bottom: "image/imageborder/shadowrounddark/BorderBottom.png",
            bottomRight: "image/imageborder/shadowrounddark/BorderBottomRight.png"
        };
        this.shadowBorderRoundHighlight = a ? {
            contentInsets: 4,
            borderInsets: 20,
            color: "#ffffaf"
        } : {
            background: WS.Style.BG_DIALOG,
            contentInsets: "10px 18px 14px 16px",
            borderInsets: "15px 18px 19px 16px",
            topLeft: "image/imageborder/shadowroundselect/BorderTopLeft.png",
            top: "image/imageborder/shadowroundselect/BorderTop.png",
            topRight: "image/imageborder/shadowroundselect/BorderTopRight.png",
            left: "image/imageborder/shadowroundselect/BorderLeft.png",
            right: "image/imageborder/shadowroundselect/BorderRight.png",
            bottomLeft: "image/imageborder/shadowroundselect/BorderBottomLeft.png",
            bottom: "image/imageborder/shadowroundselect/BorderBottom.png",
            bottomRight: "image/imageborder/shadowroundselect/BorderBottomRight.png"
        };
        this.shadowBorderHighlight = a ? {
            contentInsets: 4,
            borderInsets: 20,
            color: "#ffffaf"
        } : {
            contentInsets: "7px 13px 13px 7px",
            borderInsets: "17px 23px 23px 17px",
            topLeft: "image/imageborder/shadowselect/BorderTopLeft.png",
            top: "image/imageborder/shadowselect/BorderTop.png",
            topRight: "image/imageborder/shadowselect/BorderTopRight.png",
            left: "image/imageborder/shadowselect/BorderLeft.png",
            right: "image/imageborder/shadowselect/BorderRight.png",
            bottomLeft: "image/imageborder/shadowselect/BorderBottomLeft.png",
            bottom: "image/imageborder/shadowselect/BorderBottom.png",
            bottomRight: "image/imageborder/shadowselect/BorderBottomRight.png"
        };
        this.musicIndexRendererStyle = {
            background: "#ffffff",
            titleBackground: "#3f3f3f",
            titleForeground: "#efefff",
            border: this.shadowBorder,
            insets: "5px 0px",
            selectedBorder: this.shadowBorderHighlight
        };
        this.videoGalleryRendererStyle = {
            background: "#ffffff",
            titleBackground: "#3f3f3f",
            titleForeground: "#efefff",
            border: this.shadowBorder,
            selectedBorder: this.shadowBorderHighlight
        };
        this.styleSheet = new Echo.StyleSheet({
            Category: {
                Button: {
                    background: "#4f4f6f",
                    foreground: "#efefef",
                    rolloverBackground: "#6f6f8f",
                    rolloverEnabled: true,
                    pressedBackground: "#2f2f4f",
                    pressedEnabled: true,
                    textPosition: "bottom",
                    textAlignment: "center",
                    alignment: "center",
                    insets: "8px 2px",
                    iconTextMargin: 0
                }
            },
            CategoryLight: {
                Button: {
                    background: WS.Style.BG_DIALOG,
                    foreground: "#7f7f7f",
                    font: {
                        typeface: WS.Style.ROBOTO_LIGHT
                    },
                    rolloverBackground: "#ffffff",
                    rolloverEnabled: true,
                    pressedBackground: "#ffffff",
                    pressedEnabled: true,
                    textPosition: "bottom",
                    textAlignment: "center",
                    alignment: "center",
                    insets: "8px 2px",
                    iconTextMargin: 0
                }
            },
            ControlPane: {
                AbstractButton: {
                    insets: "6px 20px",
                    font: {
                        typeface: WS.Style.ROBOTO_LIGHT,
                        size: "12pt"
                    },
                    lineWrap: false,
                    foreground: "#000000",
                    disabledForeground: "#afafaf",
                    rolloverForeground: "#ffffff",
                    rolloverBackground: WS.Style.BG_ROLLOVER,
                    rolloverEnabled: true,
                    pressedForeground: "#efefef",
                    pressedBackground: WS.Style.BG_PRESSED,
                    pressedEnabled: true,
                    focusedBackground: WS.Style.BG_FOCUSED,
                    focusedEnabled: true
                },
                Row: {
                    layoutData: {
                        background: WS.Style.BG_DIALOG,
                        overflow: Echo.SplitPane.OVERFLOW_HIDDEN,
                        insets: "0px 9px"
                    }
                }
            },
            "ControlPane.SplitTop": {
                SplitPane: {
                    autoPositioned: true,
                    separatorColor: "#dfdfdf",
                    separatorHeight: 1,
                    separatorVisible: true,
                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM
                }
            },
            "ControlPane.SplitBottom": {
                SplitPane: {
                    autoPositioned: true,
                    separatorColor: "#dfdfdf",
                    separatorHeight: 1,
                    separatorVisible: true,
                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP
                }
            },
            Default: {
                "Extras.AccordionPane": {
                    tabFont: {
                        typeface: WS.Style.ROBOTO_LIGHT,
                        size: "16pt"
                    },
                    tabRolloverForeground: "#ffffff",
                    tabRolloverBackground: "#33B5E5",
                    tabForeground: "#33B5E5",
                    tabBackground: "#ffffff",
                    tabBorder: {
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: "1px solid #33B5E5"
                    }
                },
                "Extras.ContextMenu": {
                    animationTime: 150,
                    background: "#ffffff",
                    border: {
                        top: "1px solid #dfdfdf",
                        left: "1px solid #dfdfdf",
                        right: "1px solid #afafaf",
                        bottom: "1px solid #afafaf"
                    },
                    font: {
                        size: "12pt",
                        typeface: WS.Style.ROBOTO_LIGHT
                    },
                    selectionForeground: "#ffffff",
                    selectionBackground: WS.Style.BG_ROLLOVER
                },
                "Extras.MenuBarPane": {
                    animationTime: 150,
                    insets: "5px 1px",
                    background: "#3f3f3f",
                    foreground: "#ffffff",
                    border: {
                        bottom: "2px solid #33B5E5"
                    },
                    font: {
                        size: "10pt",
                        bold: true
                    },
                    menuBackground: "#3f3f3f",
                    menuFont: {
                        typeface: WS.Style.ROBOTO_LIGHT,
                        size: "12pt"
                    },
                    menuBorder: {
                        top: "1px solid #4f4f4f",
                        left: "1px solid #4f4f4f",
                        right: "1px solid #1f1f1f",
                        bottom: "1px solid #1f1f1f"
                    },
                    selectionForeground: "#ffffff",
                    selectionBackground: WS.Style.BG_ROLLOVER
                },
                "Extras.TabPane": {
                    insets: 0,
                    background: "#ffffff",
                    tabActiveBackground: "#ffffff",
                    tabActiveHeightIncrease: 0,
                    tabActiveBorder: 0,
                    tabInactiveBorder: 0,
                    tabInset: 0,
                    tabActiveInsets: "3px 20px",
                    tabInactiveInsets: "3px 20px",
                    tabInactiveForeground: "#4f4f4f",
                    tabActiveFont: {
                        size: "15pt",
                        typeface: WS.Style.ROBOTO_LIGHT
                    },
                    tabInactiveFont: {
                        size: "15pt",
                        typeface: WS.Style.ROBOTO_LIGHT
                    },
                    tabRolloverEnabled: true,
                    tabRolloverForeground: "#ffffff",
                    tabRolloverBackground: WS.Style.BG_ROLLOVER
                },
                WindowPane: {
                    background: WS.Style.BG_DIALOG,
                    border: this.shadowBorderRoundDark,
                    controlsSpacing: 3,
                    openAnimationTime: 250,
                    closeAnimationTime: 250,
                    titleInsets: "5 10",
                    titleBackground: WS.Style.BG_DIALOG,
                    titleForeground: "#33B5E5",
                    titleFont: {
                        typeface: WS.Style.ROBOTO_LIGHT,
                        size: "15pt"
                    },
                    ieAlphaRenderBorder: true,
                    closeIcon: a ? null : "image/windowpane/ControlClose.png",
                    closeRolloverIcon: a ? null : "image/windowpane/ControlCloseRollover.png",
                    maximizeIcon: a ? null : "image/windowpane/ControlMaximize.png",
                    maximizeRolloverIcon: a ? null : "image/windowpane/ControlMaximizeRollover.png",
                    minimizeIcon: a ? null : "image/windowpane/ControlMinimize.png",
                    minimizeRolloverIcon: a ? null : "image/windowpane/ControlMinimizeRollover.png"
                },
                "FileTransfer.UploadSelect": {},
                "FileTransfer.MultipleUploadSelect": {
                    insets: "4 25",
                    border: "1px outset #dfdfdf",
                    background: "#dfdfdf"
                },
                "Extras.ListViewer": {
                    headerInsets: "3px 5px",
                    headerBackground: "#efefef",
                    headerForeground: "#7f7f7f",
                    headerFont: {
                        size: "12pt",
                        typeface: WS.Style.ROBOTO_LIGHT
                    },
                    rolloverEnabled: true,
                    rolloverBackground: WS.Style.BG_LIST_ROLLOVER,
                    rolloverForeground: WS.Style.FG_LIST_ROLLOVER,
                    selectionBackground: WS.Style.BG_LIST_SELECTION,
                    selectionForeground: WS.Style.FG_LIST_SELECTION,
                    border: {
                        left: null,
                        top: null,
                        right: null,
                        bottom: "1px solid #efefef"
                    },
                    insets: "5px 5px"
                },
                TextField: {
                    focusEffectEnabled: false,
                    background: WS.Style.BG_DIALOG,
                    border: {
                        top: "0px solid #33B5E5",
                        left: "0px solid #33B5E5",
                        right: "0px solid #33B5E5",
                        bottom: "1px solid #33B5E5"
                    }
                }
            },
            "FileBrowser.SidePane.Header": {
                Component: {
                    layoutData: {
                        backgroundImage: {
                            url: "image/fill/SilverToolbar.png",
                            y: "50%"
                        },
                        background: "#abcdef",
                        insets: "2px 1em"
                    }
                }
            },
            "FileBrowser.SidePane.DescriptionLabel": {
                Label: {
                    font: {
                        size: "8pt"
                    },
                    foreground: "#7f7f7f",
                    layoutData: {
                        insets: "2px 1em"
                    }
                }
            },
            FormBox: {
                Column: {
                    border: {
                        left: "1px solid #dfdfdf",
                        top: "1px solid #dfdfdf",
                        right: "1px solid #e7e7e7",
                        bottom: "1px solid #e7e7e7"
                    },
                    background: "#efefef",
                    cellSpacing: 8,
                    insets: "8px 20px"
                },
                Row: {
                    border: {
                        left: "1px solid #dfdfdf",
                        top: "1px solid #dfdfdf",
                        right: "1px solid #e7e7e7",
                        bottom: "1px solid #e7e7e7"
                    },
                    background: "#efefef",
                    cellSpacing: 16,
                    insets: "8px 20px"
                }
            },
            FormTitle: {
                Label: {
                    foreground: "#7f7f7f",
                    font: {
                        typeface: WS.Style.ROBOTO_LIGHT,
                        italic: true,
                        size: "14pt"
                    }
                }
            },
            FormDescription: {
                Label: {
                    foreground: "#5f5f5f",
                    font: {
                        italic: true,
                        size: "8pt"
                    }
                }
            },
            "Layout.Spaced": {
                Row: {
                    cellSpacing: 20
                },
                Column: {
                    cellspacing: 5
                },
                Grid: {
                    insets: "2 5"
                }
            },
            "Layout.Spaced.100": {
                Grid: {
                    width: "100%",
                    insets: "2 5"
                }
            },
            "Music.Control": {
                Button: {
                    insets: "4 25",
                    border: {
                        top: "0px solid #3f4f3f",
                        right: "1px solid #3f4f3f",
                        left: "0px solid #3f4f3f",
                        bottom: "1px solid #3f4f3f"
                    },
                    background: "#2f372f",
                    rolloverEnabled: true,
                    rolloverBackground: WS.Style.BG_ROLLOVER,
                    pressedEnabled: true,
                    pressedBackground: WS.Style.BG_DIALOG
                }
            },
            "Music.SidePane": {
                CheckBox: {
                    foreground: "#ffffff",
                    background: "#1f1f1f",
                    rolloverEnabled: true,
                    rolloverBackground: "#3f3f3f",
                    rolloverBorder: {
                        left: "1px solid #5f5f5f",
                        top: "1px solid #5f5f5f",
                        right: "1px solid #1f1f1f",
                        bottom: "1px solid #1f1f1f"
                    },
                    alignment: "center",
                    insets: "2 8",
                    font: {
                        size: "8pt"
                    }
                }
            },
            Photo: {
                Button: {
                    insets: 10,
                    rolloverEnabled: true,
                    rolloverBackground: "#4f4f7f",
                    pressedEnabled: true,
                    pressedBackground: "#6f6f9f"
                },
                Panel: {
                    background: "#ffffff",
                    imageBorder: this.shadowBorder
                }
            },
            Shadow: {
                Panel: {
                    background: "#ffffff",
                    border: a ? "1px outset #cfcfff" : null,
                    imageBorder: a ? null : this.shadowBorder
                }
            },
            ShadowLight: {
                Panel: {
                    background: "#ffffff",
                    imageBorder: this.shadowBorderRound
                }
            }
        })
    }
};
WS.Images = new Core.ResourceBundle({
    "App.Icon": "image/branding/WebSharing72.png",
    "FileBrowser.ParentDirectoryButton": "image/icon/icl24_carat_up.png",
    "Application.Logo": "image/branding/NLogo.png",
    "Status.Battery": "image/icon/icl96_battery.png",
    "Status.BatteryCharging": "image/icon/icl96_battery_charging.png",
    "Status.ExternalStorage": "image/icon/icl96_memory_card.png",
    "Status.InternalStorage": "image/icon/icl96_memory_card.png",
    "Status.Wireless": "image/icon/icl96_network_wifi.png",
    "Status.ProcessorUsage": "image/icon/icl96_pie.png",
    "Music.Play": "image/icon/icd32_media_play.png",
    "Music.Pause": "image/icon/icd32_media_pause.png",
    "Music.PreviousTrack": "image/icon/icd32_media_rewind.png",
    "Music.NextTrack": "image/icon/icd32_media_fast_forward.png",
    "Music.Stop": "image/icon/icd32_media_stop.png",
    "Music.InvalidFormat": "image/icon/icc16_error.png",
    "Music.PlayingTrack": "image/icon/icc16_play.png",
    "Music.PlayingTrackPaused": "image/icon/icc16_pause.png",
    "Music.CategoryAlbums": "image/icon/icl48_media_play_circle.png",
    "Music.CategoryPlaylists": "image/icon/icl48_list.png",
    "Music.CategoryTracks": "image/icon/icl48_starburst.png",
    "Music.CategoryArtists": "image/icon/icl48_microphone.png",
    "Music.DefaultAlbum": "image/music/default_album.png",
    "Music.DefaultArtist": "image/icon/icl48_microphone.png",
    "Music.DefaultPlaylist": "image/icon/icl48_list.png",
    "Photos.CategoryCameraRoll": "image/icon/icl48_camera.png",
    "Photos.CategoryImageFolders": "image/icon/icl48_folder.png",
    "Photos.CategoryAll": "image/icon/icl48_starburst.png",
    "Photos.ImageFolderItem": "image/icon/icc16_folder.png",
    "Photos.DefaultThumbnail": "image/icon/icc128_image.png",
    "Videos.CategoryCameraRoll": "image/icon/icl48_camera_video.png",
    "Videos.CategoryAll": "image/icon/icl48_starburst.png",
    "Videos.VideoFolderItem": "image/icon/icc16_folder.png",
    "Videos.DefaultThumbnail": "image/icon/icc128_video.png",
    "Dialog.Error": "image/icon/icc64_error.png",
    "Dialog.Warning": "image/icon/icc64_warning.png",
    "Dialog.Information": "image/icon/icc64_information.png",
    "WelcomeScreen.WelcomeTitle": "image/branding/WelcomeTitle.png",
    "FileBrowser.MultipleFiles": "image/icon/icc128_multiple_files.png",
    "FileBrowser.Clipboard.CutIndicator": "image/icon/icl32_cut.png",
    "FileBrowser.Clipboard.CopyIndicator": "image/icon/icl32_copy.png",
    "ImageDisplayWindow.Download": "image/icon/icl24_download.png",
    "ImageDisplayWindow.FitToWindow": "image/icon/icl24_window.png",
    "ImageDisplayWindow.ActualSize": "image/icon/icl24_expand.png",
    "ImageDisplayWindow.ZoomIn": "image/icon/icl24_carat_up.png",
    "ImageDisplayWindow.ZoomOut": "image/icon/icl24_carat_down.png",
    "MediaPlayerWindow.Download": "image/icon/icl24_download.png",
    "FlowViewer.LoadingIcon": "image/icon/icc96_loading.png",
    "TextDisplayWindow.Download": "image/icon/icl24_download.png",
    "Music.Shuffle.Off": "image/icon/icd32_shuffle_off.png",
    "Music.Shuffle.On": "image/icon/icd32_shuffle_on.png",
    "Music.Repeat.Off": "image/icon/icd32_repeat_off.png",
    "Music.Repeat.On": "image/icon/icd32_repeat_on.png",
    "FileBrowser.ViewMode.Icon.Off": "image/icon/icl32_view_as_grid_off.png",
    "FileBrowser.ViewMode.Icon.On": "image/icon/icl32_view_as_grid_on.png",
    "FileBrowser.ViewMode.List.Off": "image/icon/icl32_view_as_list_off.png",
    "FileBrowser.ViewMode.List.On": "image/icon/icl32_view_as_list_on.png",
    "Upload.Stop": "image/icon/icd32_stop.png",
    "Upload.Info": "image/icon/icd32_info.png",
    "About.Logo": "image/branding/NextApp.png"
});
WS.Messages = new Core.ResourceBundle({
    "Generic.Months.Short": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "Generic.ErrorDialog.Title": "Error",
    "Generic.ErrorDialog.Message": "The operation could not be performed.",
    "Generic.Ok": "OK",
    "Generic.Cancel": "Cancel",
    "Generic.Start": "Start",
    "Generic.Save": "Save",
    "Generic.Done": "Done",
    "Generic.Yes": "Yes",
    "Generic.No": "No",
    "Generic.Enabled": "Enabled",
    "Generic.Disabled": "Disabled",
    "Generic.Previous": "Previous Step",
    "Generic.Next": "Next Step",
    "Generic.Upload": "Upload File",
    "Generic.Clear": "Clear",
    "Generic.Close": "Close",
    "Generic.Folder": "Folder",
    "ExitDialog.Title": "Exit",
    "ExitDialog.Message": "Are you sure you want to exit?",
    "Tab.Photos": "PHOTOS",
    "Tab.FileBrowser": "FILES",
    "Tab.Music": "MUSIC",
    "Tab.Videos": "VIDEOS",
    "Tab.Status": "STATUS",
    "Tab.Upgrade": "UPGRADE",
    "WelcomeScreen.WindowTitle": "Welcome",
    "WelcomeScreen.Login": "Continue",
    "WelcomeScreen.PasswordPrompt": "Password:",
    "WelcomeScreen.InvalidLoginTitle": "Incorrect Password",
    "WelcomeScreen.InvalidLoginMessage": 'The password you entered is incorrect.\n\nEnsure CAPS LOCK is not turned on.\n\nYou may set your password by opening the WebSharing application on your device and selecting the "Settings" option.',
    "BrowserWarning.IE6.Title": "Internet Explorer 6 Warning",
    "BrowserWarning.IE6.Message": "You appear to be using Internet Explorer 6.  This browser is more than eight years old, suffers from a large number of bugs, and does not support modern web standards.   WebSharing will function in this browser with a very much reduced user experience.  We strongly recommend you upgrade to a more modern browser if possible.",
    "BrowserWarning.Opera.Title": "Opera Warning",
    "BrowserWarning.Opera.Message": "You appear to be using the Opera browser.  This browser suffers from a known bug which can cause rich web applications to display incorrectly.  This bug was reported to Opera when it was introduced in version 9.5 in 2008, but unfortunately the issue has been ignored through at least version 10.10. If you wish to use Opera, you can workaround this bug by simply resizing the browser window when you see content being displayed incorrectly.",
    "StorageBase.Prompt": "Source:",
    "StorageBase.Internal": "Internal Storage",
    "StorageBase.External": "Memory Card",
    "FileBrowser.PathRow.FolderHome": "Home",
    "FileBrowser.ParentDirectoryButton": "Parent Directory",
    "FileBrowser.NewFolder.Title": "Create New Folder",
    "FileBrowser.NewFolder.Prompt": "New folder name:",
    "FileBrowser.NewFolder.ErrorExists": "The new folder could not be created.  A folder already exists with the same name.",
    "DeleteConfirm.Title": "Delete",
    "DeleteConfirm.Message": "Are you sure you want to delete the following item(s)?",
    "DeleteConfirm.Message2": 'Pressing the "Delete" button will permanently destroy the above item(s).',
    "DeleteConfirm.ConfirmText": "Check this box if you are sure that you want to delete the item(s).",
    "DeleteConfirm.Action": "Delete",
    "DeleteConfirm.DoNothing": "Don't Do Anything",
    "FileBrowser.Rename.Title": "Rename",
    "FileBrowser.Rename.Prompt": "New name:",
    "FileBrowser.Rename.ErrorExists": "The file could not be renamed, because a file already exists with the new name you entered.",
    "FileBrowser.GridView": "View as icons",
    "FileBrowser.ListView": "View as list",
    "FileBrowser.Relocate.ErrorExists": "Cannot paste items because like-named items exist at destination.",
    "FileBrowser.Relocate.ErrorNesting": "Cannot paste items into folder which is in clipboard.",
    "FileBrowser.Clipboard.Contents": "Clipboard",
    "FileBrowser.Clipboard.CutPrompt": 'The items below have been cut to the clipboard. Navigate to the folder where you would like to move them and select "Paste".',
    "FileBrowser.Clipboard.CopyPrompt": 'The items below have been copied to the clipboard. Navigate to the folder where you would like to copy them and select "Paste".',
    "FileBrowser.Name": "NAME",
    "FileBrowser.Size": "SIZE",
    "FileBrowser.Date": "DATE",
    "FileBrowser.Type": "TYPE",
    "FileBrowser.MultipleFiles": "Multiple Items",
    "FileBrowser.NFilesSelected": "items selected",
    "UploadProgress.Title.Uploading": "Uploading",
    "UploadProgress.Title.Storing": "Finishing",
    "UploadProgress.Title.Complete": "Upload Complete",
    "UploadProgrsss.StopConfirmDialog.Title": "Stop Upload",
    "UploadProgress.StopConfirmDialog.Message": "Do you want to cancel the upload?",
    "UploadProgress.Message.MediaScan": "Scanning media...",
    "UploadProgress.Window.Title": "Upload Details",
    "UploadProgress.Window.DestinationPrompt": "Destination:",
    "Status.Battery": "Battery Remaining",
    "Status.BatteryState": "Charge State:",
    "Status.BatteryChargingTrue": "Charger connected.",
    "Status.BatteryChargingFalse": "Charger not connected.",
    "Status.InternalStorage": "Internal Storage Usage",
    "Status.ExternalStorage": "Memory Card Usage",
    "Status.Wireless": "Wi-Fi Signal",
    "Status.MediaCapacity": "Capacity:",
    "Status.MediaUsage": "In Use:",
    "Status.MediaAvailable": "Available:",
    "Status.ProcessorUsage": "Processor Usage",
    "Status.CPU": "CPU:",
    "Status.UpdateSpeed": "Update Speed:",
    "Status.UpdateNormal": "Normal",
    "Status.UpdateFast": "Fast",
    "Status.WirelessStrength": "Signal Strength:",
    "Application.Provider": "NextApp",
    "Application.Title": "WebSharing",
    "Upload.WindowTitle": "Upload",
    "Upload.Description": "Select file to upload to the device.",
    "Upload.Prompt": "File: ",
    "Upload.SelectFiles": "Select file(s)...",
    "Menu.FileMenu": "FILE",
    "Menu.ViewMenu": "VIEW",
    "Menu.HelpMenu": "HELP",
    "Menu.Home": "Go to Home Folder",
    "Menu.NewFolder": "New Folder",
    "Menu.Cut": "Cut",
    "Menu.Copy": "Copy",
    "Menu.Paste": "Paste",
    "Menu.Rename": "Rename",
    "Menu.Delete": "Delete",
    "Menu.Upload": "Upload Files to Device",
    "Menu.Upload.Folder": "Upload Folders to Device",
    "Menu.Refresh": "Refresh",
    "Menu.Preferences": "Preferences",
    "Menu.DownloadItems": "Download Selected Items",
    "Menu.About": "About",
    "Menu.Documentation": "Documentation",
    "Menu.FAQ": "Frequently Asked Questions",
    "Menu.Tips": "Quick Tips",
    "Menu.ShowHiddenFiles": "Show Hidden Files",
    "Menu.DownloadTracks": "Download Selected Items",
    "Menu.UploadTracks": "Upload Tracks to Device",
    "Menu.DownloadPhotos": "Download Selected Photos",
    "Menu.DownloadVideos": "Download Selected Videos",
    "Media.LoadErrorDialog.Title": "Media Playback Failed",
    "Media.LoadErrorDialog.Message": "The media could not be played.",
    "Media.NoFlashDialog.DownloadFlash": "Download Flash",
    "Media.NoFlashDialog.Title": "Cannot Play Media",
    "Media.NoFlashDialog.Message": 'The media could not be played because Adobe Flash is not installed.  To fix this problem, click the "Download Flash" button below.',
    "Music.Heading.Artist": "ARTIST",
    "Music.Heading.Track": "TRACK",
    "Music.Heading.Album": "ALBUM",
    "Music.Heading.Duration": "TIME",
    "Music.Heading.Playlist": "PLAYLIST",
    "Music.Shuffle": "Shuffle",
    "Music.Repeat": "Repeat",
    "Music.InvalidFormat": "This track appears to be in a format which is not supported by the media player.  You will likely only be able to listen to it from your phone/device or by downloading it to your computer.",
    "Music.TrackLoading": "Loading...",
    "Music.CategoryAlbums": "Albums",
    "Music.CategoryPlaylists": "Playlists",
    "Music.CategoryTracks": "All Tracks",
    "Music.CategoryArtists": "Artists",
    "Music.Prompt.Track": "TRACK",
    "Music.Prompt.Album": "ALBUM",
    "Music.Prompt.Artist": "ARTIST",
    "Music.VolumePrompt": "Volume",
    "Photos.ThumbnailSizePrompt": "Thumbnail Size",
    "Photos.ThumbnailSize.Small": "SMALL",
    "Photos.ThumbnailSize.Large": "LARGE",
    "Photos.CategoryCameraRoll": "Camera Roll",
    "Photos.CategoryImageFolders": "Image Folders",
    "Photos.CategoryAll": "All Images",
    "Videos.CategoryCameraRoll": "Camera Roll",
    "Videos.CategoryAll": "All Videos",
    "ImageDisplayWindow.Title": "Image Viewer",
    "ImageDisplayWindow.Download": "Download",
    "ImageDisplayWindow.FitToWindow": "Fit To Window",
    "ImageDisplayWindow.ActualSize": "Actual Size",
    "ImageDisplayWindow.ZoomIn": "Zoom In",
    "ImageDisplayWindow.ZoomOut": "Zoom Out",
    "MediaPlayerWindow.Title": "Media Player",
    "MediaPlayerWindow.Download": "Download",
    "MediaPlayerWindow.HTML5": "HTML5",
    "MediaPlayerWindow.Flash": "Flash",
    "MediaPlayerWindow.ErrorInvalid": "This video could not be played. It may be encoded in a format not supported by this player/browser.",
    "MediaPlayerWindow.TimeoutMessage": "This video appears to be taking some time to download. Please note that videos which have not been optimized for web display must be downloaded in their entirety before they can be played.  Videos taken with a camera phone are generally not web optimized.\n\nVideos recorded on some devices may not be playable at all with certain video players/browsers.  You may configure and/or disable video playback from the View->Preferences menu if desired.",
    "TextDisplayWindow.Title": "Text Viewer",
    "TextDisplayWindow.Download": "Download",
    "TextDisplayWindow.Wrap": "Wrap Text",
    "TextDisplayWindow.Fixed": "Fixed Font",
    "PreferenceEditor.Title": "Preferences",
    "PreferenceEditor.Upload": "File Upload System",
    "PreferenceEditor.Upload.Single": "Single File Upload",
    "PreferenceEditor.Upload.Multiple": "Multiple File Upload",
    "PreferenceEditor.Upload.Description": "The multiple file upload system requires Adobe Flash.  If Flash is not available, the single file upload will be automatically used.",
    "PreferenceEditor.VideoPlayback": "Video Playback",
    "PreferenceEditor.VideoPlayback.Auto": "Automatic, prefer HTML5 Player",
    "PreferenceEditor.VideoPlayback.FlashPlayer": "Flash Player",
    "PreferenceEditor.VideoPlayback.Html5": "HTML5 Player",
    "PreferenceEditor.VideoPlayback.Send": "Send to Computer",
    "PreferenceEditor.VideoPlayback.Description": "The Flash player can handle formats supported by Adobe Flash, which include some variants of the MP4, 3GP, and FLV formats. Some MP4/3GP variants are not supported by Flash, including the AMR format used to store audio in movies recorded by many Android handsets.",
    "About.Title": "About WebSharing",
    "About.GeneralTab": "GENERAL",
    "About.Copyright": "Copyright 2009-2014 NextApp, Inc.",
    "About.LibrariesTab": "LIBRARIES",
    "About.Libraries": "The developers would like to thank the contributors to the following open source or public domain libraries which may be used within this product:",
    "QuickTips.Title": "Quick Tips",
    "QuickTips.1": "You can <b>drag and drop files into the browser window</b> to send them to your device.",
    "QuickTips.1b": "If you have Google Chrome, you can drag in entire folders to upload them.",
    "QuickTips.2": "To select an item, click on it.  To open or download an item, double-click.  To select more than one item, Ctrl+Click.",
    "QuickTips.3": "For more help, or to see these tips again, click the <b>HELP</b> menu.",
    "Menu.Exit": "Exit"
});
WS.WelcomeScreen = Core.extend(Echo.ContentPane, {
    $static: {
        IMAGE_NAMES: ["Balloon", "Bee", "Leaf", "Rose"]
    },
    _content: null,
    _menu: null,
    $construct: function(d) {
        this._r = WS.getResources();
        var c = parseInt(Math.random() * WS.WelcomeScreen.IMAGE_NAMES.length, 10);
        var b = "image/welcome/" + WS.WelcomeScreen.IMAGE_NAMES[c] + ".jpg",
            a = "image/welcome/" + WS.WelcomeScreen.IMAGE_NAMES[c] + "Blur.jpg";
        Echo.ContentPane.call(this, {
            events: {
                init: Core.method(this, function(f) {
                    if (d) {
                        this.start()
                    }
                })
            },
            children: [new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                autoPositioned: true,
                children: [this._menu = new Extras.MenuBarPane({
                    layoutData: {
                        overflow: Echo.SplitPane.OVERFLOW_HIDDEN
                    },
                    styleName: "Default",
                    events: {
                        action: Core.method(this, this._processMenuAction)
                    }
                }), new Echo.ContentPane({
                    background: "#000000",
                    backgroundImage: {
                        url: a,
                        x: "50%",
                        y: "50%",
                        repeat: 0
                    },
                    children: [new WS.BackgroundFader({
                        image: {
                            url: b,
                            x: "50%",
                            y: "50%",
                            repeat: 0
                        },
                        children: [this._content = new Echo.ContentPane({
                            backgroundImage: {
                                url: this._r.i["WelcomeScreen.WelcomeTitle"],
                                x: "50%",
                                y: "32%",
                                repeat: 0
                            }
                        })]
                    })]
                })]
            })]
        })
    },
    _displayBrowserWarningIE6: function() {
        if (!Core.Web.Env.ENGINE_MSHTML || Core.Web.Env.BROWSER_VERSION_MAJOR != 6) {
            return
        }
        this._displayBrowserWarningImpl("BrowserWarning.IE6")
    },
    _displayBrowserWarningImpl: function(a) {
        this.add(new Echo.WindowPane({
            styleName: "Default",
            closable: false,
            title: this._r.m[a + ".Title"],
            background: "#ffcfaf",
            foreground: "#4f0000",
            positionX: "90%",
            positionY: "10%",
            children: [new Echo.Row({
                cellSpacing: "1em",
                insets: "1em",
                children: [new Echo.Label({
                    icon: this._r.i["Dialog.Error"]
                }), new Echo.Label({
                    text: this._r.m[a + ".Message"]
                })]
            })]
        }))
    },
    _displayBrowserWarningOpera: function() {
        if (!Core.Web.Env.ENGINE_PRESTO) {
            return
        }
        this._displayBrowserWarningImpl("BrowserWarning.Opera")
    },
    displayInvalidLogin: function() {
        this._password.set("text", null);
        var a = new WS.Dialog(this._r.m["WelcomeScreen.InvalidLoginTitle"], this._r.i["WelcomeScreen.InvalidLogin"], this._r.m["WelcomeScreen.InvalidLoginMessage"], this._r.i["Dialog.Error"], WS.Dialog.CONTROLS_OK);
        a.addListener("action", Core.method(this, function(b) {
            this.application.setFocusedComponent(this._password)
        }));
        this.add(a)
    },
    _processLogin: function(a) {
        this.fireEvent({
            type: "authRequest",
            source: this,
            password: this._password.get("text")
        })
    },
    _processMenuAction: function(a) {
        switch (a.modelId) {
            case "about":
                this.application.client.exec(WS.MODULE_ABOUT, Core.method(this, function() {
                    this.application.content.add(new WS.AboutDialog())
                }));
                break;
            case "faq":
                window.open(WS.LINK_URL_DOC_FAQ);
                break;
            case "doc":
                window.open(WS.LINK_URL_DOC);
                break
        }
    },
    start: function() {
        this._r = WS.getResources();
        this._menu.set("model", new Extras.MenuModel(null, null, null, [new Extras.MenuModel(null, this._r.m["Menu.HelpMenu"], this._r.i["Menu.HelpMenu"], [new Extras.OptionModel("about", this._r.m["Menu.About"], this._r.i["Menu.About"]), new Extras.OptionModel("doc", this._r.m["Menu.Documentation"], this._r.i["Menu.Documentation"]), new Extras.OptionModel("faq", this._r.m["Menu.FAQ"], this._r.i["Menu.FAQ"])])]));
        this._content.add(new Echo.WindowPane({
            styleName: "Default",
            positionY: "75%",
            resizable: false,
            closable: false,
            title: this._r.m["WelcomeScreen.WindowTitle"],
            children: [new Echo.SplitPane({
                styleName: "ControlPane.SplitBottom",
                children: [new Echo.Row({
                    styleName: "ControlPane",
                    children: [new Echo.Button({
                        styleName: "ControlPane",
                        icon: this._r.i["WelcomeScreen.Login"],
                        text: this._r.m["WelcomeScreen.Login"],
                        events: {
                            action: Core.method(this, this._processLogin)
                        }
                    })]
                }), new Echo.Grid({
                    layoutData: {
                        insets: "10px 30px"
                    },
                    styleName: "Layout.Spaced.100",
                    width: "100%",
                    columnWidth: ["25%", "75%"],
                    children: [new Echo.Label({
                        icon: this._r.i["App.Icon"]
                    }), new Echo.Column({
                        children: [new Echo.Label({
                            text: this._r.m["WelcomeScreen.PasswordPrompt"]
                        }), this._password = new Echo.PasswordField({
                            styleName: "Default",
                            width: "100%",
                            events: {
                                action: Core.method(this, this._processLogin)
                            }
                        })]
                    })]
                })]
            })]
        }));
        this.application.setFocusedComponent(this._password);
        this._displayBrowserWarningIE6();
        this._displayBrowserWarningOpera()
    }
});