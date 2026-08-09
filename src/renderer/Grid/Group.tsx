import React, { memo } from "react";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { AlertColor } from "@mui/material/Alert";
import { HandleFilterSelect, IsSelected } from "../Shared";
import { AttributeKey, Filters } from "@sleek-types";
import { useAttributeContextMenu } from "../Shared/useAttributeContextMenu";
import { ContextMenu, SettingStore } from "@sleek-types";

interface GroupProps {
  attributeKey: AttributeKey;
  value: string | string[] | null;
  filters: Filters | null;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;

  settings: SettingStore | null;
  setSnackBarContent?: React.Dispatch<React.SetStateAction<string | null>>;
  setSnackBarSeverity?: React.Dispatch<
    React.SetStateAction<AlertColor | undefined>
  >;
}

const Group: React.FC<GroupProps> = memo(
  ({
    attributeKey,
    value,
    filters,
    setContextMenu,

    settings,
    setSnackBarContent,
    setSnackBarSeverity,
  }) => {
    const { handleContextMenu } = useAttributeContextMenu({
      setContextMenu,
      settings,
      setSnackBarContent,
      setSnackBarSeverity,
    });

    if (!value || value.length === 0) {
      return (
        <ListItem className="row group">
          <Divider />
        </ListItem>
      );
    }

    const groupElements =
      typeof value === "string" || typeof value === "number" ? [value] : value;

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
                  HandleFilterSelect(
                    attributeKey,
                    [value],
                    filters,
                    false,
                    null,
                  )
                }
                onContextMenu={(e) => handleContextMenu(e, value, attributeKey)}
                data-testid={`datagrid-group-button-${attributeKey}`}
              >
                {value}
              </button>
            </div>
          );
        })}
      </ListItem>
    );
  },
);

Group.displayName = "Group";

export default Group;
