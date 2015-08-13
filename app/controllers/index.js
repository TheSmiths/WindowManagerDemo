/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    if (Alloy.CFG.allowToChooseModuleInRunTime) {
        if (OS_ANDROID) { $.index.theme = "materialTheme" };
        $.index.open();
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
