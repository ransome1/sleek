// ########################################################################################################################
// READ FROM STORAGE
// ########################################################################################################################
const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    closedNotifications: new Array,
    pathToFile: "",
    theme: "",
    matomoEvents: false,
    notifications: true,
    language: null
  }
});
let closedNotifications = store.get("closedNotifications");
let matomoEvents = store.get("matomoEvents");
let notifications = store.get("notifications");
let showCompleted = store.get("showCompleted");
let pathToFile = store.get("pathToFile");
let selectedFilters = store.get("selectedFilters");
let categoriesFiltered = store.get("categoriesFiltered");
let language = store.get("language");
// ########################################################################################################################
// LANGUAGE
// ########################################################################################################################
if (language) {
  i18next.language = language;
} else {
  i18next
    .use(i18nextBrowserLanguageDetector)
}
// using Promises
i18next
.use(i18nextBackend)
.init(i18nextOptions)
.then(function() {
  i18nextOptions.supportedLngs.forEach(function(languageCode) {
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
i18next.changeLanguage(language, (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  //t('key'); // -> same as i18next.t
});
settingsLanguage.onchange = function(){
  i18next.changeLanguage(this.value, error => {
    if(error) return console.log(error);
    store.set("language", this.value);
    ipcRenderer.send("synchronous-message", "restart");
  })
}
// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const documentIds = document.querySelectorAll("[id]");
documentIds.forEach(function(id,index) {
  window[id] = document.getElementById(id.getAttribute("id"));
});
const head = document.getElementsByTagName("head")[0];
const btnApplyFilter = document.querySelectorAll(".btnApplyFilter");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const a = document.querySelectorAll("a");
let checkPathForFile;
let fileWatcher;
let filterContainer = document.getElementById("todoFilters");
// ########################################################################################################################
// MODAL CONFIG
// ########################################################################################################################
const modal = document.querySelectorAll('.modal');
const modalCards = document.querySelectorAll('.modal-card');
const modalClose = document.querySelectorAll('.modal-close');
const contentTabs = document.querySelectorAll('.modal.content ul li');
const contentTabsCards = document.querySelectorAll('.modal.content section');
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const modalBackground = document.querySelectorAll('.modal-background');
// ########################################################################################################################
// MAIN MENU CONFIG
// ########################################################################################################################
const btnTheme = document.querySelectorAll('.btnTheme');
const btnFilter = document.querySelectorAll(".btnFilter");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
// ########################################################################################################################
// DATEPICKER CONFIG
// ########################################################################################################################
const dueDatePickerInput = document.getElementById("dueDatePickerInput");
const dueDatePicker = new Datepicker(dueDatePickerInput, {
  autohide: true,
  format: "yyyy-mm-dd",
  clearBtn: true
});
// ########################################################################################################################
// PREP FOR THE TABLE RENDERING
// ########################################################################################################################
const todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
let todoTableContainer = document.getElementById("todoTableContainer");
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
// ########################################################################################################################
// INITIAL CONFIGURATION
// ########################################################################################################################
dueDatePickerInput.readOnly = true;
toggleShowCompleted.checked = showCompleted;
toggleMatomoEvents.checked = matomoEvents;
toggleNotifications.checked = notifications;
//navBtnHelp.setAttribute("title") = i18next.t("help");
navBtnHelp.firstElementChild.setAttribute("title", i18next.t("help"));
navBtnSettings.firstElementChild.setAttribute("title", i18next.t("settings"));
const categories = ["contexts", "projects"];
const items = {
  unfiltered: new Array,
  filtered: new Array,
  strings: null,
  grouped: new Array
}
const item = {
  id: null,
  current: null,
  previous: ""
}
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
// ########################################################################################################################
// DEV CONFIG
// ########################################################################################################################
const is = electron_util.is;
if (is.development) {
  matomoEvents = false;
  console.log("Path to user data: " + app.getPath("userData"));
}
// ########################################################################################################################
// TRANSLATIONS
// ########################################################################################################################
todoTableSearch.placeholder = i18next.t("search");
filterToggleShowCompleted.innerHTML = i18next.t("completedTodos");
filterBtnResetFilters.innerHTML = i18next.t("resetFilters");
selectionBtnShowFilters.innerHTML = i18next.t("toggleFilter");
dueDatePickerInput.placeholder = i18next.t("formSelectDueDate");
btnSave.innerHTML = i18next.t("save");
addTodoContainerHeadline.innerHTML = i18next.t("addTodoContainerHeadline");
addTodoContainerSubtitle.innerHTML = i18next.t("addTodoContainerSubtitle");
addTodoContainerButton.innerHTML = i18next.t("addTodo");
welcomeToSleek.innerHTML = i18next.t("welcomeToSleek");
onboardingContainerSubtitle.innerHTML = i18next.t("onboardingContainerSubtitle");
onboardingContainerBtnOpen.innerHTML = i18next.t("onboardingContainerBtnOpen");
onboardingContainerBtnCreate.innerHTML = i18next.t("onboardingContainerBtnCreate");
modalFileOverwrite.innerHTML = i18next.t("modalFileOverwrite");
modalFileChoose.innerHTML = i18next.t("modalFileChoose");
modalFileHeadline.innerHTML = i18next.t("modalFileHeadline");
modalFileContent.innerHTML = i18next.t("modalFileContent");
modalFormInput.placeholder = i18next.t("formTodoInputPlaceholder");
noResultContainerHeadline.innerHTML = i18next.t("noResults");
noResultContainerSubtitle.innerHTML = i18next.t("noResultContainerSubtitle");
// ########################################################################################################################
// ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
// ########################################################################################################################
navBtnHelp.onclick = function () {
  showContent(modalHelp);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}
navBtnSettings.onclick = function () {
  showContent(modalSettings);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}
btnCreateTodoFile.onclick = function () { createFile(true, false) }
btnItemStatus.onclick = function() {
  completeTodo(item.current).then(response => {
    modalForm.classList.remove("is-active");
    clearModal();
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);
}
modalFileChoose.onclick = function() { createFile(true, false) }
modalFileOverwrite.onclick = function() { createFile(false, true) }
todoTable.onclick = function() { if(event.target.classList.contains("flex-table")) showMore(false) }
toggleShowCompleted.onclick = function() {
  showCompletedTodos();
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Toggle completed todos"]);
}
toggleMatomoEvents.onclick = function() {
  matomoEvents = this.checked;
  store.set('matomoEvents', this.checked);
  matomoEventsConsent().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Content", "Click on Setting matomoEvents", this.checked])
}
toggleNotifications.onclick = function() {
  notifications = this.checked;
  store.set('notifications', this.checked);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Content", "Click on Setting Notifications", this.checked])
}
toggleDarkmode.onclick = function() {
  setTheme(true);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Content", "Click on Setting Dark mode", this.checked])
}
filterColumnClose.onclick = function() {
  showFilters(false);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on close button"])
}
modalFormInputHelp.onclick = function () {
  showContent(modalHelp);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Help"]);
}
modalFormInput.onfocus = function () {
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Todo input field", "Focused"]);
};
todoTableSearch.onfocus = function () {
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Search input field", "Focused"]);
};
btnTheme.forEach(function(el) {
  el.setAttribute("title", i18next.t("toggleDarkMode"));
  el.addEventListener("click", function(el) {
    setTheme(true);
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Theme"])
  });
});
modalBackground.forEach(function(el) {
  el.onclick = function() {
    //clearModal();
    el.parentElement.classList.remove("is-active");
    suggestionContainer.classList.remove("is-active");
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Background"]);
  }
});
modalClose.forEach(function(el) {
  el.onclick = function() {
    //clearModal();
    el.parentElement.parentElement.classList.remove("is-active");
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Close"]);
  }
});
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href === "#") el.preventDefault();
}));
btnOpenTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("openFile"));
  el.onclick = function () {
    openFile();
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
  }
});
btnModalCancel.forEach(function(el) {
  el.innerHTML = i18next.t("cancel");
  el.onclick = function() {
    clearModal();
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
  }
});
btnResetFilters.forEach(el => el.onclick = function() {
  resetFilters();
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
});
btnFilter.forEach(function(el) {
  el.setAttribute("title", i18next.t("toggleFilter"));
  el.onclick = function() {
    showFilters("toggle");
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
  };
});
btnAddTodo.forEach(function(el) {
  // title tag for hover
  el.setAttribute("title", i18next.t("addTodo"));
  el.onclick = function () {
    // just in case the form will be cleared first
    clearModal();
    showForm(true);
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
  }
});
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  let caretPosition = getCaretPosition(modalFormInput);
  if(modalFormInput.value.substr(caretPosition-5, caretPosition-1).split(" ")[1] === "due:") modalFormInput.value = modalFormInput.value.replace("due:", "");
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    item.currentTemp = new TodoTxtItem(modalFormInput.value, [ new DueExtension() ]);
    item.currentTemp.due = new Date(e.detail.date);
    item.currentTemp.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    modalFormInput.value = item.currentTemp.toString();
    // clean up as we don#t need it anymore
    item.currentTemp = null;
    // if suggestion box was open, it needs to be closed
    suggestionContainer.classList.remove("is-active");
    modalFormInput.focus();
    // matomo event
    if(matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
  }
});
todoTableSearch.addEventListener("input", function () {
  generateTodoData(this.value);
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
modalFormInput.addEventListener("keyup", e => {
  let typeAheadValue ="";
  let typeAheadPrefix = "";
  let caretPosition = getCaretPosition(modalFormInput);
  let typeAheadCategory = "";
  //item.current = new TodoTxtItem(modalFormInput.value, [ new DueExtension() ]);
  // if datepicker was visible it will be hidden with every new input
  //dueDatePicker.hide();
  if(modalFormInput.value.charAt(caretPosition-2) === " " && (modalFormInput.value.charAt(caretPosition-1) === "@" || modalFormInput.value.charAt(caretPosition-1) === "+")) {
    typeAheadValue = modalFormInput.value.substr(caretPosition, modalFormInput.value.lastIndexOf(" ")).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(caretPosition-1);
  /*} else if(modalFormInput.value.substr(caretPosition-5, caretPosition-1).split(" ")[1] === "due:" && !item.current.due) {
    dueDatePicker.show();
    dueDatePicker.focus();*/
  } else if(modalFormInput.value.charAt(caretPosition) === " ") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+2).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+1);
  } else if(modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "@" || modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "+") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition)+2).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1);
  } else {
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
  }
});
// ########################################################################################################################
// KEYBOARD SHORTCUTS
// ########################################################################################################################
filterDropdown.addEventListener ("keydown", function () {
  if(event.key === 'Escape') showFilters(false);
});
/*modal.forEach(el => el.addEventListener("keydown", function(el) {
  if(event.key === 'Escape') {
    clearModal();
  }
}));*/
suggestionContainer.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
modalForm.addEventListener ("keydown", function () {
  if(event.key === 'Escape') {
    item.current = "";
    this.classList.remove("is-active");
    suggestionContainer.classList.remove("is-active");
  }
});
modalHelp.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
modalSettings.addEventListener ("keydown", function () {
  if(event.key === 'Escape') this.classList.remove("is-active");
});
// ########################################################################################################################
// CONTENT CONTAINER
// ########################################################################################################################
contentTabs.forEach(el => el.addEventListener("click", function(el) {
  contentTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
  // matomo event
  if(matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
}));
function showContent(section) {
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
// ########################################################################################################################
// THEME CONFIG
// ########################################################################################################################
//let themeLink = "";
function setTheme(switchTheme) {
  if(store.get("theme")) {
    var theme = store.get("theme");
  } else {
    var theme = nativeTheme.themeSource;
  }
  if(switchTheme) {
    switch (theme) {
      case "dark":
        theme = "light";
        break;
      case "light":
        theme = "dark";
        break;
      case "system":
        theme = "light";
        break;
    }
    store.set("theme", theme);
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
// START
// ########################################################################################################################
window.onload = function () {
  // On app load only call matomo function if opt in is set
  matomoEventsConsent().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // set theme
  setTheme();
  // only start if a file has been selected
  if(pathToFile) {
    console.log("Info: Path to file: " + pathToFile);
    // start parsing data
    parseDataFromFile(pathToFile).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  } else {
    console.log("Info: File does not exist or has not been defined yet");
    // show onboarding if no file has been selected
    showOnboarding(true);
  }

}
window.onresize = function() {
  let width = this.outerWidth;
  let height = this.outerHeight;
  store.set('windowBounds', { width, height });
  // Adjust position of suggestion box to input field
  let modalFormInputPosition = modalFormInput.getBoundingClientRect();
  suggestionContainer.style.width = modalFormInput.offsetWidth + "px";
  suggestionContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
  suggestionContainer.style.left = modalFormInputPosition.left + "px";
}
// ########################################################################################################################
// FUNCTIONS
// ########################################################################################################################
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
  const today = new Date()
  return this.getDate() < today.getDate() &&
  this.getMonth() === today.getMonth() &&
  this.getFullYear() === today.getFullYear();
};
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
function matomoEventsConsent() {
  try {
    var _paq = window._paq = window._paq || [];
    if(matomoEvents) {
      // only continue if app is connected to the internet
      if(!navigator.onLine) return Promise.resolve("Info: App is offline, Matomo will not be loaded");
      // user has given consent to process their data
      _paq.push(['setConsentGiven']);
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(['requireConsent']);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://www.robbfolio.de/matomo/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '3']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
      return Promise.resolve("Info: Consent given, Matomo enabled");
    } else {
      // revoke matomoEvents consent
      _paq.push(['forgetConsentGiven']);
      return Promise.resolve("Info: No consent given, Matomo disabled");
    }
  } catch(error) {
    return Promise.reject("Error in matomoEventsConsent(): " + error);
  }
}
function sortItems(items) {
  // first step of sorting items: the youngest to the top
  items.sort((a, b) => b.date - a.date);
  // array is sorted so the due date is desc
  items.sort((a, b) => a.due - b.due);
  return;
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
      if(closedNotifications.includes(hash)) return Promise.resolve("Info: Notification skipped (has already been sent)");
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
      closedNotifications.push(hash);
      store.set("closedNotifications", closedNotifications);
      // click on button in notification
      newNotification.addListener('click', () => {
        app.focus();
        // if another modal was open it needs to be closed first
        clearModal();
        // prrepare the value for the modal
        item.current = todo.toString();
        //load modal
        showForm(true);
      },{
        // remove event listener after it is clicked once
        once: true
      });
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    return Promise.reject("Error in showNotification(): " + error);
  }
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
function startFileWatcher() {
  try {
    if(fileWatcher) fileWatcher.close();
    if (fs.existsSync(pathToFile)) {
      let md5Previous = null;
      let fsWait = false;
      fileWatcher = fs.watch(pathToFile, (event, filename) => {
        if (fsWait) return;
        fsWait = setTimeout(() => {
          fsWait = false;
        }, 100);
        if (fs.existsSync(pathToFile)) {
          const md5Current = md5(fs.readFileSync(pathToFile));
          if (md5Current === md5Previous) {
            return;
          }
          md5Previous = md5Current;
        }
        parseDataFromFile(pathToFile).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      });
      return Promise.resolve("Success: File watcher is watching: " + pathToFile);
    } else {
      return Promise.reject("Info: File watcher did not start as file was not found at: " + pathToFile);
    }
  } catch (error) {
    return Promise.reject("Error in startFileWatcher(): " + error);
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
  store.set("showCompleted", showCompleted);
  t0 = performance.now();
  generateTodoData().then(response => {
    console.log(response);
    t1 = performance.now();
    console.log("Table rendered in:", t1 - t0, "ms");
  }).catch(error => {
    console.log(error);
  });
}
function resetFilters() {
  selectedFilters = [];
  categoriesFiltered = new Array;
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  store.set("selectedFilters", new Array);
  // clear filtered categories
  store.set("categoriesFiltered", new Array);
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
function showForm(variable) {
  try {
    if(variable) {
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
      if(item.current) {
        // we need to check if there already is a due date in the object
        item.current = new TodoTxtItem(item.current, [ new DueExtension() ]);
        modalFormInput.value = item.current.toString();
        modalTitle.innerHTML = i18next.t("editTodo");
        btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(item.current.complete === false) {
          btnItemStatus.innerHTML = i18next.t("done");
        } else {
          btnItemStatus.innerHTML = i18next.t("inProgress");
        }

        // if so we paste it into the input field
        if(item.current.dueString) {
          dueDatePickerInput.value = item.current.dueString;
        } else {
        // if not we clean it up
          dueDatePicker.setDate({
            clear: true
          });
          dueDatePickerInput.value = null;
        }
        // in any case the item.current needs to be a string again to find the array position later on
        item.current = item.current.toString();

      } else {
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
      // Adjust position of suggestion box to input field
      let modalFormInputPosition = modalFormInput.getBoundingClientRect();
      suggestionContainer.style.width = modalFormInput.offsetWidth + "px";
      suggestionContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
      suggestionContainer.style.left = modalFormInputPosition.left + "px";
    }
  } catch (error) {
    console.log(error);
  }
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
function showFilters(variable) {
  switch(variable) {
    case true:
      navBtnFilter.classList.add("is-highlighted");
      filterDropdown.classList.add("is-active");
      filterDropdown.focus();
      filterColumnClose.classList.add("is-active");
    break;
    case false:
      navBtnFilter.classList.remove("is-highlighted");
      filterDropdown.classList.remove("is-active");
      filterDropdown.blur();
      filterColumnClose.classList.remove("is-active");
    break;
    case "toggle":
      navBtnFilter.classList.toggle("is-highlighted");
      filterDropdown.classList.toggle("is-active");
      filterDropdown.focus();
      filterColumnClose.classList.toggle("is-active");
    break;
  }
  // if more toggle is open we close it as user doesn't need it anymore
  showMore(false);
}
function clearModal() {
  // hide suggestion box if it was open
  suggestionContainer.classList.remove("is-active");
  // defines when the composed filter is being filled with content and when it is emptied
  let startComposing = false;
  // in case a category will be selected from suggestion box we need to remove the category from input value that has been written already
  let typeAheadValue = "";
  // + or @
  let typeAheadPrefix = "";

  modalForm.classList.remove("is-active");
  modalForm.blur();
  modalFile.classList.remove("is-active");
  modalFile.blur();
  // empty the data item as we don't need it anymore
  item.current = "";
  // clean up the modal
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
  // clear the content in the input field as it's not needed anymore
  modalFormInput.value = null;
  // close datepicker
  dueDatePicker.hide();
}
function showAlert(variable) {
  if(variable) {
    modalFile.classList.add("is-active", "is-danger");
    modalFile.focus();
  } else {
    modalFile.classList.remove("is-active", "is-danger");
    modalFile.blur();
  }
};
function openFile() {
  // Resolves to a Promise<Object>
  dialog.showOpenDialog({
    title: i18next.t("windowTitleOpenFile"),
    defaultPath: path.join(app.getPath("home")),
    buttonLabel: i18next.t("windowButtonOpenFile"),
    // Restricting the user to only Text Files.
    filters: [
        {
            name: i18next.t("windowFileformat"),
            extensions: ["txt"]
        },
    ],
    properties: ['openFile']
  }).then(file => {
    // Stating whether dialog operation was cancelled or not.
    if (!file.canceled) {
      // Updating the filepath variable to user-selected file.
      pathToFile = file.filePaths[0].toString();
      // write new path and file name into storage file
      store.set("pathToFile", pathToFile);
      console.log("Success: Storage file updated by new path and filename: " + pathToFile);
      // reset the (persisted) filters as they won't make any sense when switching to a different todo.txt file for instance
      selectedFilters = new Array;
      store.set("selectedFilters", new Array);
      // pass path and filename on, to extract and parse the raw data to objects
      parseDataFromFile(pathToFile).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
  }).catch(err => {
      console.log("Error: " + err)
  });
}
function createFile(showDialog, overwriteFile) {
  // Resolves to a Promise<Object>
  if(showDialog && !overwriteFile) {
    dialog.showOpenDialog({
      title: i18next.t("windowTitleCreateFile"),
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: i18next.t("windowButtonCreateFile"),
      properties: ["openDirectory", "createDirectory"]
    }).then(file => {
      // Stating whether dialog operation was cancelled or not.
      if (!file.canceled) {
        checkPathForFile = file.filePaths[0].toString();
        if(fs.stat(checkPathForFile + "/todo.txt", function(err, stats) {
          // file exists
          if(!err) {
            // so we ask user to overwrite or choose a different location
            showAlert(true);
            return false;
          // file does not exist at given location, so we write a new file with content of sample.txt
          } else {
            fs.writeFile(checkPathForFile + "/todo.txt", "", function (err) {
              if (err) throw err;
              if (!err) {
                console.log("Success: New todo.txt file created: " + checkPathForFile + "/todo.txt");
                // Updating the GLOBAL filepath variable to user-selected file.
                pathToFile = checkPathForFile + "/todo.txt";
                // write new path and file name into storage file
                store.set("pathToFile", pathToFile);
                // pass path and filename on, to extract and parse the raw data to objects
                parseDataFromFile(pathToFile).then(response => {
                  console.log(response);
                }).catch(error => {
                  console.log(error);
                });
              }
            });
          }
        }));
      }
    }).catch(err => {
        console.log("Error: " + err)
    });
  // existing file will be overwritten
  } else if (!showDialog && overwriteFile) {
    fs.writeFile(checkPathForFile + "/todo.txt", "", function (err) {
      if (err) throw err;
      if (!err) {
        showAlert(false);
        console.log("Success: New todo.txt file created: " + checkPathForFile + "/todo.txt");
        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = checkPathForFile + "/todo.txt";
        // write new path and file name into storage file
        store.set("pathToFile", pathToFile);
        // pass path and filename on, to extract and parse the raw data to objects
        parseDataFromFile(pathToFile).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }
}
function parseDataFromFile() {
  // we only start if file exists
  if (fs.existsSync(pathToFile)) {
    try {
      // start the file watcher
      startFileWatcher().then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // clear todo txt item from previous sessions
      items.unfiltered = new Array;
      // read fresh data from file
      items.strings = fs.readFileSync(pathToFile, {encoding: 'utf-8'}, function(err,data) { return data; }).toString().split("\n");
      // for each array item we generate a todotxt object and assign an id to it
      for(let i = 0; i < items.strings.length;i++) {
        if(!items.strings[i]) continue;
        let item = new TodoTxtItem(items.strings[i], [ new DueExtension() ]);
        item.id = i;
        // if due is missing we can't sort the array, so we set it to null if it's empty
        if(!item.due) item.due = null;
        items.unfiltered.push(item);
      }
      if(items.unfiltered.length>0) {
        t0 = performance.now();
        generateTodoData().then(response => {
          console.log(response);
          t1 = performance.now();
          console.log("Table rendered in", t1 - t0, "ms");
        }).catch(error => {
          console.log(error);
        });
        // if there is a file onboarding is hidden
        showOnboarding(false);
        return Promise.resolve("Success: Data has been extracted from file and parsed to todo.txt items");
      } else {
        // if there is a file onboarding is hidden
        showOnboarding(false);
        // hide/show the addTodoContainer
        addTodoContainer.classList.add("is-active");
        todoTable.classList.remove("is-active");
        // if file is actually empty we don't need the filter drawer
        navBtnFilter.classList.remove("is-active");
        return Promise.resolve("Info: File is empty, nothing will be built");
      }
    } catch(error) {
      showOnboarding(true);
      return Promise.reject("Error in parseDataFromFile(): " + error);
    }
  } else {
    showOnboarding(true);
    return Promise.resolve("Info: File does not exist or has not been defined yet");
  }
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
      //typeAhead = true;
    } else {
      container = filterContainer;
      categoriesToBuild = categories;
    }
    // empty the container to prevent duplicates
    container.innerHTML = "";
    // parse through above defined categories, most likely contexts and projects
    categoriesToBuild.forEach((category) => {
      // array to collect all the available filters in the data
      let filters = new Array();
      // run the array and collect all possible filters, duplicates included
      items.unfiltered.forEach((item) => {
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
            store.set("selectedFilters", JSON.stringify(selectedFilters));
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
        console.log("Info: No " + category + " found in todo.txt data, so no filters will be generated");
      }
    });
    return Promise.resolve("Success: All filters have been generated and built");
  } catch (error) {
    return Promise.reject("Error in generateFilterData(): " + error);
  }
}
function buildFilterButtons(category, typeAheadValue, typeAheadPrefix, caretPosition) {
  try {
    //
    let headline;
    // creates a div for the specific filter section
    let filterContainerSub = document.createElement("div");
    filterContainerSub.setAttribute("class", "dropdown-item " + category);
    filterContainerSub.setAttribute("tabindex", 0);
    // translate headline
    if(category=="contexts") {
      headline = i18next.t("contexts");
    } else if(category=="projects"){
      headline = i18next.t("projects");
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
          store.set("categoriesFiltered", categoriesFiltered);
          // we remove the greyed out look from the container
          filterContainerSub.classList.remove("is-greyed-out");
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
          store.set("categoriesFiltered", categoriesFiltered);
          // we add the greyed out look to the container
          filterContainerSub.classList.add("is-greyed-out");
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
        // matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on headline", category])
      });
      // TODO clean up. this is a duplicate, see above
      if(categoriesFiltered.includes(category)) {
        filterContainerSub.classList.add("is-greyed-out");
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye\"></i></a>&nbsp;" + headline;
      } else {
        filterContainerSub.classList.remove("is-greyed-out");
        todoFilterHeadline.innerHTML = "<a href=\"#\"><i class=\"far fa-eye-slash\"></i></a>&nbsp;" + headline;
      }
      // add the headline before category container
      filterContainerSub.appendChild(todoFilterHeadline);
      //console.log(todoFilterHeadline);
    } else {
      // show suggestion box
      suggestionContainer.classList.add("is-active");
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 title headline " + category);
      // no need for tab index if the headline is in suggestion box
      if(typeAheadPrefix==undefined) todoFilterHeadline.setAttribute("tabindex", 0);
      todoFilterHeadline.innerHTML = headline;
      // add the headline before category container
      filterContainerSub.appendChild(todoFilterHeadline);
    }
    // build one button each
    for (let filter in filtersCounted) {
      // TODO: describe
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
          //convert the collected filters to JSON and save it to store.js
          store.set("selectedFilters", JSON.stringify(selectedFilters));
          if(categoriesFiltered) {
            // remove any setting that hides the category of the selected filters
            if(categoriesFiltered.indexOf(category)>=0) categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
            //persist the category filters
            store.set("categoriesFiltered", categoriesFiltered);
          }
          t0 = performance.now();
          generateTodoData().then(response => {
            console.log(response);
            t1 = performance.now();
            console.log("Table rendered in:", t1 - t0, "ms");
          }).catch(error => {
            console.log(error);
          });
          // matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
        });
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
          // put focus back into input so user can continue writing
          modalFormInput.focus();
          //
          suggestionContainer.classList.remove("is-active");
          // matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", category]);
        });
      }
      //console.log(selectedFilters);
      // after building the buttons we check if they appear in the saved filters, if so we add the highlighting
      // TODO: do this in the first loop where buttons are built
      selectedFilters.forEach(function(item) {
        if(JSON.stringify(item) === '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
      });
      filterContainerSub.appendChild(todoFiltersItem);
    }
    // add filters to the specific filter container
    //filterContainer.appendChild(filterContainerSub);
    return Promise.resolve(filterContainerSub);
    //return Promise.resolve("Success: Filter buttons for category " + category + " have been build");
  } catch (error) {
    return Promise.reject("Error in buildFilterButtons(): " + error);
  }
}
function generateTodoData(searchString) {
  try {
    // we only continue if there actually is data
    if(items.unfiltered.length==0) return Promise.resolve("Info: Won't build anything as there is no data so far");
    // items variable to work with from here on
    items.filtered = items.unfiltered;
    // if set: remove all completed todos
    if(showCompleted==false) {
      items.filtered = items.filtered.filter(function(item) {
        return item.complete === false;
      });
    }
    // if there are selected filters
    if(selectedFilters.length > 0) {
      // we iterate through the filters in the order they got selected
      selectedFilters.forEach(filter => {
        // check if the filter is a project filter
        if(filter[1]=="projects") {
          items.filtered = items.filtered.filter(function(item) {
            if(item.projects) return item.projects.includes(filter[0]);
          });
        // check if the filter is a context filter
        } else if(filter[1]=="contexts") {
          items.filtered = items.filtered.filter(function(item) {
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
        items.filtered = items.filtered.filter(function(item) {
          return item[category] === null;
        });
      });
    }
    // if search input is detected
    if(searchString) {
      // convert everything to lowercase for better search results
      items.filtered = items.filtered.filter(function (el) { return el.toString().toLowerCase().includes(searchString.toLowerCase()); });
    } if(!searchString && todoTableSearch.value) {
      searchString = todoTableSearch.value;
      // convert everything to lowercase for better search results
      items.filtered = items.filtered.filter(function (el) { return el.toString().toLowerCase().includes(searchString.toLowerCase()); });
    }
    // we show some information on filters if any are set
    if(items.filtered.length!=items.unfiltered.length) {
      selectionInformation.classList.add("is-active");
      selectionInformation.firstElementChild.innerHTML = i18next.t("visibleTodos") + "&nbsp;<strong>" + items.filtered.length + " </strong> " + i18next.t("of") + " <strong>" + items.unfiltered.length + "</strong>";
    } else {
      selectionInformation.classList.remove("is-active");
    }
    // hide/show the addTodoContainer or noResultTodoContainer
    if(items.filtered.length > 0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
    } else if(items.filtered.length === 0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.add("is-active");
    }
    // sort items according to todo.txt logic
    sortItems(items.filtered);
    // produce an object where priority a to z + null is key
    items.grouped = items.filtered.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});
    // show the table in case it was hidden
    todoTable.classList.add("is-active");
    // empty the table containers before reading fresh data
    todoTableContainer.innerHTML = "";
    tableContainerDue.innerHTML = "";
    tableContainerComplete.innerHTML = "";
    tableContainerDueAndComplete.innerHTML = "";
    tableContainerNoPriorityNotCompleted.innerHTML = "";
    // object is converted to a sorted array
    items.grouped = Object.entries(items.grouped).sort();
    // each priority group -> A to Z plus null for all todos with no priority
    for (let priority in items.grouped) {
      // nodes need to be created to add them to the outer fragment
      // this creates a divider row for the priorities
      if(items.grouped[priority][0]!="null") tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table priority\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\">" + items.grouped[priority][0] + "</div></div>"))
      // TODO: that's ugly, refine this
      for (let item in items.grouped[priority][1]) {
        let todo = items.grouped[priority][1][item];
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
        }, 1000);
      }
      // only scroll once
      item.previous = "";
    }
    return Promise.resolve("Success: Todo data generated and table built");
  } catch(error) {
    return Promise.reject("Error in generateTodoData: " + error);
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
    // if new item was saved, row is being marked
    if(todo.toString()==item.previous.toString()) {
      todoTableBodyRow.setAttribute("id", "previousItem");
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
      completeTodo(this.parentElement.getAttribute('data-item'), false).then(response => {
        modalForm.classList.remove("is-active");
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // matomo event
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
        // declaring the item-data value global so other functions can access it
        item.current = this.parentElement.getAttribute('data-item');
        showForm(true);
        // matomo event
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
      //https://stackoverflow.com/a/6040556
      let day = ("0" + (todo.due.getDate())).slice(-2)
      let month = ("0" + (todo.due.getMonth() + 1)).slice(-2);
      let year = todo.due.getFullYear();
      let tag = year + "-" + month + "-" + day;
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
    // add the text cell to the row
    todoTableBodyRow.appendChild(todoTableBodyCellText);
    // add the more dots
    todoTableBodyCellMore.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMore.setAttribute("role", "cell");
    todoTableBodyCellMore.innerHTML = "<div class=\"dropdown is-right\"><div class=\"dropdown-trigger\"><a href=\"#\"><i class=\"fas fa-ellipsis-v\"></i></a></div><div class=\"dropdown-menu\" role=\"menu\"><div class=\"dropdown-content\"><a href=\"#\" class=\"dropdown-item\">" + i18next.t("edit") + "</a><a class=\"dropdown-item\">" + i18next.t("delete") + "</a></div></div></div>";
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
        // matomo event
        if(matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on More"]);
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.firstElementChild.onclick = function() {
          item.current = todoTableBodyCellText.parentElement.getAttribute('data-item');
          showForm(item.current);
          // matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Edit"]);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.lastElementChild.onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          completeTodo(todoTableBodyRow.getAttribute('data-item'), true).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          // matomo event
          if(matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Delete"]);
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    return Promise.reject("Error in createTableRow(): " + error);
  }
}
function submitForm() {
  try {
    // check if there is an input in the text field, otherwise indicate it to the user
    if(modalForm.elements[0].value) {
      // input value and data item are the same, nothing has changed, nothing will be written
      if (item.current==modalForm.elements[0].value) {
        //console.log("Info: Nothing has changed, won't write anything.");
        return Promise.resolve("Info: Nothing has changed, won't write anything.");
        //return true;
      // Edit todo
      } else if(item.current) {
        // convert array of objects to array of strings to find the index
        items.unfiltered = items.unfiltered.map(item => item.toString());
        // get the position of that item in the array
        item.id = items.unfiltered.indexOf(item.current);
        // get the index using the item.id, remove 1 item there and add the value from the input at that position
        items.unfiltered.splice(item.id, 1, modalForm.elements[0].value);
        // convert all the strings to proper todotxt items again
        items.unfiltered = items.unfiltered.map(item => new TodoTxtItem(item, [ new DueExtension() ]));
      // Add todo
      } else {
        // in case there hasn't been a passed data item, we just push the input value as a new item into the array
        item.current = new TodoTxtItem(modalForm.elements[0].value, [ new DueExtension() ]);
        // we add the current date to the start date attribute of the todo.txt object
        item.current.date = new Date();
        // we build the array
        items.unfiltered.push(item.current);
      }
      //write the data to the file
      fs.writeFileSync(pathToFile, TodoTxt.render(items.unfiltered), {encoding: 'utf-8'});
      // matomo event
      if(matomoEvents) _paq.push(["trackEvent", "Form", "Submit"]);
      // save the previously saved item.current for further use
      item.previous = item.current;
      item.current = null;
      return Promise.resolve("Success: Changes written to file: " + pathToFile);
    // if the input field is empty, let users know
    } else {
      modalFormAlert.innerHTML = i18next.t("formInfoNoInput");
      modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
      modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
      return Promise.reject("Info: Will not write empty todo");
    }
  } catch (error) {
    // if writing into file is denied throw alert
    modalFormAlert.innerHTML = i18next.t("formErrorWritingFile") + pathToFile;
    modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
    return Promise.reject("Error in submitForm(): " + error);
  }
}
function completeTodo(dataItem, deleteItem) {
  try {
    item.current = dataItem;
    // get the position of that item in the array (of strings, not objects) using the string
    item.id = items.strings.indexOf(dataItem);
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of item.current
    if(modalForm.elements[0].value) item.current = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    item.current = new TodoTxtItem(item.current, [ new DueExtension() ]);
    // mark item as in progress
    if(item.current.complete && !deleteItem) {
      // if item was already completed we set complete to false and the date to null
      item.current.complete = false;
      item.current.completed = null;
      // delete old item from array and add the new one at it's position
      items.strings.splice(item.id, 1, item.current.toString());
    // Mark item as complete
    } else if(!item.current.complete && !deleteItem) {
      if(item.current.due) {
        // if set to complete it will be removed from persisted notifcations
        // the one set for today
        closedNotifications = closedNotifications.filter(e => e !== md5(item.current.due.toISOString().slice(0, 10) + item.current.text)+0);
        // the one set for tomorrow
        closedNotifications = closedNotifications.filter(e => e !== md5(item.current.due.toISOString().slice(0, 10) + item.current.text)+1);
        store.set("closedNotifications", closedNotifications);
      }
      // if deleteItem has been sent as true, we delete the entry from the items.unfiltered
      item.current.complete = true;
      item.current.completed = new Date();
      // delete old item.current from array and add the new one at it's position
      items.strings.splice(item.id, 1, item.current.toString());
    } else if(deleteItem) {
      // Delete item
      if(item.current.due) {
        // if deleted it will be removed from persisted notifcations
        // the one set for today
        closedNotifications = closedNotifications.filter(e => e !== md5(item.current.due.toISOString().slice(0, 10) + item.current.text)+0);
        // the one set for tomorrow
        closedNotifications = closedNotifications.filter(e => e !== md5(item.current.due.toISOString().slice(0, 10) + item.current.text)+1);
        store.set("closedNotifications", closedNotifications);
      }
      items.strings.splice(item.id, 1);
    }
    //write the data to the file
    fs.writeFileSync(pathToFile, TodoTxt.render(items.strings), {encoding: 'utf-8'});
    return Promise.resolve("Success: Changes written to file: " + pathToFile);
  } catch(error) {
    return Promise.reject("Error in completeTodo(): " + error);
  }
}
