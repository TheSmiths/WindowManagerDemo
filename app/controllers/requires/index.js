/* -------------- INIT FUNCTION ---------- */

(function constructor(args) {
})(arguments[0] || {});

/* --------------- HANDLE USER INTERACTIONS --------------- */

function selectedModule(e) {
    if (!e.row.type) return false;

    var modules = {
        'drawer' : {
            filename : 'drawer',
            src : 'DrawerManager.2.1.2'
        },
        'tabs' : {
            filename : 'tabs',
            src : 'TabsManager.0.9.3'
        }
    };

    /* ONLY FOR DEMO
     * isAllowToCloseRoot: flow 0 will never close
     */
    if (e.source.isAllowToCloseRoot === false) {
        e.source.isAllowToCloseRoot = true;
    }
    else if (typeof e.source.isAllowToCloseRoot === 'undefined') {
        e.source.isAllowToCloseRoot = false;
    }

    return Alloy.createController(modules[e.row.type].filename, {
        windowManager : require(modules[e.row.type].src),
        isAllowToCloseRoot : e.source.isAllowToCloseRoot
    }).open();
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

if (OS_ANDROID) {
    exports.open =  function () {
        $.container.open();
    };
}
