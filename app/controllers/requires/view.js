/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    $.WindowManager = args.windowManager;
    $.closeFlow = args.closeFlow;
    $.isDrawer = args.isDrawer;
    cleanUpUnusedRow(args);
})(arguments[0] || {});

function cleanUpUnusedRow(args) {
    if (args.isRoot) {
        $.options.deleteRow($.closeWinRow, {animated : false});
    }

    if (args.isModal) {
        $.options.deleteRow($.openChildWinRow, {animated : false});
        deleteSection($.flowSection);
    }

    if (!args.isDrawer) {
        deleteSection($.forDrawerSection);
    }
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

function selectedOption(e) {
    if (!e.row.action) return false;
    if (e.row.action === "openModalWin") {
        createAndOpenWindow({modal : true});
    }
    else if (e.row.action === "openChildWin") {
        createAndOpenWindow({modal : false});
    }
    else if (e.row.action === "openLeftView") {
        $.WindowManager.openLeftWindow();
    }
    else if (e.row.action === "openRightView") {
        $.WindowManager.openRightWindow();
    }
    else if (e.row.action === "close") {
        $.window.close();
    }
    else if (e.row.action === "exitFlow") {
        $.closeFlow();
    }
    else {
        console.error('Should not be here');
    }
}

/* --------------- EMBEDDED METHODS --------------- */

function createAndOpenWindow(args) {
    // close previous window
    if (args.modal) {
        if ($.window) {
            $.window.close();
        }
    }

    var viewCtrl = Alloy.createController('requires/view', {
        isModal : args.modal,
        windowManager : $.WindowManager,
        closeFlow : $.closeFlow
    });
    var window = $.WindowManager.createWindow(viewCtrl.getView(), {
        modal : args.modal,
        drawer : $.isDrawer
    });

    // send the window which contain the view to the view controller
    // so we can call close window into view controller
    viewCtrl.setWindow(window);

    window.open();
}

function _setWindow(window) {
    $.window = window;
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

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.setWindow = _setWindow;
