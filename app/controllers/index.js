/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    if (Alloy.CFG.allowToChooseModuleInRunTime) {
        if (OS_ANDROID) { $.index.theme = "materialTheme" };
        initWindowManager();
        open();
    }
    else {
        // Choose demo of DrawerManager as default
        var modules = Alloy.CFG.modules;
        var demo = Alloy.CFG.demo || 'drawer';

        if (_.keys(modules).indexOf(demo) === -1) {
            return Ti.API.error('The module name of demo is not correct.');
        }

        return Alloy.createController(demo, {
            windowManager : require(modules[demo].src)
        }).open();
    }
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager = require('DrawerManager.2.1.2');

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

function open() {
    $.flow = $.windowManager.createFlow(Alloy.createController('requires/index', {
        isRoot : true,
        isDrawer : false,
        windowManager : $.windowManager
    }).getView(), {
        drawer : false,
        title : "Window Manager Demo",
        barColor : '#2196F3',
        titleAttributes : {
            color: '#FAFAFA',
        }
    });

    $.flow.open();
}
