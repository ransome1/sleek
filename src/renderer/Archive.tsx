import React, { useEffect } from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from './Settings/LanguageSelector'

const { ipcRenderer } = window.api

interface ArchiveComponentProps extends WithTranslation {
  triggerArchiving: boolean
  setTriggerArchiving: React.Dispatch<React.SetStateAction<boolean>>
  settings: Settings
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  headers: HeadersObject | null
  t: typeof i18n.t
}

const ArchiveComponent: React.FC<ArchiveComponentProps> = ({
  triggerArchiving,
  setPromptItem,
  t
}) => {
  const handleTriggerArchiving = (doneFileAvailable: boolean): void => {
    setPromptItem(doneFileAvailable ? promptItemArchiving : promptItemChooseChangeFile)
  }

  const handleArchiveConfirm = (): void => {
    ipcRenderer.send('archiveTodos')
  }

  const handleOpenDoneFile = (): void => {
    ipcRenderer.send('openFile', true)
  }

  const handleCreateDoneFile = (): void => {
    ipcRenderer.send('createFile', true)
  }

  const promptItemArchiving = {
    id: 'archive',
    headline: t('prompt.archive.headline'),
    text: t('prompt.archive.text'),
    button1: t('archive'),
    onButton1: handleArchiveConfirm
  }

  const promptItemChooseChangeFile = {
    id: 'changeFile',
    headline: t('prompt.archive.changeFile.headline'),
    text: t('prompt.archive.changeFile.text'),
    button1: t('openFile'),
    onButton1: handleOpenDoneFile,
    button2: t('createFile'),
    onButton2: handleCreateDoneFile
  }

  useEffect((): void => {
    if (triggerArchiving) {
      setPromptItem(null)
    }
  }, [triggerArchiving])

  useEffect((): void => {
    ipcRenderer.on('triggerArchiving', handleTriggerArchiving)
    return (): void => {
      ipcRenderer.off('triggerArchiving', handleTriggerArchiving)
    }
  }, [])

  return <></>
}

export default withTranslation()(ArchiveComponent)
