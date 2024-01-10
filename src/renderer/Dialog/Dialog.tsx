import React, { useState, useEffect, memo } from 'react';
import { Button, Dialog, DialogContent, DialogActions, AlertColor } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { i18n } from '../Settings/LanguageSelector';
import './Dialog.scss';

const { ipcRenderer} = window.api;

interface Props extends WithTranslation {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  todoObject: TodoObject | null;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  attributes: Attributes | null;
  attributeFields: TodoObject | null;
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<AlertColor | undefined>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>;
  textFieldValue: string,
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>,
  settings: Settings,
  t: typeof i18n.t;
}

const DialogComponent: React.FC<Props> = memo(({
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
  const numRowsWithContent = textFieldValue?.split('\n').filter(line => line.trim() !== '').length;
  const [priority, setPriority] = useState<string>('-');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [thresholdDate, setThresholdDate] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [pomodoro, setPomodoro] = useState<number | string>(0);

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
    if((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleAdd();
    }
  };

  const updateAttributeFields = (todoObject: TodoObject | null) => {
    if(todoObject) {
      setPriority(todoObject?.priority || '-');
      setDueDate(todoObject?.due || null);
      setThresholdDate(todoObject?.t || null);
      setRecurrence(todoObject?.rec || null);
      setPomodoro(todoObject?.pm || 0);
    }
  };

  const handleChange = (type: string, value: string) => {
    try {
      let updatedValue;
      if(type === 'due' || type === 't') {
        updatedValue = (value) ? dayjs(value).format('YYYY-MM-DD') : null;
      } else if(type === 'pm') {
        updatedValue = (value === '0') ? null : value;
      } else {
        updatedValue = value;
      }
      ipcRenderer.send('updateTodoObject', todoObject?.id, textFieldValue, type, updatedValue);
    } catch(error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if(todoObject) {
      const updatedValue = todoObject.string?.replaceAll(String.fromCharCode(16), '\n') || '';
      setTextFieldValue(updatedValue);
      updateAttributeFields(todoObject);
    }
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
      id="DialogComponent"
      open={dialogOpen}
      onClose={handleClose}
      className={settings.shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}
      onKeyDown={handleKeyDown}
    >
      <DialogContent>
        <AutoSuggest
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          attributes={attributes}
        />
        <PriorityPicker
          priority={priority}
          handleChange={handleChange}
        />
        <DatePicker
          date={dueDate}
          type="due"
          settings={settings}
          handleChange={handleChange}
        />
        <DatePicker
          date={thresholdDate}
          type="t"
          settings={settings}
          handleChange={handleChange}
        />
        <RecurrencePicker
          recurrence={recurrence}
          handleChange={handleChange}
        />
        <PomodoroPicker
          pomodoro={pomodoro}
          handleChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          data-testid="dialog-button-cancel"
        >
          {t('todoDialog.footer.cancel')}
        </Button>
        <Button 
          onClick={handleAdd}
          data-testid="dialog-button-add-update"
        >
          {todoObject && todoObject.id >= 0
            ? t('todoDialog.footer.update')
            : settings.bulkTodoCreation
              ? `${t('todoDialog.footer.add')} (${numRowsWithContent || 0})`
              : `${t('todoDialog.footer.add')}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default withTranslation()(DialogComponent);
