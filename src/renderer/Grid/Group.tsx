import React, { memo } from "react";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { HandleFilterSelect, IsSelected } from "../Shared";

interface GroupProps {
  key: string;
  value: string | string[];
  filters: Filters | null;
}

const Group: React.FC<GroupProps> = memo(({ attributeKey, value, filters }) => {
  if (!value || value.length === 0) {
    return (
      <ListItem className="row group">
        <Divider />
      </ListItem>
    );
  }

  const groupElements = typeof value === "string" ? [value] : value;

  return (
    <ListItem className="row group">
      {groupElements.map((value, index) => {
        return (
          <div
            key={index}
            className={
              IsSelected(attributeKey, filters, [value])
                ? "selected filter"
                : "filter"
            }
            data-todotxt-attribute={attributeKey}
            data-todotxt-value={value}
          >
            <button
              onClick={() =>
                HandleFilterSelect(attributeKey, [value], filters, false)
              }
              data-testid={`datagrid-group-button-${attributeKey}`}
            >
              {value}
            </button>
          </div>
        );
      })}
    </ListItem>
  );
});

Group.displayName = "Group";

export default Group;
