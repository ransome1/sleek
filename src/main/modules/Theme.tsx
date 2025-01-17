import { nativeTheme } from 'electron'
import { config } from '../config'

function handleTheme() {
  if (nativeTheme.themeSource === 'system') {
    config.set('shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
  } else if (nativeTheme.themeSource === 'dark') {
    config.set('shouldUseDarkColors', true)
  } else if (nativeTheme.themeSource === 'light') {
    config.set('shouldUseDarkColors', false)
  } else {
    config.set('shouldUseDarkColors', false)
  }
}

export default handleTheme
