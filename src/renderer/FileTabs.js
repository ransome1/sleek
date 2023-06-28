import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';

const FileTabs = ({ files }) => {
  const [value, setValue] = useState(-1);

  useEffect(() => {
    if(files) {
      const activeIndex = files.findIndex(file => file.active);
      setValue(activeIndex !== -1 ? activeIndex : 0);
    }
  }, [files]);

  const handleChange = (event, index) => {
  	window.electron.ipcRenderer.send('setActiveFile', index);
  	setValue(index)
  };

  return files && files.length > 1 ? (
    <Tabs value={value} onChange={handleChange} id="fileTabs" data-testid="file-tabs-component">
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
