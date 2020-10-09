// ### DOCUMENTATION
// read text file: https://www.geeksforgeeks.org/file-upload-in-electronjs/
// generate the table: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
// save and load user data: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e

// ###############

// BASIC DEFINITIONS

// ###############

const electron = require('electron');
const path = require('path');
const dialog = electron.remote.dialog;
const app = electron.remote.app;
const fs = require('fs');
// store user data: read store.js
const Store = require('./store.js');
// store user data: First instantiate the class
const store = new Store({
  // we'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // users home directory as default
    pathToFile: app.getPath('home')
  }
});

// TODO: clean up the mess
let selectedFiltersCollected = new Array;

// id the filter button and put the toggle action on it
const btnFilter = document.getElementById('btnFilter');
const filterDropdown = document.getElementById('filterDropdown');
document.getElementById('btnFilter').addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
  filterDropdown.classList.toggle("is-active");
});

// id the sort button and put the toggle action on it
const btnSorting = document.getElementById('btnSorting');
const sortingDropdown = document.getElementById('sortingDropdown');
document.getElementById('btnSorting').addEventListener('click', () => {
  btnSorting.classList.toggle("is-active");
  sortingDropdown.classList.toggle("is-active");
});

const pathToFile = store.get('pathToFile');
const btnLoadTodoFile = document.getElementById('btnLoadTodoFile');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];

// defining a Global file path Variable to store user-selected file
global.filepath = undefined;

// make the parsed data available
global.parsedData = undefined;

// ###############

// SORT AN 2 DIMENSIONAL ARRAY BY ITS FIRST DIMENSION AND THEN DELETE DUPLICATES
// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

// ###############

function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

// ###############

// READ THE FILE AND GENERATE DATA

// ###############

// read contents of todo.txt file and trigger further action
function readTodoFile(pathToFile) {

  if(pathToFile) {

      let allFilters = [];

      fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err,data) {

        if (!err) {
        // parse the raw data into usefull objects
        parsedData = TodoTxt.parse( data, [ new DueExtension() ] );

        // pass data on and generate the items for the table
        if(generateTodoData() == true) {
          // write shortened path and file name to empty field
          fileName.innerHTML = pathToFile;
          console.log('Received data successfully');
        }

        // pass data on and generate the filters
        if(generateFilterData() == true) {
          console.log('Filters successfully loaded');
        };

      } else {
        console.log(err);
      }
    });
  }
}

// ###############

// BUILD THE FILTER SECTION

// ###############

function buildFilterButtons(selectedFilters) {

  let selectedFiltersNoCategory = new Array;

  for(i = 0; i < selectedFilters.length; i++) {
    selectedFiltersNoCategory.push(selectedFilters[i].slice(0,1));
  }

  // delete duplicates and count filters
  let selectedFiltersCounted = selectedFiltersNoCategory.join(',').split(',').reduce(function (selectedFiltersNoCategory, filter) {
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
  selectedFilters = uniqBy(selectedFilters, JSON.stringify);

  // configure the headline by adding icon
  let categoryHeadline;
  switch(category) {
    case "contexts":
      categoryHeadline = "<i class=\"fas fa-plus\"></i> " + category;
      break;
    case "projects":
      categoryHeadline = "<i class=\"fas fa-at\"></i> " + category;
      break;
    default:
      categoryHeadline = category;
  }

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
    todoFilterHeadline.innerHTML = categoryHeadline;

    // add the headline before category container
    todoFilterContainerSub.appendChild(todoFilterHeadline);

    // build one button each
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

        generateTodoData(selectedFiltersCollected);

      });
    }
  }
}

