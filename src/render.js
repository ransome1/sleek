// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const documentIds = document.querySelectorAll("[id]");
documentIds.forEach(function(id,index) {
  window[id] = document.getElementById(id.getAttribute("id"));
});
const a = document.querySelectorAll("a");
// ########################################################################################################################
// PREPARE TABLE BUILDING
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
tableContainerCategoriesTemplate.setAttribute("class", "categories");
todoTableBodyCellPriorityTemplate.setAttribute("role", "cell");
todoTableBodyCellSpacerTemplate.setAttribute("role", "cell");
todoTableBodyCellDueDateTemplate.setAttribute("class", "flex-row itemDueDate");
todoTableBodyCellDueDateTemplate.setAttribute("role", "cell");
todoTableBodyCellRecurrenceTemplate.setAttribute("class", "flex-row recurrence");
todoTableBodyCellRecurrenceTemplate.setAttribute("role", "cell");
// ########################################################################################################################
// DEFINE ELEMENTS
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
const radioRecurrence = document.querySelectorAll("#recurrencePicker .selection");
const btnFilter = document.querySelectorAll(".btnFilter");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
// ########################################################################################################################
// DATEPICKER CONFIG
// ########################################################################################################################
const dueDatePicker = new Datepicker(dueDatePickerInput, {
  autohide: true,
  format: "yyyy-mm-dd",
  clearBtn: true,
  beforeShowDay: function(date) {
    let today = new Date();
    if (date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()) {
      return { classes: 'today'};
    }
  }
});
// Adjust Picker width according to length of input
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  let caretPosition = getCaretPosition(modalFormInput);
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
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
  }
});
// ########################################################################################################################
// DEFINE CONSTANTS
// ########################################################################################################################
const categories = ["contexts", "projects"];
const items = {
  raw: null,
  objects: new Array,
  objectsFiltered: new Array
}
const item = {
  previous: ""
}
// ########################################################################################################################
// ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
// ########################################################################################################################
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href === "#") el.preventDefault();
}));
navBtnHelp.onclick = function () {
  showContent(modalHelp);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}
navBtnSettings.onclick = function () {
  showContent(modalSettings);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}
