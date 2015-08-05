var _DrawerModule = OS_ANDROID ? require('com.tripvi.drawerlayout') : require('dk.napp.drawer'),
    _currentFlow = null, // A reference to the current flow, will hold any new window.
    _config = {
        defaultWithDrawer: true,
        rightDrawerWidth: 200,
        leftDrawerWidth: 200,
        defaultStyle: { backgroundColor: "#FFFFFF" },
        leftView: null,
        rightView: null,
    },
    _drawer = null;


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
                window: flow.root,
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


function _createFlow(view, options) {
    var flow = { 
            id: _Factory.newId(), 
            children: OS_ANDROID ? [] : undefined,
            viewStack: OS_ANDROID ? [] : undefined,
            navigationWindow: OS_IOS ? null : undefined,
            root: null
        }; 

    /* Handle options correcly */
    options = options || {};
    if (options.drawer !== undefined) {
        /* Modal or Drawer, you have to choose :) */
        flow.withDrawer = options.drawer && !options.modal;
        delete options.drawer;
    } else {
        flow.withDrawer = _config.defaultWithDrawer && !options.modal;
    }

    /* On iOS, we need to create a new navigation window, will be our root. */
    if (OS_IOS) {
        flow.root = (function createNavWindow(view, options) {
            var window = _Factory.newWindow(options);
            window.add(view);
            return Ti.UI.iOS.createNavigationWindow({ window: window });
        }(view, options));
    } else if (OS_ANDROID) {
        flow.root = _Factory.newWindow(options);
        if (flow.withDrawer) {
            /* On Android, no nav window, we're gonna fake it */
            flow.viewStack.push(view);
        } else {
            /* Android, but no drawer.. simple window then */
            flow.root.add(view);
        }
    }

    /* Then, return the stub */
    return _Factory.newFlowStub(flow);
}


/* Create a window, more doc at the end of the file. */
function _createWindow(view, options) {
    var window = _Factory.newWindow(options), 
        withDrawer;

    if (OS_IOS && options.modal) {
        window.add(view);
        window = Ti.UI.iOS.createNavigationWindow({
            autoAdjustScrollViewInsets: false,
            fullscreen: true,
            modal: true,
            window: window,
        });
    }

    /* Handle the drawer option */
    if (options.drawer !== undefined) {
        withDrawer = options.drawer && !options.modal;
        delete options.drawer;
    } else {
        withDrawer = _config.defaultWithDrawer && !options.modal;
    }

    /* Add the view, or not, depending the options */
    ((OS_IOS && !options.modal) || (OS_ANDROID && !withDrawer)) && window.add(view);

    /* Return the stub */
    return _Factory.newWindowStub(window, _currentFlow, options.modal, 
        OS_ANDROID && withDrawer ? view : undefined);
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
    if (OS_IOS && flow.withDrawer) {
        _drawer.setCenterWindow(flow.root);
        flow.root.fireEvent("open", {
            type: "open",
            source: flow.root
        });
        _drawer.open();
    } else if (OS_IOS && !flow.withDrawer) {
        flow.root.open();
    } else if (OS_ANDROID) {
        _currentFlow !== null && (function removePreviousFlow(flow) {
            if (!flow.withDrawer) { return; }

            var previousWindow = flow.children.length > 0 ?
                    flow.children[flow.children.length - 1] : flow.root;
            
            previousWindow.remove(_drawer);
        }(_currentFlow));

        if (flow.withDrawer) {
            _drawer.setCenterView(flow.viewStack[0]);
            flow.root.add(_drawer);
        }

        flow.root.open();
    } 
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

    if (OS_ANDROID) {
        if (view !== undefined) {
            /* Drawer !! :D */
            (function removeDrawerFromPrevious(flow) {
                var previousView = flow.viewStack[flow.viewStack.length - 1],
                    previousWindow;
                
                if (flow.children.length > 0) { 
                    previousWindow = flow.children[flow.children.length - 1];
                } else {
                    previousWindow = flow.root;
                }
                previousWindow.remove(_drawer);
            }(flow));
            _drawer.setCenterView(view);
            window.add(_drawer);
            flow.viewStack.push(view);
        }
        flow.children.push(window);
        window.open();
    } else if (OS_IOS) {
        flow.root.openWindow(window, { animated: true });
    }
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
    OS_ANDROID && !flow.withDrawer && flow.children.map(function (w) { w.close(); });
    OS_IOS && flow.withDrawer && _currentFlow.withDrawer && _drawer.close();
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

    OS_ANDROID && flow.withDrawer && (function removeFromStack(view, flow) {
        var index = flow.viewStack.indexOf(view);

        if (index === -1) { throw("View already closed"); } // Really weird if happens.

        window.remove(_drawer);
        if (index === flow.viewStack.length - 1) { 
            /* Closing the last window, the one displayed in the drawer */
            _drawer.setCenterView(flow.viewStack[index - 1]); // There is at least 2 views 
            if (flow.children.length > 1) { // There are previous windows 
                flow.children[index - 2].add(_drawer);
            } else { //Otherwise, back to the root
                flow.root.add(_drawer);
            }
        }
        flow.viewStack.splice(index, 1);
    }(view, flow));

    OS_ANDROID && flow.children.splice(index, 1);
    window.close();
}

