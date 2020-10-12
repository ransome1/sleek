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
// id the filter button and put the toggle action on it
const btnFilter = document.getElementById('btnFilter');
const filterDropdown = document.getElementById('filterDropdown');
const btnLoadTodoFile = document.getElementsByClassName('btnLoadTodoFile');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];
// store user data: read store.js
const Store = require('./store.js');
// store user data: First instantiate the class
const store = new Store({
  // we'll call our data file 'user-preferences'
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
document.getElementById('showCompleted').checked = showCompleted;
// persist the highlighting of the button and the dropdown menu
document.getElementById('btnFilter').addEventListener('click', () => {
  btnFilter.classList.toggle("is-active");
  filterDropdown.classList.toggle("is-active");
});
// just reread the file and flush all filters and items
document.getElementById('btnResetAllFilters').addEventListener('click', () => {
  selectedFiltersCollected = [];
  readTodoFile(pathToFile);
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
  // regenerate the table considering the sort value
  generateTodoData(selectedFiltersCollected);
});
// reread the data but sort it asc
document.getElementById('showCompleted').addEventListener('click', () => {
  if(showCompleted==false) {
    showCompleted = true;
  } else {
    showCompleted = false;
  }
  // persist the sorting
  store.set('showCompleted', showCompleted);
  // regenerate the table considering the sort value
  generateTodoData(selectedFiltersCollected);
});

// ###############

// READ PREVIOUSLY SELECTED todo.txt FILE, STORED IN store.js

// ###############

if(pathToFile) {
  readTodoFile(pathToFile);
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

if(btnLoadTodoFile) {

  for (var i = 0; i < btnLoadTodoFile.length; i++) {

    btnLoadTodoFile[i].addEventListener('click', () => {

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

            // read contents of todo.txt file
            if (global.filepath && !file.canceled) {

              // pass path and filename on, to extract and parse the raw data
              readTodoFile(global.filepath);

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
    });
  }
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
            //fileName.innerHTML = pathToFile;
            console.log('Received data successfully');
          }

          // pass data on and generate the filters
          if(generateFilterData() == true) {
            console.log('Filters successfully loaded');
          };

        } else {
          document.getElementById('onboarding').setAttribute('class','modal is-active');
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
    selectedFilters = uniqBy(selectedFilters);

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

      // remove duplicate items using magic function I do not even understand
      //itemsFiltered = uniqBy(itemsFiltered, JSON.stringify);

    }

  // if no filter has been passed, select all items
  } else {
    itemsFiltered = parsedData;
  }

  // https://stackoverflow.com/a/10024929
  // check the showCompleted value and filter completed items if selected by user
  if(showCompleted == false) {
    itemsFiltered = itemsFiltered.filter(function(el) { return el.complete == false; });
  } else {
    itemsFiltered = itemsFiltered;
  }

  // sort asc if requested
  // https://stackoverflow.com/a/45544166
  let itemsFilteredSorted = itemsFiltered.slice().sort((a, b) => a.text.localeCompare(b.text));
  if(sortAlphabetically==true) {
    // pass filtered data to function to build the table
    generateTodoTable(itemsFilteredSorted);
  } else {
    // pass filtered data to function to build the table
    generateTodoTable(itemsFiltered);
  }

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
  //let itemsComplete = itemsFilteredSorted.filter(item => item.complete==true);

  addTableRows(itemsWithPriority, true);

  addTableRows(itemsWithNoPriority, false);

  previousItem = undefined;

}

function addTableRows(items, priority) {

  /*let temp = items.reduce((r, a) => {
   r[a.complete] = [...r[a.complete] || [], a];
   return r;
  }, {});
  temp = items.complete.splice(this == false);*/
  /*console.log(items);
  var temp = items.filter(function(el) { return el.complete == true; });
  console.log(temp);*/

  if(priority==true) {

    // TODO: whats happening here?
    let itemsByPriority = items.reduce((r, a) => {
     r[a.priority] = [...r[a.priority] || [], a];
     return r;
    }, {});

    // convert the not sortable object into an array and sort it a to z
    itemsByPriority = Object.entries(itemsByPriority).sort();

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
