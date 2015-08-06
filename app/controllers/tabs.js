/* -------------- INIT FUNCTIONS ---------- */
(function constructor(args) {
    $.WindowManager = args.windowManager;
    initTabs();
    _init();
})(arguments[0] || {});

function initTabs() {
    var tabs = [];

    for (var i = 0, max = 3; i < max; i++) {
        var window = Ti.UI.createWindow({
            title : 'Tab ' + (i + 1)
        });

        window.add(Alloy.createController('requires/view', {
            isRoot : true,
            windowManager : $.WindowManager,
            closeFlow : _close
        }).getView());

        tabs.push(Ti.UI.createTab({
            title : 'Tab ' + (i + 1),
            window : window
        }));
    }

    $.tabGroup.setTabs(tabs);
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _init () {
    $.WindowManager.configure({ debug: true });

    $.WindowManager.init();
}

function _open() {
    var flow = $.WindowManager.createFlow({
        // all style of root should be defined in styles files
        root : $.tabGroup,
        beforeCreating : function (root) {
            root.setActiveTab(root.tabs[0]);
        }
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
