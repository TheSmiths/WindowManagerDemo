(function constructor(args) {
    $.index.open();
})(arguments[0] || {});

function selectedDemo(e) {
    if (!e.row._id) return false;
    if (e.row._id === "loadDrawerManager") {
        setupDrawerManager();
    }
    else if (e.row._id === "loadTabsManager") {
        setupTabsManager();
    }
}

function setupDrawerManager() {
    if (!$.WindowManager || $.WindowManager.type !== "DrawerManager") {
        $.WindowManager = require('DrawerManager.2.1.2');
        $.WindowManager.type = "DrawerManager";

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

    var flow = $.WindowManager.createFlow($.options, {
        drawer : true,
        title : "Drawer Manager 2.1.2"
    });

    $.flow = flow;
    flow.open();
}

function setupTabsManager() {
    if (!$.WindowManager || $.WindowManager.type !== "TabsManager") {
        $.WindowManager = require('TabsManager.0.9.2');
        $.WindowManager.type = "TabsManager";
        $.WindowManager.configure({ debug: true });
        $.WindowManager.init();
    }

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

function selectedOption(e) {
    if (!e.row._id) return false;
    if (e.row._id === "openModalWin") {
        openModalWindow();
    }
    else if (e.row._id === "openChildWin") {
        openChildWindow();
    }
    else if (e.row._id === "openLeftView") {
        $.WindowManager.openLeftWindow();
    }
    else if (e.row._id === "openRightView") {
        $.WindowManager.openRightWindow();
    }
    else if (e.row._id === "exitDrawerManager") {
        exitCurrentFlow();
    }
    else {
        console.error('Should not be here');
    }
}

function openChildWindow(e) {
    var label = Ti.UI.createLabel({
        text : 'Close Me',
        color : 'black'
    });
    label.addEventListener('click', function closeWindow() {
        label.removeEventListener('click', closeWindow);
        childWindow.close();
    });
    var childWindow = $.WindowManager.createWindow(label, {modal : false});
    childWindow.open();
}

function openModalWindow(e) {
    var label = Ti.UI.createLabel({
        text : 'Close Me',
        color : 'black'
    });
    label.addEventListener('click', function closeWindow() {
        label.removeEventListener('click', closeWindow);
        modalWindow.close();
    });
    var modalWindow = $.WindowManager.createWindow(label, {modal : true});
    modalWindow.open();
}

function exitCurrentFlow() {
    // if ($.flow.tabGroup) {
    //  alert('TabsManager can only open and close flow one time. You will get error if try to open second time.');
    // }
    $.flow.close();
    delete $.flow;
}
