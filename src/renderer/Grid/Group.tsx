import React, { memo } from 'react';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
interface GroupProps {
  value: string;
  group: string;
  filters: Filters | null;
  onClick: Function;
}
const Group: React.FC<GroupProps> = memo(({
  value,
  group,
  filters,
  onClick
}) => {
  const values = value?.split(',') || [];
  return (
    <ListItem className="row group">
      {values.map((value, index) => {
        if(!value) {
          return <Divider key={index} />;
        }
        const selected: boolean = filters && (filters[group as keyof Filters] || []).some(
          (filter: Filter) => filter && filter.name === value.trim()
        );
        return (
          <div
            key={index}
            className={selected ? 'selected filter' : 'filter'}
            data-todotxt-attribute={group}
            data-todotxt-value={value}
          >
            <Button className='attribute' onClick={() => onClick(group, value, value.trim())} data-testid={`datagrid-button-${group}`}>
              {value.trim()}
            </Button>
          </div>
        );
      })}
    </ListItem>
  );
});

export default Group;
