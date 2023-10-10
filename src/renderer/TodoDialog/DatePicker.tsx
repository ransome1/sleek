import React, { useState, useEffect } from 'react';
import { Item } from 'jstodotxt';
import { withTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/cs';
import 'dayjs/locale/es';
import 'dayjs/locale/hu';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/zh';
import './DatePicker.scss';

const userLocale = navigator.language || navigator.userLanguage;

interface DatePicker {
  todoObject: Item | null;
  type: string;
  setTextFieldValue: (value: string) => void;
  textFieldValue: string;
}

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

    const updatedTodoObject = new Item(updatedTextFieldValue);
    updatedTodoObject.setExtension(type, formattedDate);

    setDate(updatedDate);
    setTextFieldValue(updatedTodoObject.toString());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={userLocale}>
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