import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import Prompt from './Prompt';
import { withTranslation } from 'react-i18next';
import { File } from '../main/util';
import './FileTabs.scss';

const ipcRenderer = window.api.ipcRenderer;

interface FileTabs extends WithTranslation {
  files: File[];
  setContextMenuPosition: (position: { top: number; left: number }) => void;
  setContextMenuItems: (items: any[]) => void;
}

const FileTabs: React.FC<FileTabs> = ({ 
  files,
  setContextMenuPosition,
  setContextMenuItems,  
  t,
}) => {
  const [promptIndex, setPromptIndex] = useState<number | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuItems([
      {
        id: 'changeDoneFilePath',
        label: t('fileTabs.changeLocation'),
        index: index,
        doneFilePath: files[index].doneFilePath,
      },
      {
        id: 'revealFile',
        label: t('fileTabs.revealFile'),
        index: index,
      },
      {
        id: 'removeFile',
        headline: t('fileTabs.removeFileHeadline'),
        text: t('fileTabs.removeFileText'),
        label: t('fileTabs.removeFileLabel'),
        index: index,
      },
    ]);
  };  

  if (!files || files.length === 0) return null;
  
  const index = files.findIndex((file) => file.active);
  const [fileTab, setFileTab] = useState<number>(index !== -1 ? index : 0);

  const handleChange = (event: React.ChangeEvent<{}>, newIndex: number) => {
    if (newIndex < 0 || newIndex > 9) return false;
    setFileTab(newIndex);
    ipcRenderer.send('setFile', newIndex);
  };

  const handleRemove = (event: React.MouseEvent<SVGElement, MouseEvent>, index: number) => {
    event.stopPropagation();
    setPromptIndex(index);
    setShowPrompt(true);
  };

  useEffect(() => {
    setFileTab(index !== -1 ? index : 0);
  }, [index]);

  return (
    <Tabs value={fileTab} id="fileTabs" onChange={handleChange}>
    {files.map((file, index) => (
      file ? (
        <Tab
          key={index}
          label={file.todoFileName}
          tabIndex={0}
          onContextMenu={(event) => handleContextMenu(event, index)}
          icon={
            <CancelIcon 
              onClick={(event) => {
                event.stopPropagation();
                handleContextMenu(event, index);
              }}
            />
          }
          className={file.active ? 'active-tab' : ''}
          value={index}
        />
      ) : null
    ))}
    </Tabs>
  );
};

export default withTranslation()(FileTabs);
