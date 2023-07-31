import React, { useState, useEffect } from 'react';
import { Box, Drawer, Tabs, Tab } from '@mui/material';
import DraggableList from './DraggableList';
import './DrawerSorting.scss';

const DrawerSorting = ({ isDrawerOpen, setIsDrawerOpen, sorting, setSorting }) => {
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
		<DraggableList sorting={sorting} setSorting={setSorting} onDragEnd={onDragEnd} />
	);
};

export default DrawerSorting;
