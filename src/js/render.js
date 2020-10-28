// ### DOCUMENTATION
// read text file: https://www.geeksforgeeks.org/file-upload-in-electronjs/
// generate the table: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
// save and load user data: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e

// ########################################################################################################################


// DECLARATIONS


// ########################################################################################################################

const electron = require("electron");
const path = require("path");
const dialog = electron.remote.dialog;
const app = electron.remote.app;
const fs = require("fs");
const Store = require("./store.js");
const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 600, minWidth: 800, minHeight: 600 },
    sortAlphabetically: false,
    showCompleted: true,
    selectedFilters: new Array
  }
});

const body = document.getElementById("body");
const a = document.querySelectorAll("a");

const btnFilter = document.getElementById("btnFilter");
const btnAddItem = document.getElementById("btnAddItem");
const btnFormSubmit = document.getElementById("btnFormSubmit");
const btnItemStatus = document.getElementById("btnItemStatus");
const btnApplyFilter = document.getElementsByClassName("btnApplyFilter");
const btnLoadTodoFile = document.querySelectorAll(".btnLoadTodoFile");
const btnCreateTodoFile = document.getElementById("btnCreateTodoFile");
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnResetAllFilters = document.getElementById("btnResetAllFilters");

const toggleShowCompleted = document.getElementById("toggleShowCompleted");
const toggleSortAlphabetically = document.getElementById("toggleSortAlphabetically");

const onboardingContainer = document.getElementById("onboardingContainer");

const todoTable = document.getElementById("todoTable");

const filterCategories = ["contexts", "projects"];
const filterDropdown = document.getElementById("filterDropdown");

const modalForm = document.getElementById('modalForm');
const modalFormInput = document.getElementById("modalFormInput");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalTitle = document.getElementById("modalTitle");
const modalBackground = document.querySelectorAll('.modal-background');
const modalFileChoose = document.getElementById("modalFileChoose");
const modalFileOverwrite = document.getElementById("modalFileOverwrite");

// Needed for comparison between priority items to build the divider rows
let previousItem;
// defining a file path Variable to store user-selected file
let pathToFile = store.get("pathToFile");
// empty variable
let pathToNewFile;
// check store file if filters (come as JSON) have been saved. If so convert the JSON to arrays and them to the main array. If not the array stays empty
// TODO: is there a more sophisticated way to do this?
let selectedFilters = store.get("selectedFilters");
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
// get default sorting value (false)
let sortAlphabetically = store.get("sortAlphabetically");
// get default "show completed? value (false)
let showCompleted = store.get("showCompleted");
// create  an empty variable for the data item
let dataItem;
// create  an empty variable for the data item
let parsedData;

// ###############

// INITIAL DOM CONFIG

// ###############

// set the checked attribute according to the persisted value
toggleSortAlphabetically.checked = sortAlphabetically;
// set the checked attribute according to the persisted value
toggleShowCompleted.checked = showCompleted;

// ########################################################################################################################


// EVENT LISTENERS


// ########################################################################################################################

// persist the highlighting of the button and the dropdown menu
btnFilter.addEventListener("click", showFilters, false);

btnAddItem.addEventListener("click", showForm, false);

// just reread the file and flush all filters and items by emptying the array
btnResetAllFilters.addEventListener("click", () => {
  selectedFilters = [];
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  store.set("selectedFilters", new Array);
  parseData(pathToFile);
});

// reread the data but sort it asc
toggleSortAlphabetically.addEventListener("click", () => {
  if(sortAlphabetically==false) {
    sortAlphabetically = true;
  } else {
    sortAlphabetically = false;
  }
  // persisting the sorting setting
  store.set("sortAlphabetically", sortAlphabetically);

  // TODO: error handling
  // regenerate the table considering the sort value and make sure saved filters are going to be passed
  // TODO: does it crash if no filters have been selected?
  generateTodoData(selectedFilters);

});

// reread the data but sort it asc
toggleShowCompleted.addEventListener("click", () => {
  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  // persist the sorting
  store.set("showCompleted", showCompleted);

  // clear selectedFilters to avoid problems
  // TODO: this is ugly
  selectedFilters = [];

  // TODO: error handling
  // regenerate the table considering the sort value
  parseData(pathToFile);

});

