import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './PriorityPicker.scss';

const { ipcRenderer } = window.api;
const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

interface Props extends WithTranslation {
  priority: string;
  textFieldValue: string;
  todoObject: TodoObject | null;
  t: typeof i18n.t;
}

const PriorityPicker: React.FC<Props> = ({
  priority,
  textFieldValue,
  todoObject,
  t,
}: Props) => {

  const handleChange = (event: SelectChangeEvent) => {
    try {
      ipcRenderer.send('updateTodoObject', todoObject?.id, textFieldValue, 'priority', event.target.value);
    } catch(error) {
      console.error(error);
    }
  };
  
  return (
    <FormControl id="priorityPicker" className="priorityPicker">
      <InputLabel>{t('todoDialog.priorityPicker.label')}</InputLabel>
      <Select
        labelId="priorityPicker"
        id="priorityPicker"
        label={t('todoDialog.priorityPicker.label')}
        value={priority}
        onChange={(event: SelectChangeEvent) => handleChange(event)}
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
