/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    if (OS_ANDROID) {
        exports.open =  function () {
            $.container.open();
        };
    }
})(arguments[0] || {});

function selectedModule(e) {
    if (!e.row.type) return false;

    var modules = {
        'drawer' : {
            filename : 'drawer',
            src : 'DrawerManager.2.1.2'
        },
        'tabs' : {
            filename : 'tabs',
            src : 'TabsManager.0.9.2'
        }
    };

    return Alloy.createController(modules[e.row.type].filename, {
        windowManager : require(modules[e.row.type].src)
    }).open();
}
