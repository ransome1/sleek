import React, { useState, useEffect, memo } from 'react';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
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
  textFieldValue: string,
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>,
  settings: Settings,
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
  textFieldValue,
  setTextFieldValue,
  settings,
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

  const handleKeyDown = (event: any) => {
    if(event.metaKey && event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  const updateAttributeFields = (todoObject: TodoObject) => {
    if(todoObject) {
      setPriority(todoObject?.priority || '-');
      setDueDate(todoObject?.due || null);
      setThresholdDate(todoObject?.t || null);
      setRecurrence(todoObject?.rec || null);
      setPomodoro(todoObject?.pm || 0);
    }
  }

  useEffect(() => {
    setTextFieldValue(todoObject?.string || '');
    updateAttributeFields(todoObject);
  }, [todoObject]);

  useEffect(() => {
    if(textFieldValue) ipcRenderer.send('updateAttributeFields', todoObject?.id, textFieldValue)
  }, [textFieldValue]);

  useEffect(() => {
    if(attributeFields) {
      updateAttributeFields(attributeFields);
    }
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
      className={settings.shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
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
          textFieldValue={textFieldValue}
          todoObject={todoObject}
        />
        <DueDatePicker
          dueDate={dueDate}
          settings={settings}
          textFieldValue={textFieldValue}
          todoObject={todoObject}
        />
        <ThresholdDatePicker
          thresholdDate={thresholdDate}
          settings={settings}
          textFieldValue={textFieldValue}
          todoObject={todoObject}
        />
        <RecurrencePicker
          recurrence={recurrence}
          textFieldValue={textFieldValue}
          todoObject={todoObject}
        />
        <PomodoroPicker
          pomodoro={pomodoro}
          textFieldValue={textFieldValue}
          todoObject={todoObject}
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
