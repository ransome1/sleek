import React, { useRef, useState, useEffect, memo } from 'react';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DueDatePicker from './DueDatePicker';
import ThresholdDatePicker from './ThresholdDatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { withTranslation, WithTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { i18n } from '../LanguageSelector';
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
  const textFieldRef = useRef(null);
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
    setDialogOpen(false);
  };

  useEffect(() => {
    setTextFieldValue(todoObject?.string);
    setAttributeFields(todoObject);
  }, [todoObject]);

  useEffect(() => {
    setPriority(attributeFields?.priority || '-');
    setDueDate(attributeFields?.due || null);
    setThresholdDate(attributeFields?.t || null);
    setRecurrence(attributeFields?.rec || null);
    setPomodoro(attributeFields?.pm || 0);
  }, [attributeFields]);

  useEffect(() => {
    if(!dialogOpen) {
      setTodoObject(null);
      setAttributeFields(null);
    }
  }, [dialogOpen]);

  return (
    <Dialog
      id="TodoDialog"
      open={dialogOpen}
      className={shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
    >
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
          todoObject={todoObject}
          textFieldRef={textFieldRef}
          
        />
        <PriorityPicker
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
          priority={priority}
        />
        <DueDatePicker
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
          dueDate={dueDate}
          setDueDate={setDueDate}
          selectedLanguage={selectedLanguage}
        />
        <ThresholdDatePicker
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
          thresholdDate={thresholdDate}
          setThresholdDate={setThresholdDate}
          selectedLanguage={selectedLanguage}
        />
        <RecurrencePicker
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
          recurrence={recurrence}
        />
        <PomodoroPicker
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
          pomodoro={pomodoro}
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
