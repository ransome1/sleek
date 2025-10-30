function restorePreviousPriority(JsTodoTxtObject: any) {
  if (!JsTodoTxtObject.extensions) return false
  const previousPriorityIndex: number = JsTodoTxtObject.extensions().findIndex(
    (extension: any) => extension.key === 'pri'
  )
  const previousPriorityString: string = JsTodoTxtObject.extensions()[previousPriorityIndex]?.value
  JsTodoTxtObject.setPriority(previousPriorityString)
  JsTodoTxtObject.removeExtension('pri', previousPriorityString);
}

export default restorePreviousPriority
