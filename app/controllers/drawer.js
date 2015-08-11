/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();

    /* ONLY FOR DEMO */
    $.isAllowToCloseRoot = args.isAllowToCloseRoot;
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init({
        leftView : (function () {
            var view = Alloy.createController('requires/view', {
                isRoot : true,
                isDrawer : true,
                windowManager : $.windowManager,
                closeFlow : _close,
                styles : {
                    top : OS_IOS ? 20 : 0
                }
            }).getView();

            if (OS_IOS) {
                var window = Ti.UI.createWindow({
                    backgroundColor : '#ecf0f1'
                });
                window.add(view);
                return window;
            }

            return view;
        })(),
        rightView : (function () {
            var view = Alloy.createController('requires/view', {
                isRoot : true,
                isDrawer : true,
                windowManager : $.windowManager,
                closeFlow : _close,
                styles : {
                    top : OS_IOS ? 20 : 0
                }
            }).getView();

            if (OS_IOS) {
                var window = Ti.UI.createWindow({
                    backgroundColor : '#ecf0f1'
                });
                window.add(view);
                return window;
            }

            return view;
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
    /* ONLY FOR DEMO */
    /* It should only $.flow.close() in a production */
    if ($.isAllowToCloseRoot) {
        $.flow.close();
    }
    else {
        console.log($.flow.window);
        console.log($.flow.window.close.close);
        $.flow.window.close();
    }
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
