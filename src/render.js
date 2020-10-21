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
const btnItemComplete = document.getElementById('btnItemComplete');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const btnLoadTodoFile = document.querySelectorAll('.btnLoadTodoFile');
const btnFormCancel = document.getElementById("btnFormCancel");

const filterCategories = ["contexts", "projects"];
const filterDropdown = document.getElementById('filterDropdown');

const modalEditForm = document.getElementById('modalEditForm');
const modalEditItemInput = document.getElementById("modalEditItemInput");
const modalEditItemAlert = document.getElementById("modalEditItemAlert");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.querySelectorAll('.modal-close');
const modalBackground = document.querySelectorAll('.modal-background');

const Store = require('./store.js');
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    pathToFile: app.getPath('home'),
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

// ###############

// INITIAL DOM CONFIG

// ###############
// set the checked attribute according to the persisted value
document.getElementById('toggleSort').checked = sortAlphabetically;
// set the checked attribute according to the persisted value
document.getElementById('toggleShowCompleted').checked = showCompleted;

// ###############

// EVENT LISTENERS

// ###############

// persist the highlighting of the button and the dropdown menu
btnFilter.addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
  filterDropdown.classList.toggle('is-active');
  body.classList.toggle('is-active');
});

// put a listeners on the table for closing the active menu
document.getElementById('todoTable').addEventListener('click', () => {
  if(filterDropdown.classList.contains('is-active')) {
    btnFilter.classList.toggle("is-active");
    filterDropdown.classList.toggle('is-active');
    body.classList.toggle('is-active');
  }
});

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
document.getElementById('toggleShowCompleted').addEventListener('click', () => {
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
modalEditForm.addEventListener("submit", function(e) {
  // intercept submit
  if (e.preventDefault) e.preventDefault();

  if(submitForm()) {
      modalEditForm.classList.toggle('is-active');
  }

  return false;

});

// click on submit button
btnFormSubmit.addEventListener("click", function(e) {
  if(submitForm()) {
      modalEditForm.classList.toggle('is-active');
  }
});

btnItemComplete.addEventListener('click', () => {
  if(completeItem(dataItem)) {
    modalEditForm.classList.toggle('is-active');
  }
});

// click on the close button in the footer of the edit modal
btnFormCancel.addEventListener("click", function(e) {
  modalEditForm.classList.toggle('is-active');
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

// ###############

// READ PREVIOUSLY SELECTED todo.txt FILE, STORED IN store.js

// ###############

// TODO: Maybe wait for something before we start the iterations?
if(pathToFile) {

  parseData(pathToFile);
  console.log('todo.txt file loaded: ' + pathToFile);
  document.getElementById('onboarding').setAttribute('class','modal');
} else {
  document.getElementById('onboarding').setAttribute('class','modal is-active');
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
          document.getElementById('onboarding').setAttribute('class','modal');

          // write new path and file name into storage file
          store.set('pathToFile', pathToFile);

          console.log('Storage file updated by new path and filename: ' + pathToFile);
         }
      }
  }).catch(err => {
      console.log(err)
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
            console.log('Todos successfully loaded');
          } else {
            console.log('Could not load data');
          }

          // load filters
          if(generateFilterData(selectedFiltersCollected) == true) {
            console.log('Filters successfully loaded');
          } else {
            console.log('Could not load filters');
          }

        } else {
          // if data couldn't be extracted from file
          console.log("Data could not be extracted from file, starting onboarding instead");
          document.getElementById('onboarding').setAttribute('class','modal is-active');
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

    // remove the duplicates
    //selectedFilters = uniqBy(selectedFilters);

    // TODO: error handling
    // build the filter buttons
    buildFilterButtons();
  }

  // TODO: add a false on err
  return true;
}

