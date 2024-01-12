import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg';
import DatePickerInline from './DatePickerInline';

interface ElementsProps {
  todoObject: TodoObject;
  filters: Filters | null;
  handleButtonClick: (key: string, value: string) => void;
  settings: Settings;
}

const Elements: React.FC<ElementsProps> = memo(({
  todoObject,
  filters,
  handleButtonClick,
  settings,
}) => {
  const replacements: {
    [key: string]: (value: string, type: string) => React.ReactNode;
  } = {
    due: (value,type) => (
      <DatePickerInline
        type={type}
        todoObject={todoObject}
        date={todoObject.due}
        filters={filters}
        settings={settings}
      />
    ),
    t: (value, type) => (
      <DatePickerInline
        type={type}
        todoObject={todoObject}
        date={todoObject.t}
        filters={filters}
        settings={settings}
      />
    ),
    contexts: (value, type) => (
      <Button className='contexts' onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
        {value}
      </Button>
    ),
    projects: (value, type) => (
      <Button onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
        {value}
      </Button>
    ),
    rec: (value, type) => (
      <Button onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
        <Chip label="rec:" />
        {value}
      </Button>
    ),
    pm: (value, type) => (
      <Button className='pomodoro' onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
        <TomatoIconDuo />
        {value}
      </Button>
    ),
    hidden: () => null as React.ReactNode,
  };

  const matches = () => {
    const expressions = [
      { pattern: new RegExp(`t:${todoObject.tString?.replace(/\s/g, '\\s')}`, 'g'), type: 't', key: 't:' },
      { pattern: new RegExp(`due:${todoObject.dueString?.replace(/\s/g, '\\s')}`, 'g'), type: 'due', key: 'due:' },
      { pattern: /(@\S+)/, type: 'contexts', key: '@' },
      { pattern: /\+\S+/, type: 'projects', key: '+' },
      { pattern: /\bh:1\b/, type: 'hidden', key: 'h:1' },
      { pattern: /pm:\d+\b/, type: 'pm', key: 'pm:' },
      { pattern: /rec:([^ ]+)/, type: 'rec', key: 'rec:' },
    ];

    let body = todoObject.body;
    let substrings = [];
    let index = 0;

    if(body) {
      while (body.length > 0) {
        let matched = false;

        for (const expression of expressions) {
          const regex = new RegExp(`^(${expression.pattern.source})`);
          const match = body.match(regex);

          if(match) {
            matched = true;
            const value = match[0].substring(expression.key?.length ?? 0);
            if(value) substrings.push({ type: expression.type, value: value, key: expression.key, index: index });
            body = body.substring(match[0].length);
            break;
          }
        }

        if(!matched) {
          const nextSpaceIndex = body.indexOf(' ');
          const endOfWordIndex = nextSpaceIndex !== -1 ? nextSpaceIndex : body.length;
          const value = body.substring(0, endOfWordIndex);
          if(value !== '') substrings.push({ type: null, value: value, index: index });
          body = body.substring(endOfWordIndex + 1);
        }
        index++;
      }
    }
    return substrings;
  };

  const elements = matches().map((element: ElementObject, index) => {
    const selected = filters && element.type !== null && (filters[element.type as keyof Filters] || []).some(
      (filter: Filter) => filter.value === element.value
    );

    return (
      <Box
        key={index}
        className={selected ? 'filter selected' : 'filter'}
        data-todotxt-attribute={element.type}
      >
        {element.type && element.value && replacements[element.type]
          ? replacements[element.type](element.value, element.type)
          : element.value ? <span>{element.value}</span> : null}
      </Box>
    );
  });
  return <>{elements}</>;
});

export default Elements;