// submit in the form
modalForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();
  // if form returns success we clear the modal
  if(submitForm()) clearModal();
});

// complete the item using the footer button in modal
btnItemStatus.addEventListener("click", () => {
  // TODO: error handling
  if(completeItem(dataItem)) {
    modalForm.classList.toggle("is-active");
  }
});

// prevent empty hyperlinks from jumping to top after clicking
a.forEach(el => el.addEventListener("click", function(el) {
  // only if the href contains a hash we prevent the default action of a link
  if(el.target.href && el.target.href.includes('#')) el.preventDefault();
}));

// put a click event on all "open file" buttons
btnLoadTodoFile.forEach(el => el.addEventListener("click", openFile, false));

// onboarding: click will call createFile() function
btnCreateTodoFile.addEventListener("click", function() {
  createFile(true, false);
});

// onboarding: click will call createFile() function
modalFileChoose.addEventListener("click", function() {
  createFile(true, false);
});

// onboarding: click will call createFile() function
modalFileOverwrite.addEventListener("click", function() {
  createFile(false, true);
});

// put a listeners on all modal backgrounds
modalBackground.forEach(el => el.addEventListener("click", clearModal, false));

// click on the cancel button in the footer of the edit modal
btnModalCancel.forEach(el => el.addEventListener("click", clearModal, false));

// ###############

// CONFIGURE KEYS

// ###############

// toggle filter dropdown when escape key is pressed
filterDropdown.addEventListener ("keydown", function () {
  if(event.key == 'Escape') showFilters();
});

// put a listeners on all modal backgrounds
modalForm.addEventListener ("keydown", function () {
  if(event.key == 'Escape') clearModal();
});

// ########################################################################################################################


// START PARSING ONCE EVERYTHING ELSE IS READY


// ########################################################################################################################

window.onload = function () {
  // Check if file exists
  if (fs.existsSync(pathToFile)) {
    parseData(pathToFile);
    console.log("Success: todo.txt file loaded: " + pathToFile);
    // clear the onboarding, display the todo table and show the navigation buttons
    onboardingContainer.removeAttribute("class","is-active");
    todoTable.classList.add("is-active");
    btnAddItem.setAttribute("class","is-active");
    btnFilter.setAttribute("class","is-active");
  } else {
    // show the onboarding instead of the table and hide the nav buttons as they are not needed right now
    console.log("Info: No todo.txt file loaded, starting onboarding.");
    onboardingContainer.setAttribute("class","is-active");
    onboardingContainer.focus();
    todoTable.classList.remove("is-active");
    btnAddItem.removeAttribute("class","is-active");
    btnFilter.removeAttribute("class","is-active");
  }
}

// ########################################################################################################################


// HELPER FUNCTIONS


// ########################################################################################################################

// show and hide the filter selection dropdown
function showFilters() {
  btnFilter.classList.toggle("is-highlighted");
  filterDropdown.classList.toggle("is-active");
  filterDropdown.focus();
  body.classList.toggle("is-active");
}

// ###############

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

// ###############

