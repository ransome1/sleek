import { Item } from 'jstodotxt';

const keyMap: Record<string, string> = {
  due: 'due',
  t: 't',
  rec: 'rec',
  pm: 'pm'
};

export function renameAttributeValue(
  linesInFile: string[],
  attrType: string,
  oldValue: string,
  newValue: string
): { count: number } {
  
  if (linesInFile.length === 0) return { count: 0 };

  let count = 0;
  const oldValueClean = oldValue.replace(/^[@+]/, '');
  const newValueClean = newValue.replace(/^[@+]/, '');

  for (let i = 0; i < linesInFile.length; i++) {
    let newLine = linesInFile[i];
    let modified = false;

    switch (attrType) {
      case 'contexts':
      case 'projects': {
        const prefix = attrType === 'contexts' ? '@' : '+';
        const escapedPrefix = prefix === '@' ? '\\@' : '\\+';
        const regex = new RegExp(`(?<!\\S)${escapedPrefix}${oldValueClean}(?!\\S)`, 'g');
        const result = newLine.replace(regex, `${prefix}${newValueClean}`);
        if (result !== newLine) {
          newLine = result;
          modified = true;
        }
        break;
      }
      case 'priority': {
        const item = new Item(newLine);
        if (item.priority() === oldValueClean) {
          item.setPriority(newValueClean);
          newLine = item.toString();
          modified = true;
        }
        break;
      }
      case 'due':
      case 't':
      case 'rec':
      case 'pm': {
        const item = new Item(newLine);
        const key = keyMap[attrType];
        const extValue = item.extensions().find(e => e.key === key)?.value;
        if (extValue === oldValueClean) {
          item.setExtension(key, newValueClean);
          newLine = item.toString();
          modified = true;
        }
        break;
      }
case 'created':
case 'completed': {
  const item = new Item(newLine);
  if (attrType === 'created') {
    const createdDate = item.created();
    const createdDateStr = createdDate ? 
      `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}` 
      : null;
    
    if (createdDateStr === oldValueClean) {
      
      item.setCreated(new Date(newValueClean));
      newLine = item.toString();
      modified = true;
    }
  } else if (attrType === 'completed') {
    const completedDate = item.completed();
    const completedDateStr = completedDate ? 
      `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}` 
      : null;
    
    if (completedDateStr === oldValueClean) {
      
      item.setCompleted(new Date(newValueClean));
      newLine = item.toString();
      modified = true;
    }
  }
  break;
}
      default: {
        
        break;
      }
    }

    if (modified) {
      linesInFile[i] = newLine;
      count++;
    }
  }

  return { count };
}

export function deleteAttributeValue(
  linesInFile: string[],
  attrType: string,
  valueToDelete: string
): { count: number } {
  if (linesInFile.length === 0) return { count: 0 };

  let count = 0;
  const valueClean = valueToDelete.replace(/^[@+]/, '');

  for (let i = 0; i < linesInFile.length; i++) {
    let newLine = linesInFile[i];
    let modified = false;

    switch (attrType) {
      case 'contexts':
      case 'projects': {
        const prefix = attrType === 'contexts' ? '@' : '+';
        const escapedPrefix = prefix === '@' ? '\\@' : '\\+';
        const regex = new RegExp(`(?<!\\S)${escapedPrefix}${valueClean}\\s*`, 'g');
        const result = newLine.replace(regex, '');
        if (result !== newLine) {
          newLine = result;
          modified = true;
        }
        break;
      }
      case 'priority': {
        const item = new Item(newLine);
        if (item.priority() === valueClean) {
          item.setPriority(null);
          newLine = item.toString();
          modified = true;
        }
        break;
      }
      case 'due':
      case 't':
      case 'rec':
      case 'pm': {
        const item = new Item(newLine);
        const key = keyMap[attrType];
        const extValue = item.extensions().find(e => e.key === key)?.value;
        if (extValue === valueClean) {
          item.removeExtension(key);
          newLine = item.toString();
          modified = true;
        }
        break;
      }
      case 'created':
      case 'completed': {
        const item = new Item(newLine);
        if (attrType === 'created') {
          const createdDate = item.created();
          const createdDateStr = createdDate ? 
            `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}` 
            : null;
          if (createdDateStr === valueClean) {
            item.setCreated(null);
            newLine = item.toString();
            modified = true;
          }
        } else if (attrType === 'completed') {
          const completedDate = item.completed();
          const completedDateStr = completedDate ? 
            `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}` 
            : null;
          if (completedDateStr === valueClean) {
            item.setCompleted(null);
            newLine = item.toString();
            modified = true;
          }
        }
        break;
      }
    }

    if (modified) {
      linesInFile[i] = newLine;
      count++;
    }
  }

  return { count };
}