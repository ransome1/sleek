import { dialog } from 'electron'
import { openFile, createFile } from '../../main/modules/File/Dialog'
import { addFile } from '../../main/modules/File/File'
import fs from 'fs'

jest.mock('../../main/main', () => ({
  mainWindow: jest.fn()
}))

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => './src/__tests__/__mock__'),
    getVersion: jest.fn(() => '')
  },
  dialog: {
    showOpenDialog: jest.fn(() => ({
      canceled: false,
      filePaths: ['./src/__tests__/__mock__/fileDialog.txt'],
      securityScopedBookmarks: true
    })),
    showSaveDialog: jest.fn(() => ({
      canceled: false,
      filePath: './src/__tests__/__mock__/fileDialog.txt',
      securityScopedBookmarks: true
    }))
  }
}))

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn()
  }
}))

jest.mock('../../main/modules/File/File', () => ({
  addFile: jest.fn()
}))

jest.mock('fs', () => ({
  writeFileSync: jest.fn()
}))

describe('openFile', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call addFile when a file is selected', async () => {
    await openFile(false)

    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openFile'],
      securityScopedBookmarks: true,
      filters: [
        { name: 'Text files', extensions: ['txt'] },
        { name: 'All files', extensions: ['*'] }
      ]
    })

    expect(addFile).toHaveBeenCalledWith('./src/__tests__/__mock__/fileDialog.txt', null)
  })

  it('should not call addFile when file selection is canceled', async () => {
    ;(dialog.showOpenDialog as jest.Mock).mockReturnValueOnce({
      canceled: true,
      filePaths: [],
      securityScopedBookmarks: true
    })

    await openFile(false)

    expect(addFile).not.toHaveBeenCalled()
  })
})

describe('createFile', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call addFile after successfully creating a file', async () => {
    ;(dialog.showSaveDialog as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      filePath: './src/__tests__/__mock__/fileDialog.txt',
      securityScopedBookmarks: true
    })

    await createFile(false)

    expect(dialog.showSaveDialog).toHaveBeenCalledWith({
      defaultPath: expect.any(String),
      securityScopedBookmarks: true,
      filters: [
        { name: 'Text files', extensions: ['txt'] },
        { name: 'All files', extensions: ['*'] }
      ]
    })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './src/__tests__/__mock__/fileDialog.txt',
      '',
      'utf-8'
    )
    expect(addFile).toHaveBeenCalledWith('./src/__tests__/__mock__/fileDialog.txt', null)
  })

  it('should not call addFile when file creation is canceled', async () => {
    ;(dialog.showSaveDialog as jest.Mock).mockResolvedValueOnce({
      canceled: true,
      filePath: undefined,
      securityScopedBookmarks: true
    })

    await createFile(false)

    expect(addFile).not.toHaveBeenCalled()
  })
})
