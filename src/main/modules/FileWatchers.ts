"use strict";

import chokidar from 'chokidar';

function createFileWatchers (files) {
	if (!files || files.length === 0) return Promise.reject(new Error('Filewatcher: No files available'))
	const watcher = chokidar.watch(files.map(file => file.path), { persistent: true });
	watcher
		.on('add', (file) => console.log(`File ${file} has been added`))
		.on('change', (file) => console.log(`File ${file} has been changed`))
		.on('unlink', (file) => console.log(`File ${file} has been unlinked`))
		.on('ready', () => console.log('Initial scan complete. Ready for changes'));
	return Promise.resolve('Filewatcher: File watchers created');
}

export default createFileWatchers;
