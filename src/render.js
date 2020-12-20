// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const documentIds = document.querySelectorAll("[id]");
documentIds.forEach(function(id,index) {
  window[id] = document.getElementById(id.getAttribute("id"));
});
const head = document.getElementsByTagName("head")[0];
const btnApplyFilter = document.querySelectorAll(".btnApplyFilter");
const todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
const btnFilter = document.querySelectorAll(".btnFilter");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const modalBackground = document.querySelectorAll('.modal-background');
const modal = document.querySelectorAll('.modal');
const modalClose = document.querySelectorAll('.modal-close');
const helpTabs = document.querySelectorAll('#modalHelp ul li');
const helpTabsCards = document.querySelectorAll('#modalHelp section');
const a = document.querySelectorAll("a");
const categories = ["contexts", "projects"];
const dueDatePickerInput = document.getElementById("dueDatePickerInput");
const dueDatePicker = new Datepicker(dueDatePickerInput, {
  autohide: true,
  format: 'yyyy-mm-dd',
  clearBtn: true
});
const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    closedNotifications: new Array,
    pathToFile: "",
    theme: ""
  }
});
const items = {
  unfiltered: new Array,
  filtered: new Array,
  strings: null,
  grouped: new Array
}
let pathToFile = store.get("pathToFile");
let pathToNewFile;
let selectedFilters = store.get("selectedFilters");
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
let showCompleted = store.get("showCompleted");
let dataItem;
let previousDataItem = "";
let itemId;
let modalFormStatus;
let categoriesFiltered = store.get("categoriesFiltered");
let fileWatcher;
let filterContainer = document.getElementById("todoFilters");
let themeLink = null;
let selectedTheme = store.get("theme");
let closedNotifications = store.get("closedNotifications");
if(store.get("closedNotifications")) {
  closedNotifications = store.get("closedNotifications")
} else {
  closedNotifications = [];
}
// ########################################################################################################################
// INITIAL DOM CONFIGURATION
// ########################################################################################################################
dueDatePickerInput.readOnly = true;
toggleShowCompleted.checked = showCompleted;
// ########################################################################################################################
// TRANSLATIONS
// ########################################################################################################################
todoTableSearch.placeholder = i18next.t("search");
navBtnTheme.setAttribute("title", i18next.t("toggleDarkMode"));
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
btnCreateTodoFile.onclick = function () { createFile(true, false) }
btnItemStatus.onclick = function() {
  completeTodo(dataItem).then(response => {
    modalForm.classList.remove("is-active");
    clearModal();
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
}
navBtnHelp.onclick = function () { showHelp(); }
modalFileChoose.onclick = function() { createFile(true, false) }
modalFileOverwrite.onclick = function() { createFile(false, true) }
todoTable.onclick = function() { if(event.target.classList.contains("flex-table")) showMore(false) }
toggleShowCompleted.onclick = showCompletedTodos;
filterColumnClose.onclick = function() { showFilters(false) }
modalFormInputHelp.onclick = function () { showHelp(); }
navBtnTheme.addEventListener("click", () => {
  switchTheme(true);
});
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    dataItemTemp = new TodoTxtItem(modalFormInput.value, [ new DueExtension() ]);
    dataItemTemp.due = new Date(e.detail.date);
    dataItemTemp.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    modalFormInput.value = dataItemTemp.toString();
    // clean up as we don#t need it anymore
    dataItemTemp = null;
    // if suggestion box was open, it needs to be closed
    suggestionContainer.classList.remove("is-active");
    modalFormInput.focus();
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
  if(modalFormInput.value.charAt(caretPosition-2) === " " && (modalFormInput.value.charAt(caretPosition-1) === "@" || modalFormInput.value.charAt(caretPosition-1) === "+")) {
    typeAheadValue = modalFormInput.value.substr(caretPosition, modalFormInput.value.lastIndexOf(" ")).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(caretPosition-1);
  } else if(modalFormInput.value.charAt(caretPosition) === " ") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+2).split(" ").shift();
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+1);
  } else if(modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "@" || modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "+") {
    typeAheadValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition)+2).split(" ").shift()
    typeAheadPrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1);
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
modalBackground.forEach(el => el.onclick = clearModal);
modalClose.forEach(el => el.addEventListener("click", function(el) {
  this.parentElement.classList.remove("is-active");
}));
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href === "#") el.preventDefault();
}));
btnOpenTodoFile.forEach(function(el) {
  el.setAttribute("title", i18next.t("openFile"));
  el.onclick = openFile;
});
btnModalCancel.forEach(function(el) {
  el.innerHTML = i18next.t("cancel");
  el.onclick = clearModal;
});
btnResetFilters.forEach(el => el.onclick = resetFilters);
btnFilter.forEach(function(el) {
  el.setAttribute("title", i18next.t("toggleFilter"));
  el.onclick = function() { showFilters("toggle") };
});
btnAddTodo.forEach(function(el) {
  el.setAttribute("title", i18next.t("addTodo"));
  el.onclick = showForm;
});
helpTabs.forEach(el => el.addEventListener("click", function(el) {
  helpTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
}));
// ########################################################################################################################
// KEYBOARD SHORTCUTS
// ########################################################################################################################
filterDropdown.addEventListener ("keydown", function () {
  if(event.key === 'Escape') showFilters(false);
});
modalForm.addEventListener ("keydown", function () {
  if(event.key === 'Escape') clearModal();
});
body.addEventListener ("keydown", function () {
  if(event.key === "Escape") {
    todoTableSearch.blur();
    clearModal();
    modalHelp.classList.remove("is-active")
  }
});
// ########################################################################################################################
// START
// ########################################################################################################################
window.onload = function () {
  // set theme
  if(selectedTheme) switchTheme(false)
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
function showNotification(todo, offset) {
  // check for necessary permissions
  navigator.permissions.query({name: 'notifications'}).then(function(result) {
    // abort if user didn't permit notifications
    if(!result) return false;
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
    if(closedNotifications.includes(hash)) return false
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
      dataItem = todo.toString();
      //load modal
      showForm(true);
    },{
      // remove event listener after it is clicked once
      once: true
    });
  });
}
function showHelp() {
  modalHelp.classList.add("is-active");
  modalHelp.focus();
}
function showTab(tab) {
  helpTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  document.getElementById(tab).classList.add("is-active");
}
function switchTheme(toggle) {
  if(selectedTheme && !toggle) {
    theme.themeSource = selectedTheme;
  } else if (toggle) {
    if(theme.themeSource=="dark") {
      theme.themeSource = "light";
    } else {
      theme.themeSource = "dark";
    }
    selectedTheme=theme.themeSource;
  }
  if(themeLink!=null) {
    head.removeChild(document.getElementById("theme"));
    themeLink = null;
  }
  themeLink = document.createElement("link");
  themeLink.id = "theme";
  themeLink.rel = "stylesheet";
  themeLink.type = "text/css";
  themeLink.href = path.join(__dirname, "css/" + selectedTheme + ".css");
  head.appendChild(themeLink);
  store.set("theme", selectedTheme);
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
      // in case the more toggle menu is open we close it
      showMore(false);
      // set global variable if the modal is opening
      modalFormStatus = true;
      // clear the input value in case there was an old one
      modalFormInput.value = null;
      modalForm.classList.toggle("is-active");
      // clean up the alert box first
      modalFormAlert.innerHTML = null;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
      // here we configure the headline and the footer buttons
      if(dataItem) {
        // we need to check if there already is a due date in the object
        dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);
        modalFormInput.value = dataItem.toString();
        modalTitle.innerHTML = i18next.t("editTodo");
        btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(dataItem.complete === false) {
          btnItemStatus.innerHTML = i18next.t("done");
        } else {
          btnItemStatus.innerHTML = i18next.t("inProgress");
        }

        // if so we paste it into the input field
        if(dataItem.dueString) {
          dueDatePickerInput.value = dataItem.dueString;
        } else {
        // if not we clean it up
          dueDatePicker.setDate({
            clear: true
          });
          dueDatePickerInput.value = null;
        }
        // in any case the dataItem needs to be a string again to find the array position later on
        dataItem = dataItem.toString();

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
    btnAddTodo.forEach(item => item.classList.remove("is-active"));
    navBtnFilter.classList.remove("is-active");
    todoTable.classList.remove("is-active");
  } else {
    console.log("Info: Ending onboarding");
    onboardingContainer.classList.remove("is-active");
    btnAddTodo.forEach(item => item.classList.add("is-active"));
    navBtnFilter.classList.add("is-active");
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
  dataItem = null;
  // clean up the modal
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
  // set global variable if the modal is opening
  modalFormStatus = false;
  // clear the content in the input field as it's not needed anymore
  modalFormInput.value = null;
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
        pathToNewFile = file.filePaths[0].toString();
        if(fs.stat(pathToNewFile + "/todo.txt", function(err, stats) {
          // file exists
          if(!err) {
            // so we ask user to overwrite or choose a different location
            showAlert(true);
            return false;
          // file does not exist at given location, so we write a new file with content of sample.txt
          } else {
            fs.writeFile(pathToNewFile + "/todo.txt", "", function (err) {
              if (err) throw err;
              if (!err) {
                console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");
                // Updating the GLOBAL filepath variable to user-selected file.
                pathToFile = pathToNewFile + "/todo.txt";
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
    fs.writeFile(pathToNewFile + "/todo.txt", "", function (err) {
      if (err) throw err;
      if (!err) {
        showAlert(false);
        console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");
        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = pathToNewFile + "/todo.txt";
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
      // TODO: what does the first condition do?
      /*if(items.length==0 || typeAheadCategory) {
        items = items.unfiltered;
      }*/
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
    // filter items according to showCompleted setting
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
    // if there is at least 1 category to hide
    if(categoriesFiltered.length > 0) {
      categoriesFiltered.forEach(category => {
        // we create a new array where the items attrbite has no values
        items.filtered = items.filtered.filter(function(item) {
          return item[category] === null;
        });
      });
    }
    // if there is a search input detected
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
    // produce an object where priority a to z + null is key
    items.grouped = items.filtered.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});
    todoTable.classList.add("is-active");
    // get the reference for the table container
    let todoTableContainer = document.getElementById("todoTableContainer");
    // empty the table before reading fresh data
    todoTableContainer.innerHTML = "";
    // fragment is created to append the nodes
    let tableContainerContent = document.createDocumentFragment();
    // object is converted to an array
    items.grouped = Object.entries(items.grouped).sort();
    // each priority group -> A to Z plus null for all todos with no priority
    for (let priority in items.grouped) {
      let itemsDue = new Array;
      let itemsRest = new Array;
      let itemsDueComplete = new Array;
      let itemsComplete = new Array;
      // nodes need to be created to add them to the outer fragment
      // this creates a divider row for the priorities
      if(items.grouped[priority][0]!="null") {
        let divider = document.createRange().createContextualFragment("<div class=\"flex-table priority\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\">" + items.grouped[priority][0] + "</div></div>");
        tableContainerContent.appendChild(divider);
      }
      // TODO: that's ugly, refine this
      for (let item in items.grouped[priority][1]) {
        let todo = items.grouped[priority][1][item];
        // for each sorted group within a priority group an array is created
        // incompleted todos with due date
        if (todo.due && !todo.complete) {
          // create notification

          if(todo.due.isToday()) showNotification(todo, 0)
          if(todo.due.isTomorrow()) showNotification(todo, 1)

          itemsDue.push(todo);
        // incompleted todos with no due date
        } else if(!todo.due && !todo.complete) {
          itemsRest.push(todo);
        // completed todos with due date
        } else if(todo.due && todo.complete) {
          itemsDueComplete.push(todo);
        // completed todos with no due date
        } else if(!todo.due && todo.complete) {
          itemsComplete.push(todo);
        }
      }

      // array is sorted so the due date is desc
      itemsDue.sort((a, b) => a.due - b.due);
      // all rows for the items with due date within the priority group are being build
      itemsDue.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // all rows for the items with no due date within the priority group are being build
      itemsRest.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // array is sorted so the due date is desc
      itemsDueComplete.sort((a, b) => a.due - b.due);
      // all rows for the items with due date within the priority group are being build
      itemsDueComplete.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });
      // all rows for the items with no due date within the priority group are being build
      itemsComplete.forEach(item => {
        tableContainerContent.appendChild(createTableRow(item));
      });

    }
    // append the table to the wrapper
    todoTableContainer.appendChild(tableContainerContent);

    // jump to previously edited or added item
    if (document.getElementById("previousDataItem")) {
      // scroll to view
      document.getElementById("previousDataItem").scrollIntoView(true);
      // trigger a quick background ease in and out
      document.getElementById("previousDataItem").classList.add("is-highlighted");
      setTimeout(() => {
        document.getElementById("previousDataItem").classList.remove("is-highlighted");
      }, 1000);
      // empty previous item it is not needed after highlighting once
      previousDataItem = "";
    }

    return Promise.resolve("Success: Todo data generated and table built");
  } catch(error) {
    return Promise.reject("Error in generateTodoData: " + error);
  }
}
function createTableRow(item) {
  try {
    // build the items for one row
    let todoTableBodyRow = document.createElement("div");
    todoTableBodyRow.setAttribute("role", "rowgroup");
    todoTableBodyRow.setAttribute("class", "flex-table");
    // if new item was saved, row is being marked
    if(item.toString()==previousDataItem.toString()) {
      todoTableBodyRow.setAttribute("id", "previousDataItem");
      previousDataItem = "";
    }
    let todoTableBodyCellCheckbox = document.createElement("div");
    todoTableBodyCellCheckbox.setAttribute("class", "flex-row checkbox");
    todoTableBodyCellCheckbox.setAttribute("role", "cell");
    let todoTableBodyCellText = document.createElement("a");
    todoTableBodyCellText.setAttribute("class", "flex-row text");
    todoTableBodyCellText.setAttribute("role", "cell");
    todoTableBodyCellText.setAttribute("tabindex", 0);
    todoTableBodyCellText.setAttribute("href", "#");
    todoTableBodyCellText.setAttribute("title", i18next.t("editTodo"));
    //todoTableBodyCellText.setAttribute("tabindex", 300);
    let tableContainerCategories = document.createElement("span");
    tableContainerCategories.setAttribute("class", "categories");
    let todoTableBodyCellMore = document.createElement("div");
    let todoTableBodyCellPriority = document.createElement("div");
    todoTableBodyCellPriority.setAttribute("role", "cell");
    let todoTableBodyCellSpacer = document.createElement("div");
    todoTableBodyCellSpacer.setAttribute("role", "cell");
    let todoTableBodyCellDueDate = document.createElement("span");
    todoTableBodyCellDueDate.setAttribute("class", "flex-row itemDueDate");
    todoTableBodyCellDueDate.setAttribute("role", "cell");
    // start with the individual config of the items
    if(item.complete==true) {
      todoTableBodyRow.setAttribute("class", "flex-table completed");
    }
    todoTableBodyRow.setAttribute("data-item", item.toString());
    // add the priority marker or a white spacer
    if(item.priority) {
      todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + item.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else {
      todoTableBodyCellSpacer.setAttribute("class", "flex-row spacer");
      todoTableBodyRow.appendChild(todoTableBodyCellSpacer);
    }
    // add the checkbox
    if(item.complete==true) {
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
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(item.text) {
      // use the autoLink lib to attach an icon to every link and put a link on it
      todoTableBodyCellText.innerHTML =  item.text.autoLink({
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
        dataItem = this.parentElement.getAttribute('data-item');
        showForm(dataItem);
      }
    }
    // cell for the categories
    categories.forEach(category => {
      if(item[category]) {
        item[category].forEach(item => {
          let todoTableBodyCellCategory = document.createElement("span");
          todoTableBodyCellCategory.setAttribute("class", "tag " + category);
          todoTableBodyCellCategory.innerHTML = item;
          tableContainerCategories.appendChild(todoTableBodyCellCategory);
        });
      }
    });
    // add the text cell to the row
    todoTableBodyCellText.appendChild(tableContainerCategories);
    // check for and add a given due date
    let tag;
    if(item.due) {
      if(item.due.isToday()) {
        todoTableBodyCellDueDate.classList.add("isToday");
        tag = i18next.t("dueToday");
      } else if(item.due.isTomorrow()) {
        todoTableBodyCellDueDate.classList.add("isTomorrow");
        tag = i18next.t("dueTomorrow");
      } else if(item.due.isPast()) {
        todoTableBodyCellDueDate.classList.add("isPast");
        tag = item.due.toISOString().slice(0, 10);
      } else {
        tag = item.due.toISOString().slice(0, 10);
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
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.firstElementChild.onclick = function() {
          dataItem = todoTableBodyCellText.parentElement.getAttribute('data-item');
          showForm(dataItem);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.lastElementChild.onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          completeTodo(todoTableBodyRow.getAttribute('data-item'), true).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
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
      if (dataItem==modalForm.elements[0].value) {
        //console.log("Info: Nothing has changed, won't write anything.");
        return Promise.resolve("Info: Nothing has changed, won't write anything.");
        //return true;
      // Edit todo
      } else if(dataItem) {
        // convert array of objects to array of strings to find the index
        items.unfiltered = items.unfiltered.map(item => item.toString());
        // get the position of that item in the array
        itemId = items.unfiltered.indexOf(dataItem);
        // get the index using the itemId, remove 1 item there and add the value from the input at that position
        items.unfiltered.splice(itemId, 1, modalForm.elements[0].value);
        // convert all the strings to proper todotxt items again
        items.unfiltered = items.unfiltered.map(item => new TodoTxtItem(item, [ new DueExtension() ]));
      // Add todo
      } else {
        // in case there hasn't been a passed data item, we just push the input value as a new item into the array
        dataItem = new TodoTxtItem(modalForm.elements[0].value, [ new DueExtension() ]);
        // we add the current date to the start date attribute of the todo.txt object
        dataItem.date = new Date();
        // we build the array
        items.unfiltered.push(dataItem);
      }
      //write the data to the file
      fs.writeFileSync(pathToFile, TodoTxt.render(items.unfiltered), {encoding: 'utf-8'});
      // save the previously saved dataItem for further use
      previousDataItem = dataItem;
      dataItem = null;
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
    // get the position of that item in the array (of strings, not objects) using the string
    let itemId = items.strings.indexOf(dataItem);
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of dataItem
    if(modalForm.elements[0].value) dataItem = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);
    // mark item as in progress
    if(dataItem.complete && !deleteItem) {
      // if item was already completed we set complete to false and the date to null
      dataItem.complete = false;
      dataItem.completed = null;
      // delete old dataItem from array and add the new one at it's position
      items.unfiltered.splice(itemId, 1, dataItem);
    // Mark item as complete
    } else if(!dataItem.complete && !deleteItem) {
      // if deleteItem has been sent as true, we delete the entry from the items.unfiltered
      dataItem.complete = true;
      dataItem.completed = new Date();
      // delete old dataItem from array and add the new one at it's position
      items.unfiltered.splice(itemId, 1, dataItem);
      if(dataItem.due) {
        // if set to complete it will be removed from persisted notifcations
        // the one set for today
        closedNotifications = closedNotifications.filter(e => e !== md5(dataItem.due.toISOString().slice(0, 10) + dataItem.text)+0);
        // the one set for tomorrow
        closedNotifications = closedNotifications.filter(e => e !== md5(dataItem.due.toISOString().slice(0, 10) + dataItem.text)+1);
        store.set("closedNotifications", closedNotifications);
      }
    } else if(deleteItem) {
      // Delete item
      items.unfiltered.splice(itemId, 1);
      if(dataItem.due) {
        // if deleted it will be removed from persisted notifcations
        // the one set for today
        closedNotifications = closedNotifications.filter(e => e !== md5(dataItem.due.toISOString().slice(0, 10) + dataItem.text)+0);
        // the one set for tomorrow
        closedNotifications = closedNotifications.filter(e => e !== md5(dataItem.due.toISOString().slice(0, 10) + dataItem.text)+1);
        store.set("closedNotifications", closedNotifications);
      }
    }
    //write the data to the file
    fs.writeFileSync(pathToFile, TodoTxt.render(items.unfiltered), {encoding: 'utf-8'});
    return Promise.resolve("Success: Changes written to file: " + pathToFile);
  } catch(error) {
    return Promise.reject("Error in completeTodo(): " + error);
  }
}
