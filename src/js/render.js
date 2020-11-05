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
    windowBounds: { width: 1025, height: 768, minWidth: 800, minHeight: 600 },
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
//const loadingIndicator = document.getElementById("loadingIndicator");
const todoTable = document.getElementById("todoTable");
const filterCategories = ["contexts", "projects"];
const filterDropdown = document.getElementById("filterDropdown");
const modalForm = document.getElementById('modalForm');
const modalFormInput = document.getElementById("modalFormInput");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalTitle = document.getElementById("modalTitle");
const modalBackground = document.querySelectorAll('.modal-background');
const modalFile = document.getElementById("modalFile");
const modalFileChoose = document.getElementById("modalFileChoose");
const modalFileOverwrite = document.getElementById("modalFileOverwrite");
// path to the sample file if new todo.txt is about to be created
const pathToSampleFile = app.getAppPath() + "/src/sample.txt";
// using pathToSampleFile to build a string that contains the sample data
const sampleData = fs.readFileSync(pathToSampleFile).toString();
// datepicker declaration and configuation
const dueDatePickerInput = document.getElementById("dueDatePickerInput");
const dueDatePicker = new Datepicker(dueDatePickerInput, {
      autohide: true,
      format: 'yyyy-mm-dd',
      clearBtn: true
});
// defining a file path Variable to store user-selected file
let pathToFile = store.get("pathToFile");
// empty variable
let pathToNewFile;
// check store file if filters (come as JSON) have been saved. If so convert the JSON to arrays and them to the main array. If not the array stays empty
let selectedFilters = store.get("selectedFilters");
if (selectedFilters.length > 0) selectedFilters = JSON.parse(selectedFilters);
// get default sorting value (false)
let sortAlphabetically = store.get("sortAlphabetically");
// get default "show completed? value (false)
let showCompleted = store.get("showCompleted");
// create  an empty variable for the data item
let dataItem;
// create  an empty variable for the data item if updated temporarily
let dataItemUpdated;
// create  global variable for parsedData
let parsedData;
// TODO: whats this again?
let modalFormStatus;

// ###############

// INITIAL DOM CONFIG

// ###############

// prevent manual input in datepicker
dueDatePickerInput.readOnly = true;
// set the checked attribute according to the persisted value
toggleSortAlphabetically.checked = sortAlphabetically;
// set the checked attribute according to the persisted value
toggleShowCompleted.checked = showCompleted;

// ########################################################################################################################


// ONCLICK DEFINITIONS AND EVENT LISTENERS


// ########################################################################################################################

// persist the highlighting of the button and the dropdown menu
btnFilter.onclick = showFilters;

btnAddItem.onclick = showForm;

// flush all filters and items by emptying the array and reloading the data
btnResetAllFilters.onclick = function() {
  selectedFilters = [];
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  store.set("selectedFilters", new Array);

  // only generate the filters and items, we do not read the file again as it is not necessary
  generateFilterData(selectedFilters);
  generateTodoData();
}

// click on the todo table will close more dropdown and remove active state for the dotted button
todoTable.onclick = function() {
  if(event.target.classList.contains("flex-table")) {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.remove("is-active")
    });
  }
}

// reread the data but sort it asc
toggleSortAlphabetically.onclick = function() {
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
  generateTodoData();
}

// reread the data but sort it asc
toggleShowCompleted.onclick = function() {
  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  // persist the sorting
  store.set("showCompleted", showCompleted);

  // clear selectedFilters to avoid problems
  // TODO: this is ugly
  //selectedFilters = [];

  // TODO: error handling
  // only generate the filters and items, we do not read the file again as it is not necessary
  generateFilterData(selectedFilters);
  generateTodoData();
}

// submit in the form
modalForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();
  // if form returns success we clear the modal
  if(submitForm()) clearModal();
});

// complete the item using the footer button in modal
btnItemStatus.onclick = function() {
  // TODO: error handling
  if(completeItem(dataItem)) {
    modalForm.classList.toggle("is-active");
  }
}

// prevent empty hyperlinks from jumping to top after clicking
a.forEach(el => el.addEventListener("click", function(el) {
  if(el.target.href && el.target.href == "#") el.preventDefault();
}));

// put a click event on all "open file" buttons
btnLoadTodoFile.forEach(el => el.onclick = openFile);

// onboarding: click will call createFile() function
btnCreateTodoFile.onclick = function () { createFile(true, false) };

// onboarding: click will call createFile() function
modalFileChoose.onclick = function() { createFile(true, false); }

// onboarding: click will call createFile() function
modalFileOverwrite.onclick = function() { createFile(false, true); }

// put a listeners on all modal backgrounds
modalBackground.forEach(el => el.onclick = clearModal);

// click on the cancel button in the footer of the edit modal
btnModalCancel.forEach(el => el.onclick = clearModal);

