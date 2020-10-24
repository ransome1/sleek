// ### DOCUMENTATION
// read text file: https://www.geeksforgeeks.org/file-upload-in-electronjs/
// generate the table: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
// save and load user data: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e

// ###############

// CONSTANTS

// ###############

const electron = require('electron');
const path = require('path');
const dialog = electron.remote.dialog;
const app = electron.remote.app;
const fs = require('fs');

const body = document.getElementById('body');

const btnFilter = document.getElementById('btnFilter');
const btnAddItem = document.getElementById('btnAddItem');
const btnFormSubmit = document.getElementById('btnFormSubmit');
const btnItemStatus = document.getElementById('btnItemStatus');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const btnLoadTodoFile = document.querySelectorAll('.btnLoadTodoFile');
const btnFormCancel = document.getElementById("btnFormCancel");

const toggleShowCompleted = document.getElementById('toggleShowCompleted');

const itemExternalLink = document.querySelectorAll('.itemExternalLink');

const filterCategories = ["contexts", "projects"];
const filterDropdown = document.getElementById('filterDropdown');

const modalForm = document.getElementById('modalForm');
const modalFormItemInput = document.getElementById("modalFormItemInput");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.querySelectorAll('.modal-close');
const modalBackground = document.querySelectorAll('.modal-background');

const Store = require('./store.js');
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 },
    sortAlphabetically: false,
    showCompleted: false
  }
});

// ###############

// VARIABLES

// ###############

// Needed for comparison between priority items to build the divider rows
let previousItem;
// defining a file path Variable to store user-selected file
let pathToFile = store.get('pathToFile');
// create an empty array for pre selected filters
let selectedFiltersCollected = new Array;
// check store file if filters (come as JSON) have been saved. If so convert the JSON to arrays and them to the main array. If not the array stays empty
// TODO: is there a more sophisticated way to do this?
if(store.get('selectedFiltersCollected')!= undefined) {
  selectedFiltersCollected = JSON.parse(store.get('selectedFiltersCollected'));
}
// sort alphabetically
let sortAlphabetically = store.get('sortAlphabetically');
// show completed: get the stored value
let showCompleted = store.get('showCompleted');
// we need the parsed data as strings instead of todotxt objects to save them into the text file
let parsedDataString = new Array;
// create  an empty variable for the data item
let dataItem;

// ###############

// INITIAL DOM CONFIG

// ###############
// set the checked attribute according to the persisted value
document.getElementById('toggleSort').checked = sortAlphabetically;
// set the checked attribute according to the persisted value
toggleShowCompleted.checked = showCompleted;

// ###############

// EVENT LISTENERS

// ###############

// persist the highlighting of the button and the dropdown menu
btnFilter.addEventListener('click', () => {
  btnFilter.classList.toggle("is-highlighted");
  filterDropdown.classList.toggle('is-active');
  body.classList.toggle('is-active');
});

/*
// put a listeners on the table for closing the active menu
document.getElementById('todoTable').addEventListener('click', () => {
  if(filterDropdown.classList.contains('is-active')) {
    btnFilter.classList.toggle("is-active");
    filterDropdown.classList.toggle('is-active');
    body.classList.toggle('is-active');
  }
});
*/

btnAddItem.addEventListener('click', () => {
  showForm();
});

// just reread the file and flush all filters and items
document.getElementById('btnResetAllFilters').addEventListener('click', () => {
  selectedFiltersCollected = [];
  // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
  store.set('selectedFiltersCollected', undefined);
  parseData(pathToFile);
});

// reread the data but sort it asc
document.getElementById('toggleSort').addEventListener('click', () => {
  if(sortAlphabetically==false) {
    sortAlphabetically = true;
  } else {
    sortAlphabetically = false;
  }
  // persist the sorting
  store.set('sortAlphabetically', sortAlphabetically);

  // TODO: error handling
  // regenerate the table considering the sort value and make sure saved filters are going to be passed
  // TODO: does it crash if no filters have been selected?
  generateTodoData(selectedFiltersCollected);

});

// reread the data but sort it asc
toggleShowCompleted.addEventListener('click', () => {
  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  // persist the sorting
  store.set('showCompleted', showCompleted);

  // TODO: error handling
  // regenerate the table considering the sort value
  parseData(pathToFile);

});

// submit in the form
modalForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();

  if(submitForm()) {
      modalForm.classList.toggle('is-active');
  }

  return false;

});

// click on submit button
btnFormSubmit.addEventListener("click", function(e) {
  if(submitForm()) {
      modalForm.classList.toggle('is-active');
  }
});

