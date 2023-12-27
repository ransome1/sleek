import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from './Settings/LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  open: boolean;
  onClose: () => void;
  promptItem: PromptItem;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>;
  setContextMenuItems: React.Dispatch<React.SetStateAction<ContextMenuItem>>;
  t: typeof i18n.t;
}

const Prompt: React.FC<Props> = ({
  open,
  onClose,
  promptItem,
  setPromptItem,
  setContextMenuItems,
  t
}) => {

  const onClick = (functionToExecute) => {
    functionToExecute();
    setPromptItem(null);
  };

  useEffect(() => {
    if(promptItem) {
      setContextMenuItems(null);
    }
  }, [promptItem]);

  return (
    <Dialog open={open} onClose={onClose}>
      {promptItem?.headline && <DialogTitle>{promptItem.headline}</DialogTitle>}
      {promptItem?.text && <DialogContent><p>{promptItem.text}</p></DialogContent>}
      <DialogActions>

        <Button onClick={onClose}>{t('cancel')}</Button>
        {promptItem?.button1 && <Button onClick={() => onClick(promptItem.onButton1)}>{promptItem.button1}</Button>}
        {promptItem?.button2 && <Button onClick={() => onClick(promptItem.onButton2)}>{promptItem.button2}</Button>}
        
      </DialogActions>
    </Dialog>
  );
};

export default withTranslation()(Prompt);
