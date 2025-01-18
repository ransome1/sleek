import React, { useEffect, Fragment } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from './Settings/LanguageSelector'

interface PromptComponentProps extends WithTranslation {
  open: boolean
  onClose: () => void
  promptItem: PromptItem | null
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  t: typeof i18n.t
}

const PromptComponent: React.FC<PromptComponentProps> = ({
  open,
  onClose,
  promptItem,
  setPromptItem,
  setContextMenu,
  t
}) => {
  const onClick = (functionToExecute: () => void): void => {
    functionToExecute()
    setPromptItem(null)
  }

  useEffect(() => {
    if (promptItem) {
      setContextMenu(null)
    }
  }, [promptItem])

  return (
    <Dialog open={open} onClose={onClose}>
      {promptItem?.headline && <DialogTitle>{promptItem.headline}</DialogTitle>}
      {promptItem?.text && (
        <DialogContent>
          <Fragment>
            <span dangerouslySetInnerHTML={{ __html: promptItem.text }} />
          </Fragment>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} data-testid="prompt-button-cancel">
          {t('cancel')}
        </Button>
        {promptItem?.button1 && (
          <Button
            onClick={() => onClick(promptItem.onButton1)}
            data-testid={`prompt-button-${promptItem.button1}`}
          >
            {promptItem.button1}
          </Button>
        )}
        {promptItem?.button2 && (
          <Button
            onClick={() => onClick(promptItem.onButton2)}
            data-testid={`prompt-button-${promptItem.button2}`}
          >
            {promptItem.button2}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default withTranslation()(PromptComponent)
