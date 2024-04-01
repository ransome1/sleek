import { getActiveFile } from './Active';
import { readFileContent } from './File';
import { writeToFile } from './Write';
import { mainWindow } from '../../main';

function handleRequestArchive(): void {
  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    throw new Error('Todo file is not defined');
  }
  mainWindow!.webContents.send('triggerArchiving', Boolean(activeFile?.doneFilePath));
}

async function readFilteredFileContent(filePath: string, bookmark: string | null, complete: boolean): Promise<string> {
  const filterStrings = (fileContent: string, complete: boolean): string => {
    const arrayOfStrings = fileContent.split('\n');
    const filteredArrayOfStrings = arrayOfStrings.filter(string => {
        return (complete && string.startsWith('x ')) || (!complete && !string.startsWith('x '));
    });
    return filteredArrayOfStrings.join('\n');
  };
  const fileContent: string | null = await readFileContent(filePath, bookmark);
  if(fileContent) {
    return filterStrings(fileContent, complete);  
  } else {
    return '';
  }
}

async function archiveTodos(): Promise<string> {
  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    throw new Error('Todo file is not defined');
  }

  if(activeFile.doneFilePath === null) {
    return 'Archiving file is not defined';
  }

  const completedTodos: string = await readFilteredFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark, true);

  if(!completedTodos) {
    return 'No completed todos found';
  }

  const uncompletedTodos: string = await readFilteredFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark, false);
  
  const todosFromDoneFile: string | null = await readFileContent(activeFile.doneFilePath, activeFile.doneFileBookmark);

  await writeToFile(todosFromDoneFile + '\n' + completedTodos, activeFile.doneFilePath, activeFile.doneFileBookmark);

  await writeToFile(uncompletedTodos, activeFile.todoFilePath, activeFile.todoFileBookmark);

  return 'Successfully archived';
}

export { archiveTodos, handleRequestArchive };
