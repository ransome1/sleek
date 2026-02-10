import React, { useState, useEffect } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SortIcon from "@mui/icons-material/Sort";
import { withTranslation, WithTranslation } from "react-i18next";
import { i18n } from "../Settings/LanguageSelector";
import { translatedAttributes } from "../Shared";
import "./Sorting.scss";

const { store } = window.api;

interface DrawerSortingComponentProps extends WithTranslation {
  settings: Settings;
  t: typeof i18n.t;
}

const visibleSettings = {
  fileSorting: {
    style: "toggle",
    rerender: true,
  },
  sortCompletedLast: {
    style: "toggle",
    rerender: true,
    dependsOn: ["fileSorting"],
  },
};

const DrawerSortingComponent: React.FC<DrawerSortingComponentProps> = ({
  settings,
  t,
}) => {
  const [accordionOrder, setAccordionOrder] = useState<Sorting[]>(
    settings.sorting,
  );
  const moveItem = (index: number, direction: "up" | "down"): void => {
    const newAccordionOrder = [...accordionOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newAccordionOrder.length) {
      [newAccordionOrder[index], newAccordionOrder[swapIndex]] = [
        newAccordionOrder[swapIndex],
        newAccordionOrder[index],
      ];

      setAccordionOrder(newAccordionOrder);
    }
  };
  const toggleInvert = (index: number): void => {
    const newAccordionOrder = [...accordionOrder];
    newAccordionOrder[index].invert = !newAccordionOrder[index].invert;
    setAccordionOrder(newAccordionOrder);
  };

  useEffect(() => {
    store.setConfig("sorting", accordionOrder);
  }, [accordionOrder]);

  const translatedValues = translatedAttributes(t);

  return (
    <div id="Sorting">
      <FormGroup>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) => {
          // todo: this is a duplicate, must be improved
          if (settingValue.dependsOn) {
            for (let i = 0; i < settingValue.dependsOn.length; i++) {
              if (settings[settingValue.dependsOn[i]]) return null;
            }
          }
          return settingValue.style === "toggle" ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  checked={settings[settingName as keyof Settings]}
                  onChange={(event) =>
                    store.setConfig(settingName, event.target.checked)
                  }
                  name={settingName}
                />
              }
              label={t(`drawer.sorting.${settingName}`)}
            />
          ) : null;
        })}
      </FormGroup>
      {!settings.fileSorting && (
        <List>
          {accordionOrder.map((item: Sorting, index: number) => (
            <ListItem key={index}>
              <IconButton
                edge="end"
                aria-label="up"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
              >
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="down"
                onClick={() => moveItem(index, "down")}
                disabled={index === accordionOrder.length - 1}
              >
                <ArrowDownwardIcon />
              </IconButton>

              <ListItemText primary={translatedValues[item.value]} />

              <button
                onClick={() => toggleInvert(index)}
                data-testid={`drawer-sorting-draggable-list-item-${item.value}-invert`}
                aria-label={
                  item.invert ? "Descending order" : "Ascending order"
                }
              >
                {!item.invert ? <SortIcon className="invert" /> : <SortIcon />}
              </button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default withTranslation()(DrawerSortingComponent);
