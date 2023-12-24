import React, { useState, useEffect, memo } from 'react';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DueDatePicker from './DueDatePicker';
import ThresholdDatePicker from './ThresholdDatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { i18n } from '../Settings/LanguageSelector';
import './TodoDialog.scss';

const { ipcRenderer, store } = window.api;

interface Props extends WithTranslation {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  todoObject: TodoObject;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject>>;
  attributes: Attributes | null;
  attributeFields: TodoObject;
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  shouldUseDarkColors: boolean;
  textFieldValue: string,
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>,
  selectedLanguage: React.Dispatch<React.SetStateAction<string>>,
  t: typeof i18n.t;
}

const TodoDialog: React.FC<Props> = memo(({
  dialogOpen,
  setDialogOpen,
  todoObject,
  setTodoObject,
  attributes,
  attributeFields,
  setAttributeFields,
  setSnackBarSeverity,
  setSnackBarContent,
  shouldUseDarkColors,
  textFieldValue,
  setTextFieldValue,
  selectedLanguage,
  t
}) => {
  const bulkTodoCreation = store.get('bulkTodoCreation');
  const numRowsWithContent = textFieldValue?.split('\n').filter(line => line.trim() !== '').length;
  const [priority, setPriority] = useState<string>('-');
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [thresholdDate, setThresholdDate] = useState<dayjs.Dayjs | null>(null);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [pomodoro, setPomodoro] = useState<number>(0);

  const handleAdd = () => {
    try {
      if(textFieldValue) {
        const index = (todoObject) ? todoObject.id : -1;
        const string = textFieldValue.replaceAll(/\n/g, String.fromCharCode(16));
        ipcRenderer.send('writeTodoToFile', index, string);
        handleClose();
      } else {
        setSnackBarSeverity('info');
        setSnackBarContent(t('todoDialog.snackbar.emptyInput'));
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleClose = () => {
    setTodoObject(null);
    setAttributeFields(null);
    setTextFieldValue('');
    setDialogOpen(false);
  };

  const refreshTextFieldValue = (type, value) => {
    let updatedString = (textFieldValue || '').replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
    const JsTodoTxtObject = new Item(updatedString);
    if (type === 'priority') {
      JsTodoTxtObject.setPriority(value);
    } else {
      JsTodoTxtObject.setExtension(type, value);
    }
    updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16));
    setTextFieldValue(updatedString);
  };

  const handleKeyDown = (event) => {
    if(event.metaKey && event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  useEffect(() => {
    if(textFieldValue) ipcRenderer.send('createTodoObject', textFieldValue)
  }, [textFieldValue]);

  useEffect(() => {
      setPriority(attributeFields?.priority || '-');
      setDueDate(attributeFields?.due || null);
      setThresholdDate(attributeFields?.t || null);
      setRecurrence(attributeFields?.rec || null);
      setPomodoro(attributeFields?.pm || 0);
  }, [attributeFields]);

  useEffect(() => {
    if(dialogOpen) {
      setTextFieldValue(todoObject?.string || '');
    }
  }, [dialogOpen]);

  return (
    <Dialog
      id="TodoDialog"
      open={dialogOpen}
      onClose={handleClose}
      className={shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
      onKeyDown={handleKeyDown}
    >
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
          todoObject={todoObject}
        />
        <PriorityPicker
          priority={priority}
          refreshTextFieldValue={refreshTextFieldValue}
        />
        <DueDatePicker
          dueDate={dueDate}
          selectedLanguage={selectedLanguage}
          refreshTextFieldValue={refreshTextFieldValue}
        />
        <ThresholdDatePicker
          thresholdDate={thresholdDate}
          selectedLanguage={selectedLanguage}
          refreshTextFieldValue={refreshTextFieldValue}
        />
        <RecurrencePicker
          recurrence={recurrence}
          refreshTextFieldValue={refreshTextFieldValue}
        />
        <PomodoroPicker
          pomodoro={pomodoro}
          refreshTextFieldValue={refreshTextFieldValue}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('todoDialog.footer.cancel')}</Button>
        <Button onClick={handleAdd}>
          {todoObject?.id >= 0 ? t('todoDialog.footer.update') : (bulkTodoCreation ? `${t('todoDialog.footer.add')} (${numRowsWithContent || 0})` : `${t('todoDialog.footer.add')}`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default withTranslation()(TodoDialog);
