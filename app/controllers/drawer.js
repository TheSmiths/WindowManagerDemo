/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    $.windowManager = args.windowManager;
    _init();
})(arguments[0] || {});
/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _init () {
    $.windowManager.configure({ debug: true });

    $.windowManager.init({
        leftView : (function () {
            return $.leftView;
        })(),
        rightView : (function () {
            return $.rightView;
        })()
    });
}

function _open() {
    var flow = $.windowManager.createFlow(Alloy.createController('requires/view', {
        isRoot : true,
        isDrawer : true,
        windowManager : $.windowManager,
        closeFlow : _close
    }).getView(), {
        drawer : true,
        title : "Drawer Manager 2.1.2"
    });

    $.flow = flow;
    flow.open();
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
