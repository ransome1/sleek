// https://dev.to/xxczaki/how-to-make-your-electron-app-faster-4ifb
require('v8-compile-cache');
// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const documentIds = document.querySelectorAll("[id]");
documentIds.forEach(function(id,index) {
  window[id] = document.getElementById(id.getAttribute("id"));
});
const a = document.querySelectorAll("a");
let fileWatcher;
// ########################################################################################################################
// READ FROM CONFIG
// ########################################################################################################################
const config = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    dismissedNotifications: new Array,
    dismissedMessages: new Array,
    theme: null,
    matomoEvents: false,
    notifications: true,
    language: null,
    files: new Array,
    uid: null,
    filterDrawerWidth: "560px",
    useTextarea: false,
    filterDrawer: false
  }
});
let { width, height } = config.get("windowBounds");
if(config.get("dismissedNotifications")) {
  var dismissedNotifications = config.get("dismissedNotifications");
} else {
  var dismissedNotifications = new Array;
}
if(config.get("dismissedMessages")) {
  var dismissedMessages = config.get("dismissedMessages");
} else {
  var dismissedMessages = new Array;
}
if(config.get("matomoEvents")!=null) {
  var matomoEvents = config.get("matomoEvents");
} else {
  var matomoEvents = false;
}
if(config.get("filterDrawerWidth")) {
  let filterDrawerWidth = config.get("filterDrawerWidth");
  filterDrawer.setAttribute("style", "--resizeable-width: " + filterDrawerWidth);
}
if(config.get("notifications")!=null) {
  var notifications = config.get("notifications");
} else {
  var notifications = true;
}
if(config.get("showCompleted")!=null) {
  var showCompleted = config.get("showCompleted");
} else {
  var showCompleted = true;
}
if(config.get("selectedFilters")) {
  var selectedFilters = config.get("selectedFilters");
} else {
  var selectedFilters = new Array;
}
if(config.get("categoriesFiltered")) {
  var categoriesFiltered = config.get("categoriesFiltered");
} else {
  var categoriesFiltered = new Array;
}
let language = config.get("language");
if(config.get("files")) {
  var files = config.get("files");
  var file = files.filter(file => { return file[0]===1 });
  file = file[0][1];
} else {
  var files = new Array;
}
if(config.get("theme")) {
  var theme = config.get("theme");
} else {
  if(nativeTheme.shouldUseDarkColors) {
    var theme = "dark";
  } else {
    var theme = "light"
  }
}
if(config.get("useTextarea")) {
  var useTextarea = config.get("useTextarea");
} else {
  var useTextarea = false;
}
if(config.get("filterDrawer")) {
  showFilters(true);
} else {
  showFilters(false);
}
// ########################################################################################################################
// DEV CONFIG
// ########################################################################################################################
const is = electron_util.is;
if (is.development) {
  let matomoEvents = false;
  console.log("Path to user data: " + app.getPath("userData"));
}
if(config.get("uid")) {
  var uid = config.get("uid");
} else {
  // generate random number/string combination as user id and persist it
  var uid = Math.random().toString(36).slice(2);
  if(is.development) uid = "DEVELOPMENT"
  config.set("uid", uid);
}
// ########################################################################################################################
// LANGUAGE
// ########################################################################################################################
if (language) {
  i18next.language = language;
} else {
  i18next.use(i18nextBrowserLanguageDetector)
}
i18next
.use(i18nextBackend)
.init(i18nextOptions)
.then(function() {
  i18nextOptions.supportedLngs.forEach(function(languageCode) {
    // generate user friendly entries for language selection menu
    switch (languageCode) {
      case "de":
        var languageName = "Deutsch"
        break;
      case "en":
        var languageName = "English"
        break;
      case "it":
        var languageName = "Italiano"
        break;
      case "es":
        var languageName = "‎Español"
        break;
      case "fr":
        var languageName = "Français"
        break;
      default:
        return;
    }
    var option = document.createElement("option");
    option.text = languageName;
    option.value = languageCode;
    if(languageCode===language) option.selected = true;
    settingsLanguage.add(option);
  });
});
i18next.changeLanguage(language, (error, t) => {
  if (error) return console.log("Error in i18next.changeLanguage(): " + error);
});
settingsLanguage.onchange = function(){
  i18next.changeLanguage(this.value, error => {
    if(error) {
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Error", "changeLanguage()", error])
      return console.log(error);
    }
    config.set("language", this.value);
    ipcRenderer.send("synchronous-message", "restart");
  })
}
// ########################################################################################################################
// MODAL CONFIG
// ########################################################################################################################
const modal = document.querySelectorAll('.modal');
const modalCards = document.querySelectorAll('.modal-card');
const modalClose = document.querySelectorAll('.close');
const modalBackground = document.querySelectorAll('.modal-background');
const contentTabs = document.querySelectorAll('.modal.content ul li');
const contentTabsCards = document.querySelectorAll('.modal.content section');
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
const btnCreateTodoFile = document.querySelectorAll(".btnCreateTodoFile");
const btnChangeTodoFile = document.querySelectorAll(".btnChangeTodoFile");
const messages = document.querySelectorAll(".message");
// ########################################################################################################################
// MAIN MENU CONFIG
// ########################################################################################################################
const btnFilter = document.querySelectorAll(".btnFilter");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
// ########################################################################################################################
// DATEPICKER CONFIG
// ########################################################################################################################
const dueDatePicker = new Datepicker(dueDatePickerInput, {
  autohide: true,
  format: "yyyy-mm-dd",
  clearBtn: true,
  language: i18next.language
});
dueDatePickerInput.placeholder = i18next.t("formSelectDueDate");
// closes suggestion box on focus
dueDatePickerInput.onfocus = function () {
  suggestionContainer.classList.remove("is-active");
};
// Adjust Picker width according to length of input
dueDatePickerInput.setAttribute("size", i18next.t("formSelectDueDate").length)
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  let caretPosition = getCaretPosition(modalFormInput);
  //if(modalFormInput.value.substr(caretPosition-5, caretPosition-1).split(" ")[1] === "due:") modalFormInput.value = modalFormInput.value.replace("due:", "");
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
    todo.due = new Date(e.detail.date);
    todo.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    modalFormInput.value = todo.toString();
    // adjust size of inut
    dueDatePickerInput.setAttribute("size", dueDatePickerInput.value.length);
    // clean up as we don#t need it anymore
    todo = null;
    // if suggestion box was open, it needs to be closed
    suggestionContainer.classList.remove("is-active");
    suggestionContainer.blur();
    // if a due date is set, the recurrence picker will be shown
    recurrencePicker.classList.add("is-active");
    recurrencePickerInput.setAttribute("size", recurrencePickerInput.value.length);
    modalFormInput.focus();
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
  }
});
// ########################################################################################################################
// PREP FOR TABLE RENDERING
// ########################################################################################################################
let todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
let tableContainerDue = document.createDocumentFragment();
let tableContainerComplete = document.createDocumentFragment();
let tableContainerDueAndComplete = document.createDocumentFragment();
let tableContainerNoPriorityNotCompleted = document.createDocumentFragment();
let tableContainerContent = document.createDocumentFragment();
let todoTableBodyRowTemplate = document.createElement("div");
let todoTableBodyCellCheckboxTemplate  = document.createElement("div");
let todoTableBodyCellTextTemplate = document.createElement("a");
let tableContainerCategoriesTemplate = document.createElement("span");
let todoTableBodyCellMoreTemplate = document.createElement("div");
let todoTableBodyCellPriorityTemplate = document.createElement("div");
let todoTableBodyCellSpacerTemplate = document.createElement("div");
let todoTableBodyCellDueDateTemplate = document.createElement("span");
let todoTableBodyCellRecurrenceTemplate = document.createElement("span");
todoTableBodyRowTemplate.setAttribute("role", "rowgroup");
todoTableBodyRowTemplate.setAttribute("class", "flex-table");
todoTableBodyCellCheckboxTemplate.setAttribute("class", "flex-row checkbox");
todoTableBodyCellCheckboxTemplate.setAttribute("role", "cell");
todoTableBodyCellTextTemplate.setAttribute("class", "flex-row text");
todoTableBodyCellTextTemplate.setAttribute("role", "cell");
todoTableBodyCellTextTemplate.setAttribute("tabindex", 0);
todoTableBodyCellTextTemplate.setAttribute("href", "#");
todoTableBodyCellTextTemplate.setAttribute("title", i18next.t("editTodo"));
tableContainerCategoriesTemplate.setAttribute("class", "categories");
todoTableBodyCellPriorityTemplate.setAttribute("role", "cell");
todoTableBodyCellSpacerTemplate.setAttribute("role", "cell");
todoTableBodyCellDueDateTemplate.setAttribute("class", "flex-row itemDueDate");
todoTableBodyCellDueDateTemplate.setAttribute("role", "cell");
todoTableBodyCellRecurrenceTemplate.setAttribute("class", "flex-row recurrence");
todoTableBodyCellRecurrenceTemplate.setAttribute("role", "cell");
// ########################################################################################################################
// INITIAL CONFIGURATION
// ########################################################################################################################
toggleShowCompleted.checked = showCompleted;
toggleMatomoEvents.checked = matomoEvents;
toggleNotifications.checked = notifications;
navBtnHelp.firstElementChild.setAttribute("title", i18next.t("help"));
navBtnSettings.firstElementChild.setAttribute("title", i18next.t("settings"));
//recurrencePickerInput.setAttribute("size", i18next.t("noRecurrence").length)
const categories = ["contexts", "projects"];
const items = {
  raw: null,
  objects: new Array,
  objectsFiltered: new Array
}
const item = {
  previous: ""
}
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
// adjust input field
if(useTextarea) resizeInput("input");
// ########################################################################################################################
// TRANSLATIONS
// ########################################################################################################################
btnTheme.setAttribute("title", i18next.t("toggleDarkMode"));
btnSave.innerHTML = i18next.t("save");
todoTableSearch.placeholder = i18next.t("search");
filterToggleShowCompleted.innerHTML = i18next.t("completedTodos");
filterBtnResetFilters.innerHTML = i18next.t("resetFilters");
addTodoContainerHeadline.innerHTML = i18next.t("addTodoContainerHeadline");
addTodoContainerSubtitle.innerHTML = i18next.t("addTodoContainerSubtitle");
addTodoContainerButton.innerHTML = i18next.t("addTodo");
onboardingContainerSubtitle.innerHTML = i18next.t("onboardingContainerSubtitle");
onboardingContainerBtnOpen.innerHTML = i18next.t("openFile");
onboardingContainerBtnCreate.innerHTML = i18next.t("createFile");
noResultContainerHeadline.innerHTML = i18next.t("noResults");
noResultContainerSubtitle.innerHTML = i18next.t("noResultContainerSubtitle");
modalFormInput.placeholder = i18next.t("formTodoInputPlaceholder");
modalChangeFileTitle.innerHTML = i18next.t("selectFile");
modalChangeFileOpen.innerHTML = i18next.t("openFile");
modalChangeFileCreate.innerHTML = i18next.t("createFile");
selectionBtnShowFilters.innerHTML = i18next.t("toggleFilter");
welcomeToSleek.innerHTML = i18next.t("welcomeToSleek");
recurrencePickerEvery.innerHTML = i18next.t("every");
recurrencePickerDay.innerHTML = i18next.t("day");
recurrencePickerWeek.innerHTML = i18next.t("week");
recurrencePickerMonth.innerHTML = i18next.t("month");
recurrencePickerYear.innerHTML = i18next.t("year");
recurrencePickerNoRecurrence.innerHTML = i18next.t("noRecurrence");
messageLoggingTitle.innerHTML = i18next.t("errorEventLogging");
messageLoggingBody.innerHTML = i18next.t("messageLoggingBody");
messageLoggingButton.innerHTML = i18next.t("settings");
settingsTabSettings.innerHTML = i18next.t("settings");
settingsTabSettingsLanguage.innerHTML = i18next.t("language");
settingsTabSettingsLanguageBody.innerHTML = i18next.t("settingsTabSettingsLanguageBody");
settingsTabSettingsArchive.innerHTML = i18next.t("settingsTabSettingsArchive");
settingsTabSettingsArchiveBody.innerHTML = i18next.t("settingsTabSettingsArchiveBody");
settingsTabSettingsArchiveButton.innerHTML = i18next.t("archive");
settingsTabSettingsNotifications.innerHTML = i18next.t("notifications");
settingsTabSettingsNotificationsBody.innerHTML = i18next.t("settingsTabSettingsNotificationsBody");
settingsTabSettingsDarkmode.innerHTML = i18next.t("darkmode");
settingsTabSettingsDarkmodeBody.innerHTML = i18next.t("settingsTabSettingsDarkmodeBody");
settingsTabSettingsLogging.innerHTML = i18next.t("errorEventLogging");
settingsTabSettingsLoggingBody.innerHTML = i18next.t("settingsTabSettingsLoggingBody");
settingsTabAbout.innerHTML = i18next.t("about");
settingsTabAboutContribute.innerHTML = i18next.t("settingsTabAboutContribute");
settingsTabAboutContributeBody.innerHTML = i18next.t("settingsTabAboutContributeBody");
settingsTabAboutCopyrightLicense.innerHTML = i18next.t("settingsTabAboutCopyrightLicense");
settingsTabAboutCopyrightLicenseBody.innerHTML = i18next.t("settingsTabAboutCopyrightLicenseBody");
settingsTabAboutPrivacy.innerHTML = i18next.t("settingsTabAboutPrivacy");
settingsTabAboutPrivacyBody.innerHTML = i18next.t("settingsTabAboutPrivacyBody");
settingsTabAboutExternalLibraries.innerHTML = i18next.t("settingsTabAboutExternalLibraries");
helpTabKeyboardTitle.innerHTML = i18next.t("shortcuts");
helpTabPrioritiesTitle.innerHTML = i18next.t("helpTabPrioritiesTitle");
helpTabPrioritiesBody.innerHTML = i18next.t("helpTabPrioritiesBody");
helpTabContextsProjectsTitle.innerHTML = i18next.t("helpTabContextsProjectsTitle");
helpTabContextsProjectsBody.innerHTML = i18next.t("helpTabContextsProjectsBody");
helpTabDatesRecurrencesTitle1.innerHTML = i18next.t("helpTabDatesRecurrencesTitle1");
helpTabDatesRecurrencesBody1.innerHTML = i18next.t("helpTabDatesRecurrencesBody1");
helpTabDatesRecurrencesTitle2.innerHTML = i18next.t("helpTabDatesRecurrencesTitle2");
helpTabDatesRecurrencesBody2.innerHTML = i18next.t("helpTabDatesRecurrencesBody2");
helpTab1Title.innerHTML = i18next.t("shortcuts");
helpTab2Title.innerHTML = i18next.t("priorities");
helpTab3Title.innerHTML = i18next.t("helpTab3Title");
helpTab4Title.innerHTML = i18next.t("helpTab4Title");
helpTabKeyboardTR1TD1.innerHTML = i18next.t("addTodo");
helpTabKeyboardTR2TD1.innerHTML = i18next.t("findTodo");
helpTabKeyboardTR3TD1.innerHTML = i18next.t("toggleCompletedTodos");
helpTabKeyboardTR4TD1.innerHTML = i18next.t("toggleDarkMode");
helpTabKeyboardTR5TD1.innerHTML = i18next.t("openFile");
helpTabKeyboardTR6TD1.innerHTML = i18next.t("settings");
helpTabKeyboardTR1TH1.innerHTML = i18next.t("function");
// ########################################################################################################################
// ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
// ########################################################################################################################
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href === "#") el.preventDefault();
}));
navBtnHelp.onclick = function () {
  showContent(modalHelp);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}
