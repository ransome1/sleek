import { nativeTheme } from 'electron'
import { SettingsStore } from './Stores'
import { handleError } from './Shared'
import { HandleTray } from './Tray'

nativeTheme.on('updated', () => {
  try {
    if (nativeTheme.themeSource === 'system') {
      SettingsStore.set('shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
    } else if (nativeTheme.themeSource === 'dark') {
      SettingsStore.set('shouldUseDarkColors', true)
    } else {
      SettingsStore.set('shouldUseDarkColors', false)
    }
    HandleTray(SettingsStore.get('tray'))
  } catch (error: error) {
    handleError(error)
  }
});

export function handleTheme(colorTheme) {
  nativeTheme.themeSource = colorTheme;
}