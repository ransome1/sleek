import React, { useEffect, useRef, memo } from 'react';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TodoObject, Attributes } from '../../main/util';
import './TodoDialog.scss';
import { i18n } from '../LanguageSelector';

const { ipcRenderer, store } = window.api;

interface Props extends WithTranslation {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  todoObject: TodoObject | null;
  setTodoObject: React.Dispatch<React.SetStateAction<boolean>>;
  attributes: Attributes | null;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  shouldUseDarkColors: boolean;
  textFieldValue: string,
  setTextFieldValue: React.Dispatch<React.SetStateAction<boolean>>,
  t: typeof i18n.t;
}

const TodoDialog: React.FC<Props> = memo(({
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
}) => {

  const useMultilineForBulkTodoCreation = store.get('useMultilineForBulkTodoCreation');
  const multilineTextField = store.get('multilineTextField');
  const textFieldRef = useRef(null);
  const numRowsWithContent = textFieldValue?.split('\n').filter(line => line.trim() !== '').length;

  const handleAdd = (id: number, string: string) => {
    try {
      if(string === '') {
        setSnackBarSeverity('info');
        setSnackBarContent(t('todoDialog.snackbar.emptyInput'));
      } else {
        ipcRenderer.send('writeTodoToFile', id, string);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleClose = () => {
    try {
      setDialogOpen(false);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if(!dialogOpen) {
      setTodoObject(null);
    }
  }, [dialogOpen]);

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
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
          todoObject={todoObject}
          textFieldRef={textFieldRef}
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
        <Button onClick={() => handleAdd(todoObject?.id, textFieldValue)}>
          {todoObject?.body ? t('todoDialog.footer.update') : (useMultilineForBulkTodoCreation && multilineTextField ? `${t('todoDialog.footer.add')} (${numRowsWithContent})` : `${t('todoDialog.footer.add')}`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default withTranslation()(TodoDialog);