btnMessageLogging.onclick = function () {
  showContent(modalSettings);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Settings"]);
}
btnItemStatus.onclick = function() {
  setTodoComplete(this.parentElement.parentElement.parentElement.parentElement.getAttribute("data-item")).then(response => {
    modalForm.classList.remove("is-active");
    clearModal();
    console.log(response);
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);
  }).catch(error => {
    console.log(error);
  });
}
btnTheme.onclick = function(el) {
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Theme"])
  setTheme(true);
}
btnArchiveTodos.onclick = function() {
  archiveTodos().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Archive"])
}
btnOpenTodoFile.forEach(function(el) {
  el.onclick = function () {
    //openFile();
    window.api.send("openOrCreateFile", "open");
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
  }
});
btnChangeTodoFile.forEach(function(el) {
  el.onclick = function () {
    if(window.userData.files.length > 0) {
      modalChooseFile();
    } else {
      window.api.send("openOrCreateFile", "open");
    }
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Choose file"]);
  }
});
btnCreateTodoFile.forEach(function(el) {
  el.onclick = function () {
    //createFile()
    window.api.send("openOrCreateFile", "create");
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Create file"]);
  }
});
btnModalCancel.forEach(function(el) {
  el.onclick = function() {
    el.parentElement.parentElement.parentElement.parentElement.classList.remove("is-active");
    clearModal();
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
  }
});
btnFilter.forEach(function(el) {
  el.onclick = function() {
    showFilterDrawer("toggle").then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
  };
});
btnAddTodo.forEach(function(el) {
  el.onclick = function () {
    // just in case the form will be cleared first
    clearModal();
    showForm();
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
  }
});
btnFiltersResetFilters.onclick = function() {
  resetFilters();
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
}
btnNoResultContainerResetFilters.onclick = function() {
  resetFilters();
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "No Result Container", "Click on reset button"])
}
todoTable.onclick = function() { if(event.target.classList.contains("flex-table")) showMore(false) }
todoTableSearch.addEventListener("input", function () {
  generateTodoData(this.value).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
});
toggleShowCompleted.onclick = function() {
  toggleCompletedTodos().then(response => {
    console.log(response);
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Toggle completed todos"]);
  }).catch(error => {
    console.log(error);
  });
}
toggleMatomoEvents.onclick = function() {
  matomoEvents = this.checked;
  setUserData('matomoEvents', this.checked);
  matomoEventsConsent(this.checked).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Logging", this.checked])
}
toggleNotifications.onclick = function() {
  notifications = this.checked;
  setUserData('notifications', this.checked);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Notifications", this.checked])
}
toggleDarkmode.onclick = function() {
  setTheme(true);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Dark mode", this.checked])
}
modalFormInputResize.onclick = function () {
  toggleInputSize(this.getAttribute("data-input-type"));
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Resize"]);
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
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Background"]);
  }
});
modalClose.forEach(function(el) {
  el.onclick = function() {
    if(el.getAttribute("data-message")) {
      // persist closed message, so it won't show again
      if(!window.userData.dismissedMessages.includes(el.getAttribute("data-message"))) window.userData.dismissedMessages.push(el.getAttribute("data-message"))
      setUserData("dismissedMessages", window.userData.dismissedMessages);
      // trigger matomo event
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Close"]);
    } else {
      // trigger matomo event
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Close"]);
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
  showFilterDrawer(false).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on close button"])
}
priorityPicker.addEventListener("change", e => { setPriority(e.target.value) });
priorityPicker.onfocus = function () {
  // close suggestion box if focus comes to priority picker
  suggestionContainer.classList.remove("is-active");
};
dueDatePickerInput.onfocus = function () {
  suggestionContainer.classList.remove("is-active");
};
recurrencePickerInput.onfocus = function(el) { showRecurrenceOptions(el) };
contentTabs.forEach(el => el.addEventListener("click", function(el) {
  contentTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
  // trigger matomo event
  if(window.userData.matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
}));
settingsLanguage.onchange = function() {
  window.userData.language = this.value;
  window.api.send("setUserData", ["language", window.userData.language]);
  window.api.send("changeLanguage", this.value);
}
document.querySelector(".datepicker .clear-btn").addEventListener('click', function (e) {
  let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
  todo.due = undefined;
  todo.dueString = undefined;
  // also clear the recurrence option as it doesn't make sense any more
  todo.rec = undefined;
  todo.recString = undefined;
  modalFormInput.value = todo.toString();
});
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
  if(event.key === 'Escape') {
    showFilterDrawer(false).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
  }
});
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
function changeFile(path) {
  try {
    // TODO explain
    removeFileFromHistory(path);
    // remove "active" (1) setting from all files
    window.userData.files.forEach(function(file) {
      file[0] = 0;
      if(file[1]===path) file[0] = 1
    });
    // TODO add active (1) setting to the new file
    if(!window.userData.files.includes(path)) window.userData.files.push([1, path]);
    // persist new file path
    setUserData("files", window.userData.files);
    // also update the current file
    window.userData.file = path;
    // clear persisted filters as they propably don't make sense any more
    resetFilters().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    // get content and start building objects and table
    getFileContent(path).then(function(result) {
      // only continue if we have the items object
      generateItemsObject(result).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
      // advice main process to start the filewatcher
      window.api.send("startFileWatcher", window.userData.file);
    }).catch(error => {
      console.log(error);
    });
    // close the file modal
    clearModal();
    // return promise
    return Promise.resolve("Success: File has been changed to: " + path);
  } catch (error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "changeFile()", error])
    return Promise.reject("Error in changeFile(): " + error);
  }
}
function modalChooseFile() {
  modalChangeFile.classList.add("is-active");
  modalChangeFile.focus();
  modalChangeFileTable.innerHTML = "";
  for (let file in window.userData.files) {
    // skip if file doesn't exist
    var table = modalChangeFileTable;
    table.classList.add("files");
    var row = table.insertRow(0);
    row.setAttribute("data-path", window.userData.files[file][1]);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    if(window.userData.files[file][0]===1) {
      cell1.innerHTML = "<button class=\"button\" disabled>" + window.translations.selected + "</button>";
    } else {
      cell1.innerHTML = "<button class=\"button is-link\">" + window.translations.select + "</button>";
      cell1.onclick = function() {
        // set the new path variable and change the array
        changeFile(this.parentElement.getAttribute("data-path")).then(result => {
          console.log(result);
        }).catch(error => {
          console.log(error);
        });
        // trigger matomo event
        if(window.userData.matomoEvents) _paq.push(["trackEvent", "File", "Click on select button"]);
      }
      cell3.innerHTML = "<i class=\"fas fa-minus-circle\"></i>";
      cell3.title = window.translations.delete;
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
    cell2.innerHTML = window.userData.files[file][1];
  }
}
function removeFileFromHistory(path) {
  try {
    files = window.userData.files.filter(function(file) {
      return file[1] != path;
    });
    setUserData("files", files);
    return Promise.resolve("Success: File removed from history: " + path);
  } catch (error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "removeFileFromHistory()", error])
    return Promise.reject("Error in removeFileFromHistory(): " + error);
  }
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
  setUserData("filterDrawerWidth", `${width}px`);
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
// ########################################################################################################################
//
// ########################################################################################################################
function showResultStats() {
  try {
    // we show some information on filters if any are set
    if(items.objectsFiltered.length!=items.objects.length) {
      resultStats.classList.add("is-active");
      resultStats.firstElementChild.innerHTML = window.translations.visibleTodos + "&nbsp;<strong>" + items.objectsFiltered.length + " </strong> " + window.translations.of + " <strong>" + items.objects.length + "</strong>";
      return Promise.resolve("Info: Filters found, result box is shown");
    } else {
      resultStats.classList.remove("is-active");
      return Promise.resolve("Info: No filters found, result box is hidden");
    }
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "showResultStats()", error])
    return Promise.reject("Error in showResultStats(): " + error);
  }
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
        // replace invisible multiline ascii character with new line
        todo = todo.replaceAll(String.fromCharCode(16),"\r\n");
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
          modalTitle.innerHTML = window.translations.addTodo;
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
          modalTitle.innerHTML = window.translations.editTodo;
          btnItemStatus.classList.add("is-active");
        }
        //btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(todo.complete === false) {
          btnItemStatus.innerHTML = window.translations.done;
        } else {
          btnItemStatus.innerHTML = window.translations.inProgress;
        }
        // if there is a recurrence
        if(todo.rec) setRecurrenceInput(todo.rec)
        // if so we paste it into the input field
        if(todo.dueString) {
          dueDatePicker.setDate(todo.dueString);
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
        modalTitle.innerHTML = window.translations.addTodo;
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
      return Promise.resolve("Info: Show/Edit todo window opened");
  } catch (error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "showForm()", error])
    return Promise.reject("Error in showForm(): " + error);
  }
}
function showOnboarding(variable) {
  try {
    if(variable) {
      onboardingContainer.classList.add("is-active");
      btnAddTodo.forEach(item => item.classList.add("is-hidden"));
      navBtnFilter.classList.add("is-hidden");
      todoTable.classList.remove("is-active");
      return Promise.resolve("Info: Starting onboarding");
    } else {
      onboardingContainer.classList.remove("is-active");
      btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
      navBtnFilter.classList.remove("is-hidden");
      todoTable.classList.add("is-active");
      return Promise.resolve("Info: Ending onboarding");
    }
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "showOnboarding()", error])
    return Promise.reject("Error in showOnboarding(): " + error);
  }
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
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Modal", "Recurrence selected: " + recSplit.period]);
    }
  });
}
function showFilterDrawer(variable) {
  try {
    switch(variable) {
      case true:
        navBtnFilter.classList.add("is-highlighted");
        filterDrawer.classList.add("is-active");
        //filterDrawer.focus();
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
        //filterDrawer.focus();
        filterColumnClose.classList.toggle("is-active");
      break;
    }
    // persist filter drawer state
    if(filterDrawer.classList.contains("is-active")) {
      setUserData("filterDrawer", true);
    } else {
      setUserData("filterDrawer", false);
    }
    // if more toggle is open we close it as user doesn't need it anymore
    showMore(false);
    return Promise.resolve("Success: Filter drawer toggled");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "showFilterDrawer()", error])
    return Promise.reject("Error in showFilterDrawer(): " + error);
  }
}
function showTab(tab) {
  contentTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  document.getElementById(tab).classList.add("is-active");
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

function generateNotification(todo, offset) {
  try {
    let notifications = window.userData.notifications;
    let dismissedNotifications = window.userData.dismissedNotifications;
    // abort if user didn't permit notifications within sleek
    if(!notifications) return Promise.reject("Info: Notification surpressed (turned off in sleek's settings)");
    // check for necessary permissions
    return navigator.permissions.query({name: 'notifications'}).then(function(result) {
      // abort if user didn't permit notifications
      if(result.state!="granted") return Promise.reject("Info: Notification surpressed (not permitted by OS)");
      // add the offset so a notification shown today with "due tomorrow", will be shown again tomorrow but with "due today"
      const hash = generateHash(todo.due.toISOString().slice(0, 10) + todo.text) + offset;
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
      const config = {
        title: title,
        body: todo.text,
        silent: false,
        string: todo.toString(),
        hasReply: false,
        timeoutType: 'never',
        urgency: 'critical',
        closeButtonText: 'Close',
        actions: [ {
          type: 'button',
          text: 'Show Button'
        }]
      }
      // send notification object to main process for execution
      window.api.send("showNotification", config);
      // once shown, it will be persisted as hash to it won't be shown a second time
      dismissedNotifications.push(hash);
      setUserData("dismissedNotifications", dismissedNotifications);
      // trigger matomo event
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Shown"]);
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateNotification()", error])
    return Promise.reject("Error in generateNotification(): " + error);
  }
}
function generateFilterButtons(category, typeAheadValue, typeAheadPrefix, caretPosition) {
  try {
    let selectedFilters = new Array;
    if(window.userData.selectedFilters.length>0) selectedFilters = JSON.parse(window.userData.selectedFilters);
    let categoriesFiltered = new Array;
    if(window.userData.categoriesFiltered>0) categoriesFiltered = JSON.parse(window.userData.categoriesFiltered);
    // creates a div for the specific filter section
    let todoFiltersSub = document.createElement("div");
    todoFiltersSub.setAttribute("class", "dropdown-item " + category);
    todoFiltersSub.setAttribute("tabindex", 0);
    // translate headline
    if(category=="contexts") {
      var headline = window.translations.contexts;
    } else if(category=="projects"){
      var headline = window.translations.projects;
    }
    if(typeAheadPrefix==undefined) {
      let categoriesFiltered = window.userData.categoriesFiltered;
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
          setUserData("categoriesFiltered", categoriesFiltered);
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
          setUserData("categoriesFiltered", categoriesFiltered);
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
        if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on headline", category])
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
          setUserData("selectedFilters", JSON.stringify(selectedFilters));
          if(categoriesFiltered) {
            // remove any setting that hides the category of the selected filters
            if(categoriesFiltered.indexOf(category)>=0) categoriesFiltered.splice(categoriesFiltered.indexOf(category), 1);
            //persist the category filters
            setUserData("categoriesFiltered", categoriesFiltered);
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
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
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
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", category]);
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
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateFilterButtons()", error])
    return Promise.reject("Error in generateFilterButtons(): " + error);
  }
}
function generateHash(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}
function generateFilterData(typeAheadCategory, typeAheadValue, typeAheadPrefix, caretPosition) {
  try {
    let items = window.items;
    let selectedFilters = new Array;
    if(window.userData.selectedFilters.length>0) selectedFilters = JSON.parse(window.userData.selectedFilters);
    let categoriesFiltered = new Array;
    if(window.userData.categoriesFiltered>0) categoriesFiltered = JSON.parse(window.userData.categoriesFiltered);
    // container to fill with categories
    let container;
    // which category or categories to loop through and build
    let categoriesToBuild = [];
    if(typeAheadPrefix) {
      container = suggestionContainer;
      categoriesToBuild.push(typeAheadCategory);
      // for the suggestion container, so all filters will be shown
      items.objectsFiltered = items.objects;
    } else {
      // empty filter container first
      todoFilters.innerHTML = "";
      container = todoFilters;
      categoriesToBuild = categories;
    }
    // empty filter container to prvent duplicates
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
            if(window.userData.showCompleted==false && item.complete==true) {
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
            setUserData("selectedFilters", JSON.stringify(selectedFilters));
          }
        }
      });
      // sort filter alphanummerically (https://stackoverflow.com/a/54427214)
      filtersCounted = Object.fromEntries(
        Object.entries(filtersCounted).sort(new Intl.Collator('en',{numeric:true, sensitivity:'accent'}).compare)
      );
      // build the filter buttons
      if(filters[0]!="") {
        generateFilterButtons(category, typeAheadValue, typeAheadPrefix, caretPosition).then(response => {
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
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateFilterData()", error])
    return Promise.reject("Error in generateFilterData(): " + error);
  }
}
function generateTableRow(todo) {
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
      todoTableBodyCellCheckbox.setAttribute("title", window.translations.inProgress);
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"fas fa-check-circle\"></i></a>";
    } else {
      todoTableBodyCellCheckbox.setAttribute("title", window.translations.done);
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"far fa-circle\"></i></a>";
    }
    // add a listener on the checkbox to call the completeItem function
    todoTableBodyCellCheckbox.onclick = function() {
      // passing the data-item attribute of the parent tag to complete function
      setTodoComplete(this.parentElement.getAttribute('data-item')).then(response => {
        //modalForm.classList.remove("is-active");
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // trigger matomo event
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Checkbox"]);
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(todo.text) {
      // use the autoLink lib to attach an icon to every link and put a link on it
      todoTableBodyCellText.innerHTML =  todo.text.autoLink({
        callback: function(url) {
          // truncate the url
          let urlString = url;
          if(url.length>30) {
            urlString = url.slice(0, 30) + " [...]";
          }
          return urlString + " <a href=" + url + " target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a>";
        }
      });
      // replace line feed replacement character with a space
      todoTableBodyCellText.innerHTML = todoTableBodyCellText.innerHTML.replaceAll(String.fromCharCode(16)," ");
    }
    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, showForm(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        showForm(this.parentElement.getAttribute('data-item'));
        // trigger matomo event
        if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on todo"]);
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
        tag = window.translations.dueToday;
      } else if(todo.due.isTomorrow()) {
        todoTableBodyCellDueDate.classList.add("isTomorrow");
        tag = window.translations.dueTomorrow;
      } else if(todo.due.isPast()) {
        todoTableBodyCellDueDate.classList.add("isPast");
      }
      todoTableBodyCellDueDate.innerHTML = "<i class=\"far fa-clock\"></i><div class=\"tags has-addons\"><span class=\"tag\">" + window.translations.dueAt + "</span><span class=\"tag is-dark\">" + tag + "</span></div><i class=\"fas fa-sort-down\"></i>";
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
    todoTableBodyCellMore.innerHTML = "<div class=\"dropdown is-right\"><div class=\"dropdown-trigger\"><a href=\"#\"><i class=\"fas fa-ellipsis-v\"></i></a></div><div class=\"dropdown-menu\" role=\"menu\"><div class=\"dropdown-content\"><a class=\"dropdown-item\">" + window.translations.useAsTemplate + "</a><a href=\"#\" class=\"dropdown-item\">" + window.translations.edit + "</a><a class=\"dropdown-item\">" + window.translations.delete + "</a></div></div></div>";
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
        if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on More"]);
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[1].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'));
          // trigger matomo event
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Edit"]);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[2].onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          setTodoDelete(todoTableBodyRow.getAttribute('data-item')).then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          // trigger matomo event
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Delete"]);
        }
        // click on use as template option
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[0].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'), true);
          // trigger matomo event
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Use as template"]);
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateTableRow()", error])
    return Promise.reject("Error in generateTableRow(): " + error);
  }
}
function generateItemsObject(content) {
  try {
    items.objects = TodoTxt.parse(content, [ new DueExtension(), new RecExtension() ]);
    items.complete = items.objects.filter(function(item) { return item.complete === true });
    items.incomplete = items.objects.filter(function(item) { return item.complete === false });
    items.objects = items.objects.filter(function(item) { return item.toString() != "" });
    window.items = items;
    // start generating the todo data
    t0 = performance.now();
    generateTodoData().then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Table rendered in", t1 - t0, "ms");
    }).catch(error => {
      console.log(error);
    });
    return Promise.resolve("Success: Items object generated");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "getFileContent()", error])
    return Promise.reject("Error in getFileContent(): " + error);
  }
}
function generateTodoData(searchString) {
  try {
    let items = window.items;
    let selectedFilters = new Array;
    if(window.userData.selectedFilters.length>0) selectedFilters = JSON.parse(window.userData.selectedFilters);
    let categoriesFiltered = new Array;
    if(window.userData.categoriesFiltered>0) categoriesFiltered = JSON.parse(window.userData.categoriesFiltered);
    // if set: remove all completed todos
    if(window.userData.showCompleted==false) {
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
    if(window.userData.categoriesFiltered.length > 0) {
      window.userData.categoriesFiltered.forEach(category => {
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
    // manipulate the result info box
    showResultStats().then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
    // reconfigure the main view according to amount of objects
    configureMainView().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    // empty the table containers before reading fresh data
    todoTableContainer.innerHTML = "";
    tableContainerDue.innerHTML = "";
    tableContainerComplete.innerHTML = "";
    tableContainerDueAndComplete.innerHTML = "";
    tableContainerNoPriorityNotCompleted.innerHTML = "";
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
      let arrayDue = new Array;
      let arrayNoPriorityNotCompleted = new Array;
      let arrayDueAndComplete = new Array;
      let arrayComplete = new Array;
      for (let item in items.objectsFiltered[priority][1]) {
        let todo = items.objectsFiltered[priority][1][item];
        if(!todo.text) continue;
        // if this todo is not a recurring one the rec value will be set to null
        if(!todo.rec) {
          todo.rec = null;
        // if item is due today or in the past and has recurrence it will be duplicated
        } else if(todo.due && todo.rec && !todo.complete && (todo.due.isToday() || todo.due.isPast())) {
          generateRecurringTodo(todo).then(response => {
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
            generateNotification(todo, 0).then(response => {
              console.log(response);
            }).catch(error => {
              console.log(error);
            });
          } else if(todo.due.isTomorrow()) {
            generateNotification(todo, 1).then(response => {
              console.log(response);
            }).catch(error => {
              console.log(error);
            });
          }
          arrayDue.push(todo);
        // incompleted todos with no due date
        } else if(!todo.due && !todo.complete) {
          arrayNoPriorityNotCompleted.push(todo);
        // completed todos with due date
        } else if(todo.due && todo.complete) {
          arrayDueAndComplete.push(todo);
        // completed todos with no due date
        } else if(!todo.due && todo.complete) {
          arrayComplete.push(todo);

        }
      }
      // sort the arrays and fill fragments
      // incompleted todos with due date
      arrayDue.sort(function(a, b) {
        return a.due - b.due;
      });
      arrayDue.forEach(todo => {
        tableContainerDue.appendChild(generateTableRow(todo));
      });
      // incompleted todos with no due date
      arrayNoPriorityNotCompleted.sort(function(a, b) {
        return a.due - b.due;
      });
      arrayNoPriorityNotCompleted.forEach(todo => {
        tableContainerNoPriorityNotCompleted.appendChild(generateTableRow(todo));
      });
      // completed todos with due date
      arrayDueAndComplete.sort(function(a, b) {
        return a.due - b.due;
      });
      arrayDueAndComplete.forEach(todo => {
        tableContainerDueAndComplete.appendChild(generateTableRow(todo));
      });
      // completed todos with no due date
      arrayComplete.sort(function(a, b) {
        return a.due - b.due;
      });
      arrayComplete.forEach(todo => {
        tableContainerComplete.appendChild(generateTableRow(todo));
      });
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
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateTodoData()", error])
    return Promise.reject("Error in generateTodoData(): " + error);
  }
}
function generateRecurringTodo(todo) {
  try {
    // duplicate not reference
    let recurringItem = Object.assign({}, todo);
    recurringItem.date = todo.due;
    recurringItem.due = getRecurrenceDate(todo.due, todo.rec);
    recurringItem.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
    // get index of recurring todo
    const index = window.items.objects.map(function(item) {return item.toString().replaceAll(String.fromCharCode(16)," "); }).indexOf(recurringItem.toString().replaceAll(String.fromCharCode(16)," "));
    // only add recurring todo if it is not already in the list
    if(index===-1) {
      window.items.objects.push(recurringItem);
      tableContainerDue.appendChild(generateTableRow(recurringItem));
      window.api.send("writeToFile", [window.items.objects.join("\n").toString(), window.userData.file]);
      return Promise.resolve("Success: Recurring todo created and written into file: " + recurringItem);
    } else {
      return Promise.resolve("Info: Recurring todo already in file, won't write anything");
    }
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "generateRecurringTodo()", error])
    return Promise.reject("Error in generateRecurringTodo(): " + error);
  }
}

function setTodoComplete(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
    // get index of todo
    const index = window.items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // mark item as in progress
    if(todo.complete) {
      // if item was already completed we set complete to false and the date to null
      todo.complete = false;
      todo.completed = null;
      // delete old item from array and add the new one at it's position
      window.items.objects.splice(index, 1, todo);
    // Mark item as complete
    } else if(!todo.complete) {
      if(todo.due) {
        const date = convertDate(todo.due);
        // if set to complete it will be removed from persisted notifcations
        // the one set for today
        if(window.userData.dismissedNotifications) {
          window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
          // the one set for tomorrow
          window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
          setUserData("dismissedNotifications", window.userData.dismissedNotifications);
        }
      }
      todo.complete = true;
      todo.completed = new Date();
      // delete old todo from array and add the new one at it's position
      window.items.objects.splice(index, 1, todo);
    }
    //write the data to the file
    //fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    window.api.send("writeToFile", [window.items.objects.join("\n").toString(), window.userData.file]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setTodoComplete()", error])
    return Promise.reject("Error in setTodoComplete(): " + error);
  }
}
function setTodoDelete(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
    // get index of todo
    const index = window.items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // Delete item
    if(todo.due) {
      var date = convertDate(todo.due);
      // if deleted it will be removed from persisted notifcations
      if(window.userData.dismissedNotifications) {
        // the one set for today
        window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
        // the one set for tomorrow
        window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
        setUserData("dismissedNotifications", window.userData.dismissedNotifications);
      }
    }
    window.items.objects.splice(index, 1);
    //write the data to the file
    //fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    window.api.send("writeToFile", [window.items.objects.join("\n").toString(), window.userData.file]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setTodoDelete()", error])
    return Promise.reject("Error in setTodoDelete(): " + error);
  }
}
function setTheme(switchTheme) {
  try {
    if(switchTheme) {
      switch (window.userData.theme) {
        case "dark":
          window.userData.theme = "light";
          break;
        case "light":
          window.userData.theme = "dark";
          break;
        default:
          window.userData.theme = "light";
          break;
      }
      setUserData("theme", window.userData.theme);
    }
    switch (window.userData.theme) {
      case "light":
        toggleDarkmode.checked = false;
        themeLink.href = "";
        break;
      case "dark":
        toggleDarkmode.checked = true;
        themeLink.href = window.appData.path + "/css/" + window.userData.theme + ".css";
        break;
    }
    return Promise.resolve("Success: Theme set to " + window.userData.theme);
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setTheme()", error])
    return Promise.reject("Error in setTheme(): " + error);
  }
}
function setTranslations() {
  try {
    window.api.send("getTranslations");
    window.api.receive("sendTranslations", (translations) => {
      // declare translations as global for usage later on
      window.translations = translations;
      // ########################################################################################################################
      // TRANSLATIONS
      // ########################################################################################################################
      btnTheme.setAttribute("title", translations.toggleDarkMode);
      btnSave.innerHTML = translations.save;
      todoTableSearch.placeholder = translations.search;
      filterToggleShowCompleted.innerHTML = translations.completedTodos;
      //filterBtnResetFilters.innerHTML = translations.resetFilters;
      addTodoContainerHeadline.innerHTML = translations.addTodoContainerHeadline;
      addTodoContainerSubtitle.innerHTML = translations.addTodoContainerSubtitle;
      addTodoContainerButton.innerHTML = translations.addTodo;
      onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;
      onboardingContainerBtnOpen.innerHTML = translations.openFile;
      onboardingContainerBtnCreate.innerHTML = translations.createFile;
      noResultContainerHeadline.innerHTML = translations.noResults;
      noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;
      modalFormInput.placeholder = translations.formTodoInputPlaceholder;
      modalChangeFileTitle.innerHTML = translations.selectFile;
      modalChangeFileOpen.innerHTML = translations.openFile;
      modalChangeFileCreate.innerHTML = translations.createFile;
      selectionBtnShowFilters.innerHTML = translations.toggleFilter;
      welcomeToSleek.innerHTML = translations.welcomeToSleek;
      dueDatePickerInput.placeholder = translations.formSelectDueDate;
      recurrencePickerEvery.innerHTML = translations.every;
      recurrencePickerDay.innerHTML = translations.day;
      recurrencePickerWeek.innerHTML = translations.week;
      recurrencePickerMonth.innerHTML = translations.month;
      recurrencePickerYear.innerHTML = translations.year;
      recurrencePickerNoRecurrence.innerHTML = translations.noRecurrence;
      recurrencePickerInput.placeholder = translations.noRecurrence;
      messageLoggingTitle.innerHTML = translations.errorEventLogging;
      messageLoggingBody.innerHTML = translations.messageLoggingBody;
      messageLoggingButton.innerHTML = translations.settings;
      settingsTabSettings.innerHTML = translations.settings;
      settingsTabSettingsLanguage.innerHTML = translations.language;
      settingsTabSettingsLanguageBody.innerHTML = translations.settingsTabSettingsLanguageBody;
      settingsTabSettingsArchive.innerHTML = translations.settingsTabSettingsArchive;
      settingsTabSettingsArchiveBody.innerHTML = translations.settingsTabSettingsArchiveBody;
      settingsTabSettingsArchiveButton.innerHTML = translations.archive;
      settingsTabSettingsNotifications.innerHTML = translations.notifications;
      settingsTabSettingsNotificationsBody.innerHTML = translations.settingsTabSettingsNotificationsBody;
      settingsTabSettingsDarkmode.innerHTML = translations.darkmode;
      settingsTabSettingsDarkmodeBody.innerHTML = translations.settingsTabSettingsDarkmodeBody;
      settingsTabSettingsLogging.innerHTML = translations.errorEventLogging;
      settingsTabSettingsLoggingBody.innerHTML = translations.settingsTabSettingsLoggingBody;
      settingsTabAbout.innerHTML = translations.about;
      settingsTabAboutContribute.innerHTML = translations.settingsTabAboutContribute;
      settingsTabAboutContributeBody.innerHTML = translations.settingsTabAboutContributeBody;
      settingsTabAboutCopyrightLicense.innerHTML = translations.settingsTabAboutCopyrightLicense;
      settingsTabAboutCopyrightLicenseBody.innerHTML = translations.settingsTabAboutCopyrightLicenseBody;
      settingsTabAboutPrivacy.innerHTML = translations.settingsTabAboutPrivacy;
      settingsTabAboutPrivacyBody.innerHTML = translations.settingsTabAboutPrivacyBody;
      settingsTabAboutExternalLibraries.innerHTML = translations.settingsTabAboutExternalLibraries;
      helpTabKeyboardTitle.innerHTML = translations.shortcuts;
      helpTabPrioritiesTitle.innerHTML = translations.helpTabPrioritiesTitle;
      helpTabPrioritiesBody.innerHTML = translations.helpTabPrioritiesBody;
      helpTabContextsProjectsTitle.innerHTML = translations.helpTabContextsProjectsTitle;
      helpTabContextsProjectsBody.innerHTML = translations.helpTabContextsProjectsBody;
      helpTabDatesRecurrencesTitle1.innerHTML = translations.helpTabDatesRecurrencesTitle1;
      helpTabDatesRecurrencesBody1.innerHTML = translations.helpTabDatesRecurrencesBody1;
      helpTabDatesRecurrencesTitle2.innerHTML = translations.helpTabDatesRecurrencesTitle2;
      helpTabDatesRecurrencesBody2.innerHTML = translations.helpTabDatesRecurrencesBody2;
      helpTab1Title.innerHTML = translations.shortcuts;
      helpTab2Title.innerHTML = translations.priorities;
      helpTab3Title.innerHTML = translations.helpTab3Title;
      helpTab4Title.innerHTML = translations.helpTab4Title;
      helpTabKeyboardTR1TD1.innerHTML = translations.addTodo;
      helpTabKeyboardTR2TD1.innerHTML = translations.find;
      helpTabKeyboardTR3TD1.innerHTML = translations.toggleCompletedTodos;
      helpTabKeyboardTR4TD1.innerHTML = translations.toggleDarkMode;
      helpTabKeyboardTR5TD1.innerHTML = translations.openFile;
      helpTabKeyboardTR6TD1.innerHTML = translations.settings;
      helpTabKeyboardTR7TD1.innerHTML = translations.helpTabKeyboardTR7TD1;
      helpTabKeyboardTR8TD1.innerHTML = translations.toggleFilter;
      helpTabKeyboardTR9TD1.innerHTML = translations.resetFilters;
      helpTabKeyboardTR1TH1.innerHTML = translations.function;

      todoTableBodyCellTextTemplate.setAttribute("title", translations.editTodo);
      dueDatePickerInput.setAttribute("size", translations.formSelectDueDate.length)
      navBtnHelp.firstElementChild.setAttribute("title", translations.help);
      navBtnSettings.firstElementChild.setAttribute("title", translations.settings);

      btnOpenTodoFile.forEach(function(el) {
        el.setAttribute("title", translations.openFile);
      });
      btnResetFilters.forEach(function(el) {
        el.getElementsByTagName('span')[0].innerHTML = translations.resetFilters;
      });
      btnCreateTodoFile.forEach(function(el) {
        el.setAttribute("title", translations.createFile);
      });

      btnChangeTodoFile.forEach(function(el) {
        el.setAttribute("title", translations.openFile);
      });

      btnModalCancel.forEach(function(el) {
        el.innerHTML = translations.cancel;
      });

      btnFilter.forEach(function(el) {
        el.setAttribute("title", translations.toggleFilter);
      });

      btnAddTodo.forEach(function(el) {
        el.setAttribute("title", translations.addTodo);
      });
    });
    return Promise.resolve("Success: Translations received and applied");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setTranslations()", error])
    return Promise.reject("Error in setTranslations(): " + error);
  }
}
function setUserData(key, value) {
  try {
    window.userData[key] = value;
    window.api.send("setUserData", [key, value]);
    return Promise.resolve("Success: Config written to config file");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setUserData()", error])
    return Promise.reject("Error in setUserData(): " + error);
  }
}
function setToggles() {
  try {
    // set the toggles in settings
    toggleMatomoEvents.checked = window.userData.matomoEvents;
    toggleNotifications.checked = window.userData.notifications;
    toggleShowCompleted.checked = window.userData.showCompleted;
    return Promise.resolve("Success: All toggles set");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setToggles()", error])
    return Promise.reject("Error in setToggles(): " + error);
  }
}
function setRecurrenceInput(recurrence) {
  let recSplit = splitRecurrence(recurrence);
  let label = window.translations.noRecurrence;
  if(recSplit.period !== undefined) {
    if(recSplit.mul > 1) {
      switch (recSplit.period) {
        case "d":
          label = recurrencePickerDay;
          break;
        case "w":
          label = recurrencePickerWeek;
          break;
        case "m":
          label = recurrencePickerMonth;
          break;
        case "y":
          label = recurrencePickerYear;
          break;
      }
      label = window.translations.every + " " + recSplit.mul + " " + label.innerHTML;
    } else {
      switch (recSplit.period) {
        case "d":
          label = window.translations.daily;
          break;
        case "w":
          label = window.translations.weekly;
          break;
        case "m":
          label = window.translations.monthly;
          break;
        case "y":
          label = window.translations.yearly;
          break;
      }
    }
  }
  recurrencePickerInput.value = label;
  recurrencePickerInput.setAttribute("size", label.length)
}
function setRecurrenceOptionLabels(mul) {
  if(mul>1) {
    recurrencePickerDay.innerHTML = window.translations.day_plural;
    recurrencePickerWeek.innerHTML = window.translations.week_plural;
    recurrencePickerMonth.innerHTML = window.translations.month_plural;
    recurrencePickerYear.innerHTML = window.translations.year_plural;
  } else {
    recurrencePickerDay.innerHTML = window.translations.day;
    recurrencePickerWeek.innerHTML = window.translations.week;
    recurrencePickerMonth.innerHTML = window.translations.month;
    recurrencePickerYear.innerHTML = window.translations.year;
  }
}
function setPriorityInput(priority) {
  if(priority===null) {
    priorityPicker.selectedIndex = 0;
  } else {
    Array.from(priorityPicker.options).forEach(function(option) {
      if(option.value===priority) {
        priorityPicker.selectedIndex = option.index;
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
function setFriendlyLanguageNames(languageCode) {
  try {
    window.appData.languages.forEach((language) => {
      // generate user friendly entries for language selection menu
      switch (language) {
        case "de":
          var friendlyLanguageName = "Deutsch"
          break;
        case "en":
          var friendlyLanguageName = "English"
          break;
        case "it":
          var friendlyLanguageName = "Italiano"
          break;
        case "es":
          var friendlyLanguageName = "‎Español"
          break;
        case "fr":
          var friendlyLanguageName = "Français"
          break;
        default:
          return;
      }
      var option = document.createElement("option");
      option.text = friendlyLanguageName;
      option.value = language;
      if(language===window.userData.language) option.selected = true;
      settingsLanguage.add(option);
    });
    return Promise.resolve("Success: Friendly language names added to select field in settings");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setFriendlyLanguageNames()", error])
    return Promise.reject("Error in setFriendlyLanguageNames(): " + error);
  }
}

function getUserData() {
  return new Promise(function(resolve, reject) {
    window.api.send("getUserData");
    window.api.receive("getUserData", (userData) => {
      resolve(userData);
    });
  });
}
function getAppData() {
  return new Promise(function(resolve, reject) {
    window.api.send("getAppData");
    window.api.receive("getAppData", (appData) => {
      resolve(appData);
    });
  });
}
function getFileContent(file) {
  try {
    if(!file) {
      showOnboarding(true);
      return Promise.reject("Info: File does not exist or has not been defined yet. Starting onboarding.");
    } else {
      return new Promise(function(resolve, reject) {
        window.api.send("getFileContent", file);
        window.api.receive("getFileContent", (content) => {
          resolve(content);
        });
      });
    }
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "getFileContent()", error])
    return Promise.reject("Error in getFileContent(): " + error);
  }
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

function toggleCompletedTodos(variable) {
  try {
    if(window.userData.showCompleted==false) {
      window.userData.showCompleted = true;
    } else if(variable) {
      window.userData.showCompleted = true;
    } else {
      window.userData.showCompleted = false;
    }
    toggleShowCompleted.checked = window.userData.showCompleted;
    // persist the sorting
    setUserData("showCompleted", window.userData.showCompleted);
    //
    t0 = performance.now();
    generateTodoData().then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Table rendered in:", t1 - t0, "ms");
    }).catch(error => {
      console.log(error);
    });
    return Promise.resolve("Success: Show completed todo set to: " + window.userData.showCompleted);
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "setToggles()", error])
    return Promise.reject("Error in setToggles(): " + error);
  }
}
function toggleInputSize(type) {
  switch (type) {
    case "input":
      var d = document.createElement('textarea');
      modalFormInputResize.setAttribute("data-input-type", "textarea");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-compress-alt\"></i>";
      // persist setting
      setUserData("useTextarea", true);
      break;
    case "textarea":
      var d = document.createElement('input');
      d.type = "text";
      modalFormInputResize.setAttribute("data-input-type", "input");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-expand-alt\"></i>";
      // persist setting
      setUserData("useTextarea", false);
      break;
    default:
      modalFormInputResize.setAttribute("data-input-type", "input");
  }
  d.id = "modalFormInput";
  d.setAttribute("tabindex", 300);
  d.setAttribute("class", "input is-medium");
  d.setAttribute("placeholder", translations.formTodoInputPlaceholder);
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

function matomoEventsConsent(setting) {
  try {
    if(!window.userData.uid) {
      // generate random number/string combination as user id and persist it
      var uid = Math.random().toString(36).slice(2);
      setUserData("uid", uid);
    }
    // only continue if app is connected to the internet
    if(!navigator.onLine) return Promise.resolve("Info: App is offline, Matomo will not be loaded");
    var _paq = window._paq = window._paq || [];
    // exclude development machine
    if(window.appData.development || uid==="DEVELOPMENT") return Promise.resolve("Info: Machine is development machine, logging will be skipped")
    _paq.push(['setUserId', window.userData.uid]);
    _paq.push(['setCustomDimension', 1, window.userData.theme]);
    _paq.push(['setCustomDimension', 2, window.userData.language]);
    _paq.push(['setCustomDimension', 3, window.userData.notifications]);
    _paq.push(['setCustomDimension', 4, window.userData.matomoEvents]);
    _paq.push(['setCustomDimension', 5, window.appData.version]);
    _paq.push(['setCustomDimension', 6, window.userData.windowBounds.width+"x"+window.userData.windowBounds.height]);
    _paq.push(['setCustomDimension', 7, window.userData.showCompleted]);
    _paq.push(['setCustomDimension', 8, window.userData.files.length]);
    _paq.push(['setCustomDimension', 9, window.userData.useTextarea]);
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
    if(window.userData.matomoEvents) {
      // user has given consent to process their data
      return Promise.resolve("Info: Consent given, Matomo error and event logging enabled");
    } else {
      // revoke matomoEvents consent
      _paq.push(['forgetConsentGiven']);
      return Promise.resolve("Info: No consent given, Matomo error and event logging disabled");
    }
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "matomoEventsConsent()", error])
    return Promise.reject("Error in matomoEventsConsent(): " + error);
  }
}

function configureMainView() {
  try {
    // add version number to about tab in settings modal
    version.innerHTML = window.appData.version;
    // open filter drawer if it has been persisted
    if(window.userData.filterDrawer) {
      showFilterDrawer(true).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
    }
    // check if archive button should be enabled
    setButtonState("btnArchiveTodos");
    // adjust input field
    if(window.userData.useTextarea) toggleInputSize("input");
    if(window.userData.file) {
      // if there is a file onboarding is hidden
      showOnboarding(false).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
    } else {
      // if there is a file onboarding is hidden
      showOnboarding(true).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
      return Promise.resolve("Info: No file selected, showing onboarding");
    }
    // hide/show the addTodoContainer or noResultTodoContainer
    // file has content and objects are shown
    if(window.items.objectsFiltered.length > 0 && window.items.objects.length>0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
      todoTable.classList.add("is-active");
      navBtnFilter.classList.add("is-active");
      return Promise.resolve("Info: File has content and results are shown");
    // file is NOT empty but no results
    } else if(window.items.objectsFiltered.length === 0 && window.items.objects.length>0) {
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.add("is-active");
      navBtnFilter.classList.add("is-active");
      return Promise.resolve("Info: File has content, but no results are shown due to filters or search input");
    // file is empty
    } else if(window.items.objects.length === 0) {
      addTodoContainer.classList.add("is-active");
      noResultContainer.classList.remove("is-active");
      todoTable.classList.remove("is-active");
      navBtnFilter.classList.remove("is-active");
      return Promise.resolve("Info: File is empty");
    }
  } catch(error) {
    showOnboarding(true).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "configureMainView()", error])
    return Promise.reject("Error in configureMainView(): " + error);
  }
}

