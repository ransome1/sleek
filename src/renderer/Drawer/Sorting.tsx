import React, { useState, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SortIcon from '@mui/icons-material/Sort';
import Button from '@mui/material/Button';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import { translatedAttributes } from '../Shared';
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
	const [accordionOrder, setAccordionOrder] = useState<Sorting[]>(settings.sorting);
	const moveItem = (index: number, direction: 'up' | 'down') => {
	  const newAccordionOrder = [...accordionOrder];
	  const swapIndex = direction === 'up' ? index - 1 : index + 1;

	  if (swapIndex >= 0 && swapIndex < newAccordionOrder.length) {
	    [newAccordionOrder[index], newAccordionOrder[swapIndex]] = 
	      [newAccordionOrder[swapIndex], newAccordionOrder[index]]; // Swap values

	    setAccordionOrder(newAccordionOrder);
	  }
	};

	const toggleInvert = (index: number) => {
	  const newAccordionOrder = [...accordionOrder];
	  newAccordionOrder[index].invert = !newAccordionOrder[index].invert;
	  setAccordionOrder(newAccordionOrder);
	};

	useEffect(() => {
    store.setConfig('sorting', accordionOrder);
  }, [accordionOrder]);

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
                  onChange={(event) => store.setConfig(settingName, event.target.checked)}
                  name={settingName}
                />
              }
              label={t(`drawer.sorting.${settingName}`)}
            />
          ) : null
		    ))}
			</FormGroup>
			{!settings.fileSorting && (
			<List>
			  {accordionOrder.map((item: Sorting, index: number) => (
			    <ListItem key={index}>
			      <IconButton
			        edge="end"
			        aria-label="up"
			        onClick={() => moveItem(index, 'up')}
			        disabled={index === 0}
			      >
			        <ArrowUpwardIcon />
			      </IconButton>
			      <IconButton
			        edge="end"
			        aria-label="down"
			        onClick={() => moveItem(index, 'down')}
			        disabled={index === accordionOrder.length - 1} 
			      >
			        <ArrowDownwardIcon />
			      </IconButton>

			      <ListItemText primary={translatedAttributes(t)[item.value]} />

			      <Button
			        onClick={() => toggleInvert(index)}
			        data-testid={`drawer-sorting-draggable-list-item-${item.value}-invert`}
			        aria-label={item.invert ? "Descending order" : "Ascending order"}
			      >
			        {!item.invert ? <SortIcon className='invert' /> : <SortIcon />}
			      </Button>
			    </ListItem>
			  ))}
			</List>
			)}
		</div>
	);
};

export default withTranslation()(DrawerSorting);
