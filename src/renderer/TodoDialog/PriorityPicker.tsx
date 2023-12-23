import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import './PriorityPicker.scss';

const { ipcRenderer } = window.api;

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

interface Props extends WithTranslation {
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
  priority: string;
  t: typeof i18n.t;
}

const PriorityPicker: React.FC<Props> = ({
  setTextFieldValue,
  textFieldValue,
  priority,
  t,
}: Props) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const string = textFieldValue.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
      const JsTodoTxtObject = new Item(string);
      JsTodoTxtObject.setPriority(event.target.value);
      const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))
      setTextFieldValue(updatedString);
      ipcRenderer.send('createTodoObject', updatedString);
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