function checkDismissedMessages() {
  try {
    if(!window.userData.dismissedMessages) return Promise.reject("Info: No already checked messages found, will skip this check");
    messages.forEach((message) => {
      if(window.userData.dismissedMessages.includes(message.getAttribute("data"))) {
        message.classList.remove("is-active");
      } else {
        message.classList.add("is-active");
      }
    });
    return Promise.resolve("Info: Checked for already dismissed messages");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "checkDismissedMessages()", error])
    return Promise.reject("Error in checkDismissedMessages(): " + error);
  }
}

function resetFilters() {
  try {
    // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
    setUserData("selectedFilters", new Array);
    // clear filtered categories
    setUserData("categoriesFiltered", new Array);
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
    return Promise.resolve("Success: Filters resetted");
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "resetFilters()", error])
    return Promise.reject("Error in resetFilters(): " + error);
  }
}

function submitForm() {
  try {
    let items = window.items;
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
      let todo = new TodoTxtItem(modalForm.elements[0].value.replaceAll(/[\r\n]+/g, String.fromCharCode(16)), [ new DueExtension(), new RecExtension() ]);
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = window.translations.formInfoDuplicate;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo already exists in file, won't write duplicate");
      // check if todo text is empty
      } else if(!todo.text) {
        modalFormAlert.innerHTML = window.translations.formInfoIncomplete;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo is incomplete");
      }
      // jump to index, remove 1 item there and add the value from the input at that position
      items.objects.splice(index, 1, todo);
    // Add todo
    } else if(modalForm.getAttribute("data-item")==null && modalForm.elements[0].value!="") {
      // in case there hasn't been a passed data item, we just push the input value as a new item into the array
      // replace new lines with spaces (https://stackoverflow.com/a/34936253)
      let todo = new TodoTxtItem(modalForm.elements[0].value.replaceAll(/[\r\n]+/g, String.fromCharCode(16)), [ new DueExtension(), new RecExtension() ]);
      // we add the current date to the start date attribute of the todo.txt object
      todo.date = new Date();
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = window.translations.formInfoDuplicate;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo already exists in file, won't write duplicate");
      // check if todo text is empty
      } else if(!todo.text) {
        modalFormAlert.innerHTML = window.translations.formInfoIncomplete;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.reject("Info: Todo is incomplete");
      }
      // we build the array
      items.objects.push(todo);
      // mark the todo for anchor jump after next reload
      item.previous = todo.toString();
    } else if(modalForm.elements[0].value=="") {
      modalFormAlert.innerHTML = window.translations.formInfoNoInput;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
      modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
      return Promise.reject("Info: Will not write empty todo");
    }
    //write the data to the file
    window.api.send("writeToFile", [items.objects.join("\n").toString(), window.userData.file]);
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Form", "Submit"]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  // if the input field is empty, let users know
  } catch (error) {
    // if writing into file is denied throw alert
    modalFormAlert.innerHTML = window.translations.formErrorWritingFile + window.userData.file;
    modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "submitForm()", error])
    return Promise.reject("Error in submitForm(): " + error);
  }
}

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