function uniqBy(a) {
  var seen = {};
  return a.filter(function(item) {
      var k = JSON.stringify(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  })
}

// ###############

// function to close the modal and set it to the defaults

// ###############

function clearModal() {
  modalForm.classList.remove("is-active");
  modalFile.classList.remove("is-active");
  // empty the data item as we don't need it anymore
  dataItem = null;
  // clean up the modal
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
}

function showAlert(status) {
  if(status) {
    document.getElementById("modalFile").classList.add("is-active", "is-danger");
  } else {
    document.getElementById("modalFile").classList.remove("is-active", "is-danger");
  }
};

// ########################################################################################################################


// READ DATA


// ########################################################################################################################

// ###############

// OPEN FILE AND PASS DATA TO FUNCTIONS

// ###############

function openFile() {
  // Resolves to a Promise<Object>
  dialog.showOpenDialog({
      title: 'Select yout todo.txt file',
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: 'Open',

      // Restricting the user to only Text Files.
      filters: [
          {
              name: 'Text Files',
              extensions: ['txt']
          }, ],
      properties: ['openFile']

  }).then(file => {
      // Stating whether dialog operation was cancelled or not.

      if (!file.canceled) {
        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = file.filePaths[0].toString();

        //console.log(global.filepath);

        // read contents of todo.txt file
        if (pathToFile && !file.canceled) {

          // write new path and file name into storage file
          store.set("pathToFile", pathToFile);

          // reset the (persisted) filters as they won't make any sense when switching to a different todo.txt file for instance
          selectedFilters = new Array;
          store.set("selectedFilters", new Array);

          // pass path and filename on, to extract and parse the raw data
          parseData(pathToFile);

          console.log("Success: Storage file updated by new path and filename: " + pathToFile);

         }
      }
  }).catch(err => {
      console.log("Error: " + err)
  });
}

// ###############

// CREATE A NEW TODO.TXT FILE

// ###############

function createFile(showDialog, overwriteFile) {
  // Resolves to a Promise<Object>
  if(showDialog && !overwriteFile) {
    dialog.showOpenDialog({
      title: "Choose a folder to save your todo.txt file",
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: "Create todo.txt file here",
      properties: ["openDirectory", "createDirectory"]
    }).then(file => {
      // Stating whether dialog operation was cancelled or not.
      if (!file.canceled) {

        pathToNewFile = file.filePaths[0].toString();

        if(fs.stat(pathToNewFile + "/todo.txt", function(err, stats) {
          if(!err) {
            showAlert(true);
            return false;
          } else {
            fs.writeFile(pathToNewFile + "/todo.txt", "(A) Please report bugs at https://github.com/ransome1/sleek/issues @participate +sleek due:2020-10-10", function (err) {
              if (err) throw err;
              if (!err) {

                showAlert(false);

                console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");

                // Updating the GLOBAL filepath variable to user-selected file.
                pathToFile = pathToNewFile + "/todo.txt";

                // write new path and file name into storage file
                store.set("pathToFile", pathToFile);

                // pass path and filename on, to extract and parse the raw data
                parseData(pathToFile);
              }
            });
          }
        }));

      }
    }).catch(err => {
        console.log("Error: " + err)
    });
  } else if(!showDialog && overwriteFile) {
    fs.writeFile(pathToNewFile + "/todo.txt", "(A) Please report bugs at https://github.com/ransome1/sleek/issues @participate +sleek due:2020-10-10", function (err) {
      if (err) throw err;
      if (!err) {

        showAlert(false);

        console.log("Success: New todo.txt file created: " + pathToNewFile + "/todo.txt");

        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = pathToNewFile + "/todo.txt";

        // write new path and file name into storage file
        store.set("pathToFile", pathToFile);

        // pass path and filename on, to extract and parse the raw data
        parseData(pathToFile);
      }
    });
  }
}

// ###############

// READ THE FILE AND GENERATE DATA

// ###############

// read contents of todo.txt file and trigger further action
function parseData(pathToFile) {

  fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err,data) {

    if (!err) {
      // https://stackoverflow.com/a/10024929
      // check the toggleShowCompleted value and filter completed items if selected by user
      if (showCompleted == false) {
        // only select the items where "complete" is equal "false"
        parsedData = TodoTxt.parse( data, [ new DueExtension() ] ).filter(function(el) { return el.complete == false; });
      } else {
        // process all items by reading the file. This is important because the parsedString could already be incomplete from previous filtering
        parsedData = TodoTxt.parse( data, [ new DueExtension() ] );
      }

      if(generateTodoData(selectedFilters)) {
        console.log('Success: All todos generated');
      } else {
        console.log('Error: Could not generate todos');
      }

      // load filters
      if(generateFilterData(selectedFilters)) {
        console.log('Success: Filters generated');
      } else {
        console.log('Error: Could not generate filters');
      }

      onboardingContainer.removeAttribute('class',"is-active");
      todoTable.classList.add("is-active");
      btnAddItem.setAttribute('class',"is-active");
      btnFilter.classList.add("is-active");

    } else {
      // if data couldn't be extracted from file
      console.log(err);
      // start the onboarding instead
      console.log("Info: Data could not be extracted from file, starting onboarding instead");
      onboardingContainer.addAttribute('class',"is-active");
      btnAddItem.removeAttribute('class',"is-active");
      btnFilter.removeAttribute('class',"is-active");
      todoTable.classList.remove("is-active");
    }
  });
}

