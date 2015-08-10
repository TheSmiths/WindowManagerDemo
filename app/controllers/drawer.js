/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init({
        leftView : (function () {
            var view = Alloy.createController('requires/view', {
                isRoot : true,
                isDrawer : true,
                windowManager : $.windowManager,
                closeFlow : _close
            }).getView();

            if (OS_IOS) {
                var window = Ti.UI.createWindow();
                window.add(view);
            }

            return OS_IOS ? window : view;
        })(),
        rightView : (function () {
            var view = Alloy.createController('requires/view', {
                isRoot : true,
                isDrawer : true,
                windowManager : $.windowManager,
                closeFlow : _close
            }).getView();

            if (OS_IOS) {
                var window = Ti.UI.createWindow();
                window.add(view);
            }

            return OS_IOS ? window : view;
        })(),
    });
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _open() {
    $.flow = $.windowManager.createFlow(Alloy.createController('requires/view', {
        isRoot : true,
        isDrawer : true,
        windowManager : $.windowManager,
        closeFlow : _close
    }).getView(), {
        drawer : true,
        title : "Drawer Manager 2.1.2"
    });

    $.flow.open();
}

function _close() {
    $.flow.close();

    // Clean up
    delete $.windowManager;
    delete $.flow;
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