btnItemStatus.addEventListener('click', () => {
  if(completeItem(dataItem)) {
    modalForm.classList.toggle('is-active');
  }
});

// put a click event on all "open file" buttons
btnLoadTodoFile.forEach(el => el.addEventListener('click', event => {
  openFile();
}));

// put a listeners on all close buttons
modalClose.forEach(el => el.addEventListener('click', event => {
  el.parentElement.classList.toggle('is-active');
}));

// put a listeners on all modal backgrounds
modalBackground.forEach(el => el.addEventListener('click', event => {
  el.parentElement.classList.toggle('is-active');
}));

// click on the cancel button in the footer of the edit modal
btnFormCancel.addEventListener("click", function(e) {
  modalForm.classList.toggle('is-active');
  // clean up the modal
  modalFormAlert.parentElement.classList.remove('is-active', 'is-warning');
});

// ###############

// READ PREVIOUSLY SELECTED todo.txt FILE, STORED IN store.js

// ###############

// TODO: Maybe wait for something before we start the iterations?
if(pathToFile) {
  parseData(pathToFile);
  console.log('todo.txt file loaded: ' + pathToFile);
  document.getElementById('todoTable').classList.add("is-active");
  document.getElementById('btnAddItem').setAttribute('class','is-active');
  document.getElementById('btnFilter').setAttribute('class','is-active');
} else {
  console.log("No todo.txt file loaded, starting onboarding.");
  document.getElementById('todoTable').classList.remove("is-active");
  document.getElementById('btnAddItem').removeAttribute('class','is-active');
  document.getElementById('btnFilter').removeAttribute('class','is-active');
  document.getElementById('onboardingContainer').setAttribute('class','is-active');
}

// ###############

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
// TODO: understand the function

// ###############

function uniqBy(a) {
  var seen = {};
  return a.filter(function(item) {
      var k = JSON.stringify(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  })
}

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

      /*
      // Specifying the File Selector Property
      if (process.platform !== 'darwin') {
        // If the platform is 'win32' or 'Linux'
        properties: ['openFile']
      } else {
        // If the platform is 'darwin' (macOS)
        properties: ['openFile', 'openDirectory']
      }
      */
  }).then(file => {
      // Stating whether dialog operation was cancelled or not.

      if (!file.canceled) {
        // Updating the GLOBAL filepath variable to user-selected file.
        pathToFile = file.filePaths[0].toString();

        //console.log(global.filepath);

        // read contents of todo.txt file
        if (pathToFile && !file.canceled) {

          // pass path and filename on, to extract and parse the raw data
          parseData(pathToFile);

          // close the modal layer if open
          //document.getElementById('onboarding').setAttribute('class','modal');

          // write new path and file name into storage file
          store.set('pathToFile', pathToFile);

          console.log('Success: Storage file updated by new path and filename: ' + pathToFile);

         }
      }
  }).catch(err => {
      console.log("Error: " + err)
  });
}

// ###############

// READ THE FILE AND GENERATE DATA

// ###############

// read contents of todo.txt file and trigger further action
function parseData(pathToFile) {

  if(pathToFile) {

      fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err,data) {

        if (!err) {
          // https://stackoverflow.com/a/10024929
          // check the toggleShowCompleted value and filter completed items if selected by user
          if(showCompleted == false) {
            // only select the items where "complete" is equal "false"
            parsedData = TodoTxt.parse( data, [ new DueExtension() ] ).filter(function(el) { return el.complete == false; });
          } else {
            // process all items
            parsedData = TodoTxt.parse( data, [ new DueExtension() ] );
          }

          // load data
          if(generateTodoData(selectedFiltersCollected) == true) {
            console.log('Success: Todos loaded');
          } else {
            console.log('Error: Could not load todo data');
          }

          // load filters
          if(generateFilterData(selectedFiltersCollected) == true) {
            console.log('Success: Filters loaded');
          } else {
            console.log('Error: Could not load filters');
          }

          document.getElementById('onboardingContainer').removeAttribute('class','is-active');
          document.getElementById('todoTable').classList.add("is-active");
          document.getElementById('btnAddItem').setAttribute('class','is-active');
          btnFilter.classList.add('is-active');

        } else {
          // if data couldn't be extracted from file
          console.log("Info: Data could not be extracted from file, starting onboarding instead");
          document.getElementById('onboardingContainer').addAttribute('class','is-active');
          document.getElementById('btnAddItem').removeAttribute('class','is-active');
          document.getElementById('btnFilter').removeAttribute('class','is-active');
          document.getElementById('todoTable').classList.remove("is-active");
          //console.log(err);
        }
    });
  }
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

    // TODO: Clean up the mess
    let filters = new Array();

    // run the array and collect all possible filter, duplicates included
    for (let j = 0; j < parsedData.length; j++) {

      item = parsedData[j];
      if(item[category]) {
        for(let k = 0; k < item[category].length; k++) {
          filters.push([item[category][k]]);
        }
      }
    }

    // delete duplicates and count filters
    selectedFiltersCounted = filters.join(',').split(',').reduce(function (filters, filter) {
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
    btnResetAllFilters.classList.remove('is-active');

    // TODO: error handling
    // build the filter buttons
    if(filters.length > 0) {
        // only show the reset filters button if there are any filters
        btnResetAllFilters.classList.add('is-active');
        buildFilterButtons();
    } else {
      console.log("No filters for category " + category + " found in todo.txt data, no filter buttons will be generated");
    }
  }

  // TODO: add a false on err
  return true;
}

