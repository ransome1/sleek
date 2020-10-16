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
const btnFilter = document.getElementById('btnFilter');
const filterDropdown = document.getElementById('filterDropdown');
const modalEditForm = document.getElementById('modalEditItem');
const modalEditItem = document.getElementById("modalEditItem");
const modalEditItemInput = document.getElementById("modalEditItemInput");
const body = document.getElementById('body');
const btnLoadTodoFile = document.querySelectorAll('.btnLoadTodoFile');
const modalClose = document.querySelectorAll('.modal-close');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];
const Store = require('./store.js');
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    pathToFile: app.getPath('home')
  }
});
const pathToFile = store.get('pathToFile');

// ###############

// VARIABLES

// ###############

// Needed for comparison between priority items to build the divider rows
let previousItem;
// defining a Global file path Variable to store user-selected file
let filepath = undefined;
// make the parsed data available
let parsedData = undefined;
// TODO: clean up the mess
let selectedFiltersCollected = new Array;
// sort alphabetically
let sortAlphabetically = store.get('sortAlphabetically');
// show completed: get the stored value
let showCompleted = store.get('showCompleted');

// ###############

// INITIAL DOM CONFIG

// ###############

// set the checked attribute according to the persisted value
document.getElementById('toggleSort').checked = sortAlphabetically;
// set the checked attribute according to the persisted value
document.getElementById('toggleShowCompleted').checked = showCompleted;
// persist the highlighting of the button and the dropdown menu
document.getElementById('btnFilter').addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
  filterDropdown.classList.toggle('is-active');
  body.classList.toggle('is-active');
});

// just reread the file and flush all filters and items
document.getElementById('btnResetAllFilters').addEventListener('click', () => {
  selectedFiltersCollected = [];
  parseData(pathToFile);
});

// ###############

// EVENT LISTENERS

// ###############

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
  // regenerate the table considering the sort value
  generateTodoData();
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
  //console.log(pathToFile);
  parseData(pathToFile);
});

// put a click event on all "open file" buttons
btnLoadTodoFile.forEach(el => el.addEventListener('click', event => {
  extractDataFromFile();
}));

modalClose.forEach(el => el.addEventListener('click', event => {
  el.parentElement.classList.toggle('is-active');
}));

// ###############

// READ PREVIOUSLY SELECTED todo.txt FILE, STORED IN store.js

// ###############

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

function extractDataFromFile() {
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
        global.filepath = file.filePaths[0].toString();

        //console.log(global.filepath);

        // read contents of todo.txt file
        if (global.filepath && !file.canceled) {

          // pass path and filename on, to extract and parse the raw data
          parseData(global.filepath);

          // close the modal layer if open
          document.getElementById('onboarding').setAttribute('class','modal');

          // write new path and file name into storage file
          store.set('pathToFile', global.filepath);
          console.log('Storage file updated by new path and filename: ' + global.filepath);
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

      let allFilters = [];

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
          if(generateTodoData() == true) {
            console.log('Todos successfully loaded');
          } else {
            console.log('Could not load data');
          }

          // load filters
          if(generateFilterData() == true) {
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
    let selectedFilters = new Array();

    // TODO: clean up the mess
    let selectedFiltersNoCategory = new Array;

    // run the array and collect all possible filter, duplicates included
    for (let j = 0; j < parsedData.length; j++) {

      item = parsedData[j];

      if(item[category]) {
        for(let k = 0; k < item[category].length; k++) {
          filter = item[category][k];

          // convert the array to a comma separated string for further comparison
          selectedFilters.push([filter, category]);
        }
      }
    }

    // reduce to 1st dimension so we can count with reduce function
    for(k = 0; k < selectedFilters.length; k++) {
      selectedFiltersNoCategory.push(selectedFilters[k].slice(0,1));
    }

    // delete duplicates and count filters
    selectedFiltersCounted = selectedFiltersNoCategory.join(',').split(',').reduce(function (selectedFiltersNoCategory, filter) {
      if (filter in selectedFiltersNoCategory) {
        selectedFiltersNoCategory[filter]++;
      } else {
        selectedFiltersNoCategory[filter] = 1;
      }
      if(selectedFiltersNoCategory!=null) {
        return selectedFiltersNoCategory;
      }
    }, {});

    // remove the duplicates
    selectedFilters = uniqBy(selectedFilters);

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
        let todoFiltersItem = document.createElement("button");
        todoFiltersItem.setAttribute("class", "btnApplyFilter button");
        todoFiltersItem.setAttribute("name", filter);
        todoFiltersItem.setAttribute("title", category);
        todoFiltersItem.innerHTML = filter + " <span class=\"tag is-rounded\">" + selectedFiltersCounted[filter] + "</span>";
        todoFilterContainerSub.appendChild(todoFiltersItem);
      }

      // add filters to the specific filter container
      todoFilterContainer.appendChild(todoFilterContainerSub);
    }
  }

  // configure filter buttons
  let listOfFilterButtons = document.querySelectorAll("div." + category + " button.btnApplyFilter");

  if(listOfFilterButtons.length > 0) {

    // TODO: Why again?
    selectedFilters = [];

    for(let l = 0; l < listOfFilterButtons.length; l++) {

      let btnApplyFilter = listOfFilterButtons[l];
      btnApplyFilter.addEventListener('click', () => {

        // add or remove css class for highlighting
        btnApplyFilter.classList.toggle("is-dark");

        let filterFound;
        for(let z = 0; z < selectedFiltersCollected.length; z++) {
           if(selectedFiltersCollected[z][0] == btnApplyFilter.name) {
             // if filter is already present in 1 dimension of array, then delete array entry
             selectedFiltersCollected.splice(z,1);
             filterFound = true;
           }
        }
        // if filter is not already present in first dimension of the array, then push the value
        if(filterFound!=true) {
          selectedFiltersCollected.push([btnApplyFilter.name, btnApplyFilter.title]);
        }

        // TODO: error handling
        generateTodoData(selectedFiltersCollected);
      });
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
          // check if the selected filter is one of the array values of the category
          if(parsedData[j][selectedFiltersCollected[i][1]].includes(selectedFiltersCollected[i][0])) {
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
  todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

  // creates cell for the text
  let todoTableBodyCell_text = document.createElement("div");
  todoTableBodyCell_text.setAttribute("class", "flex-row itemText");
  todoTableBodyCell_text.setAttribute("role", "cell");
  todoTableBodyCell_text.setAttribute("data-item", item.toString());
  if(item.text) {
      todoTableBodyCell_text.innerHTML =  item.text;
  }

  todoTableBodyCell_text.addEventListener('click', function() {
    let dataItem = this.getAttribute('data-item');
    editItem(dataItem);
  });

  for (let k = 0; k < filterCategories.length; k++) {
    // creates cell for the projects
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

// TODO: clean up

function editItem(dataItem) {

  parsedDataToString = parsedData.map(item => item.toString());

  modalEditItem.classList.toggle('is-active');
  modalEditItemInput.value = dataItem;

  modalEditForm.addEventListener("submit", function(e) {
    if (e.preventDefault) e.preventDefault();

    console.log(parsedDataToString);
    console.log(dataItem);

    let itemId = parsedDataToString.indexOf(dataItem);
    console.log(itemId);

    console.log(this.elements)
    parsedDataToString.splice(itemId, 1, this.elements[0].value);

    //console.log(parsedDataToString);

    modalEditItem.classList.toggle('is-active');

    parsedData = parsedDataToString.map(item => new TodoTxtItem(item));

    //console.log(parsedData);

    generateTodoData();

    //return false;
  });
}
