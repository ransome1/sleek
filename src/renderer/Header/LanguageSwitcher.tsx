import React, { memo } from 'react'
import { i18n } from '../Settings/LanguageSelector'
import './LanguageSwitcher.scss'

const { store } = window.api

interface LanguageSwitcherProps {
  settings: Settings
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = memo(({ settings }) => {
  const currentLang = settings.language || 'en'
  const isEnglish = currentLang === 'en'
  const isChinese = currentLang === 'zh'

  const toggleLanguage = (): void => {
    const newLang = isEnglish ? 'zh' : 'en'
    store.setConfig('language', newLang)
    i18n.changeLanguage(newLang).catch((error) => {
      console.error('Error changing language:', error)
    })
  }

  return (
    <div
      className="language-switcher"
      onClick={toggleLanguage}
      title={isEnglish ? '切换到中文' : 'Switch to English'}
      data-testid="language-switcher"
    >
      <span className={`lang-option ${isEnglish ? 'active' : ''}`}>EN</span>
      <span className="lang-divider">/</span>
      <span className={`lang-option ${isChinese ? 'active' : ''}`}>中</span>
    </div>
  )
})

LanguageSwitcher.displayName = 'LanguageSwitcher'

export default LanguageSwitcher