// event intercepted when datepicker changes the date
dueDatePickerInput.addEventListener('changeDate', function (e, details) {
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    console.log(e.detail.date);
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    dataItemTemp = new TodoTxtItem(modalFormInput.value, [ new DueExtension() ]);
    dataItemTemp.due = new Date(e.detail.date);
    dataItemTemp.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    modalFormInput.value = dataItemTemp.toString();
    // clean up as we don#t need it anymore
    dataItemTemp = null;
  }
});

// ###############

// CONFIGURE KEYSTROKES

// ###############

// toggle filter dropdown when escape key is pressed
filterDropdown.addEventListener ("keydown", function () {
  if(event.key == 'Escape') showFilters();
});

// put a listeners on all modal backgrounds
modalForm.addEventListener ("keydown", function () {
  if(event.key == 'Escape') clearModal();
});

// shortcut for adding items
body.addEventListener ("keydown", function () {
  // shortcut will only work if the showForm modal is closed
  // we need to wait a little otherwise the form will be loaded before the key is interpreted and the i key will be filled into the input
  if(!modalFormStatus && event.key == 'a') setTimeout(showForm, 100);
});

// shortcut to show filters
body.addEventListener ("keydown", function () {
  // shortcut will only work if the showForm modal is closed
  if(!modalFormStatus && event.key == 'f') showFilters();
});

// shortcut to open file
body.addEventListener ("keydown", function () {
  // shortcut will only work if the showForm modal is closed
  if(!modalFormStatus && event.key == 'o') openFile();
});

// ########################################################################################################################


// HELPER FUNCTIONS


// ########################################################################################################################

