import { config } from '../../config';
import dayjs from 'dayjs';

function applyAttributes(todoObjects: TodoObject[], filters: Filters | null): TodoObject[] {
  return todoObjects.map((todoObject: TodoObject) => {
    if (!todoObject.visible) {
      return todoObject;
    }

    todoObject.visible = Object.entries(filters || {}).every(([key, filterArray]: [string, Filter[]]) => {
      if (filterArray.length === 0) {
        return true;
      }

      const attributeValues: any = ['due', 't'].includes(key) ? todoObject[key as keyof TodoObject] : todoObject[key as keyof TodoObject];

      return filterArray.every(({ values, exclude }: Filter) => {
        if (
          attributeValues === undefined ||
          attributeValues === null ||
          (Array.isArray(attributeValues) && attributeValues.length === 0)
        ) {
          return exclude;
        }

        const hasMatchingValue = Array.isArray(attributeValues)
          ? attributeValues.some((val) => values.includes(val))
          : Array.isArray(values) && values.includes(attributeValues);

        return exclude ? !hasMatchingValue : hasMatchingValue;
      });
    });

    return todoObject;
  });
}

function handleCompletedTodoObjects(todoObjects: TodoObject[]): TodoObject[] | false {
  const showCompleted: boolean = config.get('showCompleted');
  return todoObjects.map((todoObject: TodoObject) => {
    if(todoObject.complete && !showCompleted) {
      return false;
    } else {
      return todoObject;
    }
  });
}

function handleHiddenTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  return todoObjects.map((todoObject: TodoObject) => {
    if(!todoObject.visible) return todoObject;
    todoObject.visible = todoObject.visible && !todoObject.hidden;
    return todoObject;
  });
}

function handleTodoObjectsDates(todoObjects: TodoObject[]): TodoObject[] {
  const thresholdDateInTheFuture: boolean = config.get('thresholdDateInTheFuture');
  const dueDateInTheFuture: boolean = config.get('dueDateInTheFuture');

  return todoObjects.filter((todoObject: TodoObject) => {
    if (!todoObject.visible) return true;

    const thresholdDate = dayjs(todoObject?.t);
    const dueDate = dayjs(todoObject?.due);

    return !(thresholdDate && thresholdDate.isAfter(dayjs()) && !thresholdDateInTheFuture) &&
           !(dueDate && dueDate.isAfter(dayjs()) && !dueDateInTheFuture);
  });
}

export { applyAttributes, handleCompletedTodoObjects, handleHiddenTodoObjects, handleTodoObjectsDates };