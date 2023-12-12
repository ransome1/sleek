function restorePreviousPriority(todoObject: any) {
  const previousPriorityIndex: number = todoObject.extensions().findIndex((extension: any) => extension.key === 'pri');
  const previousPriorityString: string = todoObject.extensions()[previousPriorityIndex]?.value;
  todoObject.setPriority(previousPriorityString);
}

export default restorePreviousPriority;