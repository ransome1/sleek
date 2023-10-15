import React, { useState, useEffect } from 'react';
import { Item } from 'jstodotxt';
import { withTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

interface DatePicker {
  todoObject: Item | null;
  type: string;
  setTextFieldValue: (value: string) => void;
  textFieldValue: string;
}

const { store } = window.api;

const DatePickerComponent: React.FC<DatePicker> = ({
  todoObject,
  type,
  setTextFieldValue,
  textFieldValue,
  t,
}) => {
  const initialDate = todoObject && todoObject[type] && dayjs(todoObject[type]).isValid() ? dayjs(todoObject[type]) : null;
  const [date, setDate] = useState<dayjs.Dayjs | null>(initialDate);

  const handleChange = (updatedDate: dayjs.Dayjs | null) => {
    if (!updatedDate || !dayjs(updatedDate).isValid()) return;

    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');

    const updatedTextFieldValue = todoObject?.dueString
      ? textFieldValue.replace(` ${type}:${todoObject.dueString}`, '')
      : textFieldValue;

    const JsTodoTxtObject = new Item(updatedTextFieldValue);
    JsTodoTxtObject.setExtension(type, formattedDate);

    setDate(updatedDate);
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