// read passed filters, count them and build selection buttons
function generateFilterData(selectedFiltersCollected) {

  // get the reference for the filter container
  let todoFilterContainer = document.getElementById("todoFilters");
  // empty the container to prevent duplicates
  todoFilterContainer.innerHTML = "";

  // parse through above defined categories, most likely contexts and projects
  for (let i = 0; i < filterCategories.length; i++) {

    category = filterCategories[i];

    // TODO: Clean up the mess
    let selectedFilters = new Array();

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
    buildFilterButtons(selectedFilters);
  }
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

  // create all rows
  for (let i = 0; i < itemsFiltered.length; i++) {
    item = itemsFiltered[i];

    // creates a table row
    let todoTableBodyRow = document.createElement("div");
    todoTableBodyRow.setAttribute("class", "flex-table");
    todoTableBodyRow.setAttribute("role", "rowgroup");

    // add the checkbox
    let todoTableBodyCellCheckbox = document.createElement("div");
    todoTableBodyCellCheckbox.setAttribute("class", "flex-row checkbox");
    todoTableBodyCellCheckbox.setAttribute("role", "cell");
    todoTableBodyCellCheckbox.innerHTML = "<i class=\"far fa-square\"></i>"
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

    // creates cell for priority tag
    let todoTableBodyCell_priority = document.createElement("div");
    todoTableBodyCell_priority.setAttribute("class", "flex-row priority");
    todoTableBodyCell_priority.setAttribute("role", "cell");
    if(item.priority!=null) {
      todoTableBodyCell_priority.innerHTML = item.priority;
    }
    todoTableBodyRow.appendChild(todoTableBodyCell_priority);

    // creates cell for the text
    let todoTableBodyCell_text = document.createElement("div");
    todoTableBodyCell_text.setAttribute("class", "flex-row text");
    todoTableBodyCell_text.setAttribute("role", "cell");
    if(item.text) {
        todoTableBodyCell_text.innerHTML = item.text;
    }
    todoTableBodyRow.appendChild(todoTableBodyCell_text);

    for (let k = 0; k < filterCategories.length; k++) {
      // creates cell for the projects
      if(item[filterCategories[k]]!=null) {
        let todoTableBodyCellCategory = document.createElement("div");
        todoTableBodyCellCategory.setAttribute("class", "flex-row " + filterCategories[k]);
        todoTableBodyCellCategory.setAttribute("role", "cell");
        for(let j = 0; j < item[filterCategories[k]].length; j++) {
            let todoTableBodyCellCategoryItem = document.createElement("span");
            todoTableBodyCellCategoryItem.setAttribute("class", "tag");
            todoTableBodyCellCategoryItem.innerHTML = item[filterCategories[k]][j];
            todoTableBodyCellCategory.appendChild(todoTableBodyCellCategoryItem);
        }
        todoTableBodyRow.appendChild(todoTableBodyCellCategory);
      }
    }

    // add the row to the end of the table body
    todoTableContainer.appendChild(todoTableBodyRow);
  }
}

// ###############

// GENERATE THE DATA BEFORE TABLE IS BUILT

// ###############
// TODO: Remove filterArray if not needed anymore
function generateTodoData(selectedFilters) {

  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(selectedFilters!=undefined && selectedFilters!='') {

    // erst die kategorien, dann jeweils de item und gucken ob kategorie werte hat
    for (let i = 0; i < selectedFilters.length; i++) {

      let category = selectedFilters[i][1];
      let filter = selectedFilters[i][0];

      // TODO: Not sure if this works well
      for (let l = 0; l < parsedData.length; l++) {
        if(parsedData[l][category] != null && parsedData[l][category].includes(filter)==true) {
          itemsFiltered.push(parsedData[l]);
        }
      }
    }

  // if no filter has been passed
  } else {

    for (let i = 0; i < parsedData.length; i++) {
      // no filters so every item is passed to new "filtered" array
      item = parsedData[i];
      itemsFiltered.push(item);
    }
  }

  console.log(itemsFiltered);

  // pass filtered data to function to build the table
  generateTodoTable(itemsFiltered);
  return true;
}

// ###############

// OPEN FILE AND PASS DATA TO FUNCTIONS

// ###############

if(btnLoadTodoFile) {
  btnLoadTodoFile.addEventListener('click', () => {

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

        // Specifying the File Selector Property
        //if (process.platform !== 'darwin') {
          // If the platform is 'win32' or 'Linux'
          properties: ['openFile']
        //} else {
          // If the platform is 'darwin' (macOS)
          //properties: ['openFile', 'openDirectory']
        //}
    }).then(file => {
        // Stating whether dialog operation was cancelled or not.

        if (!file.canceled) {
          // Updating the GLOBAL filepath variable to user-selected file.
          global.filepath = file.filePaths[0].toString();

          // read contents of todo.txt file
          if (global.filepath && !file.canceled) {

            // pass path and filename on, to extract and parse the raw data
            readTodoFile(global.filepath);

            // write new path and file name into storage file
            store.set('pathToFile', global.filepath);
            console.log('Storage file updated by new path and filename: ' + global.filepath);

           }
        }
    }).catch(err => {
        console.log(err)
    });
  });
}

// ###############

// read previously stored todo.txt file

// ###############

if(pathToFile) {
  readTodoFile(pathToFile);
  console.log('Previous file loaded: ' + pathToFile);
}