// ###############

// BUILD THE FILTER SECTION

// ###############

// read passed filters, count them and pass on
function generateFilterData() {

  // get the reference for the filter container
  let todoFilterContainer = document.getElementById("todoFilters");
  // empty the container to prevent duplicates
  todoFilterContainer.innerHTML = "";

  // parse through above defined categories, most likely contexts and projects
  for (let i = 0; i < filterCategories.length; i++) {

    category = filterCategories[i];

    // array to collect all the available filters in the data
    let filters = new Array();

    // run the array and collect all possible filters, duplicates included
    for (let j = 0; j < parsedData.length; j++) {
      // check if the object has values in either the project or contexts field
      if(parsedData[j][category]) {
        // loop through all the values it will find and push them into the filter array
        for(let k = 0; k < parsedData[j][category].length; k++) {
          filters.push([parsedData[j][category][k]]);
        }
      }
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

    // always hide the reset filters button first
    btnResetAllFilters.classList.remove("is-active");

    // TODO: error handling
    // build the filter buttons
    if(filters.length > 0) {
        // only show the reset filters button if there are any filters
        btnResetAllFilters.classList.add("is-active");
        buildFilterButtons();
    } else {
      console.log("Info: No filters for category " + category + " found in todo.txt data, no filter buttons will be generated");
    }
  }
  return true;
}

// build a section for each category and add the buttons to each
function buildFilterButtons() {

  // build the buttons
  // only generate filters if there are any
  if(filtersCounted) {

    let todoFilterContainer = document.getElementById("todoFilters");

    // creates a div for the specific filter section
    let todoFilterContainerSub = document.createElement("div");
    todoFilterContainerSub.setAttribute("class", "dropdown-item " + category);
    todoFilterContainerSub.setAttribute("tabindex", -1);

    // create a sub headline element
    let todoFilterHeadline = document.createElement("h4");
    todoFilterHeadline.setAttribute("class", "title is-4 " + category);
    todoFilterHeadline.setAttribute("tabindex", -1);
    todoFilterHeadline.innerHTML = category;

    // add the headline before category container
    todoFilterContainerSub.appendChild(todoFilterHeadline);

    // build one button each
    // TODO: why dont put the adventListener on the buttons here?!
    for (let filter in filtersCounted) {

      let todoFiltersItem = document.createElement("button");
      todoFiltersItem.setAttribute("class", "btnApplyFilter button");
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      todoFiltersItem.setAttribute("tabindex", 415);
      todoFiltersItem.innerHTML = filter + " <span class=\"tag is-rounded\">" + filtersCounted[filter] + "</span>";

      // create the event listener for filter selection by user
      todoFiltersItem.addEventListener("click", () => {

        todoFiltersItem.classList.toggle("is-dark");

        // if no filters are selected, add a first one
        if (selectedFilters.length > 0) {
          // get the index of the item that matches the data values the button clic provided
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

        // TODO: error handling
        generateTodoData(selectedFilters);

      });
      // after building the buttons we check if they appear in the saved filters, if so we add the highlighting
      selectedFilters.forEach(function(item) {
        if(JSON.stringify(item) == '["'+filter+'","'+category+'"]') {
          todoFiltersItem.classList.toggle("is-dark");
        }
      });

      todoFilterContainerSub.appendChild(todoFiltersItem);
    }

    // add filters to the specific filter container
    todoFilterContainer.appendChild(todoFilterContainerSub);
  }
}

// ###############

// GENERATE THE DATA BEFORE TABLE IS BEING BUILT

// ###############

// TODO: Remove filterArray if not needed anymore
function generateTodoData(selectedFilters) {

  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(selectedFilters.length > 0) {

    // TODO: why?
    for (let i = 0; i < selectedFilters.length; i++) {
      for(var j = 0; j < parsedData.length; j++) {
        if(parsedData[j][selectedFilters[i][1]]) {
          // check if the selected filter is in one of the array values of the category field
          // only push into array if it hasn't already been part of the array
          if(parsedData[j][selectedFilters[i][1]].includes(selectedFilters[i][0]) && !itemsFiltered.includes(parsedData[j])) {
            itemsFiltered.push(parsedData[j]);
          }
        }
      }
    }

  // if no filter has been passed, select all items
  } else {
    itemsFiltered = parsedData;
  }

  // sort the items if toggle is set to true
  if(sortAlphabetically==true) {
    // pass filtered data to function to build the table
    itemsFiltered = itemsFiltered.slice().sort((a, b) => a.text.localeCompare(b.text));
  }

  // TODO: error handling
  generateTodoTable(itemsFiltered);

  // TODO: neccessary?
  return true;
}

// ###############

// BUILD THE TABLE

// ###############

function generateTodoTable(itemsFiltered) {

  // get the reference for the table container
  let todoTableContainer = document.getElementById("todoTableContainer");

  // empty the table before reading fresh data
  todoTableContainer.innerHTML = "";

  let itemsWithPriority = itemsFiltered.filter(item => item.priority!=null);
  let itemsWithNoPriority = itemsFiltered.filter(item => item.priority==null);

  // TODO: error handling
  addTableRows(itemsWithPriority, true);

  // TODO: error handling
  addTableRows(itemsWithNoPriority, false);

  previousItem = undefined;

}

function addTableRows(items, priority) {

  if(priority==true) {
    // TODO: whats happening here?
    let itemsByPriority = items.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});

    // convert the not sortable object into an array and sort it a to z
    itemsByPriority = Object.entries(itemsByPriority).sort();

    // TODO: looks to complicated
    for (let j = 0; j < itemsByPriority.length; j++) {

      for (let i = 0; i < itemsByPriority[j][1].length; i++) {
        item = itemsByPriority[j][1][i];

        // divider row for new priority
        createTableDividerRow(item, previousItem, itemsByPriority[j][0]);

        // table row with item data
        createTableRow(item);
      }
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      item = items[i];
      // table row with item data
      createTableRow(item);
    }
  }
}

