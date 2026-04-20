import React from "react";
import { useTranslation } from "react-i18next";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";
import "./DatePicker.scss";
import { SettingStore } from "../../@types";

interface DatePickerComponentProps {
  date: string | null;
  type: string;
  settings: SettingStore;
  handleChange: (type: string, value: DateTime | null) => void;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  date,
  type,
  settings,
  handleChange,
}) => {
  LuxonSettings.defaultWeekSettings = {
    firstDay: (settings.weekStart === 0
      ? 7
      : settings.weekStart) as WeekdayNumbers,
    minimalDays: 4,
    weekend: [6, 7],
  };

  const { t } = useTranslation();

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

export default DatePickerComponent;
