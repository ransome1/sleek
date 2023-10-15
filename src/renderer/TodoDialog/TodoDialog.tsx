import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, FormControl } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { withTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import './TodoDialog.scss';

const ipcRenderer = window.api.ipcRenderer;

interface TodoDialog {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  todoObject: any;
  attributes: any;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  shouldUseDarkColors: boolean;
}

const TodoDialog: React.FC<TodoDialog> = ({
  dialogOpen,
  setDialogOpen,
  todoObject,
  setTodoObject,
  attributes,
  setSnackBarSeverity,
  setSnackBarContent,
  shouldUseDarkColors,
  textFieldValue,
  setTextFieldValue,
  t
}: TodoDialogProps) => {

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const handleAdd = (event, id, string) => {
    try {
      if(string === '') {
        setSnackBarSeverity('info');
        setSnackBarContent(t('todoDialog.snackbar.emptyInput'));
        return false;
      } else {
        ipcRenderer.send('writeTodoToFile', id, string);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClose = () => {
    try {
      setDialogOpen(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if(!dialogOpen) {
      setTodoObject(null);
    }
  }, [dialogOpen]);

  useEffect(() => {
    textFieldRef.current?.focus();
  }, [textFieldValue]);

  return (
    <Dialog
      id="TodoDialog"
      open={dialogOpen}
      onClose={handleClose}
      className={shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
    >
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldRef={textFieldRef}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
          todoObject={todoObject}
        />
        <PriorityPicker
          todoObject={todoObject}
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
        {<RecurrencePicker
          todoObject={todoObject}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />}
        <PomodoroPicker
          todoObject={todoObject}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>{t('todoDialog.footer.cancel')}</Button>
        <Button onClick={(event) => handleAdd(event, todoObject?.id, textFieldValue)}>
          {t('todoDialog.footer.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTranslation()(TodoDialog);