function createTableDividerRow() {

  if(item.priority && item.priority!=previousItem) {
    previousItem = item.priority;
    priority = item.priority;
    let todoTableBodyRowDivider = document.createElement("div");
    todoTableBodyRowDivider.setAttribute("class", "flex-table priority");
    todoTableBodyRowDivider.setAttribute("role", "rowgroup");

    let todoTableBodyCellPriority = document.createElement("div");
    todoTableBodyCellPriority.setAttribute("class", "flex-row");
    todoTableBodyCellPriority.setAttribute("role", "cell");
    todoTableBodyCellPriority.innerHTML = priority;
    todoTableBodyRowDivider.appendChild(todoTableBodyCellPriority);

    // add the row to the end of the table body
    todoTableContainer.appendChild(todoTableBodyRowDivider);
  }
}

function createTableRow() {

  // creates a table row for one item
  let todoTableBodyRow = document.createElement("div");
  if(item.complete==true) {
    todoTableBodyRow.setAttribute("class", "flex-table completed");
  } else {
    todoTableBodyRow.setAttribute("class", "flex-table");
  }
  todoTableBodyRow.setAttribute("role", "rowgroup");
  todoTableBodyRow.setAttribute("data-item", item.toString());

  // add the priority marker
  if(item.priority) {
    let todoTableBodyCellPriority = document.createElement("div");
    todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + item.priority);
    todoTableBodyCellPriority.setAttribute("role", "cell");
    todoTableBodyRow.appendChild(todoTableBodyCellPriority);
  }

  // add the checkbox
  let todoTableBodyCellCheckbox = document.createElement("div");
  todoTableBodyCellCheckbox.setAttribute("class", "flex-row checkbox");
  todoTableBodyCellCheckbox.setAttribute("role", "cell");
  if(item.complete==true) {
    todoTableBodyCellCheckbox.setAttribute("title", "Mark as in progress");
    todoTableBodyCellCheckbox.innerHTML = "<a tabindex=\"300\"><i class=\"fas fa-check-circle\"></i></a>";
  } else {
    todoTableBodyCellCheckbox.setAttribute("title", "Mark as done");
    todoTableBodyCellCheckbox.innerHTML = "<a tabindex=\"300\"><i class=\"far fa-circle\"></i></a>";
  }
  // add a listener on the checkbox to call the completeItem function
  todoTableBodyCellCheckbox.addEventListener("click", function() {
    // passing the data-item attribute of the parent tag to complete function
    completeItem(this.parentElement.getAttribute('data-item'));
  });
  todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

  // creates cell for the text
  let todoTableBodyCellText = document.createElement("div");
  todoTableBodyCellText.setAttribute("class", "flex-row text");
  todoTableBodyCellText.setAttribute("role", "cell");
  todoTableBodyCellText.setAttribute("title", "Edit this todo");
  todoTableBodyCellText.setAttribute("tabindex", 300);
  if(item.text) {

    // use the autoLink lib to attach an icon to every link and put a link on it
    todoTableBodyCellText.innerHTML =  item.text.autoLink({
      callback: function(url) {
        return url + " <a href=" + url + " class=\"itemExternalLink\" title=\"Open this link in your browser\" target=\"_blank\" tabindex=\"300\"><i class=\"fas fa-external-link-alt\"></i></a>";
      }
    });
  }

  // event listener for the click on the text
  todoTableBodyCellText.addEventListener("click", function() {
    // if the clicked item is not the external link icon, showForm() will be called
    if(!event.target.classList.contains('fa-external-link-alt')) {
      //console.log(event.target);
      // declaring the item-data value global so other functions can access it
      dataItem = this.parentElement.getAttribute('data-item');
      showForm(dataItem);
    }
  });

  // create tag for the categories
  if (filterCategories.length > 0) {

    for (let k = 0; k < filterCategories.length; k++) {
      if(item[filterCategories[k]]!=null) {
        for(let j = 0; j < item[filterCategories[k]].length; j++) {
          let todoTableBodyCellCategory = document.createElement("span");
          todoTableBodyCellCategory.setAttribute("class", "tag " + filterCategories[k]);
          todoTableBodyCellCategory.innerHTML = item[filterCategories[k]][j];
          todoTableBodyCellText.appendChild(todoTableBodyCellCategory);
        }
      }
    }
  }

  // check for and add a given due date
  if(item.due) {
    let todoTableBodyCellDueDate = document.createElement("span");
    todoTableBodyCellDueDate.setAttribute("class", "itemDueDate");
    todoTableBodyCellDueDate.setAttribute("title", "This todo is due at " + item.due.toISOString().slice(0, 10));
    todoTableBodyCellDueDate.innerHTML = " <i class=\"far fa-clock\"></i>&nbsp;" + item.due.toISOString().slice(0, 10);
    todoTableBodyCellText.appendChild(todoTableBodyCellDueDate);
  }

  // add the text field to the row
  todoTableBodyRow.appendChild(todoTableBodyCellText);

  // add the row to the end of the table body
  todoTableContainer.appendChild(todoTableBodyRow);
}

