(function constructor(args) {
	$.index.open();
})(arguments[0] || {});

function selectedDemo(e) {
	$.flow && $.flow.close()
	if (e.row.title === "Drawer Manager 2.1.2") {
		setupDrawerManager();
	}
	else if (e.row.title === "Tabs Manager 0.9.0") {
		setupTabsManager();
	}
}

function setupDrawerManager() {
	if (!$.WindowManager || $.WindowManager.type !== "DrawerManager") {
		$.WindowManager = require('DrawerManager.2.1.2');
		$.WindowManager.type = "DrawerManager";

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
		$.WindowManager = require('TabsManager.0.9.0');
		$.WindowManager.type = "TabsManager";
		$.WindowManager.init();
	}

	var tabs = _.keys($).map(function (key) {
		if ($[key].apiName === "Ti.UI.Tab") {
			return $[key];
		}
	}).filter(function (n) { return n != undefined });

	var flow = $.WindowManager.createFlow(tabs, null);

	$.flow = flow;
	flow.open();
}

function selectedOption(e) {
	if (e.row.title === "Open Modal Window") {
		openModalWindow();
	}
	else if (e.row.title === "Open Children Window") {
		openChildWindow();
	}
	else if (e.section.headerTitle === "Left View") {
		$.WindowManager.openLeftWindow();
	}
	else if (e.section.headerTitle === "Right View") {
		$.WindowManager.openRightWindow();
	}
	else if (e.section.headerTitle === "Drawer Manager 2.1.2" && e.row.title === "Exit") {
		exitCurrentFlow();
	}
	else {
		console.error('Should not be here');
	}
}

function openChildWindow(e) {
	var label = Ti.UI.createLabel({
		text : 'Close Me'
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
		text : 'Close Me'
	});
	label.addEventListener('click', function closeWindow() {
		label.removeEventListener('click', closeWindow);
		modalWindow.close();
	});
	var modalWindow = $.WindowManager.createWindow(label, {modal : true});
	modalWindow.open();
}

function exitCurrentFlow() {
	if ($.flow.tabGroup) {
		alert('TabsManager can only open and close flow one time. You will get error if try to open second time.');
	}
	$.flow.close();
	delete $.flow;
}
