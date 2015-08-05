var DrawerManager = require('DrawerManager.2.1.2');
var TabsManager = require('TabsManager.0.9.0');

(function constructor(args) {
	// DrawerManager.init({
	// 	leftView : (function () {
	// 		return $.leftView;
	// 	})(),
	// 	rightView : (function () {
	// 		return $.rightView;
	// 	})()
	// });

	// var flow = DrawerManager.createFlow($.options, {
	// 	drawer : true
	// });

	var tabs = _.keys($).map(function (key) {
		if ($[key].apiName === "Ti.UI.Tab") {
			return $[key];
		}
	}).filter(function (n) { return n != undefined });

	TabsManager.init();


	var flow = TabsManager.createFlow(tabs, null);
	flow.open();

})(arguments[0] || {});

function selectedOption(e) {
	if (e.row.title === "Open Modal Window") {
		var label = Ti.UI.createLabel({
			text : 'Close Me'
		});
		label.addEventListener('click', function closeWindow() {
			label.removeEventListener('click', closeWindow);
			modalWindow.close();
		});
		var modalWindow = DrawerManager.createWindow(label, {modal : true});
		modalWindow.open();
	}
	else if (e.row.title === "Open Children Window") {
		var label = Ti.UI.createLabel({
			text : 'Close Me'
		});
		label.addEventListener('click', function closeWindow() {
			label.removeEventListener('click', closeWindow);
			childWindow.close();
		});
		var childWindow = DrawerManager.createWindow(label, {modal : false});
		childWindow.open();
	}
	else if (e.section.headerTitle === "Left View") {
		DrawerManager.openLeftWindow();
	}
	else if (e.section.headerTitle === "Right View") {
		DrawerManager.openRightWindow();
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
	var childWindow = TabsManager.createWindow(label, {modal : false});
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
	var modalWindow = TabsManager.createWindow(label, {modal : true});
	modalWindow.open();
}
