import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './PriorityPicker.scss';

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

interface PriorityPickerProps extends WithTranslation {
  priority: string;
  handleChange: function;
  t: typeof i18n.t;
}

const PriorityPicker: React.FC<PriorityPickerProps> = ({
  priority,
  handleChange,
  t,
}) => {
  return (
    <FormControl id="priorityPicker" className="priorityPicker">
      <InputLabel>{t('todoDialog.priorityPicker.label')}</InputLabel>
      <Select
        id="priorityPicker"
        label={t('todoDialog.priorityPicker.label')}
        value={priority}
        onChange={(event: SelectChangeEvent) => handleChange('priority', event.target.value)}
        data-testid="dialog-picker-priority"
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
