import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';

interface Props extends WithTranslation {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headline?: string;
  text?: string;
  confirmButton?: string;
  button1?: string;
  onButton1: () => void;
  button2?: string;
  onButton2: () => void;
  t: typeof i18n.t;
}

const Prompt: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  headline,
  text,
  confirmButton,
  button1,
  onButton1,
  button2,
  onButton2,
  t
}) => {
  const handleConfirm = (allow: boolean) => {
    onClose();
    if(allow) {
      onConfirm();
    }
  };  

  return (
    <Dialog open={open} onClose={onClose}>
      {headline && <DialogTitle>{headline}</DialogTitle>}
      {text && <DialogContent><p>{text}</p></DialogContent>}
      <DialogActions>

        <Button onClick={() => handleConfirm(false)}>{t('cancel')}</Button>
        {button1 && <Button onClick={() => onButton1(true)}>{button1}</Button>}
        {button2 && <Button onClick={() => onButton2(true)}>{button2}</Button>}
        {confirmButton && <Button onClick={() => handleConfirm(true)}>{confirmButton}</Button>}
        
      </DialogActions>
    </Dialog>
  );
};

export default withTranslation()(Prompt);
