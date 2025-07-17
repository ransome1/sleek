import React, { useState, useEffect, memo } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { AlertColor } from '@mui/material/Alert'
import { withTranslation, WithTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import AutoSuggest from './AutoSuggest'
import PriorityPicker from './PriorityPicker'
import DatePicker from './DatePicker'
import PomodoroPicker from './PomodoroPicker'
import RecurrencePicker from './RecurrencePicker'
import { i18n } from '../Settings/LanguageSelector'
import './Dialog.scss'

const { ipcRenderer } = window.api

interface DialogComponentProps extends WithTranslation {
  dialogOpen: boolean
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  todoObject: TodoObject | null
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  attributes: Attributes | null
  attributeFields: TodoObject | null
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<AlertColor | undefined>>
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>
  settings: Settings
  t: typeof i18n.t
}

const DialogComponent: React.FC<DialogComponentProps> = memo(
  ({
    dialogOpen,
    setDialogOpen,
    todoObject,
    setTodoObject,
    attributes,
    attributeFields,
    setAttributeFields,
    setSnackBarSeverity,
    setSnackBarContent,
    settings,
    t
  }) => {
    const [priority, setPriority] = useState<string>('-')
    const [dueDate, setDueDate] = useState<string | null>(null)
    const [thresholdDate, setThresholdDate] = useState<string | null>(null)
    const [recurrence, setRecurrence] = useState<string | null>(null)
    const [pomodoro, setPomodoro] = useState<number | string>(0)
    const [textFieldValue, setTextFieldValue] = useState<string>('')
    const numRowsWithContent = textFieldValue
      ?.split('\n')
      .filter((line) => line.trim() !== '').length

    const handleAdd = (): void => {
      try {
        if (textFieldValue) {
          const index = todoObject ? todoObject.lineNumber : -1
          const string = textFieldValue.replaceAll(/\n/g, String.fromCharCode(16))
          ipcRenderer.send('writeTodoToFile', index, string)
          handleClose()
        } else {
          setSnackBarSeverity('info')
          setSnackBarContent(t('todoDialog.snackbar.emptyInput'))
        }
      } catch (error: unknown) {
        console.error(error.message)
      }
    }

    const handleClose = (): void => {
      setTodoObject(null)
      setAttributeFields(null)
      setTextFieldValue('')
      setDialogOpen(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        handleAdd()
      }
    }

    const updateAttributeFields = (todoObject: TodoObject | null): void => {
      if (todoObject) {
        setPriority(todoObject?.priority || '-')
        setDueDate(todoObject?.due || null)
        setThresholdDate(todoObject?.t || null)
        setRecurrence(todoObject?.rec || null)
        setPomodoro(todoObject?.pm || 0)
      }
    }

    const handleChange = (type: string, value: string): void => {
      try {
        let updatedValue
        if (type === 'due' || type === 't') {
          if (dayjs(value).isValid())
            updatedValue = value ? dayjs(value).format('YYYY-MM-DD') : null
        } else if (type === 'pm') {
          updatedValue = value === '0' ? null : value
        } else {
          updatedValue = value
        }

        ipcRenderer.send(
          'updateTodoObject',
          todoObject?.lineNumber,
          textFieldValue,
          type,
          updatedValue
        )
      } catch (error: unknown) {
        console.error(error)
      }
    }

    useEffect(() => {
      if (todoObject) {
        const updatedValue = todoObject.string?.replaceAll(String.fromCharCode(16), '\n') || ''
        // Prefill a space when nothing but a prio was selected
        if (/^\([A-Z]\)$/.test(updatedValue)) {
          setTextFieldValue(updatedValue + ' ')
        } else {
          setTextFieldValue(updatedValue)
        }
      }
    }, [todoObject])

    useEffect(() => {
      const handleTextFieldValue = (): void => {
        ipcRenderer.send('updateAttributeFields', todoObject?.lineNumber, textFieldValue)
      }
      const delayedSearch: NodeJS.Timeout = setTimeout(handleTextFieldValue, 100)
      return (): void => {
        clearTimeout(delayedSearch)
      }
    }, [textFieldValue])

    useEffect(() => {
      if (attributeFields) {
        updateAttributeFields(attributeFields)
      }
    }, [attributeFields])

    useEffect(() => {
      if (dialogOpen) {
        setTextFieldValue(todoObject?.string || '')
      }
    }, [dialogOpen])

    return (
      <Dialog
        id="DialogComponent"
        open={dialogOpen}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
      >
        <DialogContent>
          <AutoSuggest
            textFieldValue={textFieldValue}
            setTextFieldValue={setTextFieldValue}
            attributes={attributes}
          />
          <PriorityPicker priority={priority} handleChange={handleChange} />
          <DatePicker date={dueDate} type="due" settings={settings} handleChange={handleChange} />
          <DatePicker
            date={thresholdDate}
            type="t"
            settings={settings}
            handleChange={handleChange}
          />
          <RecurrencePicker recurrence={recurrence} handleChange={handleChange} />
          <PomodoroPicker pomodoro={pomodoro} handleChange={handleChange} />
        </DialogContent>
        <DialogActions disableSpacing="true">
          <button onClick={handleClose} data-testid="dialog-button-cancel">
            {t('cancel')}
          </button>
          <button onClick={handleAdd} data-testid="dialog-button-add-update">
            {todoObject && todoObject.lineNumber >= 0
              ? t('todoDialog.footer.update')
              : settings.bulkTodoCreation
                ? `${t('add')} (${numRowsWithContent || 0})`
                : `${t('add')}`}
          </button>
        </DialogActions>
      </Dialog>
    )
  }
)

DialogComponent.displayName = 'DialogComponent'

export default withTranslation()(DialogComponent)
