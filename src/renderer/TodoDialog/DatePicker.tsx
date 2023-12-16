import React from 'react';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import { TodoObject } from '../../main/util';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

interface Props extends WithTranslation {
  todoObject: TodoObject | null;
  type: string;
  setTextFieldValue: (value: string) => void;
  textFieldValue: string;
  t: typeof i18n.t;
}

const { store } = window.api;

const DatePickerComponent: React.FC<Props> = ({
  todoObject,
  type,
  setTextFieldValue,
  textFieldValue,
  t,
}) => {
  const initialDate: dayjs.Dayjs | null = todoObject && todoObject[type] && !!todoObject[type] && dayjs(todoObject[type]).isValid() ? dayjs(todoObject[type]) : null;

  const handleChange = (updatedDate: dayjs.Dayjs | null) => {
    if(!updatedDate || !dayjs(updatedDate).isValid()) return;

    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');

    const content = textFieldValue.replaceAll(/\n/g, ` ${String.fromCharCode(16)}`);

    const updatedTextFieldValue = todoObject?.dueString
      ? content.replace(` ${type}:${todoObject.dueString}`, '')
      : content;

    const JsTodoTxtObject = new Item(updatedTextFieldValue);
    JsTodoTxtObject.setExtension(type, formattedDate);

    setTextFieldValue(JsTodoTxtObject.toString());
  };

  const selectedLanguage = store.get('language');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={selectedLanguage}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={type === 't' ? t('todoDialog.datePicker.threshold') : t('todoDialog.datePicker.due')}
        value={initialDate}
        onChange={(updatedDate) => handleChange(updatedDate)}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DatePickerComponent);
