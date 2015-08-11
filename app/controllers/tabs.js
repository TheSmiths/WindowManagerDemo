/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();

    /* ONLY FOR DEMO */
    $.isAllowToCloseRoot = args.isAllowToCloseRoot;
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init();
}

/* --------------- HANDLE USER INTERACTIONS --------------- */

/* --------------- EMBEDDED METHODS --------------- */

function _open() {
    $.flow = $.windowManager.createFlow({
        views : (function () {
            var views = [];
            for (var i = 0, max = 3; i < max; i++) {
                views.push(Alloy.createController('requires/view', {
                    isRoot : true,
                    windowManager : $.windowManager,
                    closeFlow : _close
                }).getView());
            }
            return views;
        })(),
        options : {
            activeTab : 1,
            tabs : [
                {
                    title : 'Tab 1',
                    windowProperties : {
                        title : 'Win 1'
                    }
                },
                {
                    title : 'Tab 2',
                    windowProperties : {
                        title : 'Win 2'
                    }
                },
                {
                    title : 'Tab 3',
                    windowProperties : {
                        title : 'Win 3'
                    }
                }
            ]
        }
    });

    $.flow.open();
}

function _close() {
    /* ONLY FOR DEMO */
    /* It should only $.flow.close() in a production */
    if ($.isAllowToCloseRoot) {
        $.flow.close();
    }
    else {
        $.flow.window.close();
    }
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
