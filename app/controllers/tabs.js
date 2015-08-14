/* -------------- INIT FUNCTIONS ---------- */

(function constructor(args) {
    $.windowManager = args.windowManager;
    initWindowManager();
})(arguments[0] || {});

function initWindowManager() {
    $.windowManager.configure({ debug: true });

    $.windowManager.init();
}

/* --------------- EMBEDDED METHODS --------------- */

function _open() {
    $.flow = $.windowManager.createFlow({
        views : (function () {
            var views = [];
            for (var i = 0, max = 3; i < max; i++) {
                views.push(Alloy.createController('requires/view', {
                    isRoot : true,
                    windowManager : $.windowManager,
                    closeFlow : _close,
                }).getView());
            }
            return views;
        })(),
        options : {
            activeTab : 1,
            styles : { /* style for tabgroup */
                tabsBackgroundColor : '#2196F3',
                tabsTintColor : '#FAFAFA',
                translucent : false
            },
            tabs : [
                {
                    title : 'Tab 1',
                    windowProperties : {
                        title : 'Win 1',
                        barColor : '#E91E63',
                        titleAttributes : {
                            color: '#FAFAFA',
                        }
                    }
                },
                {
                    title : 'Tab 2',
                    windowProperties : {
                        title : 'Win 2',
                        barColor : '#2196F3',
                        titleAttributes : {
                            color: '#FAFAFA',
                        }
                    }
                },
                {
                    title : 'Tab 3',
                    windowProperties : {
                        title : 'Win 3',
                        barColor : '#FF5722',
                        titleAttributes : {
                            color: '#FAFAFA',
                        }
                    }
                }
            ]
        }
    });

    OS_IOS && $.flow.window.addEventListener('focus', changeColorOfTabBar);

    $.flow.open();
}

function changeColorOfTabBar(e) {
    var tabGroup = $.flow.window;
    Alloy.CFG.primaryColor = tabGroup.activeTab.window.barColor;
    tabGroup.tabsBackgroundColor = tabGroup.activeTab.window.barColor;
}

function _close() {
    $.flow.close();
}

/* --------------- EXPORT THE PUBLIC INTERFACE --------------- */

exports.open = _open;

exports.close = _close;
