import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { withTranslation, WithTranslation } from 'react-i18next';
import DraggableList from './DraggableList';
import { i18n } from '../../Settings/LanguageSelector';
import './Sorting.scss';

const { store } = window.api;

interface Props extends WithTranslation {
	settings: Settings;
	attributeMapping: TranslatedAttributes;
	t: typeof i18n.t;
}

const visibleSettings = {
  fileSorting: {
    style: 'toggle',
  },
};

const DrawerSorting: React.FC<Props> = ({
	settings,
	attributeMapping,
	t
}) => {
	return (
		<div id='Sorting'>
			<FormGroup>
				{Object.entries(visibleSettings).map(([settingName, settingValue]) => (
		          settingValue.style === 'toggle' ? (
		            <FormControlLabel
		              key={settingName}
		              control={
		                <Switch
		                  checked={settings[settingName as keyof Settings]}
		                  onChange={(event) => store.set(settingName, event.target.checked)}
		                  name={settingName}
		                />
		              }
		              label={t(`drawer.sorting.${settingName}`)}
		            />
		          ) : null
		        ))}
			</FormGroup>
			<Divider />
			{!settings.fileSorting && (
				<DraggableList settings={settings} attributeMapping={attributeMapping} />
			)}
		</div>
	);
};

export default withTranslation()(DrawerSorting);
