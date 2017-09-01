'use strict';

const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const sharp = require('sharp');


var mainWindow = null;


app.on('ready', function() {
	mainWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		height: 600,
		width: 800,
	});

	mainWindow.loadURL('file://' + __dirname + '/app/index.html');
});




ipcMain.on('openFolder', (event, path) => {

	const { dialog } = require('electron')
	const fs = require('fs')
	dialog.showOpenDialog({
		properties: ["openDirectory"],
	},
	(fileNames) => {
		// fileNames is an array that contains all the selected
		if(fileNames === undefined){
			console.log("No folder selected");
		}
		else {
			const imageFolderPath = fileNames.shift();
			fs.readdir(imageFolderPath, (err, files) => {
				if (err) throw new Error(err);
				Promise.all( files.map( (file) => {
					return new Promise( (resolve, reject) => {
						fs.stat(`${imageFolderPath}/${file}`, ( err, stats) => {
							if(err) reject(err);
							resolve(stats.isDirectory());
						});
					})
				}) )
				.then( (isDirArr) => {
					const filesFiltered = files.filter( (file, i) => !isDirArr[i] ).filter( (file) => {
						const formats = [ ".jpg", ".svg", ".png"];
						const ending = file.slice(-4);
						return formats.includes(ending);
					}).map ( (file) => `${imageFolderPath}/${file}`);

					return Promise.all( filesFiltered.map( (file) => {
						const image = sharp(file);
						return image.metadata().then( (metadata) => {
							return { file, metadata }
						});
					}))
					.then( (data) => {
						console.log(data);
						event.sender.send('fileData', filesFiltered );
					})
					;
				})
			})
		}
	});

	function readFile(filepath){
		fs.readFile(filepath, 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message)
				return
			}
		})
	}
});