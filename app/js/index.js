'use strict'


const {ipcRenderer} = require('electron');



function openFolderClicked() {
	ipcRenderer.send('openFolder', () => {
		console.log("Event sent.");
	})
}


ipcRenderer.on('fileData', (event, data) => {
	console.log(data);
})