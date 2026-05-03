import React, { useState, useCallback } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import { HandleFilterSelect, friendlyDate, IsSelected } from "../Shared";
import { useTranslation } from "react-i18next";
import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";
import { AttributeKey, Filters, SettingStore, TodoObject } from "@sleek-types";

const { ipcRenderer } = window.api;

interface DatePickerInlineComponentProps {
  type: AttributeKey;
  todoObject: TodoObject;
  date: string | null;
  filters: Filters | null;
  settings: SettingStore;
}

const DatePickerInlineComponent: React.FC<DatePickerInlineComponentProps> = ({
  type,
  todoObject,
  date,
  filters,
  settings,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const setDateButtonRef = useCallback((node: HTMLElement | null) => {
    setAnchorEl(node);
  }, []);
  const chipText = type === "due" ? "due:" : type === "t" ? "t:" : null;

  const { t } = useTranslation();

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
        "writeSingleTodoToFile",
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
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const mustNotify = type === "due" ? !todoObject?.notify : true;
  const groupedName =
    settings.useHumanFriendlyDates && date && DateTime.fromISO(date).isValid
      ? friendlyDate(date, type, settings, t).pop()
      : date;

return (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      adapterLocale={settings.language}
    >
      <span
        className={IsSelected(type, filters, [date]) ? "selected" : undefined}
        data-todotxt-attribute={type}
      >
        <button tabIndex={-1}>
          <Badge variant="dot" invisible={mustNotify}>
            <Chip
              onClick={(event) => {
                event.stopPropagation();
                HandleFilterSelect(
                  type,
                  date ? [date] : [],
                  filters,
                  false,
                  null,
                )
              }}
              label={chipText}
              data-testid={`datagrid-button-${type}`}
              tabIndex={0}
            />
            <div
              ref={setDateButtonRef}
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
      <DatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={date ? DateTime.fromISO(date) : null}
        onChange={handleChange}
        slots={{ field: () => <span style={{ display: 'none' }} /> }}
        slotProps={{ popper: {
          anchorEl: anchorEl,
          placement: 'bottom-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
            {
              name: 'flip',
              enabled: true,
            },
            {
              name: 'preventOverflow',
              enabled: true,
            },
          ],
        } }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInlineComponent;
