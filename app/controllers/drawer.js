/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    $.WindowManager = args.windowManager;
    _init();
})(arguments[0] || {});
/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _init () {
    $.WindowManager.configure({ debug: true });

    $.WindowManager.init({
        leftView : (function () {
            return $.leftView;
        })(),
        rightView : (function () {
            return $.rightView;
        })()
    });
}

function _open() {
    var flow = $.WindowManager.createFlow(Alloy.createController('requires/view', {
        isRoot : true,
        isDrawer : true,
        windowManager : $.WindowManager,
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
    delete $.WindowManager;
    delete $.flow;
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
