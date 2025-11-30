import { app } from 'electron'
import fs from 'fs'
import { Item } from 'jstodotxt'
import { linesInFile } from '../DataRequest/CreateTodoObjects'
import { getActiveFile } from './Active'
import { SettingsStore } from '../Stores'
import { replaceSpeakingDatesWithAbsoluteDates } from '../Date'

function writeToFile(string: string, filePath: string, bookmark: string | null) {
  fs.writeFileSync(filePath, string + '\n', 'utf-8')
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

function reorderLineInFile(fromLineNumber: number, toLineNumber: number) {
  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    throw new Error('No active file found')
  }

  if (fromLineNumber < 0 || fromLineNumber >= linesInFile.length) {
    throw new Error('Invalid source line number')
  }
  if (toLineNumber < 0 || toLineNumber >= linesInFile.length) {
    throw new Error('Invalid target line number')
  }
  if (fromLineNumber === toLineNumber) {
    return // No change needed
  }

  // Remove the line from its original position
  const [movedLine] = linesInFile.splice(fromLineNumber, 1)

  // Insert it at the new position
  // Adjust target index if source was before target
  const adjustedToIndex = fromLineNumber < toLineNumber ? toLineNumber : toLineNumber
  linesInFile.splice(adjustedToIndex, 0, movedLine)

  writeToFile(linesInFile.join('\n'), activeFile.todoFilePath, activeFile.todoFileBookmark)
}

function prepareContentForWriting(lineNumber: number, string: string) {
  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    throw new Error('No active file found')
  } else if (!string) {
    throw new Error('No content passed')
  }

  let linesToAdd

  if (SettingsStore.get('bulkTodoCreation')) {
    linesToAdd = string.replaceAll(String.fromCharCode(16), '\n')
  } else {
    linesToAdd = string.replaceAll(/\n/g, String.fromCharCode(16))
  }

  if (SettingsStore.get('convertRelativeToAbsoluteDates')) {
    linesToAdd = replaceSpeakingDatesWithAbsoluteDates(linesToAdd)
  }

  linesToAdd = linesToAdd.split('\n')

  if (lineNumber >= 0) {
    linesInFile[lineNumber] = linesToAdd.join('\n')
  } else {
    for (let i = 0; i < linesToAdd.length; i++) {
      const JsTodoTxtObject = new Item(linesToAdd[i])
      if (SettingsStore.get('appendCreationDate') && !JsTodoTxtObject.created()) {
        JsTodoTxtObject.setCreated(new Date())
      }
      linesInFile.push(JsTodoTxtObject.toString())
    }
  }

  writeToFile(linesInFile.join('\n'), activeFile.todoFilePath, activeFile.todoFileBookmark)
}

export { prepareContentForWriting, removeLineFromFile, reorderLineInFile, writeToFile }
