/* -------------- INIT FUNCTION ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    $.closeFlow = args.closeFlow;
    $.isDrawer = args.isDrawer;

    args.styles && $.options.applyProperties(args.styles);

    cleanUpUnusedRow(args);
})(arguments[0] || {});

/* --------------- HANDLE USER INTERACTIONS --------------- */

function selectedOption(e) {
    if (!e.row.action) return false;

    if (e.row.action === "openModalWin") {
        openWindow({modal : true});
    }
    else if (e.row.action === "openChildWin") {
        openWindow({modal : false});
    }
    else if (e.row.action === "openLeftView") {
        $.windowManager.openLeftWindow();
    }
    else if (e.row.action === "openRightView") {
        $.windowManager.openRightWindow();
    }
    else if (e.row.action === "close") {
        $.window && $.window.close();
    }
    else if (e.row.action === "openDrawer") {
        return Alloy.createController('drawer', {
            windowManager : require("DrawerManager.2.1.2")
        }).open();
    }
    else if (e.row.action === "openTabs") {
        return Alloy.createController('tabs', {
            windowManager : require("TabsManager.0.9.3")
        }).open();
    }
    else {
        console.error('Should not be here');
    }
}

function openWindow(args) {
    // close previous window
    args.modal && $.window && $.window.modal && $.window.close();

    // focus on centerWindow
    if (OS_IOS) {
        $.isDrawer && $.windowManager.closeLeftWindow();
        $.isDrawer && $.windowManager.closeRightWindow();
    }

    var viewCtrl = Alloy.createController('requires/view', {
        isModal : args.modal,
        windowManager : $.windowManager
    });
    var window = $.windowManager.createWindow(viewCtrl.getView(), {
        modal : args.modal,
        drawer : $.isDrawer
    });

    // we need this line for closing previous modal window if need
    window.modal = args.modal;

    // send the window which contain the view to the view controller
    // so we can call close window into view controller
    viewCtrl.setWindow(window);

    window.open();
}

/* --------------- HELPER METHODS --------------- */

function deleteSection(section) {
    for (var i = 0, max = $.options.sections.length; i < max; i++) {
        if ($.options.sections[i] === section) {
            $.options.deleteSection(i, {animated : false});
            break;
        }
    }
}

function cleanUpUnusedRow(args) {
    if (args.isRoot) {
        $.options.deleteRow($.closeWinRow, {animated : false});
    }

    if (args.isModal) {
        $.options.deleteRow($.openChildWinRow, {animated : false});
    }

    // if (Alloy.CFG.demo === 'drawer') {
    //     $.options.deleteRow($.openTabs, {animated : false});
    // }
    // if (Alloy.CFG.demo === 'tabs') {
    //     $.options.deleteRow($.openDrawer, {animated : false});
    // }

    if (!args.isDrawer || args.isDrawerView) {
        deleteSection($.forDrawerSection);
    }

    if (args.isDrawerView || args.isModal) {
        deleteSection($.flowSection);
    }
}

/* --------------- EMBEDDED METHODS --------------- */

function _setWindow(window) {
    $.window = window;
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.setWindow = _setWindow;
