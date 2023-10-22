import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import { TodoObject } from '../../main/util';
import './PriorityPicker.scss';

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

interface Props extends WithTranslation {
  todoObject: TodoObject | null;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
  t: typeof i18n.t;
}

const PriorityPicker: React.FC<Props> = ({
  todoObject,
  setTextFieldValue,
  textFieldValue,
  t,
}: Props) => {
  const [priority, setPriority] = useState<string | null>(todoObject?.priority || '-');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const updatedPriority = event.target.value as string;
    const JsTodoTxtObject = new Item(textFieldValue);
    JsTodoTxtObject.setPriority((updatedPriority === '-') ? null : updatedPriority);
    setTextFieldValue(JsTodoTxtObject.toString());
    setPriority(updatedPriority);
  };

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
