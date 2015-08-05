var _currentFlow = null, // A reference to the current flow, will hold any new window.
    _config = {
        defaultStyle: { backgroundColor: "#FFFFFF" },
    };


/* --------------- FACTORY METHODS --------------- */ 
var _Factory = (function () {
    var count = 0;
    return { 
        newId: function () { return count++; },
        newWindow: function (options) {
            var platform = OS_IOS && "ios" || "android",
                style = _.extend(_.omit(_config.defaultStyle, ['ios', 'android']), 
                    _.extend(_config.defaultStyle[platform] || {}, options || {}));
            return Ti.UI.createWindow(style);
        },
        newFlowStub: function (flow) {
            return {
                tabGroup: flow.root,
                open: function openFlow() { _openFlow(flow); },  
                close: function closeFlow() { setTimeout(function() { _closeFlow(flow); }, 1); }
            };
        },
        newWindowStub: function (window, flow, asModal, view) {
            return {
                window: window,
                open: function openWindow() { _openWindow(window, flow, asModal, view); },
                close: function closeWindow() { _closeWindow(window, flow, asModal, view); }
            };
        }
    };
}());


function _createFlow(tabs, options) {
    var flow = { 
            id: _Factory.newId(), 
            children: OS_ANDROID ? [] : undefined,
            viewStack: OS_ANDROID ? [] : undefined,
            root: null
        }; 

    /* Handle options correcly */
    options = options || {};

    /* We need to create a tab group, will be our root. */
    flow.root = (function createTabGroup(tabs, options) {
        return Ti.UI.createTabGroup({ tabs: tabs });
    }(tabs, options));

    /* Then, return the stub */
    return _Factory.newFlowStub(flow);
}


/* Create a window, more doc at the end of the file. */
function _createWindow(view, options) {
    var window = _Factory.newWindow(options);
    window.add(view);

    if (OS_IOS && options.modal) {
        window = Ti.UI.iOS.createNavigationWindow({
            autoAdjustScrollViewInsets: false,
            fullscreen: true,
            modal: true,
            window: window,
        });
    }

    /* Handle the options */

    /* Return the stub */
    return _Factory.newWindowStub(window, _currentFlow, options.modal, undefined);
}



/* --------------- EMBEDDED METHODS --------------- */ 
/**
 * @method _openFlow
 * @private
 *
 * Open the given flow
 *
 * @param {Object} flow a reference to a representation of a flow. 
 */
function _openFlow(flow) {
    flow.root.open();
    _currentFlow = flow;
}

/**
 * @method _openWindow
 * @private
 *
 * Open the given window within the given flow. Will fail if the given flow is not the active one.
 *
 * @param {titanium: UI.Window} window The window to be opened
 * @param {Boolean} asModal Open the window as a modal window if true
 * @param {titanium: UI.View} view Only for android with drawer. This is the content view to add.
 */
function _openWindow(window, flow, asModal, view) {
    if (asModal) { return window.open({ modal: true }); }
    if (!_currentFlow || _currentFlow.id !== flow.id) { throw("Unable to open the window in the current flow."); }

    flow.root.getActiveTab().open(window, { animated : true});
}

/**
 * @method _closeFlow
 * @private
 *
 * Close the given flow
 *
 * @param {Object} flow A reference to a representation of a flow
 */
function _closeFlow(flow) {
    /* On Android, all window should be closed separately; Only if no drawer, otherwise children are
     * not windows but views and do not need to be closed */
    OS_ANDROID && flow.children.map(function (w) { w.close(); });
    flow.root.close();

    /* Remove the flow if it is still active */
    if (_currentFlow.id === flow.id) {
        _currentFlow = null;
    }
}

/** 
 * @method _closeWindow
 * @private
 *
 * Close the given window of the given flow
 *
 * @param {titanium: UI.window} window The window to be closed
 * @param {Object} flow A representation of a flow
 * @param {Boolean} asModal Close the modal window without impacting the flow
 */
function _closeWindow(window, flow, asModal, view) {
    var index = OS_ANDROID && flow.children.indexOf(window) || 0;

    if (asModal) { return window.close(); }
    if (index === -1) { throw("Window already closed"); }

    OS_ANDROID && flow.children.splice(index, 1);
    window.close();
}

/* --------------- TABS METHODS --------------- */ 
/**
 * @method _createDrawer
 * @private
 * 
 * Create a new instance of the drawer (NappDrawer for iOS, tripvi Drawer for Android).
 *
 * @return {Object} An instance of the drawer.
 */

