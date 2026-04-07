import React, { useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import { HandleFilterSelect, friendlyDate, IsSelected } from "../Shared";
import { withTranslation } from "react-i18next";
import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";

const { ipcRenderer } = window.api;

interface DatePickerInlineComponentProps {
  type: string;
  todoObject: TodoObject;
  date: string | null;
  filters: Filters | null;
  settings: Settings;
  t: (key: string) => string;
}

const DatePickerInlineComponent: React.FC<DatePickerInlineComponentProps> = ({
  type,
  todoObject,
  date,
  filters,
  settings,
  t,
}) => {
  const [open, setOpen] = useState(false);
  //const ButtonFieldRef = useRef<HTMLButtonElement>(null);
  const chipText = type === "due" ? "due:" : type === "t" ? "t:" : null;

  LuxonSettings.defaultWeekSettings = {
    firstDay: (settings.weekStart === 0
      ? 7
      : settings.weekStart) as WeekdayNumbers,
    minimalDays: 4,
    weekend: [6, 7],
  };

  const handleChange = (date: DateTime | null) => {
    try {
      ipcRenderer.send(
        "writeTodoToFile",
        todoObject.lineNumber,
        todoObject.string,
        false,
        type,
        date ? date.toFormat("yyyy-MM-dd") : null,
      );
    } catch (error) {
      console.error(error);
    }
    setOpen(false);
  };

  const toggleOpen = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    setOpen((prev) => !prev);
  };

  const ButtonField = () => {
    const mustNotify = type === "due" ? !todoObject?.notify : true;
    const groupedName =
      settings.useHumanFriendlyDates && date && DateTime.fromISO(date).isValid
        ? friendlyDate(date, type, settings, t).pop()
        : date;

    return (
      <span
        className={IsSelected(type, filters, [date]) ? "selected" : null}
        data-todotxt-attribute={type}
      >
        <button tabIndex={-1}>
          <Badge variant="dot" invisible={mustNotify}>
            <Chip
              onClick={() => HandleFilterSelect(type, [date], filters, false)}
              label={chipText}
              data-testid={`datagrid-button-${type}`}
              tabIndex={0}
            />
            <div
              onClick={toggleOpen}
              onKeyDown={(event) => event.key === "Enter" && toggleOpen(event)}
              data-testid={`datagrid-picker-date-${type}`}
              tabIndex={0}
            >
              {groupedName}
            </div>
          </Badge>
        </button>
      </span>
    );
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      adapterLocale={settings.language}
    >
      <DatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={date ? DateTime.fromISO(date) : null}
        onChange={handleChange as any}
        slots={{ field: ButtonField }}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DatePickerInlineComponent);
