import React, { useState, useRef } from "react";
import {
  LocalizationProvider,
  DatePicker,
  DatePickerProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import Popper from "@mui/material/Popper";
import { HandleFilterSelect, friendlyDate, IsSelected } from "../Shared";
import { withTranslation } from "react-i18next";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(updateLocale);

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
  DatePickerProps,
}) => {
  const [open, setOpen] = useState(false);
  //const ButtonFieldRef = useRef<HTMLButtonElement>(null);
  const chipText = type === "due" ? "due:" : type === "t" ? "t:" : null;

  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart,
  });

  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      ipcRenderer.send(
        "writeTodoToFile",
        todoObject.lineNumber,
        todoObject.string,
        false,
        type,
        dayjs(date).format("YYYY-MM-DD"),
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
      settings.useHumanFriendlyDates && dayjs(date).isValid()
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
      dateAdapter={AdapterDayjs}
      adapterLocale={settings.language}
    >
      <DatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={dayjs(date)}
        onChange={handleChange}
        slots={{ field: ButtonField }}
      />
    </LocalizationProvider>
  );
};

export default withTranslation()(DatePickerInlineComponent);
