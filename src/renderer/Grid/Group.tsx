import React, { memo } from 'react';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

interface GroupProps {
  title: string | string[];
  todotxtAttribute: string;
  filters: Filters | null;
  onClick: Function;
}

const Group: React.FC<GroupProps> = memo(({ title, todotxtAttribute, filters, onClick }) => {

  if (!title || title.length === 0) {
    return <ListItem className="row group"><Divider /></ListItem>;
  }
  
  const groupElements = (typeof title === 'string') ? [title] : title

  return (
    <ListItem className="row group">
      {groupElements.map((groupElement, index) => {
        const selected: boolean = filters && (filters[todotxtAttribute as keyof Filters] || []).some(
          (filter: Filter) => filter && filter.name === groupElement.trim()
        );
        return (
          <div
            key={index}
            className={selected ? 'selected filter' : 'filter'}
            data-todotxt-attribute={todotxtAttribute}
            data-todotxt-value={groupElement}
          >
            <Button className='attribute' onClick={() => onClick(todotxtAttribute, groupElement, groupElement.trim())} data-testid={`datagrid-button-${todotxtAttribute}`}>
              {groupElement.trim()}
            </Button>
          </div>
        );
      })}
    </ListItem>
  );
});

export default Group;