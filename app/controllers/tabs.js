/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initTabs();
    initWindowManager();
})(arguments[0] || {});

function initTabs() {
    var tabs = [];

    for (var i = 0, max = 3; i < max; i++) {
        var window = Ti.UI.createWindow({
            title : 'Tab ' + (i + 1)
        });

        window.add(Alloy.createController('requires/view', {
            isRoot : true,
            windowManager : $.windowManager,
            closeFlow : _close
        }).getView());

        tabs.push(Ti.UI.createTab({
            title : 'Tab ' + (i + 1),
            window : window
        }));
    }

    $.tabGroup.setTabs(tabs);
}

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init();
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _open() {
    $.flow = $.windowManager.createFlow({
        root : $.tabGroup,
        beforeCreating : function (root) {
            root.setActiveTab(root.tabs[0]);
        }
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
