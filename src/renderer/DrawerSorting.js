import React, { useState, useEffect } from 'react';
import { Box, FormGroup, FormControlLabel, Switch, Divider } from '@mui/material';
import DraggableList from './DraggableList';
import './DrawerSorting.scss';

const store = window.electron.store;

const DrawerSorting = ({ isDrawerOpen, setIsDrawerOpen, sorting, setSorting }) => {
	const [fileSorting, setFileSorting] = useState(store.get('fileSorting'));

	const handleSwitchChange = (event) => {
		const { name, checked } = event.target;
		store.set(name, checked);
		switch (name) {
			case 'fileSorting':
				setFileSorting(checked);
				break;
			default:
				break;
		}
	};

	const reorder = (sorting, startIndex, endIndex) => {
		const result = Array.from(sorting);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		return result;
	};

	const onDragEnd = ({ destination, source }) => {
		if (!destination) return;
		const updatedSorting = reorder(sorting, source.index, destination.index);
		setSorting(updatedSorting);
	};

	return (
		<Box className='Sorting'>
			<FormGroup>
				<FormControlLabel
					control={<Switch checked={fileSorting} onChange={handleSwitchChange} name="fileSorting" />}
					label="Use sorting order of file"
				/>
			</FormGroup>
			<Divider />
			<DraggableList sorting={sorting} setSorting={setSorting} onDragEnd={onDragEnd} />
			

		</Box>
	);
};

export default DrawerSorting;