// ########################################################################################################################


// SAVE DATA


// ########################################################################################################################

// function to open modal layer and pass a string version of the todo into input field
function showForm() {
  // clear the input value in case there was an old one
  modalFormInput.value = null;
  modalForm.classList.toggle("is-active");
  // clean up the alert box first
  modalFormAlert.innerHTML = null;
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');

  if(dataItem) {
    modalFormInput.value = dataItem;
    modalTitle.innerHTML = 'Edit item';
    btnItemStatus.classList.add("is-active");
    // only show the complete button on open items
    if(new TodoTxtItem(dataItem).complete == false) {
      btnItemStatus.innerHTML = "Mark as done";
    } else {
      btnItemStatus.innerHTML = "Mark as in progress";
    }
  } else {
    modalTitle.innerHTML = 'Add item';
    btnItemStatus.classList.remove("is-active");
  }
  // in any case put focus into the input field
  modalFormInput.focus();
}

function submitForm() {

  // check if there is an input in the text field, otherwise indicate it to the user
  if(modalForm.elements[0].value) {

    // convert array of objects to array of strings to find the index
    parsedData = parsedData.map(item => item.toString());

    // input value and data item are the same, nothing has changed, nothing will be written
    if (dataItem==modalForm.elements[0].value) {

      console.log("Info: Nothing has changed, won't write anything.");
      return true;

    // edit item
    } else if(dataItem) {

        // get the position of that item in the array
        let itemId = parsedData.indexOf(dataItem);

        // get the index using the itemId, remove 1 item there and add the value from the input at that position
        parsedData.splice(itemId, 1, modalForm.elements[0].value);

        // convert all the strings to proper todotxt items again
        parsedData = parsedData.map(item => new TodoTxtItem(item));

        // TODO: duplicate, clean up
        // pass the new data to the write function
        if(writeDataIntoFile(parsedData)) {
          // hide the alert for future modal calls, if there has been one
          return true;
        } else {
          // if writing into file is denied throw alert
          modalFormAlert.innerHTML = "<strong>Error:</strong> Could not write your changes to the file. Please check if the file exists and if you have sufficient permissions to write to it: " + pathToFile;
          modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
          return false;
        }

  // add item
  } else {

      // in case there hasn't been a passed data item, we just push the input value as a new item into the array
      parsedData.push(modalForm.elements[0].value);

      // TODO: duplicate, clean up
      // pass the new data to the write function
      if(writeDataIntoFile(parsedData)) {
        // hide the alert for future modal calls, if there has been one
        return true;
      } else {
        // if writing into file is denied throw alert
        modalFormAlert.innerHTML = "<strong>Error:</strong> Could not write your changes to the file. Please check if the file exists and if you have sufficient permissions to write to it: " + pathToFile;
        modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
        return false;
      }
    }
  // if the input field is empty, let users know
  } else {
    modalFormAlert.innerHTML = "Please add a todo into the text field. If you are unsure on how to do this, take a quick look at the <a href=\"https://github.com/todotxt/todo.txt\" target=\"_blank\">todo.txt syntax</a>.";
    modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
    modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
    return false;
  }
}

