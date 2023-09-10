import React, { useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Prompt = ({ open, onClose, onConfirm, headline, text, buttonText = 'OK' }) => {

  const handlePromptChoice = (allow) => {
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