/* -------------- INIT FUNCTIONS ---------- */

function _configure(args) {
    args = args || {};

    /* If there is a debug option, we'll decorate each method to offer some logs */
    if (args.debug) {
        function log(msg) {
            Ti.API.debug("\033[1;32m[DrawerManager]: \033[0m" + msg);
        }

        /* Windows */
        exports.createWindow = function (view, options) {
            if (options.modal) {
                log("Create new modal window");
            } else {
                log("Create new window within flow #" + (_currentFlow && _currentFlow.id)); 
            }
            log("options: " + JSON.stringify(options, null, "  "));
            return _createWindow(view, options);
        };

        var origOpenWindow = _openWindow;
        _openWindow = function (window, flow, asModal, view) {
            if (asModal) {
                log("Open modal window");
            } else {
                log("Open window in flow #" + flow.id + (view ? " with drawer" : ""));
            }

            return origOpenWindow(window, flow, asModal, view);
        };

        var origCloseWindow = _closeWindow;
        _closeWindow = function (window, flow, asModal, view) {
            if (asModal) {
                log("Close modal window");
            } else {
                log("Close window in flow #" + flow.id);
            }
           return origCloseWindow(window, flow, asModal, view); 
        };

        /* Flows */
        exports.createFlow = function (view, options) {
            log("Create new flow");
            log("options: " + JSON.stringify(options, null, "  "));
            return _createFlow(view, options);
        };

        var origOpenFlow = _openFlow;
        _openFlow = function (flow) {
            log("Open flow #"+flow.id);
            return origOpenFlow(flow);
        };

        var origCloseFlow = _closeFlow;
        _closeFlow = function (flow) {
            log("Close flow #"+flow.id);
            return origCloseFlow(flow);
        };

        /* Drawer */
        var origCreateDrawer = _createDrawer;
        _createDrawer = function () {
            log("Create a new drawer");
            return origCreateDrawer();
        };
    }

    /* Avoid double init */
    exports.configure = _configure = function () { Ti.API.error("Init already done."); }

    /* Allow chaining */
    return exports;
}

function _init(config) {
    _.extend(_config, config || {});

    exports.init = _init = function () { Ti.API.error("Configure already done."); }

    /* Allow chaining */
    return exports;
}

/* --------------- Export the public Interface --------------- */

/** 
 * @method createFlow
 *
 * Create and get a new flow stub. A flow represent a set of window that share a common
 * feature of the app. Closing a flow will cause all window opened within this flow to be closed
 * too. For iOS, it's similar to using a NavigationWindow; On Android, it will mimic that behavior.
 *
 * @param {titanium: UI.View} View The view to place in that window.
 * @param {Object} options Options to give to the root window during its creation. May also contain
 * a special key "drawer" to specify if a drawer should be bound with the window or not.
 * @return {Stub} A window stub to open and close the created window / flow. 
 */
exports.createFlow = _createFlow;

/** 
 * @method createWindow
 *
 * Create and get a new window stub. A window will be opened within the flow it has been created.
 * It's not recommended to open a window within a flow which has been closed; 
 *
 * @param {titanium: UI.View} View The view to place in that window.
 * @param {Object} options Options to give to the window during its creation. May also contain
 * a special key "drawer" to specify if a drawer should be bound with the window or not.
 * @return {Stub} A window stub to open and close the created window.
 */
exports.createWindow = _createWindow;

/**
 * @method configure
 *
 * Configure the component.  Only expect a debug option or not. There is no external dependency.
 *
 * @param {Object} args
 * @param {Boolean} args.debug If true, will decorate all functions with some logs
 *
 * @return {DrawerManager} The module itself for chaining
 */
exports.configure = _configure;

/**
 * @method init
 *
 * Initialize the drawer manager
 *
 * @param {Object} config 
 * @param {Function} [config.leftView] The view that should be placed in the left panel of the drawer.  
 * @param {Number} [config.leftDrawerWidth=200] The width of the left panel
 * @param {Function} [config.rightView] The view that should be placed in the right panel of the drawer.  
 * @param {Number} [config.rightDrawerWidth=200] The width of the right panel @param
 * @param {Boolean} [config.defaultWithDrawer=true] If true, every window will be created with a
 * drawer by default.
 * @param {Object} [config.defaultStyle] Default style to apply to the window.
 */
exports.init = _init;