// function to open modal layer and pass a string version of the todo into input field
// TODO: error handling
function showForm() {

  // we need to check if there already is a due date in the object
  dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);
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

  // set global variable if the modal is opening
  modalFormStatus = true;
  // clear the input value in case there was an old one
  modalFormInput.value = null;
  modalForm.classList.toggle("is-active");
  // clean up the alert box first
  modalFormAlert.innerHTML = null;
  modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');

  if(dataItem) {
    modalFormInput.value = dataItem.toString();
    modalTitle.innerHTML = 'Edit item';
    btnItemStatus.classList.add("is-active");
    // only show the complete button on open items
    if(dataItem.complete == false) {
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

//
function onboarding(show) {
  if(show) {
    console.log("Info: Starting onboarding");
    onboardingContainer.classList.add("is-active");
    btnAddItem.classList.remove("is-active");
    btnFilter.classList.remove("is-active");
    todoTable.classList.remove("is-active");
  } else {
    console.log("Info: Ending onboarding");
    onboardingContainer.classList.remove("is-active");
    btnAddItem.classList.add("is-active");
    btnFilter.classList.add("is-active");
    todoTable.classList.add("is-active");
  }
}

// ###############

// show and hide the filter selection dropdown

// ###############

function showFilters() {
  btnFilter.classList.toggle("is-highlighted");
  filterDropdown.classList.toggle("is-active");
  filterDropdown.focus();
  body.classList.toggle("is-active");
}

// ###############

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

// ###############

function uniqBy(items) {
  var seen = {};
  return items.filter(function(item) {
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
  // set global variable if the modal is opening
  modalFormStatus = false;
}

// ###############

// show alert modal (e.g. if file overwrite is necessary)

// ###############

function showAlert(status) {
  if(status) {
    modalFile.classList.add("is-active", "is-danger");
  } else {
    modalFile.classList.remove("is-active", "is-danger");
  }
};

// ########################################################################################################################


// START PARSING ONCE EVERYTHING ELSE IS READY


// ########################################################################################################################

window.onload = function () {
  // we only start if file exists
  parseDataFromFile(pathToFile).then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
}

// ########################################################################################################################


// READ DATA


// ########################################################################################################################

// ###############

// OPEN FILE AND PASS DATA TO FUNCTIONS

// ###############
// TODO: error handling
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

// ###############

// CREATE A NEW TODO.TXT FILE

// ###############
// TODO: error handling
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
          // file exists, so we ask user to overwrite or choose a different location
          if(!err) {
            showAlert(true);
            return false;
          // file does not exist at given location, so we write a new file with content of sample.txt
          } else {
            fs.writeFile(pathToNewFile + "/todo.txt", sampleData, function (err) {
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
        }));
      }
    }).catch(err => {
        console.log("Error: " + err)
    });
  // existing file will be overwritten
  } else if (!showDialog && overwriteFile) {
    fs.writeFile(pathToNewFile + "/todo.txt", sampleData, function (err) {
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

// ###############

// PARSE DATA FROM TODO.TXT FILE, CONVERT TO OBJECTS AND RETURN THOSE

// ###############

function parseDataFromFile(pathToFile) {

  // we only start if file exists
  if (fs.existsSync(pathToFile)) {
    try {
      // the actuall function to read the file
      parsedData = fs.readFileSync(pathToFile, {encoding: 'utf-8'}, function(err,data) { return data; });

      // convert to proper todo.txt objects
      parsedData = TodoTxt.parse( parsedData.toString(), [ new DueExtension() ] );

      // parsed data will be passed to generate data and build the tables later on
      generateTodoData().then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
      // parsed data will be passed to generate filter data and build the filter buttons
      generateFilterData(selectedFilters).then(response => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });

      onboarding(false);

      return Promise.resolve("Success: Data has been extracted from file and parsed to todo.txt items");

    } catch(error) {
      onboarding(true);
      return Promise.reject("Error: Data could not be extracted from file");
    }
  } else {
    onboarding(true);
    return Promise.reject("Info: File does not exist or has not been defined yet");
  }
}

// ###############

// BUILD THE FILTER SECTION

// ###############

function generateFilterData() {

  try {
    // get the reference for the filter container
    let todoFilterContainer = document.getElementById("todoFilters");
    // empty the container to prevent duplicates
    todoFilterContainer.innerHTML = "";
    // parse through above defined categories, most likely contexts and projects
    filterCategories.forEach((category) => {
      // array to collect all the available filters in the data
      let filters = new Array();
      // run the array and collect all possible filters, duplicates included
      parsedData.forEach((item) => {
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

      // build the filter buttons
      if(filters.length > 0) {
        // only show the reset filters button if there are any filters
        btnResetAllFilters.classList.add("is-active");
        buildFilterButtons(category).then(response => {
          console.log(response);
        }).catch (error => {
          console.log(error);
        });
        return Promise.resolve("Success: Filter data generated");
      } else {
        console.log("Info: No filters for category " + category + " found in todo.txt data, no filter buttons will be generated");
      }
    });
    return Promise.resolve("Success: Filter data generated");
  } catch (error) {
    return Promise.reject("Error: " + error);
  }
}

function buildFilterButtons(category) {

  try {
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
          generateTodoData();

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

      return Promise.resolve("Success: Filter buttons for category " + category + " have been build");
    }
  } catch (error) {
    return Promise.reject("Error: " + error);
  }
}

// ###############

// GENERATE DATA AND BUILD THE TABLE

// ###############

function generateTodoData() {
  try {
    // new variable for items, filtered or not filtered
    let itemsFiltered = [];

    // check if a filter has been passed
    if(selectedFilters.length > 0) {

      // if there are selected filters build the items according to those filters
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

    generateTodoTable(itemsFiltered).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });

    return Promise.resolve("Success: Todo data generated and passed on for building the table");

  } catch(error) {

    return Promise.reject(error);

  }

}

function generateTodoTable(itemsFiltered) {

  try {
    // get the reference for the table container
    let todoTableContainer = document.getElementById("todoTableContainer");

    // empty the table before reading fresh data
    todoTableContainer.innerHTML = "";

    // produce and object where priority a to z + null is key
    itemsFiltered = itemsFiltered.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});

    // convert the presorted object to an array
    itemsFiltered = Object.entries(itemsFiltered).sort();

    itemsFiltered.forEach((i) => {
      i.forEach((j) => {
        // reduces the entries to priorities a to z only
        if(j.toString().length==1) {
          createTableDividerRow(j);
        // adds an empty row as a divider
        } else if(j=="null") {
          createTableDividerRow("&nbsp;");
        } else {
          // can't use forEach because we need "continue" here
          for(let k in j) {
            // skip completed ones if user opted for it
            if(showCompleted==false && j[k].complete==true) {
              continue;
            } else {
              // table row with item data
              createTableItemRow(j[k]);
            }
          }
        }
      });
    });

    return Promise.resolve("Success: Table has been build");

  } catch(error) {

    return Promise.reject("Error: Could not build todo table");

  }
}

function createTableDividerRow(rowName) {
    let todoTableBodyRowDivider = document.createElement("div");
    todoTableBodyRowDivider.setAttribute("class", "flex-table priority");
    todoTableBodyRowDivider.setAttribute("role", "rowgroup");

    let todoTableBodyCellPriority = document.createElement("div");
    todoTableBodyCellPriority.setAttribute("class", "flex-row");
    todoTableBodyCellPriority.setAttribute("role", "cell");
    todoTableBodyCellPriority.innerHTML = rowName;
    todoTableBodyRowDivider.appendChild(todoTableBodyCellPriority);

    // add the row to the end of the table body
    todoTableContainer.appendChild(todoTableBodyRowDivider);
  //}
}

