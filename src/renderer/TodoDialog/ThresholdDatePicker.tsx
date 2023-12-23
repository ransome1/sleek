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
  thresholdDate: string;
  setThresholdDate: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguage: string;
  t: typeof i18n.t;
}

const ThresholdDatePickerComponent: React.FC<Props> = ({
  setTextFieldValue,
  textFieldValue,
  thresholdDate,
  setThresholdDate,
  selectedLanguage,
  t,
}) => {
  
  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      if(!date || !dayjs(date).isValid()) return;
      const validDate = dayjs(date).format('YYYY-MM-DD');
      const string = textFieldValue.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
      const JsTodoTxtObject = new Item(string);
      JsTodoTxtObject.setExtension('t', validDate);
      const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))
      setTextFieldValue(updatedString);
      setThresholdDate(validDate);
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={selectedLanguage}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={t('todoDialog.datePicker.threshold')}
        value={thresholdDate ? dayjs(thresholdDate) : null}
        onChange={(date) => handleChange(date)}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(ThresholdDatePickerComponent);
