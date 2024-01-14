import { nativeTheme } from 'electron';
import { config } from '../config';

function handleTheme() {
  const colorTheme: string = config.get('colorTheme');
  let shouldUseDarkColors: boolean;
  if(colorTheme === 'system') {
    shouldUseDarkColors = nativeTheme.shouldUseDarkColors;
  } else if(colorTheme === 'dark') {
    shouldUseDarkColors = true;
  } else if(colorTheme === 'light') {
    shouldUseDarkColors = false;
  } else {
    shouldUseDarkColors = false;
  }
  config.set('shouldUseDarkColors', shouldUseDarkColors);
}

export default handleTheme;