// build a section for each category and add the buttons to each
function buildFilterButtons() {

  // build the buttons
  // only generate filters if there are any
  if(selectedFiltersCounted) {

    let todoFilterContainer = document.getElementById("todoFilters");

    // creates a div for the specific filter section
    let todoFilterContainerSub = document.createElement("div");
    todoFilterContainerSub.setAttribute("class", "dropdown-item " + category);

    // create a sub headline element
    let todoFilterHeadline = document.createElement("h4");
    todoFilterHeadline.setAttribute("class", "title is-4 " + category);
    todoFilterHeadline.innerHTML = category;

    // add the headline before category container
    todoFilterContainerSub.appendChild(todoFilterHeadline);

    // build one button each
    // TODO: why dont put the adventListener on the buttons here?!
    for (let filter in selectedFiltersCounted) {

      let todoFiltersItem = document.createElement("button");
      todoFiltersItem.setAttribute("class", "btnApplyFilter button");
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      todoFiltersItem.innerHTML = filter + " <span class=\"tag is-rounded\">" + selectedFiltersCounted[filter] + "</span>";
      todoFiltersItem.addEventListener('click', () => {

        todoFiltersItem.classList.toggle("is-dark");

        // if no filters are selected, add a first one
        if (selectedFiltersCollected.length > 0) {
          // get the index of the item that matches the data values the button clic provided
          let index = selectedFiltersCollected.findIndex(item => JSON.stringify(item) === JSON.stringify([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]));
          if(index != -1) {
            // remove the item at the index where it matched
            selectedFiltersCollected.splice(index, 1);
          } else {
            // if the item is not already in the array, push it into
            selectedFiltersCollected.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
          }
        } else {
          // this is the first push
          selectedFiltersCollected.push([todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category')]);
        }

        //convert the collected filters to JSON and save it to store.js
        store.set('selectedFiltersCollected', JSON.stringify(selectedFiltersCollected));

        // TODO: error handling
        generateTodoData(selectedFiltersCollected);

      });

      // after building the buttons we check if they appear in the saved filters, if so we add the highlighting
      selectedFiltersCollected.forEach(function(item) {
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
function generateTodoData(selectedFiltersCollected) {

  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(selectedFiltersCollected.length > 0) {

    // TODO: why?
    for (let i = 0; i < selectedFiltersCollected.length; i++) {
      for(var j = 0; j < parsedData.length; j++) {
        if(parsedData[j][selectedFiltersCollected[i][1]]) {
          // check if the selected filter is in one of the array values of the category field
          // only push into array if it hasn't already been part of the array
          if(parsedData[j][selectedFiltersCollected[i][1]].includes(selectedFiltersCollected[i][0]) && !itemsFiltered.includes(parsedData[j])) {
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
    todoTableBodyCellPriority.setAttribute("class", "flex-row checkbox");
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
    todoTableBodyCellCheckbox.innerHTML = "<i class=\"far fa-check-square\"></i>";
  } else {
    todoTableBodyCellCheckbox.innerHTML = "<i class=\"far fa-square\"></i>";
  }
  // add a listener on the checkbox to call the completeItem function
  todoTableBodyCellCheckbox.addEventListener('click', function() {
    // passing the data-item attribute of the parent tag to complete function
    completeItem(this.parentElement.getAttribute('data-item'));
  });
  todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

  // creates cell for the text
  let todoTableBodyCellText = document.createElement("div");
  todoTableBodyCellText.setAttribute("class", "flex-row text");
  todoTableBodyCellText.setAttribute("role", "cell");
  //  todoTableBodyCellText.setAttribute("data-item", item.toString());
  if(item.text) {

    // use the autoLink lib to attach an icon to every link and put a link on it
    todoTableBodyCellText.innerHTML =  item.text.autoLink({
      callback: function(url) {
        return url + " <a href=" + url + " class=\"itemExternalLink\" title=\"Open this link in your browser\" target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a>";
      }
    });
  }

  // event listener for the click on the text
  todoTableBodyCellText.addEventListener('click', function() {
    // if the clicked item has a surrounding link attached the link will be called instead of the edit form
    if(!event.target.parentElement.hasAttribute('href')) {
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
    todoTableBodyCellDueDate.innerHTML = " <i class=\"far fa-clock\"></i> " + item.due.toISOString().slice(0, 10);
    todoTableBodyCellText.appendChild(todoTableBodyCellDueDate);
  }

  // add the text field to the row
  todoTableBodyRow.appendChild(todoTableBodyCellText);

  // add the row to the end of the table body
  todoTableContainer.appendChild(todoTableBodyRow);
}

// ###############

// SAVE DATA

// ###############

// function to open modal layer and pass a string version of the todo into input field
function showForm(dataItem) {
  // clear the input value in case there was an old one
  modalFormItemInput.value = null;
  modalForm.classList.toggle('is-active');

  if(dataItem) {
    modalFormItemInput.value = dataItem;
    modalTitle.innerHTML = 'Edit item';
    btnItemStatus.classList.add('is-active');
    // only show the complete button on open items
    if(new TodoTxtItem(dataItem).complete == false) {
      btnItemStatus.innerHTML = "Mark as done";
    } else {
      btnItemStatus.innerHTML = "Mark as in progress";
    }
  } else {
    modalTitle.innerHTML = 'Add item';
    btnItemStatus.classList.remove('is-active');
  }
}

function submitForm() {

  // check if there is an input in the text field, otherwise indicate it to the user
  if(modalForm.elements[0].value) {

    // convert array of objects to array of strings to find the index
    parsedDataString = parsedData.map(item => item.toString());

    // input value and data item are the same, nothing has changed, nothing will be written
    if (dataItem==modalForm.elements[0].value) {

      console.log("Info: Nothing has changed, won't write anything.");

    // Input and data item differ so we write the changed todo
    } else if(dataItem) {

        // get the position of that item in the array
        let itemId = parsedDataString.indexOf(dataItem);

        // get the index using the itemId, remove 1 item there and add the value from the input at that position
        parsedDataString.splice(itemId, 1, modalForm.elements[0].value);

        // convert all the strings to proper todotxt items again
        parsedData = parsedDataString.map(item => new TodoTxtItem(item));

        // pass the new data to the write function
        writeDataIntoFile(parsedData);

    // check if a data item has been passed by an item (edit item) or if there is none (add item)
    } else {

      // in case there hasn't been a passed data item, we just push the input value as a new item into the array
      parsedData.push(modalForm.elements[0].value);

      // pass the new data to the write function
      writeDataIntoFile(parsedData);

    }

    // hide the alert for future modal calls, if there has been one
    modalFormAlert.parentElement.classList.remove('is-active', 'is-warning');

    // TODO: needed?
    return true;

  } else {

    // if the input field is empty, let users know
    modalFormAlert.innerHTML = "Please add a todo into the text field. If you are unsure on how to do this, take a quick look at the <a href=\"https://github.com/todotxt/todo.txt\" target=\"_blank\">todo.txt syntax</a>.";
    modalFormAlert.parentElement.classList.add('is-active', 'is-warning');
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

  writeDataIntoFile(parsedData);

  return true;
}

function writeDataIntoFile(parsedData) {

  // render the objects into a string with line breaks
  parsedData = TodoTxt.render(parsedData);

  // Write data to 'todo.txt'
  fs.writeFile(pathToFile, parsedData, {encoding: 'utf-8'}, (err) => {
    if (err) {
      console.log(err);
    } else {
      // reset the selected filters
      selectedFiltersCollected = [];
      // also clear the persisted filers, by setting it to undefined the object entry will be removed fully
      store.set('selectedFiltersCollected', undefined);
      // write the new data into file
      console.log("File written successfully\n");
      //console.log("The written has the following contents:");
      //console.log(fs.readFileSync(pathToFile, "utf8"));
      // read the data again
      parseData(pathToFile);
    }
  });
}
