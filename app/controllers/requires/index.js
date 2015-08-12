/* -------------- INIT FUNCTION ---------- */

(function constructor(args) {
})(arguments[0] || {});

/* --------------- HANDLE USER INTERACTIONS --------------- */

function selectedModule(e) {
    if (!e.row.type) return false;

    var modules = Alloy.CFG.modules;

    return Alloy.createController(modules[e.row.type].filename, {
        windowManager : require(modules[e.row.type].src)
    }).open();
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

if (OS_ANDROID) {
    exports.open =  function () {
        $.container.open();
    };
}
