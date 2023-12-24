import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

interface Props extends WithTranslation {
  dueDate: string;
  selectedLanguage: string;
  refreshTextFieldValue: (type: string, value: any) => void;
  t: typeof i18n.t;
}

const DueDatePickerComponent: React.FC<Props> = ({
  dueDate,
  selectedLanguage,
  refreshTextFieldValue,
  t,
}) => {
  
  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      refreshTextFieldValue('due', dayjs(date).format('YYYY-MM-DD'));
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
