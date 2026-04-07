import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { i18n } from "../Settings/LanguageSelector";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";
import "./DatePicker.scss";

interface DatePickerComponentProps extends WithTranslation {
  date: string | null;
  type: string;
  settings: Settings;
  handleChange: (type: string, value: DateTime | null) => void;
  t: typeof i18n.t;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  date,
  type,
  settings,
  handleChange,
  t,
}) => {
  LuxonSettings.defaultWeekSettings = {
    firstDay: (settings.weekStart === 0
      ? 7
      : settings.weekStart) as WeekdayNumbers,
    minimalDays: 4,
    weekend: [6, 7],
  };
  return (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      adapterLocale={settings.language}
    >
      <DatePicker
        className="datePicker"
        format="yyyy-MM-dd"
        label={t(`todoDialog.datePicker.${type}`)}
        value={date ? DateTime.fromISO(date) : null}
        onChange={(date) => handleChange(type, date)}
        slotProps={{
          field: { clearable: true, onClear: () => handleChange(type, null) },
        }}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DatePickerComponent);
