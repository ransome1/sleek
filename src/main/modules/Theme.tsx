import { nativeTheme } from 'electron';
import { mainWindow } from '../main';
import createTray from './Tray';
import { configStorage } from '../config';
 
const handleTheme = () => {
    const shouldUseDarkColors = nativeTheme.shouldUseDarkColors;

    configStorage.set('shouldUseDarkColors', shouldUseDarkColors);

    mainWindow!.webContents.send('setShouldUseDarkColors', shouldUseDarkColors);

    createTray().then(result => {
		console.log('config.ts:', result);
    }).catch(error => {
		console.error('config.ts:', error);
    });
}

export default handleTheme;