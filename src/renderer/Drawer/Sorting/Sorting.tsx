import React, { useState, useEffect } from 'react';
import { Box, FormGroup, FormControlLabel, Switch, Divider } from '@mui/material';
import { handleSettingChange } from '../../Shared';
import { withTranslation } from 'react-i18next';
import { i18n } from '../../LanguageSelector';
import DraggableList from './DraggableList';
import './Sorting.scss';

const { store } = window.api;

interface Settings {
  fileSorting: boolean;
}

const DrawerSorting: React.FC = ({ attributeMapping, t }) => {
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
			{!settings.fileSorting && 
				<DraggableList
					attributeMapping={attributeMapping} 
				/>}
		</Box>
	);
};

export default withTranslation()(DrawerSorting);