function archiveTodos() {
  try {
    // cancel operation if there are no completed todos
    if(items.complete.length===0) return Promise.resolve("Info: No completed todos found, nothing will be archived")
    // if user archives within done.txt file, operating is canceled
    if(window.userData.file.split("/").pop() === "done.txt") return Promise.reject("Info: Current file seems to be a done.txt file, won't archive")
    // define path to done.txt
    let doneFile = window.userData.file.replace(window.userData.file.split("/").pop(), "done.txt");
    items.doneTxtObjects = new Array;
    getFileContent(doneFile).then(function(result) {
      if(result) items.doneTxtObjects = TodoTxt.parse(result, [ new DueExtension(), new RecExtension() ]);
      // in case done file was not empty the completed todos will be appended
      if(items.doneTxtObjects.length>0) {
        // only consider completed todo that are not already present in done.txt
        items.doneTxtObjects.forEach(itemComplete => {
          window.items.complete = window.items.complete.filter(function(item) { return item.toString() != itemComplete.toString() });
        });
        // combine done objects from todo.txt and done.txt
        window.items.complete = items.doneTxtObjects.concat(window.items.complete);
        // write combined objects to done.txt
        window.api.send("writeToFile", [window.items.complete.join("\n").toString(), doneFile]);
      // if done.txt did not exist or was empty, file will be created and filled with data
      } else {
        // if done.txt did not exist or was empty, file will be created and filled with data
        window.api.send("writeToFile", [window.items.complete.join("\n").toString(), doneFile]);
      }
    }).catch(error => {
      console.log(error);
    });
    // write incomplete only todos to todo.txt
    window.api.send("writeToFile", [window.items.incomplete.join("\n").toString(), window.userData.file]);
    return Promise.resolve("Success: Completed todo moved to: " + doneFile)
  } catch(error) {
    // trigger matomo event
    if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "archiveTodos()", error])
    return Promise.reject("Error in archiveTodos(): " + error)
  }
}

