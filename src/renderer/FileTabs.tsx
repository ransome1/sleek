import React, { useState, useEffect, memo } from 'react';
import { Tab, Tabs } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { withTranslation, WithTranslation } from 'react-i18next';
import { File } from '../main/util';
import './FileTabs.scss';
import { i18n } from './LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  files: File[];
  setContextMenuPosition: (position: { top: number; left: number }) => void;
  setContextMenuItems: (items: any[]) => void;
  t: typeof i18n.t;
}

const FileTabs: React.FC<Props> = memo(({
  files,
  setContextMenuPosition,
  setContextMenuItems,
  t,
}) => {
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

  const handleChange = (event: React.SyntheticEvent, index: number) => {
    if (index < 0 || index > 9) return false;
    setFileTab(index);
    ipcRenderer.send('setFile', index);
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
