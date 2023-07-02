import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import './FileTabs.scss';

const FileTabs = ({ files }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const activeIndex = files.findIndex(file => file.active);
    if (activeIndex >= 0) setValue(activeIndex);
  }, [files]);

  const handleChange = (event, index) => {
    window.electron.ipcRenderer.send('setActiveFile', index);
    setValue(index);
  };

  if (!files || files.length <= 1) return null;

  return (
    <Tabs className="fileTabs" value={value} onChange={handleChange} data-testid="file-tabs-component">
      {files.map((file, index) => (
        <Tab
          key={index}
          label={file.filename}
          className={file.active ? 'active-tab' : ''}
        />
      ))}
    </Tabs>
  );
};

export default FileTabs;
