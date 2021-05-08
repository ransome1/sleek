"use strict";
import { userData, handleError, translations, setUserData, startBuilding, _paq } from "../render.js";
import { items, generateGroups, generateTable } from "./todos.mjs";
import { isToday, isPast, isFuture } from "./date.mjs";
const modalFormInput = document.getElementById("modalFormInput");
const todoTableSearch = document.getElementById("todoTableSearch");
const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const todoFilters = document.getElementById("todoFilters");
let categories, filtersCounted, selectedFilters, container, headline;
function filterItems(items, searchString) {
  try {
    // selected filters are empty, unless they were persisted
    if(userData.selectedFilters && userData.selectedFilters.length>0) {
      selectedFilters = JSON.parse(userData.selectedFilters);
    } else {
      selectedFilters = new Array;
      userData.selectedFilters = selectedFilters;
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
      if(!userData.showCompleted && item.complete) return false;
      if(!userData.showDueIsToday && item.due && isToday(item.due)) return false;
      if(!userData.showDueIsPast && item.due && isPast(item.due)) return false;
      if(!userData.showDueIsFuture && item.due && isFuture(item.due)) return false;
      if(item.text==="") return false;
      return true;
    });
    return Promise.resolve(items);
  } catch(error) {
    error.functionName = filterItems.name;
    return Promise.reject(error);
  }
}
function generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix, caretPosition) {
  try {
    // select the container (filter drawer or autocomplete) in which filters will be shown
    if(autoCompleteCategory) {
      container = autoCompleteContainer;
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
      container = todoFilters;
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
            if(userData.showCompleted==false && item.complete==true) {
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
      if(userData.selectedFilters && userData.selectedFilters.length>0) {
        selectedFilters = JSON.parse(userData.selectedFilters);
        // check if selected filters is still part of all available filters
        selectedFilters.forEach(function(selectedFilter,index){
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
          if(userData.hideFilterCategories.includes(category)) {
            response.classList.add("is-greyed-out");
          }
          container.appendChild(response);
        }).catch (error => {
          handleError(error);
        });
      } else {
        autoCompleteContainer.classList.remove("is-active");
        autoCompleteContainer.blur();
        console.log("Info: No " + category + " found in todo.txt data, so no filters will be generated");
      }
    });
    return Promise.resolve("Success: Filter data generated");
  } catch (error) {
    error.functionName = generateFilterData.name;
    return Promise.reject(error);
  }
}
function selectFilter(filter, category) {
  // if no filters are selected, add a first one
  if(selectedFilters.length > 0) {
    // get the index of the item that matches the data values the button click provided
    let index = selectedFilters.findIndex(item => JSON.stringify(item) === JSON.stringify([filter, category]));
    if(index != -1) {
      // remove the item at the index where it matched
      selectedFilters.splice(index, 1);
    } else {
      // if the item is not already in the array, push it into
      selectedFilters.push([filter, category]);
    }
  } else {
    // this is the first push
    selectedFilters.push([filter, category]);
  }
  // convert the collected filters to JSON and save it to store.js
  setUserData("selectedFilters", JSON.stringify(selectedFilters));
  startBuilding();
}
function generateFilterButtons(category, autoCompleteValue, autoCompletePrefix, caretPosition) {
  try {
    selectedFilters = new Array;

    if(userData.selectedFilters && userData.selectedFilters.length>0) selectedFilters = JSON.parse(userData.selectedFilters);
    // creates a div for the specific filter section
    let todoFiltersContainer = document.createElement("div");
    todoFiltersContainer.setAttribute("class", "dropdown-item " + category);
    // translate headline
    if(category=="contexts") {
      headline = translations.contexts;
    } else if(category=="projects"){
      headline = translations.projects;
    } else if(category=="priority"){
      headline = translations.priority;
    }
    if(autoCompletePrefix===undefined) {
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 title");
      todoFilterHeadline.innerHTML = "<i class=\"far fa-eye-slash\" tabindex=\"-1\"></i>&nbsp;" + headline;
      // add click event
      todoFilterHeadline.onclick = function() {
        let hideFilterCategories = userData.hideFilterCategories;
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
        generateGroups(items.filtered).then(function(groups) {
          generateTable(groups);
        });
      }
      // add the headline before category container
      todoFiltersContainer.appendChild(todoFilterHeadline);
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
      todoFiltersContainer.appendChild(todoFilterHeadline);
    }
    // build one button each
    for (let filter in filtersCounted) {
      // skip this loop if no filters are present
      if(!filter) continue;
      let todoFiltersItem = document.createElement("a");
      todoFiltersItem.setAttribute("class", "button " + filter);
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      if(autoCompletePrefix===undefined) { todoFiltersItem.setAttribute("tabindex", 0) } else { todoFiltersItem.setAttribute("tabindex", 301) }
      todoFiltersItem.setAttribute("href", "#");
      todoFiltersItem.innerHTML = filter;
      if(autoCompletePrefix==undefined) {
        // set highlighting if filter/category combination is on selected filters array
        selectedFilters.forEach(function(item) {
          if(JSON.stringify(item) === '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
        });
        todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">" + filtersCounted[filter] + "</span>";
        // create the event listener for filter selection by user
        todoFiltersItem.addEventListener("click", () => {
          selectFilter(todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category'))
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
        });
      // autocomplete container
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
          // put focus back into input so user can continue writing
          modalFormInput.focus();
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", category]);
        });
      }
      todoFiltersContainer.appendChild(todoFiltersItem);
    }
    return Promise.resolve(todoFiltersContainer);
  } catch (error) {
    error.functionName = generateFilterButtons.name;
    return Promise.reject(error);
  }
}
export { filterItems, generateFilterData, selectFilter, categories };
