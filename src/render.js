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

// get the reference for the table container
let todoTableContainer = document.getElementById("todoTableContainer");

// id the filter button and put the toggle action on it
const btnFilter = document.getElementById('btnFilter');
const filterDropdown = document.getElementById('filterDropdown');
document.getElementById('btnFilter').addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
  filterDropdown.classList.toggle("is-active");
});
/*
// id the sort button and put the toggle action on it
const btnSorting = document.getElementById('btnSorting');
const sortingDropdown = document.getElementById('sortingDropdown');
document.getElementById('btnSorting').addEventListener('click', () => {
  btnSorting.classList.toggle("is-active");
  sortingDropdown.classList.toggle("is-active");
});
*/
const pathToFile = store.get('pathToFile');
const btnLoadTodoFile = document.getElementById('btnLoadTodoFile');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];

// defining a Global file path Variable to store user-selected file
global.filepath = undefined;

// make the parsed data available
global.parsedData = undefined;

// ###############

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
    selectedFilters = uniqBy(selectedFilters, JSON.stringify);

    buildFilterButtons(selectedFilters, selectedFiltersCounted);
  }

  // TODO: add a false on err
  return true;
}

// build a section for each category and add the buttons to each
function buildFilterButtons(selectedFilters, selectedFiltersCounted) {

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

// ###############

// GENERATE THE DATA BEFORE TABLE IS BEING BUILT

// ###############

// TODO: Remove filterArray if not needed anymore
function generateTodoData(selectedFiltersCollected) {

  //console.log(selectedFiltersCollected);
  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(selectedFiltersCollected!=undefined && selectedFiltersCollected!='') {

    // erst die kategorien, dann jeweils de item und gucken ob kategorie werte hat
    for (let i = 0; i < selectedFiltersCollected.length; i++) {

      let category = selectedFiltersCollected[i][1];
      let filter = selectedFiltersCollected[i][0];

      itemsFiltered.push(parsedData.filter(item => item[category] == filter));
    }

  // if no filter has been passed, select all items
  } else {
    itemsFiltered = parsedData;
  }

  // pass filtered data to function to build the table
  generateTodoTable(itemsFiltered.flat(1));

  // TODO: neccessary?
  return true;
}

// ###############

// BUILD THE TABLE

// ###############

function generateTodoTable(itemsFiltered) {

  // empty the table before reading fresh data
  todoTableContainer.innerHTML = "";

  //itemsFiltered.sort();
  let itemsWithPriority = new Array();
  let itemsWithNoPriority = new Array();

  // create all rows
  for (let i = 0; i < itemsFiltered.length; i++) {

    // TODO: Maybe meaningless
    if(itemsFiltered[i].priority!=null) {
      itemsWithPriority.push(itemsFiltered[i]);
      delete itemsFiltered[i];
    } else {
      itemsWithNoPriority.push(itemsFiltered[i]);
    }
  }

  addTableRows(itemsWithPriority, true);

  addTableRows(itemsWithNoPriority, false);

}

function addTableRows(items, priority) {

  if(priority == true) {
    items.sort();
  }

  let previousItem;

  for (let i = 0; i < items.length; i++) {

    item = items[i];

    if(item.priority && item.priority!=previousItem) {
      previousItem = items[i].priority;
      priority = items[i].priority;
      //console.log("WECHSEL: " + item.priority);
      // creates a divider row for priority group
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

    // creates a table row
    let todoTableBodyRow = document.createElement("div");
    if(item.complete==true) {
      todoTableBodyRow.setAttribute("class", "flex-table completed");
    } else {
      todoTableBodyRow.setAttribute("class", "flex-table");
    }
    todoTableBodyRow.setAttribute("role", "rowgroup");

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
    todoTableBodyCell_text.setAttribute("class", "flex-row text");
    todoTableBodyCell_text.setAttribute("role", "cell");
    if(item.text) {
        todoTableBodyCell_text.innerHTML =  item.text;
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
