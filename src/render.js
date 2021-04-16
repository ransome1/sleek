// ########################################################################################################################
// DECLARATIONS
// ########################################################################################################################
const a = document.querySelectorAll("a");
const documentIds = document.querySelectorAll("[id]");
documentIds.forEach(function(id,index) {
  window[id] = document.getElementById(id.getAttribute("id"));
});
// ########################################################################################################################
// PREPARE TABLE BUILDING
// ########################################################################################################################
const todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
const tableContainerDue = document.createDocumentFragment();
const tableContainerComplete = document.createDocumentFragment();
const tableContainerDueAndComplete = document.createDocumentFragment();
const tableContainerNoPriorityNotCompleted = document.createDocumentFragment();
const tableContainerContent = document.createDocumentFragment();
const todoTableBodyRowTemplate = document.createElement("div");
const todoTableBodyCellCheckboxTemplate  = document.createElement("div");
const todoTableBodyCellTextTemplate = document.createElement("a");
const tableContainerCategoriesTemplate = document.createElement("span");
const todoTableBodyCellMoreTemplate = document.createElement("div");
const todoTableBodyCellPriorityTemplate = document.createElement("div");
const todoTableBodyCellSpacerTemplate = document.createElement("div");
const todoTableBodyCellDueDateTemplate = document.createElement("span");
const todoTableBodyCellRecurrenceTemplate = document.createElement("span");

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
const navBtns = document.querySelectorAll(".navBtn");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const drawers = document.querySelectorAll(".drawer");
const item = { previous: "" }
let categories;
let visibleRows;
// ########################################################################################################################
// CONFIGURE MARKDOWN PARSER
// ########################################################################################################################
marked.setOptions({
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  sanitizer: false,
  smartLists: false,
  smartypants: false,
  xhtml: false,
  baseUrl: "https://"
});
renderer = {
  link(href, title, text) {
    // truncate the url
    if(text.length > 40) text = text.slice(0, 40) + " [...] ";
    return `${text}<a href="${href}" target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a>`;
  }
};
marked.use({ renderer });
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
Date.prototype.isFuture = function () {
  const today = new Date();
  if (this.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) return true
  return false;
};
// ########################################################################################################################
// HELPER FUNCTIONS
// ########################################################################################################################
function clearModal() {
  try {
    // reset priority setting
    priorityPicker.selectedIndex = 0;
    // if recurrence picker was open it is now being closed
    recurrencePickerContainer.classList.remove("is-active");
    // if file chooser was open it is now being closed
    modalChangeFile.classList.remove("is-active");
    // hide suggestion box if it was open
    autoCompleteContainer.classList.remove("is-active");
    // remove focus from suggestion container
    autoCompleteContainer.blur();
    // defines when the composed filter is being filled with content and when it is emptied
    let startComposing = false;
    // in case a category will be selected from suggestion box we need to remove the category from input value that has been written already
    let autoCompleteValue = "";
    // + or @
    let autoCompletePrefix = "";
    modalForm.classList.remove("is-active");
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
    return Promise.resolve("Info: Modal closed and it's values emptied");
  } catch (error) {
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Error", "clearModal()", error])
    return Promise.reject("Error in clearModal(): " + error);
  }

}
function modalFormInputEvents() {
  // if textarea, resize to content length
  if(modalFormInput.tagName==="TEXTAREA") {
    modalFormInput.style.height="auto";
    modalFormInput.style.height= modalFormInput.scrollHeight+"px";
  }
  let autoCompleteValue ="";
  let autoCompletePrefix = "";
  let caretPosition = getCaretPosition(modalFormInput);
  let autoCompleteCategory = "";
  // if datepicker was visible it will be hidden with every new input
  if((modalFormInput.value.charAt(caretPosition-2) === " " || modalFormInput.value.charAt(caretPosition-2) === "\n") && (modalFormInput.value.charAt(caretPosition-1) === "@" || modalFormInput.value.charAt(caretPosition-1) === "+")) {
    autoCompleteValue = modalFormInput.value.substr(caretPosition, modalFormInput.value.lastIndexOf(" ")).split(" ").shift();
    autoCompletePrefix = modalFormInput.value.charAt(caretPosition-1);
  } else if(modalFormInput.value.charAt(caretPosition) === " ") {
    autoCompleteValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+2).split(" ").shift();
    autoCompletePrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition-1)+1);
  } else if(modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "@" || modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1) === "+") {
    autoCompleteValue = modalFormInput.value.substr(modalFormInput.value.lastIndexOf(" ", caretPosition)+2).split(" ").shift();
    autoCompletePrefix = modalFormInput.value.charAt(modalFormInput.value.lastIndexOf(" ", caretPosition)+1);
  } else {
    autoCompleteContainer.classList.remove("is-active");
    autoCompleteContainer.blur();
    return false;
  }
  // suppress suggestion box if caret is at the end of word
  if(autoCompletePrefix) {
    if(autoCompletePrefix=="+") {
      autoCompleteCategory = "projects";
    } else if(autoCompletePrefix=="@") {
      autoCompleteCategory = "contexts";
    }
    // parsed data will be passed to generate filter data and build the filter buttons
    t0 = performance.now();
    generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix, caretPosition).then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Filters rendered:", t1 - t0, "ms");
    }).catch (error => {
      console.log(error);
    });
  } else {
    autoCompleteContainer.classList.remove("is-active");
    autoCompleteContainer.blur();
  }
  positionautoCompleteContainer();
}
function positionautoCompleteContainer() {
  // Adjust position of suggestion box to input field
  let modalFormInputPosition = modalFormInput.getBoundingClientRect();
  autoCompleteContainer.style.width = modalFormInput.offsetWidth + "px";
  autoCompleteContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
  autoCompleteContainer.style.left = modalFormInputPosition.left + "px";
}
function zoom(zoom, reset) {
  try {
    //let zoom = window.userData.zoom;
    html.style.zoom = zoom + "%";
    zoomStatus.innerHTML = zoom + "%";
    zoomRangePicker.value = zoom;
    // persist zoom setting
    setUserData("zoom", zoom);
    // set zoom status in view container
    return Promise.resolve("Info: Zoom set to " + zoom + "%");
  } catch (error) {
  // trigger matomo event
  if(window.consent) _paq.push(["trackEvent", "Error", "zoom()", error])
  return Promise.reject("Error in zoom(): " + error);
  }
}
function resizeInput(input) {
  if(input.value) {
    input.style.width = input.value.length + 6 + "ch";
  } else if(!this.value && input.placeholder) {
    input.style.width = input.placeholder.length + 6 + "ch";
  }
}
function isInViewport(item) {
  const rect = item.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
// ########################################################################################################################
// RESIZEABLE FILTER DRAWER
// https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
// ########################################################################################################################
const getResizeableElement = () => { return document.getElementById("drawerContainer"); };
const getHandleElement = () => { return document.getElementById("handle"); };
const minPaneSize = 400;
const maxPaneSize = document.body.clientWidth * .75
const setPaneWidth = (width) => {
  getResizeableElement().style.setProperty("--resizeable-width", `${width}px`);
  setUserData("drawerWidth", `${width}`);
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
    if(visibleRows!=items.objects.length) {
      resultStats.classList.add("is-active");
      resultStats.firstElementChild.innerHTML = window.translations.visibleTodos + "&nbsp;<strong>" + visibleRows + " </strong>&nbsp;" + window.translations.of + "&nbsp;<strong>" + items.objects.length + "</strong>";
      return Promise.resolve("Info: Filters found, result box is shown");
    } else {
      resultStats.classList.remove("is-active");
      return Promise.resolve("Info: No filters found, result box is hidden");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function showForm(todo, templated) {
  try {
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
        if(todo.rec) {
          setRecurrenceInput(todo.rec).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            console.log(error);
          });
        }
        // if so we paste it into the input field
        if(todo.dueString) {
          dueDatePicker.setDate(todo.dueString);
          dueDatePickerInput.value = todo.dueString;
          //dueDatePickerInput.setAttribute("size", dueDatePickerInput.value.length);
          // only show the recurrence picker when a due date is set
          recurrencePicker.classList.add("is-active");
          //recurrencePickerInput.setAttribute("size", recurrencePickerInput.value.length);
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
      // adjust size of recurrence picker input field
      resizeInput(recurrencePickerInput);
      // adjust size of due date picker input field
      resizeInput(dueDatePickerInput);
      //resizeInput(recurrencePickerInput);
      // in any case put focus into the input field
      modalFormInput.focus();
      // if textarea, resize to content length
      if(modalFormInput.tagName==="TEXTAREA") {
        modalFormInput.style.height="auto";
        modalFormInput.style.height= modalFormInput.scrollHeight+"px";
      }
      positionautoCompleteContainer();
      return Promise.resolve("Info: Show/Edit todo window opened");
  } catch (error) {
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Error", "showForm()", error])
    return Promise.reject("Error in showForm(): " + error);
  }
}
function showOnboarding(variable) {
  try {
    if(variable) {
      onboardingContainer.classList.add("is-active");
      btnAddTodo.forEach(item => item.classList.add("is-hidden"));
      navBtnFilter.classList.add("is-hidden");
      navBtnView.classList.add("is-hidden");
      todoTable.classList.remove("is-active");
      todoTableSearchContainer.classList.remove("is-active");
      return Promise.resolve("Info: Starting onboarding");
    } else {
      onboardingContainer.classList.remove("is-active");
      btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
      navBtnFilter.classList.remove("is-hidden");
      navBtnView.classList.remove("is-hidden");
      todoTable.classList.add("is-active");
      todoTableSearchContainer.classList.add("is-active");
      return Promise.resolve("Info: Ending onboarding");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
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
    setRecurrenceInput(value).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
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
      if(window.consent) _paq.push(["trackEvent", "Form", "Recurrence selected: " + recSplit.period]);
    }
  });
}
function showDrawer(variable, buttonId, drawerId) {
  try {
    switch (drawerId) {
      case "viewDrawer":
        if(window.userData.showCompleted) {
          viewToggleSortCompletedLast.parentElement.classList.remove("is-hidden");
        } else {
          viewToggleSortCompletedLast.parentElement.classList.add("is-hidden");
        }
        // set viewContainer sort select
        Array.from(viewSelectSortBy.options).forEach(function(item) {
          if(item.value===window.userData.sortBy) item.selected = true
        });
        break;
    }
    buttonId = document.getElementById(buttonId);
    drawerId = document.getElementById(drawerId);
    // always hide the drawer container first
    drawerContainer.classList.remove("is-active");
    //
    // next show or hide the single drawers
    switch(variable) {
      case true:
        buttonId.classList.add("is-highlighted");
        drawerId.classList.add("is-active");
      break;
      case false:
        drawers.forEach(function(drawer) {
          drawer.classList.remove("is-active");
        });
        navBtns.forEach(function(navBtn) {
          navBtn.classList.remove("is-highlighted");
        });
        drawerContainer.classList.remove("is-active");
      break;
      case "toggle":
        buttonId.classList.toggle("is-highlighted");
        drawerId.classList.toggle("is-active");
      break;
    }
    // if any of the drawers is active now, also show the container
    drawers.forEach(function(drawer) {
      if(drawer.classList.contains("is-active")) {
        drawerContainer.classList.add("is-active");
        setUserData(drawer.id, true);
      } else {
        setUserData(drawer.id, false);
      }
    });
    // persist filter drawer state
    if(drawerId && drawerId.classList.contains("is-active")) {
      // if the drawer is open the table needs a fixed width to overlap the viewport
      todoTable.style.minWidth = "45em";
      todoTableSearchContainer.style.minWidth = "45em";
    } else {
      // undo what has been done
      todoTable.style.minWidth = "auto";
      todoTableSearchContainer.style.minWidth = "auto";
    }
    // if more toggle is open we close it as user doesn't need it anymore
    showMore(false);
    return Promise.resolve("Success: Drawer toggled");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
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
function showFiles() {
  try {
    let files = window.userData.files;
    modalChangeFile.classList.add("is-active");
    modalChangeFile.focus();
    modalChangeFileTable.innerHTML = "";
    for (let file in files) {
      // skip if file doesn't exist
      var table = modalChangeFileTable;
      table.classList.add("files");
      var row = table.insertRow(0);
      row.setAttribute("data-path", files[file][1]);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      if(files[file][0]===1) {
        cell1.innerHTML = "<button class=\"button\" disabled>" + window.translations.selected + "</button>";
      } else {
        cell1.innerHTML = "<button class=\"button is-link\">" + window.translations.select + "</button>";
        cell1.onclick = function() {
          window.api.send("startFileWatcher", this.parentElement.getAttribute("data-path"));
          clearModal().then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          // trigger matomo event
          if(window.consent) _paq.push(["trackEvent", "File", "Click on select button"]);
        }
        cell3.innerHTML = "<i class=\"fas fa-minus-circle\"></i>";
        cell3.title = window.translations.delete;
        cell3.onclick = function() {
          let path = this.parentElement.getAttribute("data-path");
          // remove file from files array
          files = files.filter(function(file) {
            return file[1] != path;
          });
          // persist new files array
          setUserData("files", files);
          // after array is updated, open the modal again
          showFiles().then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
        }
      }
      cell2.innerHTML = files[file][1];
    }
    return Promise.resolve("Success: File changer modal built and opened");
  } catch (error) {
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Error", "showFiles()", error])
    return Promise.reject("Error in showFiles(): " + error);
  }
}
function showError(error) {
  errorContainer.classList.add("is-active");
  errorMessage.innerHTML = error.functionName + ": " + error;
  // trigger matomo event
  if(window.consent) _paq.push(["trackEvent", "Error", error.functionName, error])
}

function generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix, caretPosition) {
  try {
    // select the container (filter drawer or autocomplete) in which filters will be shown
    if(autoCompleteCategory) {
      var container = autoCompleteContainer;
      container.innerHTML = "";
      // empty default categories
      categories = [];
      // fill only with selected autocomplete category
      categories.push(autoCompleteCategory);
      // for the suggestion container, so all filters will be shown
      items.filtered = items.objects;
    // in filter drawer, filters are adaptive to the shown items
    } else {
      // empty filter container first
      var container = todoFilters;
      container.innerHTML = "";
      // needs to be reset every run, because it can be overwritten by previous autocomplete
      categories = ["priority", "contexts", "projects"];
    }
    categories.forEach((category) => {
      // array to collect all the available filters in the data
      let filters = new Array();
      // run the array and collect all possible filters, duplicates included
      items.filtered.forEach((item) => {
        // check if the object has values in either the project or contexts field
        if(item[category]) {
          // push all filters found so far into an array
          for (let filter in item[category]) {
            // if user has not opted for showComplete we skip the filter of this particular item
            if(window.userData.showCompleted==false && item.complete==true) {
              continue;
            // if task is hidden the filter will be marked
            } else if(item.h) {
              filters.push([item[category][filter],0]);
            } else {
              filters.push([item[category][filter],1]);
            }
          }
        }
      });
      // search within filters according to autoCompleteValue
      if(autoCompletePrefix) {
        filters = filters.filter(function(el) { return el.toString().toLowerCase().includes(autoCompleteValue.toLowerCase()); });
      }
      // remove duplicates, create the count object and avoid counting filters of hidden todos
      filtersCounted = filters.reduce(function(filters, filter) {
        // if filter is already in object and should be counted
        if (filter[1] && (filter[0] in filters)) {
          filters[filter[0]]++;
        // new filter in object and should be counted
        } else if(filter[1]) {
          filters[filter[0]] = 1;
        // do not count if filter is suppose to be hidden
        // only overwrite value with 0 if the filter doesn't already exist in object
        } else if(!filter[1] && !(filter[0] in filters)) {
          filters[filter[0]] = 0;
        }
        if(filters!=null) {
          return filters;
        }
      }, {});
      // sort filter alphanummerically (https://stackoverflow.com/a/54427214)
      filtersCounted = Object.fromEntries(
        Object.entries(filtersCounted).sort(new Intl.Collator('en',{numeric:true, sensitivity:'accent'}).compare)
      );
      // remove duplicates from available filters
      // https://wsvincent.com/javascript-remove-duplicates-array/
      filters = [...new Set(filters.join(",").split(","))];
      // filter persisted filters
      if(window.userData.selectedFilters.length>0) {
        selectedFilters = JSON.parse(window.userData.selectedFilters);
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
      }
      // build the filter buttons
      if(filters[0]!="" && filters.length>0) {
        generateFilterButtons(category, autoCompleteValue, autoCompletePrefix, caretPosition).then(response => {
          if(window.userData.hideFilterCategories.includes(category)) {
            response.classList.add("is-greyed-out");
          }
          container.appendChild(response);
        }).catch (error => {
          console.log(error);
        });
      } else {
        autoCompleteContainer.classList.remove("is-active");
        autoCompleteContainer.blur();
        console.log("Info: No " + category + " found in todo.txt data, so no filters will be generated");
      }
    });
    return Promise.resolve("Success: Filter data generated");
  } catch (error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function generateFilterButtons(category, autoCompleteValue, autoCompletePrefix, caretPosition) {
  try {
    let selectedFilters = new Array;
    if(window.userData.selectedFilters.length>0) selectedFilters = JSON.parse(window.userData.selectedFilters);
    // creates a div for the specific filter section
    let todoFiltersSub = document.createElement("div");
    todoFiltersSub.setAttribute("class", "dropdown-item " + category);
    // translate headline
    if(category=="contexts") {
      var headline = window.translations.contexts;
    } else if(category=="projects"){
      var headline = window.translations.projects;
    } else if(category=="priority"){
      var headline = window.translations.priority;
    }
    if(autoCompletePrefix==undefined) {
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 title");
      todoFilterHeadline.innerHTML = "<i class=\"far fa-eye-slash\" tabindex=\"-1\"></i>&nbsp;" + headline;
      todoFilterHeadline.onclick = function() {
        let hideFilterCategories = window.userData.hideFilterCategories;
        if(hideFilterCategories.includes(category)) {
          hideFilterCategories.splice(hideFilterCategories.indexOf(category),1)
          this.parentElement.classList.remove("is-greyed-out");
          this.innerHTML = "<i class=\"far fa-eye-slash\" tabindex=\"-1\"></i>&nbsp;" + headline;
        } else {
          hideFilterCategories.push(category);
          this.parentElement.classList.add("is-greyed-out");
          this.innerHTML = "<i class=\"far fa-eye\" tabindex=\"-1\"></i>&nbsp;" + headline;

          hideFilterCategories = [...new Set(hideFilterCategories.join(",").split(","))];
        }
        setUserData("hideFilterCategories", hideFilterCategories)
        //startBuilding();
        generateGroups(items.filtered).then(function(groups) {
          generateTable(groups);
        });
      }
      // add the headline before category container
      todoFiltersSub.appendChild(todoFilterHeadline);
    } else {
      // show suggestion box
      autoCompleteContainer.classList.add("is-active");
      autoCompleteContainer.focus();
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 title headline " + category);
      // no need for tab index if the headline is in suggestion box
      if(autoCompletePrefix==undefined) todoFilterHeadline.setAttribute("tabindex", -1);
      todoFilterHeadline.innerHTML = headline;
      // add the headline before category container
      todoFiltersSub.appendChild(todoFilterHeadline);
    }
    // build one button each
    for (let filter in filtersCounted) {
      // skip this loop if no filters are present
      if(!filter) continue;
      let todoFiltersItem = document.createElement("a");
      todoFiltersItem.setAttribute("class", "button " + filter);
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      if(autoCompletePrefix==undefined) { todoFiltersItem.setAttribute("tabindex", 0) } else { todoFiltersItem.setAttribute("tabindex", 301) }
      todoFiltersItem.setAttribute("href", "#");
      todoFiltersItem.innerHTML = filter;
      if(autoCompletePrefix==undefined) {
        todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">" + filtersCounted[filter] + "</span>";
        // create the event listener for filter selection by user
        todoFiltersItem.addEventListener("click", (el) => {
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
          startBuilding();
          // trigger matomo event
          if(window.userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
        });
      // suggestion container
      } else {
        // add filter to input
        todoFiltersItem.addEventListener("click", () => {
          // remove composed filter first, as it is going to be replaced with a filter from suggestion box
          if(autoCompleteValue) {
            // only if input is not only the prefix, otherwise all existing prefixes will be removed
            modalFormInput.value = modalFormInput.value.replace(" " + autoCompletePrefix+autoCompleteValue, "");
            // add filter from suggestion box
            modalFormInput.value += " " + autoCompletePrefix+todoFiltersItem.getAttribute("data-filter") + " ";
          } else {
            // add button data value to the exact caret position
            modalFormInput.value = [modalFormInput.value.slice(0, caretPosition), todoFiltersItem.getAttribute('data-filter'), modalFormInput.value.slice(caretPosition)].join('') + " ";
          }
          // hide the suggestion container after the filter has been selected
          autoCompleteContainer.blur();
          autoCompleteContainer.classList.remove("is-active");
          // trigger matomo event
          // put focus back into input so user can continue writing
          modalFormInput.focus();
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
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function generateHash(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}
function generateRecurringTodo(todo) {
  try {
    // duplicate not reference
    let recurringItem = Object.assign({}, todo);
    // if the item to be duplicated has been completed before the due date, the recurring item needs to be set incomplete again
    if(recurringItem.complete && recurringItem.due && recurringItem.due.isFuture()) {
      recurringItem.date = new Date;
      recurringItem.due = getRecurrenceDate(todo.due, todo.rec);
      recurringItem.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
      recurringItem.complete = false;
      recurringItem.completed = null;
    } else if(recurringItem.complete && !recurringItem.due) {
      //console.log(recurringItem);
      recurringItem.date = new Date;
      recurringItem.due = getRecurrenceDate(todo.completed, todo.rec);
      recurringItem.dueString = convertDate(getRecurrenceDate(todo.completed, todo.rec));
      recurringItem.complete = false;
      recurringItem.completed = null;
    } else {
      recurringItem.date = todo.due;
      recurringItem.due = getRecurrenceDate(todo.due, todo.rec);
      recurringItem.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
    }
    // get index of recurring todo
    const index = items.objects.map(function(item) {return item.toString().replaceAll(String.fromCharCode(16)," "); }).indexOf(recurringItem.toString().replaceAll(String.fromCharCode(16)," "));
    // only add recurring todo if it is not already in the list
    if(index===-1) {
      items.objects.push(recurringItem);
      tableContainerDue.appendChild(generateTableRow(recurringItem));
      window.api.send("writeToFile", [items.objects.join("\n").toString(), window.userData.file]);
      return Promise.resolve("Success: Recurring todo created and written into file: " + recurringItem);
    } else {
      return Promise.resolve("Info: Recurring todo already in file, won't write anything");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
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
          title = window.translations.dueToday;
          break;
        case 1:
          title = window.translations.dueTomorrow;
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
      if(window.consent) _paq.push(["trackEvent", "Notification", "Shown"]);
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function generateTable(groups) {
  // prepare the templates for the table
  return configureTodoTableTemplate()
  .then(function() {
    visibleRows = 0;
    for (let group in groups) {
      // nodes need to be created to add them to the outer fragment
      // create a divider row
      // completed todos
      if(window.userData.sortCompletedLast && groups[group][0]==="completed") {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"></div></div>"))
      // for priority, context and project
      } else if(groups[group][0]!="null" && window.userData.sortBy!="dueString") {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table " + window.userData.sortBy + " group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"><span class=\"button " + groups[group][0] + "\">" + groups[group][0].replace(/,/g, ', ') + "</span></div></div>"))
      // if sorting is by due date
      } else if(window.userData.sortBy==="dueString" && groups[group][1][0].due) {
        if(groups[group][1][0].due.isToday()) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isToday\" role=\"cell\"><span class=\"button\">" + window.translations.today + "</span></div></div>"));
        } else if(groups[group][1][0].due.isTomorrow()) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isTomorrow\" role=\"cell\"><span class=\"button\">" + window.translations.tomorrow + "</span></div></div>"));
        } else if(groups[group][1][0].due.isPast()) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isPast\" role=\"cell\"><span class=\"button\">" + groups[group][0] + "</span></div></div>"));
        } else {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"><span class=\"button\">" + groups[group][0] + "</span></div></div>"))
        }
      // create an empty divider row
      } else {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"></div></div>"))
      }
      // first sort by priority
      groups[group][1] = groups[group][1].sort(function(a, b) {
        // most recent or already past todo will be sorted to the top
        if (a.priority < b.priority || !b.priority) {
          return -1;
        } else if (a.priority > b.priority) {
          return 1;
        } else {
          // if all fail, no change to sort order
          return 0;
        }
      });
      // second sort by due date
      groups[group][1] = groups[group][1].sort(function(a, b) {
        // when a is smaller than b it, a is put after b
        if(a.priority===b.priority && a.due < b.due) return -1
        // when a is is undefined but b is not, b is put before a
        if(a.priority===b.priority && !a.due && b.due) return 1
        // when b is is undefined but a is not, a is put before b
        if(a.priority===b.priority && a.due && !b.due) return -1
        // if all fail, no change to sort order
        return 0;
      });
      // build the fragments per group
      for (let item in groups[group][1]) {
        let todo = groups[group][1][item];
        // check if todo is suppose to be visible, if not build process is skipped
        //if(!isTodoVisible(todo)) continue
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
        }
        tableContainerContent.appendChild(generateTableRow(todo));
      }
    }
    // append all generated groups to the main container
    todoTableContainer.appendChild(tableContainerContent);
    return new Promise(function(resolve) {
      resolve();
    });
  }).catch(error => {
    console.log(error);
  });
}
function generateTableRow(todo) {
  try {
    visibleRows++;
    // create nodes from templates
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
    if(todo.priority && window.userData.sortBy==="priority") {
      todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + todo.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else if(!todo.priority && window.userData.sortBy==="priority") {
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
         console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Todo-Table", "Click on Checkbox"]);
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(todo.text) {
      if(todo.priority && window.userData.sortBy!="priority") todoTableBodyCellText.innerHTML = "<span class=\"priority\"><span class=\"button " + todo.priority + "\">" + todo.priority + "</span></span>";
      // parse text string through markdown parser
      todoTableBodyCellText.innerHTML +=  marked.parseInline(todo.text);
      //todoTableBodyCellText.innerHTML =  todo.text;
      // replace line feed replacement character with a space
      todoTableBodyCellText.innerHTML = todoTableBodyCellText.innerHTML.replaceAll(String.fromCharCode(16)," ");
      // add a spacer to divide text (and link) and categories
      todoTableBodyCellText.innerHTML += " ";
    }
    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, showForm(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        showForm(this.parentElement.getAttribute('data-item'));
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Todo-Table", "Click on Todo item"]);
      }
    }
    // cell for the categories
    categories.forEach(category => {
      if(todo[category] && category!="priority") {
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
        tag = window.translations.today;
      } else if(todo.due.isTomorrow()) {
        todoTableBodyCellDueDate.classList.add("isTomorrow");
        tag = window.translations.tomorrow;
      } else if(todo.due.isPast()) {
        todoTableBodyCellDueDate.classList.add("isPast");
      }
      todoTableBodyCellDueDate.innerHTML = `
        <i class="far fa-clock"></i>
        <div class="tags has-addons">
          <span class="tag">` + window.translations.due + `</span><span class="tag is-dark">` + tag + `</span>
        </div>
        <i class="fas fa-sort-down"></i>
      `;
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
        if(window.consent) _paq.push(["trackEvent", "Todo-Table", "Click on More"]);
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[1].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'));
          // trigger matomo event
          if(window.consent) _paq.push(["trackEvent", "Todo-Table-More", "Click on Edit"]);
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
          if(window.consent) _paq.push(["trackEvent", "Todo-Table-More", "Click on Delete"]);
        }
        // click on use as template option
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[0].onclick = function() {
          showForm(todoTableBodyCellMore.parentElement.getAttribute('data-item'), true);
          // trigger matomo event
          if(window.consent) _paq.push(["trackEvent", "Todo-Table-More", "Click on Use as template"]);
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
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
function setTodoComplete(todo) {
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
        const date = convertDate(todo.due);
        // if set to complete it will be removed from persisted notifcations
        if(window.userData.dismissedNotifications) {
          // the one set for today
          window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
          // the one set for tomorrow
          window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
          setUserData("dismissedNotifications", window.userData.dismissedNotifications);
        }
      }
      todo.complete = true;
      todo.completed = new Date();
      // delete old todo from array and add the new one at it's position
      items.objects.splice(index, 1, todo);
      // if recurrence is set start generating the recurring todo
      if(todo.rec) generateRecurringTodo(todo)
    }
    //write the data to the file
    //fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    window.api.send("writeToFile", [items.objects.join("\n").toString(), window.userData.file]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setTodoDelete(todo) {
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
      if(window.userData.dismissedNotifications) {
        // the one set for today
        window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
        // the one set for tomorrow
        window.userData.dismissedNotifications = window.userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
        setUserData("dismissedNotifications", window.userData.dismissedNotifications);
      }
    }
    items.objects.splice(index, 1);
    //write the data to the file
    //fs.writeFileSync(file, items.objects.join("\n").toString(), {encoding: 'utf-8'});
    window.api.send("writeToFile", [items.objects.join("\n").toString(), window.userData.file]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setTheme(switchTheme) {
  try {
    let theme = window.userData.theme;
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
      setUserData("theme", theme);
    }
    switch (theme) {
      case "light":
        toggleDarkmode.checked = false;
        themeLink.href = "";
        break;
      case "dark":
        toggleDarkmode.checked = true;
        themeLink.href = window.appData.path + "/css/" + theme + ".css";
        break;
    }
    return Promise.resolve("Success: Theme set to " + theme);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setTranslations(translations) {
  try {
    btnTheme.setAttribute("title", window.translations.toggleDarkMode);
    btnSave.innerHTML = window.translations.save;
    todoTableSearch.placeholder = window.translations.search;
    viewHeadlineTodoList.innerHTML = window.translations.viewHeadlineTodoList;
    viewHeadlineAppView.innerHTML = window.translations.viewHeadlineAppView;
    viewToggleShowCompleted.innerHTML = window.translations.completedTodos;
    viewToggleSortCompletedLast.innerHTML = window.translations.sortCompletedLast;
    viewToggleDueIsToday.innerHTML = window.translations.dueToday;
    viewToggleDueIsFuture.innerHTML = window.translations.dueFuture;
    viewToggleDueIsPast.innerHTML = window.translations.duePast;
    viewToggleShowHidden.innerHTML = window.translations.hiddenTodos;
    viewToggleCompactView.innerHTML = window.translations.compactView;
    sortBy.innerHTML = window.translations.sortBy;
    sortByDueDate.innerHTML = window.translations.dueDate;
    sortByPriority.innerHTML = window.translations.priority;
    sortByContexts.innerHTML = window.translations.contexts;
    sortByProjects.innerHTML = window.translations.projects;
    addTodoContainerHeadline.innerHTML = window.translations.addTodoContainerHeadline;
    addTodoContainerSubtitle.innerHTML = window.translations.addTodoContainerSubtitle;
    addTodoContainerButton.innerHTML = window.translations.addTodo;
    onboardingContainerSubtitle.innerHTML = window.translations.onboardingContainerSubtitle;
    onboardingContainerBtnOpen.innerHTML = window.translations.openFile;
    onboardingContainerBtnCreate.innerHTML = window.translations.createFile;
    noResultContainerHeadline.innerHTML = window.translations.noResults;
    noResultContainerSubtitle.innerHTML = window.translations.noResultContainerSubtitle;
    modalFormInput.placeholder = window.translations.formTodoInputPlaceholder;
    modalChangeFileTitle.innerHTML = window.translations.selectFile;
    modalChangeFileOpen.innerHTML = window.translations.openFile;
    modalChangeFileCreate.innerHTML = window.translations.createFile;
    welcomeToSleek.innerHTML = window.translations.welcomeToSleek;
    dueDatePickerInput.placeholder = window.translations.formSelectDueDate;
    recurrencePickerEvery.innerHTML = window.translations.every;
    recurrencePickerDay.innerHTML = window.translations.day;
    recurrencePickerWeek.innerHTML = window.translations.week;
    recurrencePickerMonth.innerHTML = window.translations.month;
    recurrencePickerYear.innerHTML = window.translations.year;
    recurrencePickerNoRecurrence.innerHTML = window.translations.noRecurrence;
    recurrencePickerInput.placeholder = window.translations.noRecurrence;
    messageLoggingTitle.innerHTML = window.translations.errorEventLogging;
    messageLoggingBody.innerHTML = window.translations.messageLoggingBody;
    messageLoggingButton.innerHTML = window.translations.settings;
    messageShareTitle.innerHTML = window.translations.messageShareTitle;
    messageShareBody.innerHTML = window.translations.messageShareBody;
    settingsTabSettings.innerHTML = window.translations.settings;
    settingsTabSettingsHeadline.innerHTML = window.translations.settings;
    settingsTabSettingsLanguage.innerHTML = window.translations.language;
    settingsTabSettingsLanguageBody.innerHTML = window.translations.settingsTabSettingsLanguageBody;
    settingsTabSettingsArchive.innerHTML = window.translations.settingsTabSettingsArchive;
    settingsTabSettingsArchiveBody.innerHTML = window.translations.settingsTabSettingsArchiveBody;
    settingsTabSettingsArchiveButton.innerHTML = window.translations.archive;
    settingsTabSettingsNotifications.innerHTML = window.translations.notifications;
    settingsTabSettingsNotificationsBody.innerHTML = window.translations.settingsTabSettingsNotificationsBody;
    settingsTabSettingsDarkmode.innerHTML = window.translations.darkmode;
    settingsTabSettingsDarkmodeBody.innerHTML = window.translations.settingsTabSettingsDarkmodeBody;
    settingsTabSettingsLogging.innerHTML = window.translations.errorEventLogging;
    settingsTabSettingsLoggingBody.innerHTML = window.translations.settingsTabSettingsLoggingBody;
    settingsTabAbout.innerHTML = window.translations.about;
    settingsTabAboutHeadline.innerHTML = window.translations.about;
    settingsTabAboutContribute.innerHTML = window.translations.settingsTabAboutContribute;
    settingsTabAboutCopyrightLicense.innerHTML = window.translations.settingsTabAboutCopyrightLicense;
    settingsTabAboutCopyrightLicenseBody.innerHTML = window.translations.settingsTabAboutCopyrightLicenseBody;
    settingsTabAboutPrivacy.innerHTML = window.translations.settingsTabAboutPrivacy;
    settingsTabAboutPrivacyBody.innerHTML = window.translations.settingsTabAboutPrivacyBody;
    settingsTabAboutExternalLibraries.innerHTML = window.translations.settingsTabAboutExternalLibraries;
    helpTabKeyboardTitle.innerHTML = window.translations.shortcuts;
    helpTabPrioritiesTitle.innerHTML = window.translations.helpTabPrioritiesTitle;
    helpTabPrioritiesBody.innerHTML = window.translations.helpTabPrioritiesBody;
    helpTabContextsProjectsTitle.innerHTML = window.translations.helpTabContextsProjectsTitle;
    helpTabContextsProjectsBody.innerHTML = window.translations.helpTabContextsProjectsBody;
    helpTabDatesRecurrencesTitle1.innerHTML = window.translations.helpTabDatesRecurrencesTitle1;
    helpTabDatesRecurrencesBody1.innerHTML = window.translations.helpTabDatesRecurrencesBody1;
    helpTabDatesRecurrencesTitle2.innerHTML = window.translations.helpTabDatesRecurrencesTitle2;
    helpTabDatesRecurrencesBody2.innerHTML = window.translations.helpTabDatesRecurrencesBody2;
    helpTab1Title.innerHTML = window.translations.shortcuts;
    helpTab2Title.innerHTML = window.translations.priorities;
    helpTab3Title.innerHTML = window.translations.helpTab3Title;
    helpTab4Title.innerHTML = window.translations.helpTab4Title;
    helpTabKeyboardTR1TD1.innerHTML = window.translations.addTodo;
    helpTabKeyboardTR2TD1.innerHTML = window.translations.find;
    helpTabKeyboardTR3TD1.innerHTML = window.translations.toggleCompletedTodos;
    helpTabKeyboardTR4TD1.innerHTML = window.translations.toggleDarkMode;
    helpTabKeyboardTR5TD1.innerHTML = window.translations.openFile;
    helpTabKeyboardTR6TD1.innerHTML = window.translations.settings;
    helpTabKeyboardTR7TD1.innerHTML = window.translations.helpTabKeyboardTR7TD1;
    helpTabKeyboardTR8TD1.innerHTML = window.translations.toggleFilter;
    helpTabKeyboardTR9TD1.innerHTML = window.translations.resetFilters;
    helpTabKeyboardTR1TH1.innerHTML = window.translations.function;
    helpTabKeyboardTR10TD1.innerHTML = window.translations.helpTabKeyboardTR10TD1;
    submitIssuesOnGithub.innerHTML = window.translations.submitIssuesOnGithub;
    reviewSourceforge.innerHTML = window.translations.reviewSourceforge;
    reviewWindowsStore.innerHTML = window.translations.reviewWindowsStore;
    shareTwitter.innerHTML = window.translations.shareTwitter;
    shareFacebook.innerHTML = window.translations.shareFacebook;
    shareLinkedin.innerHTML = window.translations.shareLinkedin;
    todoTableBodyCellTextTemplate.setAttribute("title", window.translations.editTodo);
    navBtnView.firstElementChild.setAttribute("title", window.translations.view);
    navBtnHelp.firstElementChild.setAttribute("title", window.translations.help);
    navBtnSettings.firstElementChild.setAttribute("title", window.translations.settings);
    btnOpenTodoFile.forEach(function(el) {
      el.setAttribute("title", window.translations.openFile);
    });
    btnResetFilters.forEach(function(el) {
      el.getElementsByTagName('span')[0].innerHTML = window.translations.resetFilters;
    });
    btnCreateTodoFile.forEach(function(el) {
      el.setAttribute("title", window.translations.createFile);
    });
    btnChangeTodoFile.forEach(function(el) {
      el.setAttribute("title", window.translations.openFile);
    });
    btnModalCancel.forEach(function(el) {
      el.innerHTML = window.translations.cancel;
    });
    /*btnFilter.forEach(function(el) {
      el.setAttribute("title", window.translations.toggleFilter);
    });*/
    btnAddTodo.forEach(function(el) {
      el.setAttribute("title", window.translations.addTodo);
    });
    return Promise.resolve("Success: Translations set");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function setUserData(key, value) {
  try {
    window.userData[key] = value;
    window.api.send("userData", [key, value]);
    return Promise.resolve("Success: Config persisted");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setToggles() {
  try {
    // set the toggles in settings
    toggleMatomoEvents.checked = window.consent;
    toggleNotifications.checked = window.userData.notifications;
    showCompleted.checked = window.userData.showCompleted;
    sortCompletedLast.checked = window.userData.sortCompletedLast;
    showHidden.checked = window.userData.showHidden;
    showDueIsToday.checked = window.userData.showDueIsToday;
    showDueIsFuture.checked = window.userData.showDueIsFuture;
    showDueIsPast.checked = window.userData.showDueIsPast;
    toggleView.checked = window.userData.compactView;
    return Promise.resolve("Success: All toggles set");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setRecurrenceInput(recurrence) {
  try {
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
    resizeInput(recurrencePickerInput);
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Form", "Recurrence selected: " + label]);
    return Promise.resolve("Success: Recurrence added");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
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
  try {
    if(priority) {
      priority = priority.toUpperCase();
    } else {
      priority = null;
    }
    todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
    todo.priority = priority;
    modalFormInput.value = todo.toString();
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Form", "Priority changed to: " + priority]);
    return Promise.resolve("Success: Priority changed to " + priority)
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function setFriendlyLanguageNames() {
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
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
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
function getUserData() {
  return new Promise(function(resolve, reject) {
    window.api.send("userData");
    return window.api.receive("userData", (userData) => {
      resolve(userData);
    });
  });
}
function getAppData() {
  return new Promise(function(resolve, reject) {
    window.api.send("appData");
    return window.api.receive("appData", (appData) => {
      resolve(appData);
    });
  });
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

function toggleCompactView(checked) {
  try {
    window.userData.compactView = checked;
    if(window.userData.compactView) {
      body.classList.add("compact");
    } else {
      body.classList.remove("compact");
    }
    // persist the sorting
    setUserData("compactView", window.userData.compactView);
    return Promise.resolve("Success: Compact view set to: " + window.userData.compactView);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function toggleTodos(name, variable) {
  try {
    if(window.userData[name]==false) {
      window.userData[name] = true;
    } else if(variable) {
      window.userData[name] = true;
    } else {
      window.userData[name] = false;
    }
    document.getElementById(name).checked = window.userData[name];
    // persist the sorting
    setUserData(name, window.userData[name]);
    // rebuild the content
    startBuilding();
    return Promise.resolve("Success: Show " + name + " todo set to: " + window.userData[name]);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
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
  }
  d.id = "modalFormInput";
  d.setAttribute("tabindex", 300);
  d.setAttribute("class", "input is-medium");
  d.setAttribute("placeholder", window.translations.formTodoInputPlaceholder);
  d.value = modalFormInput.value;
  modalFormInput.parentNode.replaceChild(d, modalFormInput);
  // if input is a textarea, adjust height to content length
  if(modalFormInput.tagName==="TEXTAREA") {
    modalFormInput.style.height="auto";
    modalFormInput.style.height= modalFormInput.scrollHeight+"px";
  }
  positionautoCompleteContainer();
  modalFormInput.addEventListener("keyup", e => { modalFormInputEvents() });
  modalFormInput.focus();
}

function matomoEventsConsent() {
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
    _paq.push(['setCustomDimension', 4, window.consent]);
    _paq.push(['setCustomDimension', 5, window.appData.version]);
    _paq.push(['setCustomDimension', 6, window.userData.windowBounds.width+"x"+window.userData.windowBounds.height]);
    _paq.push(['setCustomDimension', 7, window.userData.showCompleted]);
    _paq.push(['setCustomDimension', 8, window.userData.files.length]);
    _paq.push(['setCustomDimension', 9, window.userData.useTextarea]);
    _paq.push(['setCustomDimension', 10, window.userData.compactView]);
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
    if(window.consent) {
      // user has given consent to process their data
      return Promise.resolve("Info: Consent given, Matomo error and event logging enabled");
    } else {
      // revoke matomoEvents consent
      _paq.push(['forgetConsentGiven']);
      return Promise.resolve("Info: No consent given, Matomo error and event logging disabled");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function configureEvents() {
  try {
    // ########################################################################################################################
    // ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
    // ########################################################################################################################
    a.forEach(el => el.addEventListener("click", function(el) {
      if(el.target.href && el.target.href === "#") el.preventDefault();
    }));
    navBtnHelp.onclick = function () {
      showContent(modalHelp);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Menu", "Click on Help"]);
    }
    navBtnSettings.onclick = function () {
      showContent(modalSettings);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
    }
    btnMessageLogging.onclick = function () {
      showContent(modalSettings);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Message", "Click on Settings"]);
    }
    btnItemStatus.onclick = function() {
      setTodoComplete(this.parentElement.parentElement.parentElement.parentElement.getAttribute("data-item")).then(response => {
        modalForm.classList.remove("is-active");
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        console.log(response);
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);
      }).catch(error => {
        console.log(error);
      });
    }
    btnTheme.onclick = function(el) {
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Menu", "Click on Theme"])
      setTheme(true);
    }
    btnArchiveTodos.onclick = function() {
      archiveTodos().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Setting", "Click on Archive"])
    }
    btnOpenTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "open");
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
      }
    });
    btnChangeTodoFile.forEach(function(el) {
      el.onclick = function () {
        if(window.userData.files.length > 0) {
          showFiles().then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
        } else {
          window.api.send("openOrCreateFile", "open");
        }
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Menu", "Click on Choose file"]);
      }
    });
    btnCreateTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "create");
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Create file"]);
      }
    });
    btnModalCancel.forEach(function(el) {
      el.onclick = function() {
        el.parentElement.parentElement.parentElement.parentElement.classList.remove("is-active");
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
      }
    });
    navBtnFilter.onclick = function() {
      // close filter drawer first
      viewDrawer.classList.remove("is-active")
      navBtnView.classList.remove("is-highlighted")
      showDrawer("toggle", this.id, filterDrawer.id).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Menu", "Click on filter"]);
    }
    navBtnView.onclick = function() {
      // close filter drawer first
      filterDrawer.classList.remove("is-active")
      navBtnFilter.classList.remove("is-highlighted")
      showDrawer("toggle", this.id, viewDrawer.id).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Menu", "Click on view"]);
    }
    btnAddTodo.forEach(function(el) {
      el.onclick = function () {
        // just in case the form will be cleared first
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        showForm();
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
      }
    });
    btnFiltersResetFilters.onclick = function() {
      resetFilters();
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
    }
    btnNoResultContainerResetFilters.onclick = function() {
      resetFilters();
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "No Result Container", "Click on reset button"])
    }
    todoTable.onclick = function() {
      if(event.target.classList.contains("flex-table")) {
        showMore(false);
      }
    }
    todoTableSearch.addEventListener("input", function () {
      startBuilding(this.value)
    });
    toggleView.onclick = function() {
      toggleCompactView(this.checked).then(response => {
        console.log(response);
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "View-Drawer", "Toggle compact view"]);
      }).catch(error => {
        console.log(error);
      });
    }
    const viewToggles = document.querySelectorAll('.viewToggle');
    viewToggles.forEach(function(viewToggle) {
      viewToggle.onclick = function() {
        toggleTodos(this.id).then(response => {
          console.log(response);
          // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "View-Drawer", "Toggle " + this.id + " set to: " + this.value]);
        }).catch(error => {
          console.log(error);
        });
      }
    });
    toggleMatomoEvents.onclick = function() {
      matomoEvents = this.checked;
      setUserData('matomoEvents', this.checked);
      matomoEventsConsent(this.checked).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Setting", "Click on Logging", this.checked])
    }
    toggleNotifications.onclick = function() {
      notifications = this.checked;
      setUserData('notifications', this.checked);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Setting", "Click on Notifications", this.checked])
    }
    toggleDarkmode.onclick = function() {
      setTheme(true);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Setting", "Click on Dark mode", this.checked])
    }
    modalFormInputResize.onclick = function () {
      toggleInputSize(this.getAttribute("data-input-type"));
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Form", "Click on Resize"]);
    }
    modalFormInput.onfocus = function () {
      autoCompleteContainer.classList.remove("is-active");
    };
    modalBackground.forEach(function(el) {
      el.onclick = function() {
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        el.parentElement.classList.remove("is-active");
        autoCompleteContainer.classList.remove("is-active");
        autoCompleteContainer.blur();
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Modal", "Click on Background"]);
      }
    });
    modalClose.forEach(function(el) {
      el.onclick = function() {
        if(el.getAttribute("data-message")) {
          // persist closed message, so it won't show again
          if(!window.userData.dismissedMessages.includes(el.getAttribute("data-message"))) window.userData.dismissedMessages.push(el.getAttribute("data-message"))
          setUserData("dismissedMessages", window.userData.dismissedMessages);
          // trigger matomo event
          if(window.consent) _paq.push(["trackEvent", "Message", "Click on Close"]);
        } else {
          // trigger matomo event
          if(window.consent) _paq.push(["trackEvent", "Modal", "Click on Close"]);
        }
        el.parentElement.parentElement.classList.remove("is-active");
      }
    });
    modalForm.addEventListener("submit", function(e) {
      // intercept submit
      if (e.preventDefault) e.preventDefault();
      submitForm().then(response => {
        // if form returns success we clear the modal
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    });
    modalFormInput.addEventListener("keyup", e => {
      // do not show suggestion container if Escape has been pressed
      if(e.key==="Escape") return false;
      modalFormInputEvents();
    });
    const drawerCloser = document.querySelectorAll(".drawerClose");
    drawerCloser.forEach(function(drawerClose) {
      drawerClose.onclick = function() {
        showDrawer(false).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Drawer", "Click on close button"])
      }
    })
    priorityPicker.addEventListener("change", e => {
      setPriority(e.target.value).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    });
    priorityPicker.onfocus = function () {
      // close suggestion box if focus comes to priority picker
      autoCompleteContainer.classList.remove("is-active");
    };
    dueDatePickerInput.onfocus = function () {
      autoCompleteContainer.classList.remove("is-active");
    };
    dueDatePickerInput.addEventListener('changeDate', function (e, details) {
      resizeInput(this);
      let caretPosition = getCaretPosition(modalFormInput);
      // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
      if(e.detail.date) {
        // generate the object on what is written into input, so we don't overwrite previous inputs of user
        let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new RecExtension() ]);
        todo.due = new Date(e.detail.date);
        todo.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
        modalFormInput.value = todo.toString();
        // clean up as we don#t need it anymore
        todo = null;
        // if suggestion box was open, it needs to be closed
        autoCompleteContainer.classList.remove("is-active");
        autoCompleteContainer.blur();
        // if a due date is set, the recurrence picker will be shown);
        modalFormInput.focus();
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
      }
    });
    recurrencePickerInput.onfocus = function(el) { showRecurrenceOptions(el) };
    contentTabs.forEach(el => el.addEventListener("click", function(el) {
      contentTabs.forEach(function(el) {
        el.classList.remove("is-active");
      });
      this.classList.add("is-active");
      showTab(this.classList[0]);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
    }));
    settingsLanguage.onchange = function() {
      window.userData.language = this.value;
      window.api.send("userData", ["language", window.userData.language]);
      window.api.send("changeLanguage", this.value);
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Settings", "Language changed to: " + this.value]);
    }
    errorContainerClose.onclick = function() {
      this.parentElement.classList.remove("is-active")
    }
    viewSelectSortBy.onchange = async function() {
      if(this.value) {
        await setUserData("sortBy", this.value);
        startBuilding();
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        // trigger matomo event
        if(window.consent) _paq.push(["trackEvent", "View-Drawer", "Sort by setting changed to: " + this.value]);
      }
    }
    zoomRangePicker.onchange = function() {
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "View-Drawer", "Zoom ranger dragged"]);
      zoom(this.value).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
    zoomUndo.onclick = function() {
      zoom(100).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "View-Drawer", "Click on zoom undo"]);
    };
    // clear due date and recurrence values from input field
    document.querySelector(".datepicker .clear-btn").addEventListener('click', function (e) {
      let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
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
        setPriority(priority).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      } else if(event.ctrlKey && event.shiftKey && event.key.length===1 && event.key.match(/[_]/i)) {
        var priority = null;
        setPriorityInput(priority);
        setPriority(priority).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    });
    modalForm.addEventListener ("keydown", function (e) {
      if(e.key==="Enter" && e.ctrlKey) {
        submitForm().then(response => {
          // if form returns success we clear the modal
          clearModal().then(function(result) {
            console.log(result);
          }).catch(function(error) {
            console.log(error);
          });
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
      if(event.key === "Escape" && !autoCompleteContainer.classList.contains("is-active")) {
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
        this.classList.remove("is-active");
      } else if(event.key === "Escape" && autoCompleteContainer.classList.contains("is-active")) {
        autoCompleteContainer.classList.remove("is-active");
      }
    });
    modalForm.addEventListener ("click", function () {
      // close recurrence picker if click is outside of recurrence container
      if(!event.target.closest("#recurrencePickerContainer") && event.target!=recurrencePickerInput) recurrencePickerContainer.classList.remove("is-active")
    });
    modalHelp.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active");
    });
    modalChangeFile.addEventListener ("keydown", function () {
      if(event.key === "Escape") {
        clearModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
      }
    });
    modalSettings.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active");
    });
    autoCompleteContainer.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active")
    });
    filterDrawer.addEventListener ("keydown", function () {
      if(event.key === "Escape") {
        showDrawer(false, navBtnFilter.id, filterDrawer.id).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
      }
    });
    viewDrawer.addEventListener ("keydown", function () {
      if(event.key === "Escape") {
        showDrawer(false, navBtnView.id, viewDrawer.id).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          console.log(error);
        });
      }
    });
    return Promise.resolve("Success: All events have been initialized");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function configureTodoTableTemplate() {
  try {
    todoTableContainer.innerHTML = "";
    // TODO: EXPLAIN
    todoTableBodyCellMoreTemplate.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMoreTemplate.setAttribute("role", "cell");
    // add the more dots
    todoTableBodyCellMoreTemplate.innerHTML = `
      <div class="dropdown is-right">
        <div class="dropdown-trigger">
          <a href="#"><i class="fas fa-ellipsis-v"></i></a>
        </div>
        <div class="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a class="dropdown-item">` + window.translations.useAsTemplate + `</a>
            <a href="#" class="dropdown-item">` + window.translations.edit + `</a>
            <a class="dropdown-item">` + window.translations.delete + `</a>
          </div>
        </div>
      </div>
    `;
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
    return Promise.resolve("Success: Table templates set up");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function configureMainView() {
  try {
    // jump to previously added item
    if(document.getElementById("previousItem")) jumpToItem(document.getElementById("previousItem"))
    // set scaling factor if default font size has changed
    if(window.userData.zoom) {
      html.style.zoom = window.userData.zoom + "%";
      zoomStatus.innerHTML = window.userData.zoom + "%";
      zoomRangePicker.value = window.userData.zoom;
    }
    // add filename to application title
    if(window.userData.file) {
      switch (window.appData.os) {
        case "windows":
          title.innerHTML = window.userData.file.split("\\").pop() + " - sleek";
          break;
        default:
          title.innerHTML = window.userData.file.split("/").pop() + " - sleek";
          break;
      }
    }
    // restore persisted width of filter drawer
    if(window.userData.drawerWidth) setPaneWidth(window.userData.drawerWidth);
    // check if compact view is suppose to be active
    if(window.userData.compactView) body.classList.add("compact");
    // add version number to about tab in settings modal
    version.innerHTML = window.appData.version;
    // open filter drawer if it has been persisted
    if(window.userData.filterDrawer) {
      showDrawer(true, navBtnFilter.id, filterDrawer.id).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
    // open view drawer if it has been persisted
    } else if(window.userData.viewDrawer) {
      showDrawer(true, navBtnView.id, viewDrawer.id).then(function(result) {
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
    if(visibleRows === 0 && items.objects.length>0) {
      todoTableSearchContainer.classList.add("is-active");
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.add("is-active");
      todoTable.classList.remove("is-active");
      navBtnFilter.classList.remove("is-active");
      return Promise.resolve("Info: File is empty");
    } else if(visibleRows > 0 && items.filtered.length>0) {
      todoTableSearchContainer.classList.add("is-active");
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
      todoTable.classList.add("is-active");
      navBtnFilter.classList.add("is-active");
      return Promise.resolve("Info: File has content and results are shown");
    // file is NOT empty but no results
    } else {
      todoTableSearchContainer.classList.remove("is-active");
      addTodoContainer.classList.add("is-active");
      noResultContainer.classList.remove("is-active");
      navBtnFilter.classList.remove("is-active");
      todoTable.classList.remove("is-active");
      return Promise.resolve("Info: File has content, but no results are shown due to filters or search input");
    }
  } catch(error) {
    showOnboarding(true).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function checkDismissedMessages() {
  try {
    const dismissedMessages = window.userData.dismissedMessages;
    if(!dismissedMessages) return Promise.resolve("Info: No already checked messages found, will skip this check");
    messages.forEach((message) => {
      if(dismissedMessages.includes(message.getAttribute("data"))) {
        message.classList.remove("is-active");
      } else {
        message.classList.add("is-active");
      }
    });
    return Promise.resolve("Info: Checked for already dismissed messages");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function resetFilters() {
  try {
    // clear the persisted filers, by setting it to undefined the object entry will be removed fully
    setUserData("selectedFilters", new Array);
    //
    setUserData("hideFilterCategories", new Array);
    // empty old filter container
    todoFilters.innerHTML = "";
    // clear search input
    todoTableSearch.value = null;
    // regenerate the data
    startBuilding();
    return Promise.resolve("Success: Filters resetted");
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
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
      let todo = new TodoTxtItem(modalForm.elements[0].value.replaceAll(/[\r\n]+/g, String.fromCharCode(16)), [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
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
      let todo = new TodoTxtItem(modalForm.elements[0].value.replaceAll(/[\r\n]+/g, String.fromCharCode(16)), [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
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
    if(window.consent) _paq.push(["trackEvent", "Form", "Submit"]);
    return Promise.resolve("Success: Changes written to file: " + window.userData.file);
  // if the input field is empty, let users know
  } catch (error) {
    // if writing into file is denied throw alert
    modalFormAlert.innerHTML = window.translations.formErrorWritingFile + window.userData.file;
    modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Error", "submitForm()", error])
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
    let doneFile;
    switch (window.appData.os) {
      case "windows":
        doneFile = window.userData.file.replace(window.userData.file.split("\\").pop(), window.userData.file.substr(0, window.userData.file.lastIndexOf(".")).split("\\").pop() + "_done.txt");
        break;
      default:
        doneFile = window.userData.file.replace(window.userData.file.split("/").pop(), window.userData.file.substr(0, window.userData.file.lastIndexOf(".")).split("/").pop() + "_done.txt");
        break;
    }
    window.api.send("fileContent", doneFile);
    window.api.receive("fileContent", (content) => {
      items.doneTxtObjects = new Array;
      if(content) items.doneTxtObjects = TodoTxt.parse(content, [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
      // in case done file was not empty the completed todos will be appended
      if(items.doneTxtObjects.length>0) {
        // only consider completed todo that are not already present in done.txt
        items.doneTxtObjects.forEach(itemComplete => {
          items.complete = items.complete.filter(function(item) { return item.toString() != itemComplete.toString() });
        });
        // combine done objects from todo.txt and done.txt
        items.complete = items.doneTxtObjects.concat(items.complete);
        // write combined objects to done.txt
        window.api.send("writeToFile", [items.complete.join("\n").toString(), doneFile]);
      // if done.txt did not exist or was empty, file will be created and filled with data
      } else {
        // if done.txt did not exist or was empty, file will be created and filled with data
        window.api.send("writeToFile", [items.complete.join("\n").toString(), doneFile]);
      }
      // write incomplete only todos to todo.txt
      window.api.send("writeToFile", [items.incomplete.join("\n").toString(), window.userData.file]);
    });
    return Promise.resolve("Success: Completed todo moved to: " + doneFile)
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function configureDatepicker() {
  try {
    dueDatePicker = new Datepicker(dueDatePickerInput, {
      autohide: true,
      language: window.userData.language,
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
    return Promise.resolve("Success: Datepicker configured")
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

window.onload = function () {
  // ask main process for app data
  getAppData().then(function(appData) {
    window.appData = appData;
  }).catch(function(error) {
    console.log(error);
  });
  // ask main process for user data
  getUserData().then(function(userData) {
    window.userData = userData;
    return userData;
  })
  .then(function(userData) {
    return new Promise(function(resolve) {
      window.api.send("translations", userData.language);
      window.api.receive("translations", (translations) => {
        resolve(translations);
      });
    });
  })
  .then(function(translations) {
    return new Promise(function(resolve) {
      window.translations = translations;
      resolve(setTranslations(translations));
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(setFriendlyLanguageNames());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(zoom(window.userData.zoom));
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(setTheme());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(configureDatepicker());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(matomoEventsConsent());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(checkDismissedMessages());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(setToggles());
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      resolve(configureEvents());
    });
  })
  .then(function(response) {
    console.log(response);
    if(window.userData.file) {
      window.api.send("startFileWatcher", window.userData.file);
    } else {
      showOnboarding(true);
    }
  }).catch(function(error) {
    console.log(error);
  });
}

window.api.receive("triggerFunction", (name, args) => {
  if(typeof(window[name]) === "function") {
    if(!args) args = new Array;
    window[name](...args).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
  } else {
    throw("Error: Function " + name + " does not exist.");
  }
});

window.api.receive("refresh", (content) => {
  generateItems(content)
  .then(function() {
    startBuilding();
  })
  .catch(function(error) {
    console.log(error);
  });
});

window.api.receive("userData", (userData) => {
  window.userData = userData;
});

function jumpToItem(item) {
  // jump to previously edited or added item
  // only scroll if new item is not in view
  if(!isInViewport(item)) {
    // scroll to view
    item.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    // trigger a quick background ease in and out
    item.classList.add("is-highlighted");
    setTimeout(() => {
      item.classList.remove("is-highlighted");
      // after scrolling the marker will be removed
      item.removeAttribute("id");
    }, 1000);
  }
}

function startBuilding(searchString) {
  t0 = performance.now();
  filterItems(items.objects, searchString)
  .then(function(filtered) {
    items.filtered = filtered;

    f0 = performance.now();
    generateFilterData().then(response => {
      console.log(response);
      f1 = performance.now();
      console.log("Filters build:", f1 - f0, "ms");
    }).catch(error => {
      console.log(error);
    });

    return generateGroups(filtered)
  })
  .then(function(groups) {
    return new Promise(function(resolve) {
      resolve(generateTable(groups));
    });
  })
  .then(function() {
    configureMainView();
  })
  .then(function(response) {
    // display info based on filtered items
    showResultStats().then(response => {
      console.log(response);
      t1 = performance.now();
      console.log("Todos build:", t1 - t0, "ms");
    }).catch(error => {
      console.log(error);
    });
  })
  .catch(function(error) {
    showError(error);
  });
}

function generateItems(content) {
  try {
    items = { objects: TodoTxt.parse(content, [ new DueExtension(), new RecExtension(), new HiddenExtension() ]) }
    items.objects = items.objects.filter(function(item) {
      if(!item.text) return false;
      return true;
    });
    items.complete = items.objects.filter(function(item) { return item.complete === true });
    items.incomplete = items.objects.filter(function(item) { return item.complete === false });
    items.objects = items.objects.filter(function(item) { return item.toString() != "" });
    return Promise.resolve(items);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function filterItems(items, searchString) {
  try {
    // selected filters are empty, unless they were persisted
    if(window.userData.selectedFilters && window.userData.selectedFilters.length>0) {
      var selectedFilters = JSON.parse(window.userData.selectedFilters);
    } else {
      var selectedFilters = new Array;
      window.userData.selectedFilters = selectedFilters;
    }
    // apply persisted contexts and projects
    if(selectedFilters.length > 0) {
      // we iterate through the filters in the order they got selected
      selectedFilters.forEach(filter => {
        if(filter[1]=="projects") {
          items = items.filter(function(item) {
            if(item.projects) return item.projects.includes(filter[0]);
          });
        } else if(filter[1]=="contexts") {
          items = items.filter(function(item) {
            if(item.contexts) {
              return item.contexts.includes(filter[0]);
            }
          });
        } else if(filter[1]=="priority") {
          items = items.filter(function(item) {
            if(item.priority) {
              return item.priority.includes(filter[0]);
            }
          });
        }
      });
    }
    // apply filters or filter by search string
    items = items.filter(function(item) {
      if(todoTableSearch.value) searchString = todoTableSearch.value;
      if((searchString || todoTableSearch.value) && item.toString().toLowerCase().indexOf(searchString.toLowerCase()) === -1) return false;
      if(!window.userData.showCompleted && item.complete) return false;
      if(!window.userData.showDueIsToday && item.due && item.due.isToday()) return false;
      if(!window.userData.showDueIsPast && item.due && item.due.isPast()) return false;
      if(!window.userData.showDueIsFuture && item.due && item.due.isFuture()) return false;
      if(item.text==="") return false;
      return true;
    });
    return Promise.resolve(items);
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function generateGroups(items) {
  // after filters have been built a last selection has to be made including the previous filter choices
  items = items.filter(function(item) {
    if(!isTodoVisible(item)) return false;
    return true;
  });
  // build object according to sorting method
  items = items.reduce((object, a) => {
    if(window.userData.sortCompletedLast && a.complete) {
      object["completed"] = [...object["completed"] || [], a];
    } else if(window.userData.sortBy==="dueString" && !a.due) {
      object["noDueDate"] = [...object["noDueDate"] || [], a];
    } else {
      object[a[window.userData.sortBy]] = [...object[a[window.userData.sortBy]] || [], a];
    }
    //object[a[window.userData.sortBy]] = [...object[a[window.userData.sortBy]] || [], a];
    return object;
  }, {});
  // object is converted to a sorted array
  items = Object.entries(items).sort(function(a,b) {
    // when a is null sort it after b
    if(a[0]==="null") return 1;
    // when b is null sort it after a
    if(b[0]==="null") return -1;
    // sort alphabetically
    if(a < b) return -1;
  });
  //
  if(window.userData.sortCompletedLast) {
    items.sort(function(a,b) {
      // when a is null sort it after b
      if(a[0]==="completed") return 1;
      // when b is null sort it after a
      if(b[0]==="completed") return -1;
      return 0;
    });
  }
  return Promise.resolve(items)
}

function isTodoVisible(todo) {
  if(!window.userData.showHidden && todo.h) return false
  if(!todo.text) return false
  for(let category in window.userData.hideFilterCategories) {
    //if(Array.isArray(todo[window.userData.hideFilterCategories[category]])) return false
    if(todo[window.userData.hideFilterCategories[category]]) return false
  }
  return true;
}



window.onresize = function() {
  try {
    let width = this.outerWidth;
    let height = this.outerHeight;
    let horizontalPosition = this.pageXOffset;
    let verticalPosition = this.pageYOffset;
    setUserData("windowBounds", { width, height, horizontalPosition, verticalPosition }).then(function() {
      // Adjust position of suggestion box to input field
      let modalFormInputPosition = modalFormInput.getBoundingClientRect();
      autoCompleteContainer.style.width = modalFormInput.offsetWidth + "px";
      autoCompleteContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight+2 + "px";
      autoCompleteContainer.style.left = modalFormInputPosition.left + "px";
      return Promise.resolve("Success: Window bounds Config written to config file");
    }).catch(function(error) {
      return Promise.reject("Error in window.onresize: " + error);
    });
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
