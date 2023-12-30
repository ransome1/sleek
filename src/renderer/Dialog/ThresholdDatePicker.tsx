import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  thresholdDate: string | null;
  settings: Settings;
  textFieldValue: string;
  todoObject: TodoObject | null;
  t: typeof i18n.t;
}

const ThresholdDatePickerComponent: React.FC<Props> = ({
  thresholdDate,
  settings,
  textFieldValue,
  todoObject,
  t,
}) => {
  
  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      ipcRenderer.send('updateTodoObject', todoObject?.id, textFieldValue, 't', dayjs(date).format('YYYY-MM-DD'));
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language}>
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
