import { app } from 'electron'
import fs from 'fs'
import { Item } from 'jstodotxt'
import { linesInFile } from '../DataRequest/CreateTodoObjects'
import { getActiveFile } from './Active'
import { config } from '../../config'
import { replaceSpeakingDatesWithAbsoluteDates } from '../Date'

function writeToFile(string: string, filePath: string, bookmark: string | null) {
  const stopAccessingSecurityScopedResource =
    process.mas && bookmark ? app.startAccessingSecurityScopedResource(bookmark) : null

  fs.writeFileSync(filePath, string, 'utf-8')

  if (stopAccessingSecurityScopedResource && process.mas && bookmark) {
    stopAccessingSecurityScopedResource()
  }
}

function removeLineFromFile(lineNumber: number) {
  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    throw new Error('No active file found')
  } else if (lineNumber >= 0) {
    linesInFile.splice(lineNumber, 1)
    writeToFile(linesInFile.join('\n'), activeFile.todoFilePath, activeFile.todoFileBookmark)
  }
}

function prepareContentForWriting(lineNumber: number, string: string) {
  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    throw new Error('No active file found')
  } else if (!string) {
    throw new Error('No content passed')
  }

  let linesToAdd

  if (config.get('bulkTodoCreation')) {
    linesToAdd = string.replaceAll(String.fromCharCode(16), '\n')
  } else {
    linesToAdd = string.replaceAll(/\n/g, String.fromCharCode(16))
  }

  if (config.get('convertRelativeToAbsoluteDates')) {
    linesToAdd = replaceSpeakingDatesWithAbsoluteDates(linesToAdd)
  }

  linesToAdd = linesToAdd.split('\n')

  if (lineNumber >= 0) {
    linesInFile[lineNumber] = linesToAdd.join('\n')
  } else {
    for (let i = 0; i < linesToAdd.length; i++) {
      const JsTodoTxtObject = new Item(linesToAdd[i])
      if (config.get('appendCreationDate') && !JsTodoTxtObject.created()) {
        JsTodoTxtObject.setCreated(new Date())
      }
      linesInFile.push(JsTodoTxtObject.toString())
    }
  }

  writeToFile(linesInFile.join('\n'), activeFile.todoFilePath, activeFile.todoFileBookmark)
}

export { prepareContentForWriting, removeLineFromFile, writeToFile }