navBtnSettings.onclick = function () {
  showContent(modalSettings);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}
btnMessageLogging.onclick = function () {
  showContent(modalSettings);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Message", "Click on Settings"]);
}
btnItemStatus.onclick = function() {
  completeTodo(this.parentElement.parentElement.parentElement.parentElement.getAttribute("data-item")).then(response => {
    modalForm.classList.remove("is-active");
    clearModal();
    console.log(response);
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);
  }).catch(error => {
    console.log(error);
  });
}
btnOpenTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("openFile"));
  el.onclick = function () {
    openFile();
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
  }
});
btnChangeTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("openFile"));
  el.onclick = function () {
    if(files.length > 0) {
      modalChooseFile();
    } else {
      openFile();
    }
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Choose file"]);
  }
});
btnCreateTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("createFile"));
  el.onclick = function () {
    createFile()
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Create file"]);
  }
});
btnModalCancel.forEach(function(el) {
  el.innerHTML = i18next.t("cancel");
  el.onclick = function() {
    el.parentElement.parentElement.parentElement.parentElement.classList.remove("is-active");
    clearModal();
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
  }
});
btnResetFilters.onclick = function() {
  resetFilters();
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
}
btnFilter.forEach(function(el) {
  el.setAttribute("title", i18next.t("toggleFilter"));
  el.onclick = function() {
    showFilters("toggle");
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
  };
});
btnAddTodo.forEach(function(el) {
  // title tag for hover
  el.setAttribute("title", i18next.t("addTodo"));
  el.onclick = function () {
    // just in case the form will be cleared first
    clearModal();
    showForm();
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
  }
});
btnTheme.onclick = function(el) {
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Theme"])
  setTheme(true);
}
btnArchiveTodos.onclick = function() {
  archiveTodos().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Archive"])
}
todoTable.onclick = function() { if(event.target.classList.contains("flex-table")) showMore(false) }
todoTableSearch.onfocus = function () {
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Search input field", "Focused"]);
};
todoTableSearch.addEventListener("input", function () {
  generateTodoData(this.value).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
});
toggleShowCompleted.onclick = function() {
  showCompletedTodos();
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Toggle completed todos"]);
}
toggleMatomoEvents.onclick = function() {
  matomoEvents = this.checked;
  config.set('matomoEvents', this.checked);
  matomoEventsConsent(this.checked).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Logging", this.checked])
}
toggleNotifications.onclick = function() {
  notifications = this.checked;
  config.set('notifications', this.checked);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Notifications", this.checked])
}
toggleDarkmode.onclick = function() {
  setTheme(true);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Dark mode", this.checked])
}
modalFormInputResize.onclick = function () {
  resizeInput(this.getAttribute("data-input-type"));
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Resize"]);
}
modalFormInput.onfocus = function () {
  suggestionContainer.classList.remove("is-active");
};
modalBackground.forEach(function(el) {
  el.onclick = function() {
    clearModal();
    el.parentElement.classList.remove("is-active");
    suggestionContainer.classList.remove("is-active");
    suggestionContainer.blur();
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Background"]);
  }
});
modalClose.forEach(function(el) {
  el.onclick = function() {
    if(el.getAttribute("data-message")) {
      // persist closed message, so it won't show again
      if(!dismissedMessages.includes(el.getAttribute("data-message"))) dismissedMessages.push(el.getAttribute("data-message"))
      config.set("dismissedMessages", dismissedMessages);
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Message", "Click on Close"]);
    } else {
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Close"]);
    }
    el.parentElement.parentElement.classList.remove("is-active");
  }
});
modalForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();
  submitForm().then(response => {
    // if form returns success we clear the modal
    clearModal();
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
});
modalFormInput.addEventListener("keyup", e => { modalFormInputEvents() });
filterColumnClose.onclick = function() {
  showFilters(false);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on close button"])
}
priorityPicker.addEventListener("change", e => { setPriority(e.target.value) });
// close suggestion box if focus comes to priority picker
priorityPicker.onfocus = function () {
  suggestionContainer.classList.remove("is-active");
};
// ########################################################################################################################
// KEYBOARD SHORTCUTS
// ########################################################################################################################
body.addEventListener ("keydown", function (e) {
  if(event.ctrlKey && event.shiftKey && event.key.length===1 && event.key.match(/[a-z]/i)) {
    e.preventDefault();
    var priority = event.key.substr(0,1);
    setPriorityInput(priority);
    setPriority(priority);
  } else if(event.ctrlKey && event.shiftKey && event.key.length===1 && event.key.match(/[_]/i)) {
    var priority = null;
    setPriorityInput(priority);
    setPriority(priority);
  }
});
modalForm.addEventListener ("keydown", function (e) {
  if(event.key === 'Escape') {
    clearModal();
    this.classList.remove("is-active");
    suggestionContainer.classList.remove("is-active");
    suggestionContainer.blur();
  }
});
modalForm.addEventListener ("click", function () {
  // close recurrence picker if click is outside of recurrence container
  if(!event.target.closest("#recurrencePickerContainer") && event.target!=recurrencePickerInput) recurrencePickerContainer.classList.remove("is-active")
});
modalHelp.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
modalChangeFile.addEventListener ("keydown", function () {
  if(event.key === 'Escape') clearModal();
});
modalSettings.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
suggestionContainer.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
filterDrawer.addEventListener ("keydown", function () {
  if(event.key === 'Escape') showFilters(false);
});
// ########################################################################################################################
// THEME CONFIG
// ########################################################################################################################
function setTheme(switchTheme) {
  if(switchTheme) {
    switch (theme) {
      case "dark":
        theme = "light";
        break;
      case "light":
        theme = "dark";
        break;
      default:
        theme = "light";
        break;
    }
    config.set("theme", theme);
  }
  switch (theme) {
    case "light":
      toggleDarkmode.checked = false;
      themeLink.href = "";
      break;
    case "dark":
      toggleDarkmode.checked = true;
      themeLink.href = path.join(__dirname, "css/" + theme + ".css");
      break;
  }
}
// ########################################################################################################################
// RECURRENT TODOS
// ########################################################################################################################
function splitRecurrence(recurrence) {
  let mul = 1;
  let period = recurrence;
  if(recurrence !== undefined &&
     recurrence.length > 1) {
    mul = Number(recurrence.substr(0, recurrence.length - 1));
    period = recurrence.substr(-1);
  }
  return {
    mul: mul,
    period: period,
    toString: function() {
      return this.mul == 1 || this.period === undefined ?
        this.period : this.mul + this.period;
    }
  };
}
function getRecurrenceDate(due, recurrence) {
  let recSplit = splitRecurrence(recurrence);
  let days = 0;
  switch (recSplit.period) {
    case "d":
      days = 1;
      break;
    case "w":
      days = 7;
      break;
    case "m":
      days = 30;
      break;
    case "y":
      days = 365;
      break;
  }
  var due = due.getTime();
  due += 1000 * 60 * 60 * 24 * recSplit.mul * days;
  return new Date(due);
}
function setRecurrenceInput(recurrence) {
  let recSplit = splitRecurrence(recurrence);
  let label = i18next.t("noRecurrence");
  if(recSplit.period !== undefined) {
    if(recSplit.mul > 1) {
      switch (recSplit.period) {
        case "d":
          label = i18next.t("day",
            {count: recSplit.mul});
          break;
        case "w":
          label = i18next.t("week",
            {count: recSplit.mul});
          break;
        case "m":
          label = i18next.t("month",
            {count: recSplit.mul});
          break;
        case "y":
          label = i18next.t("year",
            {count: recSplit.mul});
          break;
      }
      label = i18next.t("every") + " " + recSplit.mul + " " + label;
    } else {
      switch (recSplit.period) {
        case "d":
          label = i18next.t("daily");
          break;
        case "w":
          label = i18next.t("weekly");
          break;
        case "m":
          label = i18next.t("monthly");
          break;
        case "y":
          label = i18next.t("yearly");
          break;
      }
    }
  }
  recurrencePickerInput.value = label;
  recurrencePickerInput.setAttribute("size", label.length)
}
function setRecurrenceOptionLabels(mul) {
  recurrencePickerDay.innerHTML = i18next.t("day", {count: mul});
  recurrencePickerWeek.innerHTML = i18next.t("week", {count: mul});
  recurrencePickerMonth.innerHTML = i18next.t("month", {count: mul});
  recurrencePickerYear.innerHTML = i18next.t("year", {count: mul});
}
function showRecurrenceOptions(el) {
  recurrencePickerContainer.focus();
  recurrencePickerContainer.classList.toggle("is-active");
  // get object from current input
  let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
  let recSplit = splitRecurrence(todo.rec);
  setRecurrenceOptionLabels(recSplit.mul);
  recurrencePickerSpinner.value = recSplit.mul;
  // function to apply recurrence's value on changes
  let applyRecurrenceValue = function() {
    let value = recSplit.toString();
    if(value !== undefined) {
      todo.rec = value;
      todo.recString = value;
    } else {
      // clear RecExtension
      todo.rec = undefined;
      todo.recString = undefined;
    }
    setRecurrenceInput(value);
    modalFormInput.value = todo.toString();
  }
  recurrencePickerSpinner.onchange = function() {
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  recurrencePickerIncrease.onclick = function(el) {
    el.preventDefault();
    recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value) + 1;
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  recurrencePickerDecrease.onclick = function(el) {
    el.preventDefault();
  	if (parseInt(recurrencePickerSpinner.value) > 1) {
  	  recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value) - 1;
      recSplit.mul = Number(recurrencePickerSpinner.value);
      setRecurrenceOptionLabels(recSplit.mul);
      applyRecurrenceValue();
    }
  }
  radioRecurrence.forEach(function(el) {
    // remove old selection
    el.checked = false;
    // set pre selection
    if(recSplit.period === el.value) el.checked = true;
    el.onclick = function() {
      recSplit.period = el.value;
      applyRecurrenceValue();
      // hide the picker
      recurrencePickerContainer.classList.remove("is-active");
      modalFormInput.focus();
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Modal", "Recurrence selected: " + recSplit.period]);
    }
  });
}
function createRecurringTodo(todo) {
  try {
    let recurringItem = Object.assign({}, todo);
    recurringItem.date = todo.due;
    recurringItem.due = getRecurrenceDate(todo.due, todo.rec);
    recurringItem.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
    // get index of recurring todo
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(recurringItem.toString());
    // only add recurring todo if it is not already in the list
    if(index===-1) {
      items.objects.push(recurringItem);
      tableContainerDue.appendChild(createTableRow(recurringItem));
      writeTodoToFile(recurringItem.toString());
      return Promise.resolve("Success: Recurring todo created and written into file: " + recurringItem);
    } else {
      return Promise.resolve("Info: Recurring todo already in file, won't write anything");
    }
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "createRecurringTodo()", error])
    return Promise.reject("Error in createRecurringTodo(): " + error);
  }
}
const radioRecurrence = document.querySelectorAll("#recurrencePicker .selection");
recurrencePickerInput.placeholder = i18next.t("noRecurrence");
recurrencePickerInput.onfocus = function(el) { showRecurrenceOptions(el) };
// ########################################################################################################################
// DATE FUNCTIONS
// ########################################################################################################################
function convertDate(date) {
  //https://stackoverflow.com/a/6040556
  let day = ("0" + (date.getDate())).slice(-2)
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let year = date.getFullYear();
  return year + "-" + month + "-" + day;
};
Date.prototype.isToday = function () {
  const today = new Date()
  return this.getDate() === today.getDate() &&
  this.getMonth() === today.getMonth() &&
  this.getFullYear() === today.getFullYear();
};
Date.prototype.isTomorrow = function () {
  const today = new Date()
  return this.getDate() === today.getDate()+1 &&
  this.getMonth() === today.getMonth() &&
  this.getFullYear() === today.getFullYear();
};
Date.prototype.isPast = function () {
  const today = new Date();
  if (this.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
    return true;
  }
  return false;
};
// ########################################################################################################################
// FILE FUNCTIONS
// ########################################################################################################################
function parseDataFromFile() {
  // we only start if file exists
  if (fs.existsSync(file)) {
    try {
      // read fresh data from file
      items.raw = fs.readFileSync(file, {encoding: 'utf-8'}, function(err,data) { return data; });
      items.objects = TodoTxt.parse(items.raw, [ new DueExtension(), new RecExtension() ]);
      // TODO: Reuse these later
      items.complete = items.objects.filter(function(item) { return item.complete === true });
      items.incomplete = items.objects.filter(function(item) { return item.complete === false });
      // remove empty objects like from empty lines in file
      items.objects = items.objects.filter(function(item) { return item.toString() != "" });
      if(items.objects.length>0) {
        // if settings modal is open and archiving has been completed (will trigger this function) the buttons needs to be disabled until another completed todo is added
        setButtonState("btnArchiveTodos");
        // if there is a file onboarding is hidden
        showOnboarding(false);
        t0 = performance.now();
        generateTodoData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Table rendered in", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
        navBtnFilter.classList.add("is-active");
        return Promise.resolve("Success: Data has been extracted from file and parsed to todo.txt items");
      } else {
        // if there is a file onboarding is hidden
        showOnboarding(false);
        // clean up filters if there were any before
        todoFilters.innerHTML = "";
        // hide/show the addTodoContainer
        addTodoContainer.classList.add("is-active");
        // hide the table
        todoTable.classList.remove("is-active");
        // if file is actually empty we don't need the filter drawer
        navBtnFilter.classList.remove("is-active");
        return Promise.resolve("Info: File is empty, nothing will be built");
      }
    } catch(error) {
      showOnboarding(true);
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Error", "parseDataFromFile()", error])
      return Promise.reject("Error in parseDataFromFile(): " + error);
    }
  } else {
    showOnboarding(true);
    return Promise.resolve("Info: File does not exist or has not been defined yet");
  }
}
function createFile() {
  dialog.showSaveDialog({
    title: i18next.t("windowTitleCreateFile"),
    defaultPath: path.join(app.getPath('home')),
    buttonLabel: i18next.t("windowButtonCreateFile"),
    // Restricting selection to text files only
    filters: [
      {
        name: i18next.t("windowFileformat"),
        extensions: ["txt"]
      }
    ],
    properties: ["openFile", "createDirectory"]
  }).then(file => {
    fs.writeFile(file.filePath, "", function (error) {
      if (!file.canceled) {
        console.log("Success: New todo.txt file created: " + file.filePath);
        // updating files array and set this item to default
        changeFile(file.filePath).then(response => {
          // if file was changed successfully the data is parsed again
          // start file watcher
          startFileWatcher().then(response => {
            clearModal();
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }).catch(error => {
    console.log("Error: " + error)
  });
}
function openFile() {
  // Resolves to a Promise<Object>
  dialog.showOpenDialog({
    title: i18next.t("selectFile"),
    defaultPath: path.join(app.getPath("home")),
    buttonLabel: i18next.t("windowButtonOpenFile"),
    // Restricting the user to only Text Files.
    filters: [
        {
            name: i18next.t("windowFileformat"),
            extensions: ["txt"]
        },
    ],
    properties: ["openFile"]
  }).then(file => {
    // Stating whether dialog operation was cancelled or not.
    if (!file.canceled) {
      file = file.filePaths[0].toString();
      console.log("Success: Storage file updated by new path and filename: " + file);
      // updating files array and set this item to default
      changeFile(file).then(response => {
        // if file was changed successfully the data is parsed again
        // start file watcher
        startFileWatcher().then(response => {
          clearModal();
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
  }).catch(err => {
      console.log("Error: " + err)
  });
}
function startFileWatcher() {
  try {
    if (fs.existsSync(file)) {
      if(fileWatcher) fileWatcher.close();
      fileWatcher = fs.watch(file, (event, filename) => {
        parseDataFromFile(file).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      });
      parseDataFromFile(file).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      return Promise.resolve("Success: File watcher is watching: " + file);
    } else {
      return Promise.reject("Info: File watcher did not start as file was not found at: " + file);
    }
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "startFileWatcher()", error])
    return Promise.reject("Error in startFileWatcher(): " + error);
  }
}
function changeFile(path) {
  try {
    removeFileFromHistory(path);
    // remove "active" (1) setting from all files
    files.forEach(function(file) {
      file[0] = 0;
      if(file[1]===path) {
        file[0] = 1;
      }
    });
    if(!files.includes(path)) files.push([1, path]);
    file = path;
    config.set("files", files);
    resetFilters();
    return Promise.resolve("Success: File changed to: " + path);
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "changeFile()", error])
    return Promise.reject("Error in changeFile(): " + error);
  }
}
function modalChooseFile() {
  modalChangeFile.classList.add("is-active");
  modalChangeFile.focus();
  modalChangeFileTable.innerHTML = "";
  for (let file in files) {
    // skip if file doesn't exist
    if(!fs.existsSync(files[file][1])) continue;
    var table = modalChangeFileTable;
    table.classList.add("files");
    var row = table.insertRow(0);
    row.setAttribute("data-path", files[file][1]);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    if(files[file][0]===1) {
      cell1.innerHTML = "<button class=\"button\" disabled>" + i18next.t("selected") + "</button>";
    } else {
      cell1.innerHTML = "<button class=\"button is-link\">" + i18next.t("select") + "</button>";
      cell1.onclick = function() {
        // set the new path variable and change the array
        changeFile(this.parentElement.getAttribute("data-path")).then(response => {
          // if file was changed successfully the data is parsed again
          // start file watcher
          startFileWatcher().then(response => {
            clearModal();
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
        // trigger matomo event
        if(matomoEvents) _paq.push(["trackEvent", "File", "Click on select button"]);
      }
      cell3.innerHTML = "<i class=\"fas fa-minus-circle\"></i>";
      cell3.title = i18next.t("delete");
      cell3.onclick = function() {
        removeFileFromHistory(this.parentElement.getAttribute("data-path")).then(response => {
          // after array is updated, open the modal again
          modalChooseFile();
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    }
    cell2.innerHTML = files[file][1];
  }
}
function removeFileFromHistory(path) {
  try {
    files = files.filter(function(file) {
      return file[1] != path;
    });
    config.set("files", files);
    return Promise.resolve("Success: File removed from history: " + path);
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "removeFileFromHistory()", error])
    return Promise.reject("Error in removeFileFromHistory(): " + error);
  }
}
// ########################################################################################################################
// FILTER FUNCTIONS
// ########################################################################################################################
function showFilters(variable) {
  switch(variable) {
    case true:
      navBtnFilter.classList.add("is-highlighted");
      filterDrawer.classList.add("is-active");
      filterDrawer.focus();
      filterColumnClose.classList.add("is-active");
    break;
    case false:
      navBtnFilter.classList.remove("is-highlighted");
      filterDrawer.classList.remove("is-active");
      filterDrawer.blur();
      filterColumnClose.classList.remove("is-active");
    break;
    case "toggle":
      navBtnFilter.classList.toggle("is-highlighted");
      filterDrawer.classList.toggle("is-active");
      filterDrawer.focus();
      filterColumnClose.classList.toggle("is-active");
    break;
  }
  // persist filter drawer state
  if(filterDrawer.classList.contains("is-active")) {
    config.set("filterDrawer", true);
  } else {
    config.set("filterDrawer", false);
  }
  // if more toggle is open we close it as user doesn't need it anymore
  showMore(false);
}
function generateFilterData(typeAheadCategory, typeAheadValue, typeAheadPrefix, caretPosition) {
  try {
    // container to fill with categories
    let container;
    // is this a typeahead request? Default is false
    // which category or categories to loop through and build
    let categoriesToBuild = [];
    if(typeAheadPrefix) {
      container = suggestionContainer;
      categoriesToBuild.push(typeAheadCategory);
      // for the suggestion container, so all filters will be shown
      items.objectsFiltered = items.objects;
    } else {
      container = todoFilters;
      categoriesToBuild = categories;
    }
    // empty the container to prevent duplicates
    container.innerHTML = "";
    // parse through above defined categories, most likely contexts and projects
    categoriesToBuild.forEach((category) => {
      // array to collect all the available filters in the data
      let filters = new Array();
      // run the array and collect all possible filters, duplicates included
      items.objectsFiltered.forEach((item) => {
        // check if the object has values in either the project or contexts field
        if(item[category]) {
          // push all filters found so far into an array
          for (let filter in item[category]) {
            // if user has not opted for showComplete we skip the filter of this particular item
            if(showCompleted==false && item.complete==true) {
              continue;
            } else {
              filters.push([item[category][filter]]);
            }
          }
        }
      });
      // search within filters according to typeAheadValue
      if(typeAheadPrefix) {
        filters = filters.filter(function (el) { return el.toString().toLowerCase().includes(typeAheadValue.toLowerCase()); });
      }
      // delete duplicates and count filters
      filtersCounted = filters.join(',').split(',').reduce(function (filters, filter) {
        if (filter in filters) {
          filters[filter]++;
        } else {
          filters[filter] = 1;
        }
        if(filters!=null) {
          return filters;
        }
      }, {});
      // remove duplicates from available filters
      // https://wsvincent.com/javascript-remove-duplicates-array/
      filters = [...new Set(filters.join(",").split(","))];
      // check if selected filters is still part of all available filters
      selectedFilters.forEach(function(selectedFilter,index,object){
        if(selectedFilter[1]==category) {
          // category found, but the selected filter is not part of available filters
          if(!filters.includes(selectedFilter[0])) {
            // delete persisted filters
            selectedFilters.splice(index, 1);
            // persist the change
            config.set("selectedFilters", JSON.stringify(selectedFilters));
          }
        }
      });
      // sort filter alphanummerically (https://stackoverflow.com/a/54427214)
      filtersCounted = Object.fromEntries(
        Object.entries(filtersCounted).sort(new Intl.Collator('en',{numeric:true, sensitivity:'accent'}).compare)
      );
      // build the filter buttons
      if(filters[0]!="") {
        buildFilterButtons(category, typeAheadValue, typeAheadPrefix, caretPosition).then(response => {
          container.appendChild(response);
        }).catch (error => {
          console.log(error);
        });
      } else {
        suggestionContainer.classList.remove("is-active");
        suggestionContainer.blur();
        console.log("Info: No " + category + " found in todo.txt data, so no filters will be generated");
      }
    });
    return Promise.resolve("Success: All filters have been generated and built");
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "generateFilterData()", error])
    return Promise.reject("Error in generateFilterData(): " + error);
  }
}
function buildFilterButtons(category, typeAheadValue, typeAheadPrefix, caretPosition) {
  try {
    // creates a div for the specific filter section
    let todoFiltersSub = document.createElement("div");
    todoFiltersSub.setAttribute("class", "dropdown-item " + category);
    todoFiltersSub.setAttribute("tabindex", 0);
    // translate headline
    if(category=="contexts") {
      var headline = i18next.t("contexts");
    } else if(category=="projects"){
      var headline = i18next.t("projects");
    }
    if(typeAheadPrefix==undefined) {
      // create a sub headline element
      let todoFilterHeadline = document.createElement("a");
      todoFilterHeadline.setAttribute("class", "headline " + category);
      todoFilterHeadline.setAttribute("tabindex", -1);
      todoFilterHeadline.setAttribute("href", "#");
      todoFilterHeadline.setAttribute("data-headline", headline);
      todoFilterHeadline.innerHTML = "<a href=\"#\" class=\"far fa-eye-slash\" tabindex=\"0\"></a>&nbsp;" + headline;
      // TODO clean up the mess
      todoFilterHeadline.addEventListener("click", () => {
        // TODO clean up. this is a duplicate, see above
        if(categoriesFiltered.includes(category)) {
          // we remove the category from the array
          categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
          //persist the category filters
          config.set("categoriesFiltered", categoriesFiltered);
          // we remove the greyed out look from the container
          todoFiltersSub.classList.remove("is-greyed-out");
          // change the eye icon
          todoFilterHeadline.innerHTML = "<a href=\"#\" class=\"far fa-eye-slash\" tabindex=\"0\"></a>&nbsp;" + todoFilterHeadline.getAttribute("data-headline");
        } else {
          // we push the category to the filter array
          categoriesFiltered.push(category);
          // make sure there are no duplicates
          // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
          categoriesFiltered.filter(function(item) {
            let seen = {};
            let k = JSON.stringify(item);
            return seen.hasOwnProperty(k) ? false : (seen[k] = true);
          })
          //persist the category filters
          config.set("categoriesFiltered", categoriesFiltered);
          // we add the greyed out look to the container
          todoFiltersSub.classList.add("is-greyed-out");
          // change the eye icon
          todoFilterHeadline.innerHTML = "<i class=\"far fa-eye\"></i>&nbsp;" + todoFilterHeadline.getAttribute("data-headline");
        }
        t0 = performance.now();
        generateTodoData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Table rendered in:", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
        // trigger matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on headline", category])
      });
      // TODO clean up. this is a duplicate, see above
      if(categoriesFiltered.includes(category)) {
        todoFiltersSub.classList.add("is-greyed-out");
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye\"></i></a>&nbsp;" + headline;
      } else {
        todoFiltersSub.classList.remove("is-greyed-out");
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye-slash\"></i></a>&nbsp;" + headline;
      }
      // add the headline before category container
      todoFiltersSub.appendChild(todoFilterHeadline);
    } else {
      // show suggestion box
      suggestionContainer.classList.add("is-active");
      suggestionContainer.focus();
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 title headline " + category);
      // no need for tab index if the headline is in suggestion box
      if(typeAheadPrefix==undefined) todoFilterHeadline.setAttribute("tabindex", 0);
      todoFilterHeadline.innerHTML = headline;
      // add the headline before category container
      todoFiltersSub.appendChild(todoFilterHeadline);
    }
    // build one button each
    for (let filter in filtersCounted) {
      // skip this loop if no filters are present
      if(!filter) continue;
      let todoFiltersItem = document.createElement("a");
      todoFiltersItem.setAttribute("class", "btnApplyFilter button");
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      if(typeAheadPrefix==undefined) { todoFiltersItem.setAttribute("tabindex", 0) } else { todoFiltersItem.setAttribute("tabindex", 305) }
      todoFiltersItem.setAttribute("href", "#");
      todoFiltersItem.innerHTML = filter;
      if(typeAheadPrefix==undefined) {
        todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">" + filtersCounted[filter] + "</span>";
        // create the event listener for filter selection by user
        todoFiltersItem.addEventListener("click", () => {
          // set highlighting
          todoFiltersItem.classList.toggle("is-dark");
          // if no filters are selected, add a first one
          if (selectedFilters.length > 0) {
            // get the index of the item that matches the data values the button click provided
            let index = selectedFilters.findIndex(item => JSON.stringify(item) === JSON.stringify([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]));
            if(index != -1) {
              // remove the item at the index where it matched
              selectedFilters.splice(index, 1);
            } else {
              // if the item is not already in the array, push it into
              selectedFilters.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
            }
          } else {
            // this is the first push
            selectedFilters.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
          }
          // convert the collected filters to JSON and save it to store.js
          config.set("selectedFilters", JSON.stringify(selectedFilters));
          if(categoriesFiltered) {
            // remove any setting that hides the category of the selected filters
            if(categoriesFiltered.indexOf(category)>=0) categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
            //persist the category filters
            config.set("categoriesFiltered", categoriesFiltered);
          }
          t0 = performance.now();
          generateTodoData().then(response => {
            console.log(response);
            t1 = performance.now();
            console.log("Table rendered in:", t1 - t0, "ms");
          }).catch(error => {
            console.log(error);
          });
          // trigger matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
        });
      // suggestion container
      } else {
        // add filter to input
        todoFiltersItem.addEventListener("click", () => {
          // remove composed filter first, as it is going to be replaced with a filter from suggestion box
          if(typeAheadValue) {
            // only if input is not only the prefix, otherwise all existing prefixes will be removed
            modalFormInput.value = modalFormInput.value.replace(" " + typeAheadPrefix+typeAheadValue, "");
            // add filter from suggestion box
            modalFormInput.value += " " + typeAheadPrefix+todoFiltersItem.getAttribute('data-filter');
          } else {
            // add button data value to the exact caret position
            modalFormInput.value = [modalFormInput.value.slice(0, caretPosition), todoFiltersItem.getAttribute('data-filter'), modalFormInput.value.slice(caretPosition)].join('') + " ";
          }
          //
          suggestionContainer.classList.remove("is-active");
          suggestionContainer.blur();
          // put focus back into input so user can continue writing
          modalFormInput.focus();
          // trigger matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", category]);
        });
      }
      // after building the buttons we check if they appear in the saved filters, if so we add the highlighting
      // TODO: do this in the first loop where buttons are built
      selectedFilters.forEach(function(item) {
        if(JSON.stringify(item) === '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
      });
      todoFiltersSub.appendChild(todoFiltersItem);
    }
    // add filters to the specific filter container
    //todoFilters.appendChild(todoFiltersSub);
    return Promise.resolve(todoFiltersSub);
    //return Promise.resolve("Success: Filter buttons for category " + category + " have been build");
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "buildFilterButtons()", error])
    return Promise.reject("Error in buildFilterButtons(): " + error);
  }
}
function resetFilters() {
  selectedFilters = [];
  categoriesFiltered = new Array;
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  config.set("selectedFilters", new Array);
  // clear filtered categories
  config.set("categoriesFiltered", new Array);
  // clear search input
  todoTableSearch.value = null;
  t0 = performance.now();
  generateTodoData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Table rendered in:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
}
// ########################################################################################################################
// TODO FUNCTIONS
// ########################################################################################################################
function generateTodoData(searchString) {
  try {
    // if set: remove all completed todos
    if(showCompleted==false) {
      items.objectsFiltered = items.incomplete;
    } else {
      items.objectsFiltered = items.objects;
    }
    // if there are selected filters
    if(selectedFilters.length > 0) {
      // we iterate through the filters in the order they got selected
      selectedFilters.forEach(filter => {
        // check if the filter is a project filter
        if(filter[1]=="projects") {
          items.objectsFiltered = items.objectsFiltered.filter(function(item) {
            if(item.projects) return item.projects.includes(filter[0]);
          });
        // check if the filter is a context filter
        } else if(filter[1]=="contexts") {
          items.objectsFiltered = items.objectsFiltered.filter(function(item) {
            if(item.contexts) return item.contexts.includes(filter[0]);
          });
        }
      });
    }
    // filters are generated once the final todos are defined
    t0 = performance.now();
    generateFilterData().then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Filters rendered:", t1 - t0, "ms");
    }).catch(error => {
      console.log(error);
    });
    // exclude all filters of a category if set
    if(categoriesFiltered.length > 0) {
      categoriesFiltered.forEach(category => {
        // we create a new array where the items attrbite has no values
        items.objectsFiltered = items.objectsFiltered.filter(function(item) {
          return item[category] === null;
        });
      });
    }
    // if search input is detected
    if(searchString || todoTableSearch.value) {
      if(todoTableSearch.value) searchString = todoTableSearch.value;
      // convert everything to lowercase for better search results
      items.objectsFiltered = items.objectsFiltered.filter(function(item) {
        // if no match (-1) the item is skipped
        if(item.toString().toLowerCase().indexOf(searchString.toLowerCase()) === -1) return false;
        return item;
      });
    }
    // fill result stat container, if it is necessary
    showResultStats();
    // empty the table containers before reading fresh data
    todoTableContainer.innerHTML = "";
    tableContainerDue.innerHTML = "";
    tableContainerComplete.innerHTML = "";
    tableContainerDueAndComplete.innerHTML = "";
    tableContainerNoPriorityNotCompleted.innerHTML = "";
    // hide/show the addTodoContainer or noResultTodoContainer
    if(items.objectsFiltered.length > 0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
    } else {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.add("is-active");
      return Promise.resolve("Info: No results to search input or filter selection");
    }
    // produce an object where priority a to z + null is key
    items.objectsFiltered = items.objectsFiltered.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});
    // object is converted to a sorted array
    items.objectsFiltered = Object.entries(items.objectsFiltered).sort();
    // each priority group -> A to Z plus null for all todos with no priority
    for (let priority in items.objectsFiltered) {
      // nodes need to be created to add them to the outer fragment
      // this creates a divider row for the priorities
      if(items.objectsFiltered[priority][0]!="null") tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table priority\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\">" + items.objectsFiltered[priority][0] + "</div></div>"))
      // sort items according to todo.txt logic
      // second start dates
      items.objectsFiltered[priority][1].sort(function(a, b) {
        return b.date - a.date;
      });
      // first due dates
      items.objectsFiltered[priority][1].sort(function(a, b) {
        return a.due - b.due;
      });
      // TODO: that's ugly, refine this
      for (let item in items.objectsFiltered[priority][1]) {
        let todo = items.objectsFiltered[priority][1][item];
        if(!todo.text) continue;
        // if this todo is not a recurring one the rec value will be set to null
        if(!todo.rec) {
          todo.rec = null;
        // if item is due today or in the past and has recurrence it will be duplicated
        } else if(todo.due && todo.rec && !todo.complete && (todo.due.isToday() || todo.due.isPast())) {
          createRecurringTodo(todo).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
        }
        // for each sorted group within a priority group an array is created
        // incompleted todos with due date
        if (todo.due && !todo.complete) {
          // create notification
          if(todo.due.isToday()) {
            showNotification(todo, 0).then(response => {
              console.log(response);
            }).catch(error => {
              console.log(error);
            });
          } else if(todo.due.isTomorrow()) {
            showNotification(todo, 1).then(response => {
              console.log(response);
            }).catch(error => {
              console.log(error);
            });
          }
          tableContainerDue.appendChild(createTableRow(todo));
        // incompleted todos with no due date
        } else if(!todo.due && !todo.complete) {
          tableContainerNoPriorityNotCompleted.appendChild(createTableRow(todo));
        // completed todos with due date
        } else if(todo.due && todo.complete) {
          tableContainerDueAndComplete.appendChild(createTableRow(todo));
        // completed todos with no due date
        } else if(!todo.due && todo.complete) {
          tableContainerComplete.appendChild(createTableRow(todo));
        }
      }
      // append items to priority group
      tableContainerContent.appendChild(tableContainerDue);
      tableContainerContent.appendChild(tableContainerNoPriorityNotCompleted);
      tableContainerContent.appendChild(tableContainerDueAndComplete);
      tableContainerContent.appendChild(tableContainerComplete);
    }
    // append all generated groups to the main container
    todoTableContainer.appendChild(tableContainerContent);
    // jump to previously edited or added item
    if (document.getElementById("previousItem")) {
      // only scroll if new item is not in view
      if(!inView(document.getElementById("previousItem"))) {
        // scroll to view
        document.getElementById("previousItem").scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        // trigger a quick background ease in and out
        document.getElementById("previousItem").classList.add("is-highlighted");
        setTimeout(() => {
          document.getElementById("previousItem").classList.remove("is-highlighted");
          // after scrolling the marker will be removed
          document.getElementById("previousItem").removeAttribute("id");
        }, 1000);
      }
    }
    return Promise.resolve("Success: Todo data generated and table built");
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "generateTodoData()", error])
    return Promise.reject("Error in generateTodoData(): " + error);
  }
}
function writeTodoToFile(todo) {
  // stop filewatcher to avoid loops
  if(fileWatcher) fileWatcher.close();
  //append todo as string to file in a new line
  fs.open(file, 'a', 666, function(error, id) {
    if(error) {
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Error", "fs.open()", error])
      return "Error in fs.open(): " + error;
    }
    fs.write(id, "\n"+todo, null, 'utf8', function() {
      fs.close(id, function() {
        // only start the file watcher again after new todo has been appended
        startFileWatcher().then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
        console.log("Success: Recurring todo written to file: " + todo);
      });
    });
  });
}
function archiveTodos() {
  try {
    // if user archives within done.txt file, operating is canceled
    if(file.split("/").pop() === "done.txt") return Promise.reject("Info: Current file seems to be a done.txt file, won't archive")
    // define path to done.txt
    let doneFile = path.dirname(file) + "/done.txt";
    // if done.txt exists, data will be appended
    if (fs.existsSync(doneFile)) {
      // read existing done.txt
      let doneTxtContent = fs.readFileSync(doneFile, {encoding: 'utf-8'}, function(err,data) { return data; }).split("\n");
      // only consider completed todo that are not already present in done.txt
      doneTxtContent.forEach(itemComplete => {
        items.complete = items.complete.filter(function(item) { return item.toString() != itemComplete.toString() });
      });
      //
      if(items.complete.length>0) {
        fs.appendFile(doneFile, "\n" + items.complete.join("\n").toString(), error => {
          if (error) return Promise.reject("Error in appendFile(): " + error)
        });
      }
    // if done.txt does not exist, file will be created and filled with data
    } else {
      fs.writeFileSync(doneFile, items.complete.join("\n").toString(), {encoding: 'utf-8'});
    }
    // write incomplete only todos to file
    fs.writeFileSync(file, items.incomplete.join("\n").toString(), {encoding: 'utf-8'});

    if(items.complete.length===0) return Promise.resolve("Info: No completed todos found, nothing will be archived")
    return Promise.resolve("Success: Completed todo moved to: " + doneFile)
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "archiveTodos()", error])
    return Promise.reject("Error in archiveTodos(): " + error)
  }
}
function createTableRow(todo) {
  try {
    let todoTableBodyRow = todoTableBodyRowTemplate.cloneNode(true);
    let todoTableBodyCellCheckbox = todoTableBodyCellCheckboxTemplate.cloneNode(true);
    let todoTableBodyCellText = todoTableBodyCellTextTemplate.cloneNode(true);
    let tableContainerCategories = tableContainerCategoriesTemplate.cloneNode(true);
    let todoTableBodyCellMore = todoTableBodyCellMoreTemplate.cloneNode(true);
    let todoTableBodyCellPriority = todoTableBodyCellPriorityTemplate.cloneNode(true);
    let todoTableBodyCellSpacer = todoTableBodyCellSpacerTemplate.cloneNode(true);
    let todoTableBodyCellDueDate = todoTableBodyCellDueDateTemplate.cloneNode(true);
    let todoTableBodyCellRecurrence = todoTableBodyCellRecurrenceTemplate.cloneNode(true);
    // if new item was saved, row is being marked
    if(todo.toString()==item.previous) {
      todoTableBodyRow.setAttribute("id", "previousItem");
      item.previous = null;
    }
    // start with the individual config of the items
    if(todo.complete==true) {
      todoTableBodyRow.setAttribute("class", "flex-table completed");
    }
    todoTableBodyRow.setAttribute("data-item", todo.toString());
    // add the priority marker or a white spacer
    if(todo.priority) {
      todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + todo.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else {
      todoTableBodyCellSpacer.setAttribute("class", "flex-row spacer");
      todoTableBodyRow.appendChild(todoTableBodyCellSpacer);
    }
    // add the checkbox
    if(todo.complete==true) {
      i18next.t("resetFilters")
      todoTableBodyCellCheckbox.setAttribute("title", i18next.t("inProgress"));
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"fas fa-check-circle\"></i></a>";
    } else {
      todoTableBodyCellCheckbox.setAttribute("title", i18next.t("done"));
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"far fa-circle\"></i></a>";
    }
    // add a listener on the checkbox to call the completeItem function
    todoTableBodyCellCheckbox.onclick = function() {
      // passing the data-item attribute of the parent tag to complete function
      completeTodo(this.parentElement.getAttribute('data-item')).then(response => {
        modalForm.classList.remove("is-active");
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Checkbox"]);
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(todo.text) {
      // use the autoLink lib to attach an icon to every link and put a link on it
      todoTableBodyCellText.innerHTML =  todo.text.autoLink({
        callback: function(url) {
          return url + " <a href=" + url + " target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a>";
        }
      });
    }
    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, showForm(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        showForm(this.parentElement.getAttribute('data-item'));
        // trigger matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on todo"]);
      }
    }
    // cell for the categories
    categories.forEach(category => {
      if(todo[category]) {
        todo[category].forEach(el => {
          let todoTableBodyCellCategory = document.createElement("span");
          todoTableBodyCellCategory.setAttribute("class", "tag " + category);
          todoTableBodyCellCategory.innerHTML = el;
          tableContainerCategories.appendChild(todoTableBodyCellCategory);
        });
      }
    });
    // add the text cell to the row
    todoTableBodyCellText.appendChild(tableContainerCategories);
    // check for and add a given due date
    if(todo.due) {
      var tag = convertDate(todo.due);
      if(todo.due.isToday()) {
        todoTableBodyCellDueDate.classList.add("isToday");
        tag = i18next.t("dueToday");
      } else if(todo.due.isTomorrow()) {
        todoTableBodyCellDueDate.classList.add("isTomorrow");
        tag = i18next.t("dueTomorrow");
      } else if(todo.due.isPast()) {
        todoTableBodyCellDueDate.classList.add("isPast");
      }
      todoTableBodyCellDueDate.innerHTML = "<i class=\"far fa-clock\"></i><div class=\"tags has-addons\"><span class=\"tag\">" + i18next.t("dueAt") + "</span><span class=\"tag is-dark\">" + tag + "</span></div><i class=\"fas fa-sort-down\"></i>";
      // append the due date to the text item
      todoTableBodyCellText.appendChild(todoTableBodyCellDueDate);
    }
    // add recurrence icon
    if(todo.rec) {
      todoTableBodyCellRecurrence.innerHTML = "<i class=\"fas fa-redo\"></i>";
      // append the due date to the text item
      todoTableBodyCellText.appendChild(todoTableBodyCellRecurrence);
    }
    // add the text cell to the row
    todoTableBodyRow.appendChild(todoTableBodyCellText);
    // add the more dots
    todoTableBodyCellMore.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMore.setAttribute("role", "cell");
    todoTableBodyCellMore.innerHTML = "<div class=\"dropdown is-right\"><div class=\"dropdown-trigger\"><a href=\"#\"><i class=\"fas fa-ellipsis-v\"></i></a></div><div class=\"dropdown-menu\" role=\"menu\"><div class=\"dropdown-content\"><a class=\"dropdown-item\">" + i18next.t("useAsTemplate") + "</a><a href=\"#\" class=\"dropdown-item\">" + i18next.t("edit") + "</a><a class=\"dropdown-item\">" + i18next.t("delete") + "</a></div></div></div>";
    // click on three-dots-icon to open more menu
    todoTableBodyCellMore.firstElementChild.firstElementChild.onclick = function() {
      // only if this element was highlighted before, we will hide instead of show the dropdown
      if(this.parentElement.parentElement.classList.contains("is-active")) {
        this.parentElement.parentElement.classList.remove("is-active");
      } else {
        // on click we close all other active more buttons and dropdowns
        document.querySelectorAll(".todoTableItemMore.is-active").forEach(function(item) {
          item.classList.remove("is-active");
        });
        // if this element was hidden before, we will show it now
        this.parentElement.parentElement.classList.add("is-active");
        // trigger matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on More"]);
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[1].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'));
          // trigger matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Edit"]);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[2].onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          deleteTodo(todoTableBodyRow.getAttribute('data-item')).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          // trigger matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Delete"]);
        }
        // click on use as template option
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[0].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'), true);
          // trigger matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Use as template"]);
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "createTableRow()", error])
    return Promise.reject("Error in createTableRow(): " + error);
  }
}
function completeTodo(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
    // get index of todo
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // mark item as in progress
    if(todo.complete) {
      // if item was already completed we set complete to false and the date to null
      todo.complete = false;
      todo.completed = null;
      // delete old item from array and add the new one at it's position
      items.objects.splice(index, 1, todo);
    // Mark item as complete
    } else if(!todo.complete) {
      if(todo.due) {
        var date = convertDate(todo.due);
        // if set to complete it will be removed from persisted notifcations
        // the one set for today
        dismissedNotifications = dismissedNotifications.filter(e => e !== md5(date + todo.text)+0);
        // the one set for tomorrow
        dismissedNotifications = dismissedNotifications.filter(e => e !== md5(date + todo.text)+1);
        config.set("dismissedNotifications", dismissedNotifications);
      }
      todo.complete = true;
      todo.completed = new Date();
      // delete old todo from array and add the new one at it's position
      items.objects.splice(index, 1, todo);
    }
    //write the data to the file
    fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    return Promise.resolve("Success: Changes written to file: " + file);
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "completeTodo()", error])
    return Promise.reject("Error in completeTodo(): " + error);
  }
}
function deleteTodo(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
    // get index of todo
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // Delete item
    if(todo.due) {
      var date = convertDate(todo.due);
      // if deleted it will be removed from persisted notifcations
      // the one set for today
      dismissedNotifications = dismissedNotifications.filter(e => e !== md5(date + todo.text)+0);
      // the one set for tomorrow
      dismissedNotifications = dismissedNotifications.filter(e => e !== md5(date + todo.text)+1);
      config.set("dismissedNotifications", dismissedNotifications);
    }
    items.objects.splice(index, 1);
    //write the data to the file
    fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    return Promise.resolve("Success: Changes written to file: " + file);
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "deleteTodo()", error])
    return Promise.reject("Error in deleteTodo(): " + error);
  }
}
function submitForm() {
  try {
    // check if there is an input in the text field, otherwise indicate it to the user
    // input value and data item are the same, nothing has changed, nothing will be written
    if (modalForm.getAttribute("data-item")===modalForm.elements[0].value) {
      return Promise.resolve("Info: Nothing has changed, won't write anything.");
    // Edit todo
    } else if(modalForm.getAttribute("data-item")!=null) {
      // get index of todo
      const index = items.objects.map(function(item) {return item.toString(); }).indexOf(modalForm.getAttribute("data-item"));
      // create a todo.txt object
      // replace new lines with spaces (https://stackoverflow.com/a/34936253)
      let todo = new TodoTxtItem(modalForm.elements[0].value.replace(/[\r\n]+/g," "), [ new DueExtension(), new RecExtension() ]);
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = i18next.t("formInfoDuplicate");
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo already exists in file, won't write duplicate");
      }
      // jump to index, remove 1 item there and add the value from the input at that position
      items.objects.splice(index, 1, todo);
    // Add todo
    } else if(modalForm.getAttribute("data-item")==null && modalForm.elements[0].value!="") {
      // in case there hasn't been a passed data item, we just push the input value as a new item into the array
      // replace new lines with spaces (https://stackoverflow.com/a/34936253)
      let todo = new TodoTxtItem(modalForm.elements[0].value.replace(/[\r\n]+/g," "), [ new DueExtension(), new RecExtension() ]);
      // we add the current date to the start date attribute of the todo.txt object
      todo.date = new Date();
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = i18next.t("formInfoDuplicate");
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo already exists in file, won't write duplicate");
      }
      // we build the array
      items.objects.push(todo);
      // mark the todo for anchor jump after next reload
      item.previous = todo.toString();
    } else if(modalForm.elements[0].value=="") {
      modalFormAlert.innerHTML = i18next.t("formInfoNoInput");
      modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
      modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
      return Promise.reject("Info: Will not write empty todo");
    }
    //write the data to the file
    fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Submit"]);
    // save the previously saved item.current for further use
    //
    return Promise.resolve("Success: Changes written to file: " + file);
  // if the input field is empty, let users know
  } catch (error) {
    // if writing into file is denied throw alert
    modalFormAlert.innerHTML = i18next.t("formErrorWritingFile") + file;
    modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "submitForm()", error])
    return Promise.reject("Error in submitForm(): " + error);
  }
}
function showCompletedTodos() {
  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  toggleShowCompleted.checked = showCompleted;
  // persist the sorting
  config.set("showCompleted", showCompleted);
  t0 = performance.now();
  generateTodoData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Table rendered in:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
}
function showForm(todo, templated) {
  try {
      // clean up the form before doing anything
      clearModal();
      // in case a content window was open, it will be closed
      modal.forEach(function(el) {
        el.classList.remove("is-active");
      });
      // in case the more toggle menu is open we close it
      showMore(false);
      // clear the input value in case there was an old one
      modalFormInput.value = null;
      modalForm.classList.toggle("is-active");
      // clean up the alert box first
      modalFormAlert.innerHTML = null;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
      // here we configure the headline and the footer buttons
      if(todo) {
        // we need to check if there already is a due date in the object
        todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
        // set the priority
        setPriorityInput(todo.priority);
        //
        if(templated === true) {
          // this is a new templated todo task
          // erase the original creation date and description
          todo.date = null;
          todo.text = "____________";
          modalFormInput.value = todo;
          modalTitle.innerHTML = i18next.t("addTodo");
          // automatically select the placeholder description
          let selectStart = modalFormInput.value.indexOf(todo.text);
          let selectEnd = selectStart + todo.text.length;
          modalFormInput.setSelectionRange(selectStart, selectEnd);
          btnItemStatus.classList.remove("is-active");
        } else {
          // this is an existing todo task to be edited
          // put the initially passed todo to the modal data field
          modalForm.setAttribute("data-item", todo.toString());
          modalFormInput.value = todo;
          modalTitle.innerHTML = i18next.t("editTodo");
          btnItemStatus.classList.add("is-active");
        }
        //btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(todo.complete === false) {
          btnItemStatus.innerHTML = i18next.t("done");
        } else {
          btnItemStatus.innerHTML = i18next.t("inProgress");
        }
        // if there is a recurrence
        if(todo.rec) setRecurrenceInput(todo.rec)
        // if so we paste it into the input field
        if(todo.dueString) {
          dueDatePickerInput.value = todo.dueString;
          dueDatePickerInput.setAttribute("size", dueDatePickerInput.value.length);
          // only show the recurrence picker when a due date is set
          recurrencePicker.classList.add("is-active");
          recurrencePickerInput.setAttribute("size", recurrencePickerInput.value.length);
        } else {
          // hide the recurrence picker when a due date is not set
          recurrencePicker.classList.remove("is-active");
          // if not we clean it up
          dueDatePicker.setDate({
            clear: true
          });
          dueDatePickerInput.value = null;
        }
      } else {
        // hide the recurrence picker when a due date is not set
        recurrencePicker.classList.remove("is-active");
        // if not we clean it up
        dueDatePicker.setDate({
          clear: true
        });
        dueDatePickerInput.value = null;
        modalTitle.innerHTML = i18next.t("addTodo");
        btnItemStatus.classList.remove("is-active");
      }
      // in any case put focus into the input field
      modalFormInput.focus();
      // if textarea, resize to content length
      if(modalFormInput.tagName==="TEXTAREA") {
        modalFormInput.style.height="auto";
        modalFormInput.style.height= modalFormInput.scrollHeight+"px";
      }
      positionSuggestionContainer();
  } catch (error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "showForm()", error])
    console.log(error);
  }
}
function showResultStats() {
  // we show some information on filters if any are set
  if(items.objectsFiltered.length!=items.objects.length) {
    resultStats.classList.add("is-active");
    resultStats.firstElementChild.innerHTML = i18next.t("visibleTodos") + "&nbsp;<strong>" + items.objectsFiltered.length + " </strong> " + i18next.t("of") + " <strong>" + items.objects.length + "</strong>";
  } else {
    resultStats.classList.remove("is-active");
  }
}
function setPriorityInput(priority) {
  if(priority===null) {
    priorityPicker.selectedIndex = 0;
    //priorityPicker.setAttribute("size", i18next.t("formSelectDueDate").length);
  } else {
    Array.from(priorityPicker.options).forEach(function(option) {
      if(option.value===priority) {
        priorityPicker.selectedIndex = option.index;
        //priorityPicker.setAttribute("size", 2);
      }
    });
  }
}
function setPriority(priority) {
  if(priority) {
    priority = priority.toUpperCase();
  } else {
    priority = null;
  }
  todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
  todo.priority = priority;
  modalFormInput.value = todo.toString();
}
// ########################################################################################################################
// HELPER FUNCTIONS
// ########################################################################################################################
function inView(element) {
    var box = element.getBoundingClientRect();
    return inViewBox(box);
}
function inViewBox(box) {
    return ((box.bottom < 0) || (box.top > getWindowSize().h)) ? false : true;
}
function getWindowSize() {
    return { w: document.body.offsetWidth || document.documentElement.offsetWidth || window.innerWidth, h: document.body.offsetHeight || document.documentElement.offsetHeight || window.innerHeight}
}
function getCaretPosition(inputId) {
  var content = inputId;
  if((content.selectionStart!=null)&&(content.selectionStart!=undefined)){
    var position = content.selectionStart;
    return position;
  } else {
    return false;
  }
}
function matomoEventsConsent(setting) {
  try {
    // only continue if app is connected to the internet
    if(!navigator.onLine) return Promise.resolve("Info: App is offline, Matomo will not be loaded");
    var _paq = window._paq = window._paq || [];
    // exclude development machine
    if(is.development || uid==="DEVELOPMENT") return Promise.resolve("Info: Machine is development machine, logging will be skipped")
    _paq.push(['setUserId', uid]);
    _paq.push(['setCustomDimension', 1, theme]);
    _paq.push(['setCustomDimension', 2, language]);
    _paq.push(['setCustomDimension', 3, notifications]);
    _paq.push(['setCustomDimension', 4, matomoEvents]);
    _paq.push(['setCustomDimension', 5, app.getVersion()]);
    _paq.push(['setCustomDimension', 6, width+"x"+height]);
    _paq.push(['setCustomDimension', 7, showCompleted]);
    _paq.push(['setCustomDimension', 8, files.length]);
    _paq.push(['setCustomDimension', 9, useTextarea]);
    _paq.push(['requireConsent']);
    _paq.push(['setConsentGiven']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['trackVisibleContentImpressions']);
    (function() {
      var u="https://www.robbfolio.de/matomo/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '3']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
    if(matomoEvents) {
      // user has given consent to process their data
      return Promise.resolve("Info: Consent given, Matomo error and event logging enabled");
    } else {
      // revoke matomoEvents consent
      _paq.push(['forgetConsentGiven']);
      return Promise.resolve("Info: No consent given, Matomo error and event logging disabled");
    }
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "matomoEventsConsent()", error])
    return Promise.reject("Error in matomoEventsConsent(): " + error);
  }
}
function showNotification(todo, offset) {
  try {
    // abort if user didn't permit notifications within sleek
    if(!notifications) return Promise.reject("Info: Notification surpressed (turned off in sleek's settings)");
    // check for necessary permissions
    return navigator.permissions.query({name: 'notifications'}).then(function(result) {
      // abort if user didn't permit notifications
      if(result.state!="granted") return Promise.reject("Info: Notification surpressed (not permitted by OS)");
      // add the offset so a notification shown today with "due tomorrow", will be shown again tomorrow but with "due today"
      const hash = md5(todo.due.toISOString().slice(0, 10) + todo.text) + offset;
      switch (offset) {
        case 0:
          title = "due today";
          break;
        case 1:
          title = "due tomorrow";
          break;
      }
      // if notification already has been triggered once it will be discarded
      if(dismissedNotifications.includes(hash)) return Promise.resolve("Info: Notification skipped (has already been sent)");
      // set options for notifcation
      const newNotification = new notification({
        title: title,
        body: todo.text,
        silent: false,
        icon: path.join(__dirname, '../assets/icons/icon.png'),
        hasReply: false,
        timeoutType: 'never',
        urgency: 'critical',
        closeButtonText: 'Close',
        actions: [ {
          type: 'button',
          text: 'Show Button'
        }]
      });
      // send it to UI
      newNotification.show();
      // once shown, it will be persisted as hash to it won't be shown a second time
      dismissedNotifications.push(hash);
      config.set("dismissedNotifications", dismissedNotifications);
      // click on button in notification
      newNotification.addListener('click', () => {
        // trigger matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Notification", "Click on notification"]);
        app.focus();
        // if another modal was open it needs to be closed first
        clearModal();
        //load modal
        showForm(todo.toString());
      },{
        // remove event listener after it is clicked once
        once: true
      });
      // trigger matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Notification", "Shown"]);
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    // trigger matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Error", "showNotification()", error])
    return Promise.reject("Error in showNotification(): " + error);
  }
}
function showMore(variable) {
  if(variable) {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.add("is-active")
    });
  } else {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.remove("is-active")
    });
  }
};
function clearModal() {
  // reset priority setting
  priorityPicker.selectedIndex = 0;
  // if recurrence picker was open it is now being closed
  recurrencePickerContainer.classList.remove("is-active");
  // if file chooser was open it is now being closed
  modalChangeFile.classList.remove("is-active");
  // hide suggestion box if it was open
  suggestionContainer.classList.remove("is-active");
  suggestionContainer.blur();
  // defines when the composed filter is being filled with content and when it is emptied
  let startComposing = false;
  // in case a category will be selected from suggestion box we need to remove the category from input value that has been written already
  let typeAheadValue = "";
  // + or @
  let typeAheadPrefix = "";
  modalForm.classList.remove("is-active");
  modalForm.blur();
  // remove the data item as we don't need it anymore
  modalForm.removeAttribute("data-item");
  // clean up the modal
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
  // clear the content in the input field as it's not needed anymore
  modalFormInput.value = null;
  // clear previous recurrence selection
  recurrencePickerInput.value = null;
  // close datepicker
  dueDatePicker.hide();
}
function checkDismissedMessages() {
  messages.forEach((message) => {
    if(dismissedMessages.includes(message.getAttribute("data"))) {
      message.classList.remove("is-active");
    } else {
      message.classList.add("is-active");
    }
  });
}
function setButtonState(button) {
  switch (button) {
    case "btnArchiveTodos":
      if(items.complete.length>0) {
        btnArchiveTodos.disabled = false;
      } else {
        btnArchiveTodos.disabled = true;
      }
      break;
    default:
  }
}
function modalFormInputEvents() {
  // if textarea, resize to content length
  if(modalFormInput.tagName==="TEXTAREA") {
    modalFormInput.style.height="auto";
    modalFormInput.style.height= modalFormInput.scrollHeight+"px";
  }
  let typeAheadValue ="";
  let typeAheadPrefix = "";
  let caretPosition = getCaretPosition(modalFormInput);
  let typeAheadCategory = "";
  // if datepicker was visible it will be hidden with every new input
  if((modalFormInput.value.charAt(caretPosition-2) === " " || modalFormInput.value.charAt(caretPosition-2) === "\n") && (modalFormInput.value.charAt(caretPosition-1) === "@" || modalFormInput.value.charAt(caretPosition-1) === "+")) {
    typeAheadValue = modalFormInput.value.substr(caretPosition, modalFormInput.value.lastIndexOf(" ")).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(caretPosition-1);
  } else if(modalFormInput.value.charAt(caretPosition) === " ") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+2).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+1);
  } else if(modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "@" || modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "+") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition)+2).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1);
  } else {
    suggestionContainer.classList.remove("is-active");
    suggestionContainer.blur();
    return false;
  }
  // suppress suggestion box if caret is at the end of word
  if(typeAheadPrefix) {
    if(typeAheadPrefix=="+") {
      typeAheadCategory = "projects";
    } else if(typeAheadPrefix=="@") {
      typeAheadCategory = "contexts";
    }
    // parsed data will be passed to generate filter data and build the filter buttons
    t0 = performance.now();
    generateFilterData(typeAheadCategory, typeAheadValue, typeAheadPrefix, caretPosition).then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Filters rendered:", t1 - t0, "ms");
    }).catch (error => {
      console.log(error);
    });
  } else {
    suggestionContainer.classList.remove("is-active");
    suggestionContainer.blur();
  }
  positionSuggestionContainer();
}
function positionSuggestionContainer() {
  // Adjust position of suggestion box to input field
  let modalFormInputPosition = modalFormInput.getBoundingClientRect();
  suggestionContainer.style.width = modalFormInput.offsetWidth + "px";
  suggestionContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
  suggestionContainer.style.left = modalFormInputPosition.left + "px";
}
function resizeInput(type) {
  switch (type) {
    case "input":
      var d = document.createElement('textarea');
      modalFormInputResize.setAttribute("data-input-type", "textarea");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-compress-alt\"></i>";
      // persist setting
      config.set("useTextarea", true);
      break;
    case "textarea":
      var d = document.createElement('input');
      d.type = "text";
      modalFormInputResize.setAttribute("data-input-type", "input");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-expand-alt\"></i>";
      // persist setting
      config.set("useTextarea", false);
      break;
    default:
      modalFormInputResize.setAttribute("data-input-type", "input");
  }
  d.id = "modalFormInput";
  d.setAttribute("tabindex", 300);
  d.setAttribute("class", "input is-medium");
  d.value = modalFormInput.value;
  modalFormInput.parentNode.replaceChild(d, modalFormInput);
  // if input is a textarea, adjust height to content length
  if(modalFormInput.tagName==="TEXTAREA") {
    modalFormInput.style.height="auto";
    modalFormInput.style.height= modalFormInput.scrollHeight+"px";
  }
  positionSuggestionContainer();
  modalFormInput.addEventListener("keyup", e => { modalFormInputEvents() });
  modalFormInput.focus();
}
// ########################################################################################################################
// CONTENT FUNCTIONS
// ########################################################################################################################
function showContent(section) {
  // in case a content window was open, it will be closed
  modal.forEach(function(el) {
    el.classList.remove("is-active");
  });
  contentTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  contentTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  let firstTab = section.querySelector(".tabs");
  firstTab.firstElementChild.firstElementChild.classList.add("is-active");
  let firstSection = section.querySelector("section");
  firstSection.classList.add("is-active");
  section.classList.add("is-active");
  section.focus();
}
function showTab(tab) {
  contentTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  document.getElementById(tab).classList.add("is-active");
}
function showOnboarding(variable) {
  if(variable) {
    console.log("Info: Starting onboarding");
    onboardingContainer.classList.add("is-active");
    btnAddTodo.forEach(item => item.classList.add("is-hidden"));
    navBtnFilter.classList.add("is-hidden");
    todoTable.classList.remove("is-active");
  } else {
    console.log("Info: Ending onboarding");
    onboardingContainer.classList.remove("is-active");
    btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
    navBtnFilter.classList.remove("is-hidden");
    todoTable.classList.add("is-active");
  }
}
contentTabs.forEach(el => el.addEventListener("click", function(el) {
  contentTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
  // trigger matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
}));
// ########################################################################################################################
// WINDOW
// ########################################################################################################################
window.onload = function () {
  // only start if a file has been selected
  if(file) {
    console.log("Info: Path to file: " + file);
    // start file watcher
    startFileWatcher().then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  } else {
    console.log("Info: File does not exist or has not been defined yet");
    // show onboarding if no file has been selected
    showOnboarding(true);
  }
  // On app load only call matomo function if opt in is set
  matomoEventsConsent().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // set theme
  setTheme();
  // TODO: not generic
  // only show message to users, that haven't enabled matomo yet
  if(!matomoEvents) checkDismissedMessages()
}
window.onresize = function() {
  let width = this.outerWidth;
  let height = this.outerHeight;
  config.set('windowBounds', { width, height });
  // Adjust position of suggestion box to input field
  let modalFormInputPosition = modalFormInput.getBoundingClientRect();
  suggestionContainer.style.width = modalFormInput.offsetWidth + "px";
  suggestionContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
  suggestionContainer.style.left = modalFormInputPosition.left + "px";
}
// ########################################################################################################################
// RESIZEABLE FILTER DRAWER
// https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
// ########################################################################################################################
const getResizeableElement = () => { return document.getElementById("filterDrawer"); };
const getHandleElement = () => { return document.getElementById("handle"); };
const minPaneSize = 400;
const maxPaneSize = document.body.clientWidth * .75
const setPaneWidth = (width) => {
  getResizeableElement().style
    .setProperty("--resizeable-width", `${width}px`);
  config.set("filterDrawerWidth", `${width}px`);
};
const getPaneWidth = () => {
  const pxWidth = getComputedStyle(getResizeableElement())
    .getPropertyValue("--resizeable-width");
  return parseInt(pxWidth, 10);
};
const startDragging = (event) => {
  event.preventDefault();
  const host = getResizeableElement();
  const startingPaneWidth = getPaneWidth();
  const xOffset = event.pageX;
  const mouseDragHandler = (moveEvent) => {
    moveEvent.preventDefault();
    const primaryButtonPressed = moveEvent.buttons === 1;
    if (!primaryButtonPressed) {
      setPaneWidth(Math.min(Math.max(getPaneWidth(), minPaneSize), maxPaneSize));
      document.body.removeEventListener("pointermove", mouseDragHandler);
      return;
    }
    const paneOriginAdjustment = "left" === "right" ? 1 : -1;
    setPaneWidth((xOffset - moveEvent.pageX ) * paneOriginAdjustment + startingPaneWidth);
  };
  const remove = document.body.addEventListener("pointermove", mouseDragHandler);
};
getResizeableElement().style.setProperty("--max-width", `${maxPaneSize}px`);
getResizeableElement().style.setProperty("--min-width", `${minPaneSize}px`);
getHandleElement().addEventListener("mousedown", startDragging);
