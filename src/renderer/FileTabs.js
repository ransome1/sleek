import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';

const FileTabs = () => {
  const [value, setValue] = useState(-1); // Set initial value to -1
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const receiveFiles = await new Promise((resolve, reject) => {
          window.electron.ipcRenderer.once('receiveFiles', resolve);
          window.electron.ipcRenderer.send('requestFiles');
        });
        setFiles(receiveFiles);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const activeIndex = files.findIndex(file => file.active);
    setValue(activeIndex !== -1 ? activeIndex : 0); // Set value to 0 if no active file found
  }, [files]);

  const handleChange = (event, index) => {
  	window.electron.ipcRenderer.send('setActiveFile', index);
  	setValue(index)
  };

  return (
    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
      {files.map((file, index) => (
        <Tab
          key={index}
          label={file.file}
          className={file.active ? 'active-tab' : ''}
        />
      ))}
    </Tabs>
  );
};

export default FileTabs;
