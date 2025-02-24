import { nativeTheme } from 'electron'
import { config } from '../config'
import { handleError } from '../Util'

nativeTheme.on('updated', () => {
  try {
    if (nativeTheme.themeSource === 'system') {
      config.set('shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
    } else if (nativeTheme.themeSource === 'dark') {
      config.set('shouldUseDarkColors', true)
    } else {
      config.set('shouldUseDarkColors', false)
    }
  } catch (error: error) {
    handleError(error)
  }
});

export function handleTheme(colorTheme) {
  nativeTheme.themeSource = colorTheme;
}