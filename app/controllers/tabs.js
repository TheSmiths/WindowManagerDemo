/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init();
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _open() {
    var views = [];

    for (var i = 0, max = 3; i < max; i++) {
        views.push({
            view : Alloy.createController('requires/view', {
                isRoot : true,
                windowManager : $.windowManager,
                closeFlow : _close
            }).getView(),
            options : {
                title : 'Tab' + (i + 1)
            }
        });
    }

    $.tabGroup = $.windowManager.createFlows(views);

    $.tabGroup.open();
}

function _close() {
    $.tabGroup.close();

    // Clean up
    delete $.windowManager;
    delete $.tabGroup;
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
