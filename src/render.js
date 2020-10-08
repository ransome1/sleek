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

// id the filter button and put the toggle action on it
const btnFilter = document.getElementById('btnFilter');
document.getElementById('btnFilterClick').addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
});
// id the sort button and put the toggle action on it
const btnSorting = document.getElementById('btnSorting');
btnSorting.addEventListener('click', () => {
  btnSorting.classList.toggle("is-active");
});

const pathToFile = store.get('pathToFile');
const btnLoadTodoFile = document.getElementById('btnLoadTodoFile');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];
// defining a Global file path Variable to store user-selected file
global.filepath = undefined;

// ###############

// READ THE FILE AND GENERATE DATA

// ###############

// read contents of todo.txt file and trigger further action
function readTodoFile(pathToFile) {

  if(pathToFile) {
    fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err,data) {

      if (!err) {
        // parse the raw data into usefull objects
        parsedData = TodoTxt.parse( data, [ new DueExtension() ] );

        // pass data on and generate the items for the table
        if(generateTodoData(parsedData) == true) {
          // write shortened path and file name to empty field
          fileName.innerHTML = pathToFile;
          console.log('Received data successfully');
        }

        // pass data on and generate the filters
        if(generateTodoFilters(parsedData, filterCategories) == true) {
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

// read passed filters, count them and build selection buttons
function generateTodoFilters(parsedData, filterCategories) {

  let selectedFilters = new Array();

  // get the reference for the filter container
  let todoFilterContainer = document.getElementById("todoFilters");
  todoFilterContainer.innerHTML = "";

  // parse the data
  //items = TodoTxt.parse( data, [ new DueExtension() ] );

  // parse through above defined categories, most likely contexts and projects
  for (let i = 0; i < filterCategories.length; i++) {

    category = filterCategories[i];

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

    let allFilters = [];

    // run the array and collect all possible filter, duplicates included
    for (let j = 0; j < parsedData.length; j++) {
      item = parsedData[j];
      if(item[category]) {
        // convert the array to a comma separated string for further comparison
        allFilters = allFilters.concat(item[category]);
      }
    }

    // use the string to count how often filter occur and generate an object to work with
    //let allFilters = [];
    allFilters = allFilters.join(',').split(',').reduce(function (allFilters, filter) {
      if (filter in allFilters) {
        allFilters[filter]++;
      } else {
        allFilters[filter] = 1;
      }
      if(allFilters!=null) {
        return allFilters;
      }
    }, {});


    // only generate filters if there are any
    if(allFilters) {

      // creates a div for the specific filter section
      let todoFilterContainerSub = document.createElement("div");
      todoFilterContainerSub.setAttribute("class", "dropdown-item " + category);

      // create a sub headline element
      let todoFilterHeadline = document.createElement("h5");
      todoFilterHeadline.setAttribute("class", "title is-5 " + category);
      todoFilterHeadline.innerHTML = categoryHeadline;

      // add the headline before category container
      todoFilterContainerSub.appendChild(todoFilterHeadline);

      // build one button each
      for (let filter in allFilters) {
        let todoFiltersItem = document.createElement("button");
        todoFiltersItem.setAttribute("class", "btnApplyFilter button");
        todoFiltersItem.setAttribute("name", filter);
        todoFiltersItem.setAttribute("title", category);
        todoFiltersItem.innerHTML = filter + " <span class=\"tag is-rounded\">" + allFilters[filter] + "</span>";
        todoFilterContainerSub.appendChild(todoFiltersItem);

      }

      // add filters to the specific filter container
      todoFilterContainer.appendChild(todoFilterContainerSub);

    }

    // configure filter buttons
    let listOfFilterButtons = document.querySelectorAll("div." + category + " button.btnApplyFilter");

    for(let l = 0; l < listOfFilterButtons.length; l++) {

      let btnApplyFilter = listOfFilterButtons[l];
      btnApplyFilter.addEventListener('click', () => {

        // add or remove css class for highlighting
        btnApplyFilter.classList.toggle("is-dark");

        // check if there is already one filter, otherwise initialize first push
        if(selectedFilters.length > 0) {

          let filterFound;
          for(let z = 0; z < selectedFilters.length; z++) {
             if(selectedFilters[z][0] == btnApplyFilter.name) {
               // if filter is already present in 1 dimension of array, then delete array entry
               selectedFilters.splice(z,1);
               filterFound = true;
             }
          }

          // if filter is not already present in first dimension of the array, then push the value
          if(filterFound!=true) {
            selectedFilters.push([btnApplyFilter.name, btnApplyFilter.title]);
          }

        } else {
          // push for the first time
          selectedFilters.push([btnApplyFilter.name, btnApplyFilter.title]);
        }
        generateTodoData(parsedData, selectedFilters);
      });
    }
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

// SORT ARRAY THEN DELETE DUPLICATES
// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

// ###############
function uniq(a) {
  return a.sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1];
  });
}

// ###############

// GENERATE THE DATA BEFORE TABLE IS BUILT

// ###############
// TODO: Remove filterArray if not needed anymore
function generateTodoData(parsedData, selectedFilters) {

  //console.log(selectedFilters);

  // https://github.com/jmhobbs/jsTodoTxt
  // parse raw data
  //items = TodoTxt.parse( data, [ new DueExtension() ] );

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

  // pass filtered data to functio to build the table
  generateTodoTable(uniq(itemsFiltered));
  return true;
}

// ###############

// OPEN FILE AND PASS DATA TO FUNCTIONS

// ###############

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

// ###############

// read previously stored todo.txt file

// ###############

if(pathToFile) {
  readTodoFile(pathToFile);
  console.log('Previous file loaded: ' + pathToFile);
}
