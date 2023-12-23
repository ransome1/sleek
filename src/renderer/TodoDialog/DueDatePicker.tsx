import React from 'react';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

interface Props extends WithTranslation {
  setTextFieldValue: (value: string) => void;
  textFieldValue: string;
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguage: string;
  t: typeof i18n.t;
}

const DueDatePickerComponent: React.FC<Props> = ({
  setTextFieldValue,
  textFieldValue,
  dueDate,
  setDueDate,
  selectedLanguage,
  t,
}) => {
  
  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      if(!date || !dayjs(date).isValid()) return;
      const validDate = dayjs(date).format('YYYY-MM-DD');
      const string = textFieldValue.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
      const JsTodoTxtObject = new Item(string);
      JsTodoTxtObject.setExtension('due', validDate);
      const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))
      setTextFieldValue(updatedString);
      setDueDate(validDate);
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={selectedLanguage}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={t('todoDialog.datePicker.due')}
        value={dueDate ? dayjs(dueDate) : null}
        onChange={(date) => handleChange(date)}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DueDatePickerComponent);