function createTableItemRow(item) {

  if(item) {
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
    todoTableBodyCellCheckbox.onclick = function() {
      // passing the data-item attribute of the parent tag to complete function
      completeItem(this.parentElement.getAttribute('data-item'));
    }
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
          return url + " <a href=" + url + " title=\"Open this link in your browser\" target=\"_blank\" tabindex=\"300\"><i class=\"fas fa-external-link-alt\"></i></a>";
        }
      });
    }

    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, showForm() will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        // declaring the item-data value global so other functions can access it
        dataItem = this.parentElement.getAttribute('data-item');
        showForm(dataItem);
      }
    }

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

    // add the more dots
    let todoTableBodyCellMore = document.createElement("div");
    todoTableBodyCellMore.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMore.setAttribute("role", "cell");
    todoTableBodyCellMore.setAttribute("title", "More options");
    todoTableBodyCellMore.innerHTML = "<div class=\"dropdown is-right\"><div class=\"dropdown-trigger\"><a tabindex=\"200\"><i class=\"fas fa-ellipsis-v\"></i></a></div><div class=\"dropdown-menu\" role=\"menu\"><div class=\"dropdown-content\"><a class=\"dropdown-item\">Edit</a><a class=\"dropdown-item\">Delete</a></div></div></div>";
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
          completeItem(todoTableBodyRow.getAttribute('data-item'), true);
        }
      }
    }

    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);

    // add the row to the end of the table body
    todoTableContainer.appendChild(todoTableBodyRow);
  } else {
    console.log("Error: Could not build row for todo: " + item);
  }
}

// ########################################################################################################################


// SAVE DATA


// ########################################################################################################################

// TODO: error handling
function submitForm() {

  // check if there is an input in the text field, otherwise indicate it to the user
  if(modalForm.elements[0].value) {

    // input value and data item are the same, nothing has changed, nothing will be written
    if (dataItem==modalForm.elements[0].value) {

      console.log("Info: Nothing has changed, won't write anything.");
      return true;

    // edit item
    } else if(dataItem) {

      // convert array of objects to array of strings to find the index
      parsedData = parsedData.map(item => item.toString());

      // get the position of that item in the array
      let itemId = parsedData.indexOf(dataItem);

      // get the index using the itemId, remove 1 item there and add the value from the input at that position
      parsedData.splice(itemId, 1, modalForm.elements[0].value);

      // convert all the strings to proper todotxt items again
      parsedData = parsedData.map(item => new TodoTxtItem(item, [ new DueExtension() ]));

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
      dataItem = new TodoTxtItem(modalForm.elements[0].value, [ new DueExtension() ]);
      parsedData.push(dataItem);

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

// TODO: error handling
function completeItem(dataItem, deleteItem) {

  // convert array of objects to array of strings
  let parsedDataString = parsedData.map(item => item.toString());
  // get the position of that item in the array using the string
  let itemId = parsedDataString.indexOf(dataItem);
  // first convert the string to a todo.txt object
  dataItem = new TodoTxtItem(dataItem, [ new DueExtension() ]);

  // check if item was complete but was not suppose to be deleted
  if(dataItem.complete && !deleteItem) {
    // if item was already completed we set complete to false and the date to null
    dataItem.complete = false;
    dataItem.completed = null;
    // delete old dataItem from array and add the new one at it's position
    parsedData.splice(itemId, 1, dataItem);
    if(writeDataIntoFile(parsedData)) {
      console.log("Success: Unmarked item as complete \"" + dataItem + "\"");
    } else {
      console.log("Error: Could not mark item as completed");
    }
  } else if(!dataItem.complete && !deleteItem) {
    // if deleteItem has been sent as true, we delete the entry from the parsedData
    dataItem.complete = true;
    dataItem.completed = new Date();
    // delete old dataItem from array and add the new one at it's position
    parsedData.splice(itemId, 1, dataItem);
    if(writeDataIntoFile(parsedData)) {
      console.log("Success: Marked item as complete \"" + dataItem + "\"");
    } else {
      console.log("Error: Could not mark item as completed");
    }
  } else {
    parsedData.splice(itemId, 1);
    if(writeDataIntoFile(parsedData)) {
      console.log("Success: Deleted todo \"" + dataItem + "\"");
    } else {
      console.log("Error: Could not delete todo");
    }
  }
  clearModal();
}

function writeDataIntoFile() {

  // empty the data item as we don't need it anymore
  dataItem = null;

  // Write data to 'todo.txt'
  try {

    //write the data to the file
    fs.writeFileSync(pathToFile, TodoTxt.render(parsedData), {encoding: 'utf-8'});

    // reset the (persisted) filters
    //selectedFilters = [];
    //store.set("selectedFilters", new Array);

    // reread the data
    //parseDataFromFile(pathToFile);
    // parsed data will be passed to generate data and build the tables later on
    generateTodoData().then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
    // parsed data will be passed to generate filter data and build the filter buttons
    generateFilterData(selectedFilters).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });

    return true;

  } catch(err) {
    console.error(err);
    return false;
  }

}
