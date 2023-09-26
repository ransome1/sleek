import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Item } from 'jstodotxt';
import { withTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import './PriorityPicker.scss';

interface PriorityPicker {
  currentPriority: string | null;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
}

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

const PriorityPicker: React.FC<PriorityPicker> = ({
  currentPriority,
  setTextFieldValue,
  textFieldValue,
  t,
}: PriorityPickerProps) => {
  const [priority, setPriority] = useState<string | null>(currentPriority || '-');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const updatedPriority = event.target.value as string;
    setPriority(updatedPriority);
  };

  useEffect(() => {
    const updatedPriority = priority === '-' ? null : priority;
    const todoObject = new Item(textFieldValue);
    todoObject.setPriority(updatedPriority);
    setTextFieldValue(todoObject.toString());
  }, [priority, setTextFieldValue, textFieldValue]);

  return (
    <FormControl id="priorityPicker" className="priorityPicker">
      <InputLabel>{t('todoDialog.priorityPicker.label')}</InputLabel>
      <Select
        labelId="priorityPicker"
        id="priorityPicker"
        label={t('todoDialog.priorityPicker.label')}
        value={priority}
        onChange={handleChange}
      >
        {priorities.map((priorityOption) => (
          <MenuItem key={priorityOption.value} value={priorityOption.value}>
            {priorityOption.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default withTranslation()(PriorityPicker);
