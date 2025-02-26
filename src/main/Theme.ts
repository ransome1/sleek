import { nativeTheme } from 'electron'
import { SettingsStore } from './Stores/SettingsStore'
import { handleError } from './Util'

nativeTheme.on('updated', () => {
  try {
    if (nativeTheme.themeSource === 'system') {
      SettingsStore.set('shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
    } else if (nativeTheme.themeSource === 'dark') {
      SettingsStore.set('shouldUseDarkColors', true)
    } else {
      SettingsStore.set('shouldUseDarkColors', false)
    }
  } catch (error: error) {
    handleError(error)
  }
});

export function handleTheme(colorTheme) {
  nativeTheme.themeSource = colorTheme;
}