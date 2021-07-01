"use strict";
import { userData, handleError, translations, setUserData, startBuilding, getConfirmation } from "../render.js";
import { createModalJail } from "../configs/modal.config.mjs";
import { _paq } from "./matomo.mjs";
import { items } from "./todos.mjs";
import { isToday, isPast, isFuture } from "./date.mjs";
import * as filterlang from "./filterlang.mjs";
import { runQuery } from "./filterquery.mjs";

const todoTableSearch = document.getElementById("todoTableSearch");
const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const todoFilters = document.getElementById("todoFilters");
const filterContext = document.getElementById("filterContext");
const filterContextInput = document.getElementById("filterContextInput");
const filterContextSave = document.getElementById("filterContextSave");
const filterContextDelete = document.getElementById("filterContextDelete");

let categories,
    filterCounter = 0,
    filtersCounted,
    filtersCountedReduced,
    selectedFilters,
    lastFilterQueryString = null,
    lastFilterItems = null,
    container,
    headline;

filterContextSave.innerHTML = translations.save;
filterContextDelete.innerHTML = translations.delete;

filterContextInput.addEventListener("keydown", (event) => {
  if(event.code==="Space") event.preventDefault();
})

function saveFilter(newFilter, oldFilter, category) {
  try {
    items.objects.forEach((item) => {
      if(category!=="priority" && item[category]) {
        const index = item[category].findIndex((el) => el === oldFilter);
        item[category][index] = newFilter;
      } else if(category==="priority" && item[category]===oldFilter) {
        item[category] = newFilter.toUpperCase();
      }
    });
    // persisted filters will be removed
    setUserData("selectedFilters", []);
    //write the data to the file
    // a newline character is added to prevent other todo.txt apps to append new todos to the last line
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n", userData.file]);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Filter renamed"]);
    return Promise.resolve("Success: Filter renamed");
  } catch(error) {
    error.functionName = saveFilter.name;
    return Promise.reject(error);
  }
}
function deleteFilter(filter, category) {
  try {
    items.objects.forEach((item) => {
      if(category!=="priority" && item[category]) {
        const index = item[category].indexOf(filter);
        if(index!==-1) item[category].splice(index, 1);
        if(item[category].length===0) item[category] = null;
      } else if(category==="priority" && item[category]===filter) {
        item[category] = null;
      }
    });
    // persisted filters will be removed
    setUserData("selectedFilters", []);
    //write the data to the file
    // a newline character is added to prevent other todo.txt apps to append new todos to the last line
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n", userData.file]);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Filter deleted"]);
    return Promise.resolve("Success: Filter deleted");
  } catch(error) {
    error.functionName = deleteFilter.name;
    return Promise.reject(error);
  }
}
function filterItems(items) {
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
    // apply persisted excluded categories filter
    if(userData.hideFilterCategories.length > 0) {
      // we iterate through the filters in the order they got selected
      userData.hideFilterCategories.forEach(filter => {
        items = items.filter(function(item) {
          if(!item[filter]) return item;
        });
      });
    }
    if (todoTableSearch.value) { // assume that this is an advanced search expr
      let queryString = todoTableSearch.value;
      try {
        let query = filterlang.parse(queryString);
        if (query.length > 0) {
          items = items.filter(function(item) {
            return runQuery(item, query);
          });
          lastFilterQueryString = queryString;
          lastFilterItems = items;
          todoTableSearch.classList.add("is-valid-query");
          todoTableSearch.classList.remove("is-previous-query");
        }
      } catch(e) {
        // oops, that wasn't a syntactically correct search expression
        todoTableSearch.classList.remove("is-valid-query");
        if (lastFilterQueryString && queryString.startsWith(lastFilterQueryString)) {
          // keep table more stable by using the previous valid query while
          // user continues to type additional query syntax.
          items = lastFilterItems;
          todoTableSearch.classList.add("is-previous-query");
        } else {
          // the query is not syntactically correct and isn't a longer version
          // of the last working query, so let's assume that it is a
          // plain-text query.
          items = items.filter(function(item) {
            return item.toString().toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
          });
          todoTableSearch.classList.remove("is-previous-query");
        }
      }
    }
    // apply filters
    items = items.filter(function(item) {
      if(!item.text) return false
      if(!userData.showHidden && item.h) return false;
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
    // reset filter counter
    filterCounter = 0;
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
      let filterArray;
      // run the array and collect all possible filters, duplicates included
      if(userData.showEmptyFilters) {
        filterArray = items.objects;
      } else {
        filterArray = items.filtered;
      }
      filterArray.forEach((item) => {
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
        if(filter[1] && (filter[0] in filters)) {
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
      // count reduced filter when persisted filters are present
      let filtersReduced = new Array();
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
              filtersReduced.push([item[category][filter],0]);
            } else {
              filtersReduced.push([item[category][filter],1]);
            }
          }
        }
      });
      filtersCountedReduced = filtersReduced.reduce(function(filters, filter) {
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
      // build the filter buttons
      if(filters[0]!="" && filters.length>0) {
        // add category length to total filter count
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
    let hideFilterCategories = userData.hideFilterCategories;
    selectedFilters = new Array;
    if(userData.selectedFilters && userData.selectedFilters.length>0) selectedFilters = JSON.parse(userData.selectedFilters);
    // creates a div for the specific filter section
    let todoFiltersContainer = document.createElement("section");
    todoFiltersContainer.setAttribute("class", category);
    // translate headline
    if(category=="contexts") {
      headline = translations.contexts;
    } else if(category=="projects"){
      headline = translations.projects;
    } else if(category=="priority"){
      headline = translations.priority;
    }
    if(autoCompletePrefix===undefined && userData.showEmptyFilters) {
      // create a sub headline element
      let todoFilterHeadline = document.createElement("h4");
      todoFilterHeadline.setAttribute("class", "is-4 clickable");
      // setup greyed out state
      if(hideFilterCategories.includes(category)) {
        todoFilterHeadline.innerHTML = "<i class=\"far fa-eye\" tabindex=\"-1\"></i>&nbsp;" + headline;
        todoFilterHeadline.classList.add("is-greyed-out");
      } else {
        todoFilterHeadline.innerHTML = "<i class=\"far fa-eye-slash\" tabindex=\"-1\"></i>&nbsp;" + headline;
        todoFilterHeadline.classList.remove("is-greyed-out");
      }
      // add click event
      todoFilterHeadline.onclick = function() {
        document.getElementById("todoTableWrapper").scrollTo(0,0);
        if(hideFilterCategories.includes(category)) {
          hideFilterCategories.splice(hideFilterCategories.indexOf(category),1)
        } else {
          hideFilterCategories.push(category);
          hideFilterCategories = [...new Set(hideFilterCategories.join(",").split(","))];
        }
        setUserData("hideFilterCategories", hideFilterCategories)
        startBuilding();
      }
      // add the headline before category container
      todoFiltersContainer.appendChild(todoFilterHeadline);
    } else {
      let todoFilterHeadline = document.createElement("h4");
      // show suggestion box when prefix is present
      if(autoCompletePrefix!==undefined) {
        autoCompleteContainer.classList.add("is-active");
        autoCompleteContainer.focus();
      }
      todoFilterHeadline.setAttribute("tabindex", -1);
      // create a sub headline element
      todoFilterHeadline.setAttribute("class", "is-4");
      // no need for tab index if the headline is in suggestion box
      //if(autoCompletePrefix==undefined)
      todoFilterHeadline.innerHTML = headline;
      // add the headline before category container
      todoFiltersContainer.appendChild(todoFilterHeadline);
    }
    // to figure out how many buttons with filters behind them have been build in the end
    // build one button each
    for (let filter in filtersCounted) {
      // skip this loop if no filters are present
      if(!filter) continue;
      let todoFiltersItem = document.createElement("button");
      if(category==="priority") todoFiltersItem.classList.add(filter);
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      if(autoCompletePrefix===undefined) { todoFiltersItem.setAttribute("tabindex", 0) } else { todoFiltersItem.setAttribute("tabindex", 0) }
      todoFiltersItem.innerHTML = filter;
      if(autoCompletePrefix==undefined) {
        // set highlighting if filter/category combination is on selected filters array
        selectedFilters.forEach(function(item) {
          if(JSON.stringify(item) === '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
        });
        // add context menu
        todoFiltersItem.addEventListener("contextmenu", event => {
          // jail the modal
          createModalJail(filterContext);

          filterContext.style.left = event.x + "px";
          filterContext.style.top = event.y + "px";
          filterContext.classList.add("is-active");
          filterContextInput.value = filter;
          filterContextInput.focus();
          filterContextInput.onkeyup = function(event) {
            if(event.key === "Escape") filterContext.classList.remove("is-active");
            if(event.key === "Enter") {
              if(filterContextInput.value!==filter && filterContextInput.value) {
                saveFilter(filterContextInput.value, filter, category).then(function(response) {
                  console.info(response);
                }).catch(function(error) {
                  handleError(error);
                });
              } else {
                filterContext.classList.remove("is-active");
              }
            }
          }
          filterContextSave.onclick = function() {
            if(filterContextInput.value!==filter && filterContextInput.value) {
              saveFilter(filterContextInput.value, filter, category).then(function(response) {
                console.info(response);
              }).catch(function(error) {
                handleError(error);
              });
            } else {
              filterContext.classList.remove("is-active");
            }
          }
          filterContextDelete.onclick = function() {
            getConfirmation(deleteFilter, translations.deleteCategoryPrompt, filter, category);
          }
        });
        if(filtersCountedReduced[filter]) {
          todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">" + filtersCountedReduced[filter] + "</span>";
          // create the event listener for filter selection by user
          todoFiltersItem.addEventListener("click", () => {
            document.getElementById("todoTableWrapper").scrollTo(0,0);
            selectFilter(todoFiltersItem.getAttribute('data-filter'), todoFiltersItem.getAttribute('data-category'))
            // trigger matomo event
            if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
          });
        } else {
          todoFiltersItem.disabled = true;
          todoFiltersItem.classList.add("is-greyed-out");
          todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">0</span>";
        }
      // autocomplete container
      } else {
        // add filter to input
        todoFiltersItem.addEventListener("click", (event) => {
          if(autoCompletePrefix && autoCompleteValue) {
            // remove composed filter first, then add selected filter
            document.getElementById("modalFormInput").value = document.getElementById("modalFormInput").value.replace(autoCompletePrefix + autoCompleteValue, autoCompletePrefix + todoFiltersItem.getAttribute("data-filter") + " ");
          } else if(autoCompletePrefix) {
            // add button data value to the exact caret position
            document.getElementById("modalFormInput").value = [document.getElementById("modalFormInput").value.slice(0, caretPosition), todoFiltersItem.getAttribute('data-filter'), document.getElementById("modalFormInput").value.slice(caretPosition)].join('') + " ";
          }
          // empty autoCompleteValue to prevent multiple inputs using multiple Enter presses
          autoCompleteValue = null;
          autoCompletePrefix = null;
          // hide the suggestion container after the filter has been selected
          autoCompleteContainer.blur();
          autoCompleteContainer.classList.remove("is-active");
          // put focus back into input so user can continue writing
          document.getElementById("modalFormInput").focus();
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", category]);
        });
      }
      filterCounter++;
      todoFiltersContainer.appendChild(todoFiltersItem);
    }
    return Promise.resolve(todoFiltersContainer);
  } catch (error) {
    error.functionName = generateFilterButtons.name;
    return Promise.reject(error);
  }
}

export { filterItems, generateFilterData, selectFilter, categories, filterCounter };
