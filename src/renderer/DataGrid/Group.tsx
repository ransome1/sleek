import React from 'react';
import { ListItem, Box, Button, Divider } from '@mui/material';
import { TodoObject, Filters } from '../../main/util.ts';

interface Group {
  todoObject: TodoObject;
  filters: Filters;
  onClick: (key: string, value: string) => void;
}

const Group: React.FC<GroupListItem> = ({ todoObject, filters, onClick }) => {
  const values = todoObject.value?.split(',') || [];

  return (
    <ListItem className="row group">
      {values.map((value, index) => {
        const selected = (filters[todoObject.group] || []).some(
          (filter) => filter.value === value.trim()
        );

        if (!value) {
          return <Divider key={index} />;
        }

        return (
          <Box
            key={index}
            className={selected ? 'selected' : ''}
            data-todotxt-attribute={todoObject.group}
            data-todotxt-value={value}
          >
            <Button className='attribute' onClick={() => onClick(todoObject.group, value.trim())}>
              {value.trim()}
            </Button>
          </Box>
        );
      })}
    </ListItem>
  );
};

export default Group;
