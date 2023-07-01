import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import './FileTabs.scss';

const FileTabs = ({ files }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if(files) {
      const activeIndex = files.findIndex(file => file.active);
      if(activeIndex >= 0) setValue(activeIndex);
    }
  }, [files]);

  const handleChange = (event, index) => {
  	window.electron.ipcRenderer.send('setActiveFile', index);
  	setValue(index)
  };

  return files && files.length > 1 ? (
    <Tabs value={value} onChange={handleChange} className="fileTabs" data-testid="file-tabs-component">
      {files.map((file, index) => (
        <Tab
          key={index}
          label={file.filename}
          className={file.active ? 'active-tab' : ''}
        />
      ))}
    </Tabs>
  ) : null;

};

export default FileTabs;
