import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headline?: string;
  text?: string;
  buttonText?: string;
}

const Prompt: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  headline,
  text,
  buttonText = 'OK'
}) => {
  const handlePromptChoice = (allow: boolean) => {
    onClose();
    if (allow) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {headline && <DialogTitle>{headline}</DialogTitle>}
      {text && <DialogContent><p>{text}</p></DialogContent>}
      <DialogActions>
        <Button onClick={() => handlePromptChoice(false)}>Cancel</Button>
        <Button onClick={() => handlePromptChoice(true)}>
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
