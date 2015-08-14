/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;

    // already init in index page
})(arguments[0] || {});

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
        title : "Drawer Manager 2.1.2",
        barColor : '#2196F3',
        titleAttributes : {
            color: '#FAFAFA',
        }
    });

    $.flow.open();

    // No need to change color in drawer demo
    Alloy.CFG.primaryColor = null;
}

/* unable to close flow for now */
function _close() {
    $.flow.close();
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
