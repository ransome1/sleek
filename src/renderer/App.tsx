import { useEffect, useState, useRef, JSX, useReducer } from "react";
import { Theme, ThemeProvider, createTheme } from "@mui/material/styles";
import IpcComponent from "./IpcRenderer";
import MatomoComponent from "./Matomo";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { snackbarReducer, initialSnackbarState } from "./hooks/useAppState";

import NavigationComponent from "./Navigation";
import GridComponent from "./Grid/Grid";
import SplashScreen from "./SplashScreen";
import FileTabs from "./Header/FileTabs";
import { dark, light, BORDER_RADIUS } from "./Themes";
import DrawerComponent from "./Drawer/Drawer";
import SearchComponent from "./Header/Search/Search";
import DialogComponent from "./Dialog/Dialog";
import Archive from "./Archive";
import HeaderComponent from "./Header/Header";
import ContextMenu from "./ContextMenu";
import { I18nextProvider } from "react-i18next";
import { i18n } from "./Settings/LanguageSelector";
import Settings from "./Settings/Settings";
import Prompt from "./Prompt";
import { getCssVariables } from "./Colors";
import "./App.scss";
import "./Buttons.scss";
import "./Form.scss";
import {
  ContextMenu as ContextMenuType,
  HeadersObject,
  PromptItem,
  Filters,
  SettingStore,
  TodoData,
  TodoObject,
  Attributes,
} from "../@types";

const { store, ipcRenderer } = window.api;

const App = (): JSX.Element => {
  const [settings, setSettings] = useState<SettingStore>(store.getConfig());
  const [snackbar, dispatchSnackbar] = useReducer(
    snackbarReducer,
    initialSnackbarState,
  );
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null);
  const [attributeFields, setAttributeFields] = useState<TodoObject | null>(
    null,
  );
  const [headers, setHeaders] = useState<HeadersObject | null>(null);
  const [filters, setFilters] = useState<Filters>({} as Filters);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuType | null>(null);
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null);
  const [triggerArchiving] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(
    createTheme({
      ...(settings?.shouldUseDarkColors ? dark : light),
      typography: {
        fontSize: Math.round(14 * (settings.zoom / 100)),
      },
    }),
  );
  const searchFieldRef = useRef<HTMLInputElement>(null);

  // Inject CSS variables for current theme and radius
  useEffect(() => {
    const themeMode = settings?.shouldUseDarkColors ? "dark" : "light";
    const vars = getCssVariables(themeMode);
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    // Inject border radius as CSS variable
    document.documentElement.style.setProperty("--radius", BORDER_RADIUS);
  }, [settings?.shouldUseDarkColors]);

  useEffect(() => {
    ipcRenderer.send("requestData");
  }, []);

  return (
    <>
      <IpcComponent
        setHeaders={setHeaders}
        setAttributes={setAttributes}
        setFilters={setFilters}
        setTodoData={setTodoData}
        setTodoObject={setTodoObject}
        setAttributeFields={setAttributeFields}
        onNotification={dispatchSnackbar}
        setSettings={setSettings}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      {settings.matomo && <MatomoComponent settings={settings} />}
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div
            className={`flexContainer ${settings?.isNavigationOpen ? "" : "hideNavigation"}`}
          >
            <NavigationComponent
              setDialogOpen={setDialogOpen}
              settings={settings}
              setIsSettingsOpen={setIsSettingsOpen}
              setTodoObject={setTodoObject}
              headers={headers}
            />
            {settings?.files?.length > 0 && (
              <DrawerComponent
                settings={settings}
                attributes={attributes}
                filters={filters}
                searchFieldRef={searchFieldRef}
                setContextMenu={setContextMenu}
                setPromptItem={setPromptItem}
                onNotification={dispatchSnackbar}
              />
            )}
            <div className="flexItems">
              {settings.files?.length > 0 && (
                <>
                  {settings.showFileTabs ? (
                    <FileTabs
                      settings={settings}
                      setContextMenu={setContextMenu}
                    />
                  ) : null}
                  {headers && headers.availableObjects > 0 && (
                    <>
                      <SearchComponent
                        headers={headers}
                        searchString={searchString}
                        setSearchString={setSearchString}
                        settings={settings}
                        searchFieldRef={searchFieldRef}
                        setPromptItem={setPromptItem}
                      />
                      <HeaderComponent
                        settings={settings}
                        searchFieldRef={searchFieldRef}
                      />
                    </>
                  )}
                </>
              )}
              {todoData && headers && headers.availableObjects > 0 && (
                <>
                  <GridComponent
                    todoData={todoData}
                    setTodoObject={setTodoObject}
                    filters={filters}
                    setDialogOpen={setDialogOpen}
                    setContextMenu={setContextMenu}
                    setPromptItem={setPromptItem}
                    onNotification={dispatchSnackbar}
                    settings={settings}
                    headers={headers}
                    searchString={searchString}
                  />
                </>
              )}
              {headers && (
                <SplashScreen
                  setDialogOpen={setDialogOpen}
                  headers={headers}
                  settings={settings}
                />
              )}
            </div>
          </div>
          {dialogOpen ? (
            <DialogComponent
              todoObject={todoObject}
              setTodoObject={setTodoObject}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              attributes={attributes}
              attributeFields={attributeFields}
              setAttributeFields={setAttributeFields}
              onNotification={dispatchSnackbar}
              settings={settings}
            />
          ) : null}
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            setIsSettingsOpen={setIsSettingsOpen}
            setTheme={setTheme}
            setTodoData={setTodoData}
          />
          {contextMenu && (
            <ContextMenu
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              setPromptItem={setPromptItem}
            />
          )}
          <Snackbar
            open={snackbar.open}
            onClose={() => dispatchSnackbar({ type: "close" })}
            autoHideDuration={3000}
          >
            <Alert
              severity={snackbar.severity}
              data-testid={`snackbar-${snackbar.severity}`}
            >
              {snackbar.content}
            </Alert>
          </Snackbar>
          {settings?.files?.length > 0 && (
            <Archive
              triggerArchiving={triggerArchiving}
              setPromptItem={setPromptItem}
            />
          )}
          {promptItem && (
            <Prompt
              open={true}
              onClose={() => setPromptItem(null)}
              promptItem={promptItem}
              setPromptItem={setPromptItem}
              setContextMenu={setContextMenu}
            />
          )}
        </ThemeProvider>
      </I18nextProvider>
    </>
  );
};

export default App;