// build a section for each category and add the buttons to each
function buildFilterButtons() {

  // build the buttons
  // only generate filters if there are any
  if(selectedFiltersCounted) {

    if(Object.keys(selectedFiltersCounted).length > 1) {

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


        //console.log(JSON.stringify(selectedFiltersCollected));
        //console.log(new Array([filter, category]));

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
}

// ###############

// GENERATE THE DATA BEFORE TABLE IS BEING BUILT

// ###############

// TODO: Remove filterArray if not needed anymore
function generateTodoData(selectedFiltersCollected) {

  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(selectedFiltersCollected!=undefined && selectedFiltersCollected!='') {

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
    todoTableBodyCellCheckbox.addEventListener('click', function() {
      // passing the data-item attribute of the parent tag to complete function
      completeItem(this.parentElement.getAttribute('data-item'));
    });

  }
  todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

  // creates cell for the text
  let todoTableBodyCell_text = document.createElement("div");
  todoTableBodyCell_text.setAttribute("class", "flex-row itemText");
  todoTableBodyCell_text.setAttribute("role", "cell");
  //  todoTableBodyCell_text.setAttribute("data-item", item.toString());
  if(item.text) {
      todoTableBodyCell_text.innerHTML =  item.text;
  }
  todoTableBodyCell_text.addEventListener('click', function() {
    // declaring the item-data value global so other functions can access it
    window.dataItem = this.parentElement.getAttribute('data-item');
    showForm(dataItem);
  });

  for (let k = 0; k < filterCategories.length; k++) {
    // creates bubbles for the categories
    if(item[filterCategories[k]]!=null) {
      for(let j = 0; j < item[filterCategories[k]].length; j++) {
          let todoTableBodyCellCategoryItem = document.createElement("span");
          todoTableBodyCellCategoryItem.setAttribute("class", "tag " + filterCategories[k]);
          todoTableBodyCellCategoryItem.innerHTML = item[filterCategories[k]][j];
          todoTableBodyCell_text.appendChild(todoTableBodyCellCategoryItem);
      }
    }
    todoTableBodyRow.appendChild(todoTableBodyCell_text);
  }

  // add the row to the end of the table body
  todoTableContainer.appendChild(todoTableBodyRow);
}

// ###############

// SAVE DATA

// ###############

// function to open modal layer and pass a string version of the todo into input field
function showForm(dataItem) {
  // clear the input value in case there was an old one
  modalEditItemInput.value = null;
  // convert array of objects to array of strings
  parsedDataString = parsedData.map(item => item.toString());
  modalEditForm.classList.toggle('is-active');

  if(dataItem) {
    modalEditItemInput.value = dataItem;
    modalTitle.innerHTML = 'Edit item';
    // only show the complete button on open items
    if(new TodoTxtItem(dataItem).complete == false) {
      btnItemComplete.classList.add('is-active');
    } else {
      btnItemComplete.classList.remove('is-active');
    }
  } else {
    modalTitle.innerHTML = 'Add item';
    btnItemComplete.classList.remove('is-active');
  }
}

function submitForm() {
  // get the position of that item in the array
  let itemId = parsedDataString.indexOf(window.dataItem);

  // get the index using the itemId, remove 1 item there and add the value from the input at that position
  parsedDataString.splice(itemId, 1, modalEditForm.elements[0].value);

  // convert all the strings to proper todotxt items again
  parsedDataString = parsedDataString.map(item => new TodoTxtItem(item));

  writeDataIntoFile(parsedDataString);

  return true;
}

function completeItem(dataItem) {

  // convert array of objects to array of strings
  parsedData = parsedData.map(item => item.toString());

  // get the position of that item in the array
  let itemId = parsedData.indexOf(dataItem);

  // build the prefix "x " and add today's date
  // https://stackoverflow.com/a/35922073
  let prefix = "x " + new Date().toISOString().slice(0, 10) + " ";

  // get the index using the itemId, remove 1 item there and add the value from the input at that position
  parsedData.splice(itemId, 1, prefix.concat(dataItem));

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
      //modalEditItemAlert.classList.toggle('is-active');
      console.log(err);
    } else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
      console.log(fs.readFileSync(pathToFile, "utf8"));
      parseData(pathToFile);
    }
  });
}
