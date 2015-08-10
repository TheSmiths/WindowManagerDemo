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
                window: flow.root,
                open: function openFlow() { _openFlow(flow); },
                close: function closeFlow() { setTimeout(function() { _closeFlow(flow); }, 0); }
            };
        },
        newWindowStub: function (args) {
            return {
                window: args.window,
                open: function openWindow() { _openWindow(args); },
                close: function closeWindow() { _closeWindow(args); }
            };
        }
    };
}());


function _createFlow(args) {
    root = _Factory.newWindow(args.options);
    root.add(args.view);

    return _Factory.newFlowStub({
        id: _Factory.newId(),
        root: root,
        children: OS_ANDROID ? [] : undefined
    });
}

function _createFlows(views) {
    var tabs = [];

    for (var i = 0, max = views.length; i < max; i++) {
        tabs.push(
        Ti.UI.createTab(_.extend(views[i].options, {
            window : _createFlow({
                view : views[i].view
            }).window
        })));
    }

    return Ti.UI.createTabGroup({
        tabs : tabs
    });
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

    /* Return the stub */
    return _Factory.newWindowStub({
        window: window,
        flow : _currentFlow,
        asModal : options.modal,
        view : undefined
    });
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
 * @param {Object} args
 * @param {titanium: UI.Window} [args.window] window The window to be opened
 * @param {Object} [args.flow] A representation of a flow
 * @param {Boolean} [args.asModal] Open the window as a modal window if true
 */
function _openWindow(args) {
    if (args.asModal) {
        return args.window.open({ modal: true });
    }
    if (!_currentFlow || _currentFlow.id !== args.flow.id) {
        throw("Unable to open the window in the current flow.");
    }
    if (OS_ANDROID) {
        args.flow.children.push(args.window);
    }
    args.flow.root.getActiveTab().open(args.window, { animated : true});
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
    /* On Android, all window should be closed separately */
    OS_ANDROID && flow.children.map(function (window) { window.close(); });
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
 * @param {Object} args
 * @param {titanium: UI.Window} [args.window] window The window to be closed
 * @param {Boolean} [args.asModal] Close the modal window without impacting the flow
 * @param {Object} [args.flow] A representation of a flow
 */
function _closeWindow(args) {
    var index = OS_ANDROID && args.flow.children.indexOf(args.window) || 0;

    if (args.asModal) { return args.window.close(); }
    if (index === -1) { throw("Window already closed"); }

    OS_ANDROID && args.flow.children.splice(index, 1);
    args.window.close();
}

/* --------------- TABS METHODS --------------- */


/* -------------- INIT FUNCTIONS ---------- */

function _configure(args) {
    args = args || {};

    /* If there is a debug option, we'll decorate each method to offer some logs */
    if (args.debug) {
        function log(msg) {
            Ti.API.debug("\033[1;32m[TabsManager]: \033[0m" + msg);
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
        _openWindow = function (args) {
            if (args.asModal) {
                log("Open modal window");
            } else {
                log("Open window in flow #" + args.flow.id);
            }

            return origOpenWindow(args);
        };

        var origCloseWindow = _closeWindow;
        _closeWindow = function (args) {
            if (args.asModal) {
                log("Close modal window");
            } else {
                log("Close window in flow #" + args.flow.id);
            }
           return origCloseWindow(args);
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
    }

    /* Avoid double init */
    exports.configure = _configure = function () { Ti.API.error("Init already done."); };

    /* Allow chaining */
    return exports;
}

function _init(config) {
    _.extend(_config, config || {});

    exports.init = _init = function () { Ti.API.error("Configure already done."); };

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
 * @param {Object} options Options to give to the root window during its creation.
 * @return {Stub} A window stub to open and close the created window / flow.
 */
exports.createFlow = _createFlow;

exports.createFlows = _createFlows;

/**
 * @method createWindow
 *
 * Create and get a new window stub. A window will be opened within the flow it has been created.
 * It's not recommended to open a window within a flow which has been closed;
 *
 * @param {titanium: UI.View} View The view to place in that window.
 * @param {Object} options Options to give to the window during its creation.
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
 * @return {TabsManager} The module itself for chaining
 */
exports.configure = _configure;

/**
 * @method init
 *
 * Initialize the tabs manager
 *
 * @param {Object} config
 * @param {Object} [config.defaultStyle] Default style to apply to the window.
 */
exports.init = _init;