/* --------------- DRAWER METHODS --------------- */ 
/**
 * @method _createDrawer
 * @private
 * 
 * Create a new instance of the drawer (NappDrawer for iOS, tripvi Drawer for Android).
 *
 * @return {Object} An instance of the drawer.
 */
function _createDrawer() {
    var drawerInstance;

    if (OS_IOS) { 
        drawerInstance = {
            fullscreen: false,
            centerWindow: Ti.UI.createWindow(),
            animationMode: _DrawerModule.ANIMATION_NONE,
            closeDrawerGestureMode: _DrawerModule.CLOSE_MODE_ALL,
            openDrawerGestureMode: _DrawerModule.OPEN_MODE_ALL,
            shouldStretchDrawer: false,
            showShadow: false
        };

        if (_config.leftView !== null) {
            drawerInstance.leftWindow = _config.leftView;
            drawerInstance.leftDrawerWidth = _config.leftDrawerWidth;
        }

        if (_config.rightView !== null) {
            drawerInstance.rightWindow = _config.rightView;
            drawerInstance.rightDrawerWidth = _config.rightDrawerWidth;
        }

        drawerInstance = _DrawerModule.createDrawer(drawerInstance);
    } else if (OS_ANDROID) {
        drawerInstance = {
            centerView: Ti.UI.createView(),
            width: Ti.UI.FILL,
            height: Ti.UI.FILL
        };

        if (_config.leftView !== null) {
            drawerInstance.drawerArrowIcon = true;
            drawerInstance.drawerArrowIconColor = "#FFFFFF";
            drawerInstance.leftView = _config.leftView;
            drawerInstance.leftDrawerWidth = _config.leftDrawerWidth;
        }

        if (_config.rightView !== null) {
            drawerInstance.rightView = _config.rightView;
            drawerInstance.rightDrawerWidth = _config.rightDrawerWidth;
        }

        drawerInstance = _DrawerModule.createDrawer(drawerInstance);
    }

    return drawerInstance;
}

function _toggleLeftWindow() { 
    if (_config.leftView !== null) {
        _drawer.toggleLeftWindow(); 
    }
}

function _toggleRightWindow() { 
    if (_config.rightView !== null) {
        _drawer.toggleRightWindow(); 
    }
}

function _closeLeftWindow() {
    if (_config.leftView === null) { return; }
    if (OS_ANDROID) {
        _drawer.closeLeftWindow();
    } else if (OS_IOS && _drawer.isLeftWindowOpen()) {
        _drawer.toggleLeftWindow();
    }
}

function _closeRightWindow() {
    if (_config.rightView === null) { return; }
    if (OS_ANDROID) {
        _drawer.closeRightWindow();
    } else if (OS_IOS && _drawer.isRightWindowOpen()) {
        _drawer.toggleRightWindow();
    }
}

function _openLeftWindow() {
    if (_config.leftView === null) { return; }
    if (OS_ANDROID) {
        _drawer.openLeftWindow();
    } else if (OS_IOS && !_drawer.isLeftWindowOpen()) {
        _drawer.toggleLeftWindow();
    }
}

function _openRightWindow() {
    if (_config.rightView === null) { return; }
    if (OS_ANDROID) {
        _drawer.openRightWindow();
    } else if (OS_IOS && !_drawer.isRightWindowOpen()) {
        _drawer.toggleRightWindow();
    }
}

function _setLeftView(view) {
    OS_IOS && _drawer.setLeftWindow(view);
    OS_ANDROID && _drawer.setLeftView(view);
}

function _setRightView(view) {
    OS_IOS && _drawer.setRightWindow(view);
    OS_ANDROID && _drawer.setRightView(view);
}

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
    _drawer = _createDrawer();

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

/** 
 * @method toggleLeftWindow
 *
 * Toggle the left drawer window
 */
exports.toggleLeftWindow = _toggleLeftWindow;

/** 
 * @method toggleRightWindow
 *
 * Toggle the right drawer window
 */
exports.toggleRightWindow = _toggleRightWindow;


/**
 * @method openLeftWindow
 *
 * Open the left drawer window. Do nothing if the window is already opened.
 */
exports.openLeftWindow = _openLeftWindow;

/**
 * @method openRightWindow
 *
 * Open the right drawer window. Do nothing if the window is already opened.
 */
exports.openRightWindow = _openRightWindow;

/**
 * @method closeLeftWindow
 *
 * Close the left drawer window. Do nothing if the window is already closed.
 */
exports.closeLeftWindow = _closeLeftWindow;

/**
 * @method closeRightWindow
 *
 * Close the right drawer window. Do nothing if the window is already closed.
 */
exports.closeRightWindow = _closeRightWindow;

/**
 * @method setLeftView
 *
 * set the leftView
 *
 * @param {titanium: UI.View} view The view to set
 */
exports.setLeftView = _setLeftView;

/**
 * @method setRightView
 *
 * set the RightView
 *
 * @param {titanium: UI.View} view The view to set
 */
exports.setRightView = _setRightView;
