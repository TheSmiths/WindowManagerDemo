/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init({
        rightDrawerWidth : 250,
        leftDrawerWidth : 250,
        leftView : initDrawerView(),
        rightView : initDrawerView(),
    });
}

function initDrawerView () {
    var view = Alloy.createController('requires/view', {
        isRoot : true,
        isDrawer : true,
        isDrawerView : true,

        windowManager : $.windowManager,
        closeFlow : _close,
        styles : {
            top : OS_IOS ? 20 : 0
        }
    }).getView();

    if (OS_IOS) {
        var window = Ti.UI.createWindow({
            backgroundColor : '#E0E0E0'
        });
        window.add(view);
        return window;
    }

    return view;
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
        title : "Drawer Manager 2.1.2",
        barColor : '#2196F3',
        titleAttributes : {
            color: '#FAFAFA',
        }
    });

    $.flow.open();
}

/* unable to close flow for now */
function _close() {
    $.flow.close();
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