window.onload = async function () {

  // set listeners
  window.api.receive("reloadContent", (content) => {
    // advice main process to start the filewatcher
    window.api.send("startFileWatcher", window.userData.file);
    generateItemsObject(content).then(function(result) {
      console.log(result);
      // close any modal
      clearModal();
    }).catch(function(error) {
      console.log(error);
    });
  });

  // change file
  window.api.receive("changeFile", (file) => {
    changeFile(file).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
  });

  // trigger function in renderer process
  window.api.receive("triggerFunction", (name, args) => {
    switch (name) {
      case "toggleCompletedTodos":
        toggleCompletedTodos().then(function(appData) {
          window.appData = appData;
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "setTheme":
        setTheme(args.join()).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "showOnboarding":
        showOnboarding(args.join()).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "showFilterDrawer":
        showFilterDrawer(args.join()).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "archiveTodos":
        archiveTodos().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "showForm":
        showForm().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
      case "resetFilters":
        resetFilters().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        break;
    }
  });

  // call app data and only continue if result is ready
  await getAppData().then(function(appData) {
    window.appData = appData;
  }).catch(function(error) {
    console.log(error);
  });

  // call user data and write it to a global variable
  await getUserData().then(function(userData) {
    window.userData = userData;
    if(!userData.file) showOnboarding(true)
  }).catch(function(error) {
    console.log(error);
  });

  // call for translations and apply them
  setToggles().then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

  // call for translations and apply them
  setTranslations().then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

  // get file content and create the items object
  await getFileContent(window.userData.file).then(function(result) {
    // only continue if we have the items object
    generateItemsObject(result).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    // advice main process to start the filewatcher
    window.api.send("startFileWatcher", window.userData.file);
  }).catch(error => {
    console.log(error);
  });

  // add friendly language names to settings dropdown
  setFriendlyLanguageNames(window.userData.language).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

  // set theme
  setTheme().then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

  // On app load only call matomo function if opt in is set
  matomoEventsConsent(window.userData.matomoEvents).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });

  // check for already dismissed messages to prevent them to show up again
  checkDismissedMessages().then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

  // persist window size on resize
  window.onresize = function() {
    try {
      let width = this.outerWidth;
      let height = this.outerHeight;
      setUserData("windowBounds", { width, height }).then(function() {
        // Adjust position of suggestion box to input field
        let modalFormInputPosition = modalFormInput.getBoundingClientRect();
        suggestionContainer.style.width = modalFormInput.offsetWidth + "px";
        suggestionContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
        suggestionContainer.style.left = modalFormInputPosition.left + "px";
        return Promise.resolve("Success: Window bounds Config written to config file");
      }).catch(function(error) {
        return Promise.reject("Error in window.onresize: " + error);
      });
    } catch(error) {
      // trigger matomo event
      if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "window.onresize", error])
      return Promise.reject("Error in window.onresize: " + error);
    }
  }
}
