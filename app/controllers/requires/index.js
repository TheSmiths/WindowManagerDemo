/* -------------- INIT FUNCTION ---------- */
(function constructor(args) {
    if (OS_ANDROID) {
        exports.open =  function () {
            $.container.open();
        };
    }
})(arguments[0] || {});

function selectedDemo(e) {
    if (!e.row.type) return false;

    var libraries = {
        'drawer' : {
            controller : 'drawer',
            src : 'DrawerManager.2.1.2'
        },
        'tabs' : {
            controller : 'tabs',
            src : 'TabsManager.0.9.2'
        }
    };

    return Alloy.createController(libraries[e.row.type].controller, {
        windowManager : require(libraries[e.row.type].src)
    }).open();
}
