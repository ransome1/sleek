import React, { useState } from 'react';
import { Box, FormGroup, FormControlLabel, Switch, Divider } from '@mui/material';
import { withTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleSettingChange } from './Shared';
import DraggableList from './DraggableList';
import './DrawerSorting.scss';

const { store } = window.api;

interface Settings {
  fileSorting: boolean;
}

const DrawerSorting: React.FC = ({ t }) => {
	const [settings, setSettings] = useState<Settings>({
		fileSorting: store.get('fileSorting'),
	});

	return (
		<Box id='Sorting'>
			<FormGroup>
			{Object.entries(settings).map(([settingName, value]) => (
			  <FormControlLabel
			    key={settingName}
			    control={
			      <Switch
			        checked={value}
			        onChange={handleSettingChange(settingName, setSettings)}
			        name={settingName}
			      />
			    }
			    label={t(`drawer.sorting.${settingName}`)}
			  />
			))}
			</FormGroup>
			<Divider />
			{!settings.fileSorting && <DraggableList />}
		</Box>
	);
};

export default withTranslation()(DrawerSorting);
