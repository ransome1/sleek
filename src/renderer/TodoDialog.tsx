import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, FormControl } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { withTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import './TodoDialog.scss';

const ipcRenderer = window.api.ipcRenderer;

interface TodoDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  todoObject: any;
  attributes: any;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  shouldUseDarkColors: boolean;
}

const TodoDialog: React.FC<TodoDialogProps> = ({
  dialogOpen,
  setDialogOpen,
  todoObject,
  attributes,
  setSnackBarSeverity,
  setSnackBarContent,
  textFieldValue,
  setTextFieldValue,
  shouldUseDarkColors,
  t
}: TodoDialogProps) => {
  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const handleAdd = () => {
    try {
      if (textFieldRef.current?.value === '') {
        setSnackBarSeverity('info');
        setSnackBarContent(t('todoDialog.snackbar.emptyInput'));
        return false;
      }
      ipcRenderer.send('writeTodoToFile', todoObject?.id, textFieldRef.current?.value);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleWriteTodoToFile = (response: any) => {
    if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
    } else {
      setDialogOpen(false);
    }
  };

  useEffect(() => {
    ipcRenderer.on('writeTodoToFile', handleWriteTodoToFile);
    return () => {
      ipcRenderer.removeListener('writeTodoToFile', handleWriteTodoToFile);
    };
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      id="todoDialog"
      className={shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
    >
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldRef={textFieldRef}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          todoObject={todoObject}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
        />
        <PriorityPicker
          currentPriority={todoObject?.priority}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <DatePicker
          todoObject={todoObject}
          type="due"
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <DatePicker
          todoObject={todoObject}
          type="t"
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <RecurrencePicker
          currentRecurrence={todoObject?.rec}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <PomodoroPicker
          currentPomodoro={todoObject?.pm}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>{t('todoDialog.footer.cancel')}</Button>
        <Button onClick={handleAdd}>{t('todoDialog.footer.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTranslation()(TodoDialog);