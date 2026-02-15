import React from "react";
import Link from "@mui/material/Link";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import HelpIcon from "@mui/icons-material/Help";
import { useTranslation } from "react-i18next";
import { handleLinkClick } from "../Shared";
import "./Filters.scss";
import { VisibleSettings } from "../Settings/Settings";
import { SettingStore } from "@sleek-types";

const { store } = window.api;

const visibleSettings: VisibleSettings = {
  showCompleted: {
    style: "toggle",
    rerender: true,
  },
  showHidden: {
    style: "toggle",
    rerender: true,
    help: "https://github.com/ransome1/sleek/wiki/Hidden-todos-(h:)",
  },
  thresholdDateInTheFuture: {
    style: "toggle",
    rerender: true,
  },
  dueDateInTheFuture: {
    style: "toggle",
    rerender: true,
  },
};

interface DrawerFiltersComponentProps {
  settings: SettingStore;
}

const DrawerFiltersComponent: React.FC<DrawerFiltersComponentProps> = ({
  settings,
}) => {
  const { t } = useTranslation();
  return (
    <div id="Filters">
      <FormGroup>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) =>
          settingValue.style === "toggle" ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  data-testid={`setting-toggle-${settingName}`}
                  checked={!!settings[settingName as keyof SettingStore]}
                  onChange={(event) =>
                    store.setConfig(settingName, event.target.checked)
                  }
                  name={settingName}
                />
              }
              label={
                settingValue.help ? (
                  <>
                    {t(`drawer.filters.${settingName}`)}
                    <Link
                      onClick={(event) =>
                        settingValue.help &&
                        handleLinkClick(event, settingValue.help)
                      }
                    >
                      <HelpIcon />
                    </Link>
                  </>
                ) : (
                  t(`drawer.filters.${settingName}`)
                )
              }
            />
          ) : null,
        )}
      </FormGroup>
    </div>
  );
};

export default DrawerFiltersComponent;
