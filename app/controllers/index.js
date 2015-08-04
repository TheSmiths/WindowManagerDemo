var DrawerManager = require('DrawerManager.2.1.2');

(function constructor(args) {
	DrawerManager.init({
		leftView : (function () {
			return $.leftView;
		})(),
		rightView : (function () {
			return $.rightView;
		})()
	});

	var flow = DrawerManager.createFlow($.options, {
		drawer : true
	});

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
			modalWindow.close();
		});
		var modalWindow = DrawerManager.createWindow(label, {modal : false});
		modalWindow.open();
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
