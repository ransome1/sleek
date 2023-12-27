import React, { useState, useEffect, memo } from 'react';
import { Tab, Tabs } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { withTranslation, WithTranslation } from 'react-i18next';
import './FileTabs.scss';
import { i18n } from '../Settings/LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  settings: Settings;
  setContextMenuPosition: (position: { top: number; left: number }) => void;
  setContextMenuItems: (items: any[]) => void;
  t: typeof i18n.t;
}

const FileTabs: React.FC<Props> = memo(({
  settings,
  setContextMenuPosition,
  setContextMenuItems,
  t,
}) => {

  const handleContextMenu = (event: React.MouseEvent, index: number) => {
    const revealFile = (index) => {
      const file = settings.files[index];
      if(file) ipcRenderer.send('revealInFileManager', file.todoFilePath);
    };

    const removeFile = (index) => {
      if(index >= 0) ipcRenderer.send('removeFile', index);
    };

    const contextMenuItems = [
      {
        id: 'changeLocation',
        label: t('fileTabs.changeLocation'),
        index: index,
        doneFilePath: settings.files[index].doneFilePath,
      },
      {
        id: 'revealFile',
        label: t('fileTabs.revealFile'),
        function: () => revealFile(index),
      },
      {
        id: 'removeFile',
        label: t('fileTabs.removeFileLabel'),
        promptItem: {
          headline: t('fileTabs.removeFileHeadline'),
          text: t('fileTabs.removeFileText'),
          button1: t('fileTabs.removeFileLabel'),
          onButton1: () => removeFile(index),
        },
      },
    ];

    setContextMenuItems({
      event: event,
      index: index,
      items: contextMenuItems,
    });
  };

  const index = settings.files.findIndex((file) => file.active);
  const [fileTab, setFileTab] = useState<number>(index !== -1 ? index : 0);

  const handleChange = (_event: React.SyntheticEvent, index: number) => {
    if(index < 0 || index > 9) return false;
    setFileTab(index);
    ipcRenderer.send('setFile', index);
  };

  useEffect(() => {
    setFileTab(index !== -1 ? index : 0);
  }, [index]);

  return (
    <Tabs value={fileTab} id="fileTabs" onChange={handleChange}>
    {settings.files.map((file, index) => (
      file ? (
        <Tab
          key={index}
          label={file.todoFileName}
          tabIndex={0}
          onContextMenu={(event) => handleContextMenu(event, index)}
          icon={
            <MoreVertIcon
              onClick={(event) => {
                event.stopPropagation();
                handleContextMenu(event, index);
              }}
              role="button"
            />
          }
          className={file.active ? 'active-tab' : ''}
          value={index}
        />
      ) : null
    ))}
    </Tabs>
  );
});

export default withTranslation()(FileTabs);