function completeItem(dataItem) {

  // convert array of objects to array of strings
  parsedData = parsedData.map(item => item.toString());

  // get the position of that item in the array
  let itemId = parsedData.indexOf(dataItem);
  let itemStatus = new TodoTxtItem(dataItem).complete;

  // check if item was complete
  if(itemStatus) {

    // if item was already completed we remove the first 13 chars (eg "x 2020-01-01 ") and make the item incomplete again
    parsedData.splice(itemId, 1, dataItem.substr(13));

  } else {

    // build the prefix "x " and add today's date, so it will be read as completed
    // https://stackoverflow.com/a/35922073
    let prefix = "x " + new Date().toISOString().slice(0, 10) + " ";

    // get the index using the itemId, remove 1 item there and add the value from the input at that position
    parsedData.splice(itemId, 1, prefix.concat(dataItem));

  }

  // convert all the strings to proper todotxt items again
  parsedData = parsedData.map(item => new TodoTxtItem(item));

  if(writeDataIntoFile(parsedData)) {
      console.log("Success: Marked item as complete \"" + dataItem + "\"");
  } else {
    console.log("Error: Could not mark item as completed");
  }


  return true;
}

function writeDataIntoFile(parsedData) {

  // empty the data item as we don't need it anymore
  dataItem = null;

  // render the objects into a string with line breaks
  parsedData = TodoTxt.render(parsedData);

  // Write data to 'todo.txt'
  try {
    //write the data to the file
    fs.writeFileSync(pathToFile, parsedData, {encoding: 'utf-8'});
    console.log("Success: File written successfully");

    // reset the (persisted) filters
    selectedFilters = [];
    store.set("selectedFilters", new Array);

    // reread the data
    parseData(pathToFile);

    return true;

  } catch(err) {
    console.error(err);
    return false;
  }

}
