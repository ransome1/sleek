"use strict";
import { userData, setUserData, translations, buildTable } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { _paq } from "./matomo.mjs";
import { items } from "./todos.mjs";
import { showModal } from "./content.mjs";
import { getConfirmation } from "./prompt.mjs";
import { isToday, isPast, isFuture } from "./date.mjs";
import * as filterlang from "./filterlang.mjs";
import { runQuery } from "./filterquery.mjs";
import { handleError, getCaretPosition } from "./helper.mjs";

const todoTableSearch = document.getElementById("todoTableSearch");
const todoTableWrapper = document.getElementById("todoTableWrapper");
const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const todoFilters = document.getElementById("todoFilters");
const filterContext = document.getElementById("filterContext");
const filterContextInput = document.getElementById("filterContextInput");
const filterContextSave = document.getElementById("filterContextSave");
const filterContextDelete = document.getElementById("filterContextDelete");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");

let categories,
    filtersCounted,
    filtersReducedCounted,
    selectedFilters,
    lastFilterQueryString = null,
    lastFilterItems = null,
    container;

filterContextSave.innerHTML = translations.save;
filterContextDelete.innerHTML = translations.delete;
btnResetFilters.forEach(function(button) {
  button.getElementsByTagName("span")[0].innerHTML = translations.resetFilters;
});

autoCompleteContainer.onkeyup = function(event) {
  // if there is only one filter shown it will be selected automatically
  if(event.key === "Tab" && Object.keys(filtersCounted).length === 1) {
    addFilterToInput(Object.keys(filtersCounted)[0], event.target.getAttribute("data-prefix")).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
  }
}

function saveFilter(newFilter, oldFilter, category) {
  try {

    const l = items.objects.length;
    for(let i = 0; i < l; i++) {
      if(category !== "priority" && items.objects[i][category]) {
        const index = items.objects[i][category].findIndex((el) => el === oldFilter);
        items.objects[i][category][index] = newFilter;
      // priorities will be converted uppercase
      } else if(category === "priority" && items.objects[i][category] === oldFilter) {
        items.objects[i][category] = newFilter.toUpperCase();
      }
    }

    // persisted filters will be removed
    setUserData("selectedFilters", []).then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });

    // write the data to the file
    // a newline character is added to prevent other todo.txt apps to append new todos to the last line
    window.api.send("replaceFileContent", [items.objects.join("\n").toString() + "\n"]);

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Filter renamed"]);

    return Promise.resolve("Success: Filter " + oldFilter + " renamed to " + newFilter);

  } catch(error) {
    error.functionName = saveFilter.name;
    return Promise.reject(error);
  }
}

function deleteFilter(filter, category) {
  try {
    const l = items.objects.length;
    for(let i = 0; i < l; i++) {
    
      if(category !== "priority" && items.objects[i][category]) {
        const index = items.objects[i][category].indexOf(filter);

        if(index !== -1) items.objects[i][category].splice(index, 1);

        if(items.objects[i][category].length===0) items.objects[i][category] = null;

      } else if(category==="priority" && items.objects[i][category]===filter) {
        items.objects[i][category] = null;
      }

    }

    // persisted filters will be removed
    setUserData("selectedFilters", []).then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });

    //write the data to the file
    // a newline character is added to prevent other todo.txt apps to append new todos to the last line
    window.api.send("replaceFileContent", [items.objects.join("\n").toString() + "\n"]);

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Filter deleted"]);

    return Promise.resolve("Success: Filter deleted");

  } catch(error) {
    error.functionName = deleteFilter.name;
    return Promise.reject(error);
  }
}

function applyFilters() {
  try {

    items.filtered = items.objects;
    selectedFilters = userData.selectedFilters;

    // apply persisted contexts and projects
    if(userData.selectedFilters.length > 0) {
      
      selectedFilters = JSON.parse(userData.selectedFilters);
      // we iterate through the filters in the order they got selected
      selectedFilters.forEach(filter => {
        // reduce filtered items to items that include the filter
        items.filtered = items.filtered.filter(function(item) {
          if(item[filter[1]]) return item[filter[1]].includes(filter[0]);
        });
      });
    }

    // apply persisted excluded categories filter
    if(userData.hideFilterCategories.length > 0) {
      // we iterate through the filters in the order they got selected
      userData.hideFilterCategories.forEach(filter => {
        items.filtered = items.filtered.filter(function(item) {
          if(!item[filter]) return item;
        });
      });
    }

    // apply filters
    items.filtered = items.filtered.filter(function(item) {
      if(!userData.showHidden && item.h) return false;
      if(!userData.showCompleted && item.complete) return false;
      if(!userData.showDueIsToday && item.due && isToday(item.due)) return false;
      if(!userData.showDueIsPast && item.due && isPast(item.due)) return false;
      if(!userData.showDueIsFuture && item.due && isFuture(item.due)) return false;
      if(!userData.deferredTodos && item.t && isFuture(item.t)) return false;
      return item;
    });

    return Promise.resolve("Success: todo.txt objects filtered");

  } catch(error) {
    error.functionName = applyFilters.name;
    return Promise.reject(error);
  }
}

function applySearchInput(queryString) {
  try {
    let query = filterlang.parse(queryString);

    items.filtered = items.filtered.filter(function(item) {
      return runQuery(item, query);
    });
    lastFilterQueryString = queryString;
    lastFilterItems = items.filtered;

    return Promise.resolve("Success: Advanced search query applied");

  } catch(error) {
    // oops, that wasn't a syntactically correct search expression
    if (lastFilterQueryString && queryString.startsWith(lastFilterQueryString)) {
      // keep table more stable by using the previous valid query while
      // user continues to type additional query syntax.
      items.filtered = lastFilterItems;
    } else {
      // the query is not syntactically correct and isn't a longer version
      // of the last working query, so let's assume that it is a
      // plain-text query.

      items.filtered = items.filtered.filter(function(item) {        
        return item.raw.toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
      });
    }
  }

  return Promise.resolve("Success: Plain-text search query applied");
}

function selectFilter(filter, category) {
  try {

    // get the index of the item that matches the data values the button click provided
    const index = selectedFilters.findIndex(item => JSON.stringify(item) === JSON.stringify([filter, category]));

    // remove the item at the index where it matched
    if(index !== -1) {
      selectedFilters.splice(index, 1);
    // if the item is not already in the array, push it into
    } else {
      selectedFilters.push([filter, category]);
    }

    // convert the collected filters to JSON and save it to store.js
    setUserData("selectedFilters", JSON.stringify(selectedFilters)).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    // each filter selection will reload the table    
    buildTable().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    
    return Promise.resolve("Success: Filter \"" + filter + "\" (de)selected");

  } catch (error) {
    error.functionName = selectFilter.name;
    return Promise.reject(error);
  }
}

function resetFilters(refresh) {
  try {

    // clear the persisted filters. By setting it to undefined the object entry will be removed fully
    if(userData.selectedFilters.length > 0) setUserData("selectedFilters", new Array).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    //
    if(userData.hideFilterCategories.length > 0) setUserData("hideFilterCategories", new Array).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    // regenerate the data
    if(refresh) buildTable().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    // clear search input
    todoTableSearch.value = null;

    // scroll back to top
    todoTableWrapper.scrollTo(0,0);

    return Promise.resolve("Success: Filters resetted");

  } catch(error) {
    error.functionName = resetFilters.name;
    return Promise.reject(error);
  }
}

function addFilterToInput(filter, autoCompletePrefix) {
  try {  
    const modalFormInput = document.getElementById("modalFormInput");
    const caretPosition = getCaretPosition(modalFormInput);

    // split string into elements
    //const inputElements = modalFormInput.value.split(/[^\r\n]+/);
    const inputElements = modalFormInput.value.split(" ");

    let i;
    let x = 0;
    for(i = 0; i < inputElements.length; i++) {
      x += inputElements[i].length + 1;
      // once caret position is met inside element the index is persisted
      if(x > caretPosition) break;
    }

    inputElements.splice(i, 1, autoCompletePrefix + filter + " ");
  
    modalFormInput.value = inputElements.join(" ");

    // empty autoCompleteValue to prevent multiple inputs using multiple Enter presses
    autoCompletePrefix = null;

    // put focus back into input so user can continue writing
    modalFormInput.focus();

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Suggestion-box", "Click on filter tag", filter]);

    return Promise.resolve("Success: Filter \"" + filter + "\" added to input");

  } catch (error) {
    error.functionName = addFilterToInput.name;
    return Promise.reject(error);
  }
}

function generateCategoryContainer(category, autoCompletePrefix, buttons) {
  try {
  
    selectedFilters = (userData.selectedFilters && userData.selectedFilters.length > 0) ? JSON.parse(userData.selectedFilters) : new Array

    // creates a div for the specific filter section
    const todoFiltersContainer = document.createElement("section");
    todoFiltersContainer.setAttribute("class", category);

    const todoFilterHeadline = document.createElement("h4");

    // show suggestion box when prefix is present
    if(autoCompletePrefix !== undefined) {

      autoCompleteContainer.classList.add("is-active");
      todoFilterHeadline.innerHTML = translations[category];

    // filter box in drawer
    } else {

      let hideFilterCategories = userData.hideFilterCategories;

      todoFilterHeadline.setAttribute("class", "is-4 clickable");
      
      // setup greyed out state
      if(hideFilterCategories.includes(category)) {
        todoFilterHeadline.innerHTML = "<i class=\"far fa-eye\" tabindex=\"-1\"></i>&nbsp;" + translations[category];
        todoFilterHeadline.classList.add("is-greyed-out");
      } else {
        todoFilterHeadline.innerHTML = "<i class=\"far fa-eye-slash\" tabindex=\"-1\"></i>&nbsp;" + translations[category];
        todoFilterHeadline.classList.remove("is-greyed-out");
      }

      // add click event
      todoFilterHeadline.onclick = function() {

        // scroll up to top
        todoTableWrapper.scrollTo(0,0);

        // if filter is already persisted it will be removed on click
        if(hideFilterCategories.includes(category)) {
          hideFilterCategories.splice(hideFilterCategories.indexOf(category), 1)

        // otherwise it's added
        } else {
          hideFilterCategories.push(category);
          hideFilterCategories = [...new Set(hideFilterCategories.join(",").split(","))];
        }

        setUserData("hideFilterCategories", hideFilterCategories).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        
        buildTable().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
    }

    // add the headline before content 
    todoFiltersContainer.appendChild(todoFilterHeadline);

    // add filter fragment -> most likely autocomplete container
    if(buttons.childElementCount === 0) {

      const todoFilterHint = document.createElement("div");
      todoFilterHint.setAttribute("class", "todoFilterHint");

      todoFilterHint.innerHTML = translations["hint_" + category];
      todoFilterHint.onclick = function() {

        showModal("modalHelp").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Drawer", "Click on Help"]);
      }
      todoFiltersContainer.appendChild(todoFilterHint);
    }

    // add filter fragment if it is available
    todoFiltersContainer.appendChild(buttons)

    // return the container
    return Promise.resolve(todoFiltersContainer);

  } catch (error) {
    error.functionName = generateCategoryContainer.name;
    return Promise.reject(error);
  }
}

function generateFilterButtons(category, autoCompletePrefix) {
  try {

    // create a fragment to collect the filters in
    const buttons = document.createDocumentFragment();

    // convert object to array
    const filters = Object.entries(filtersCounted);
    
    const l = filters.length;

    // build one button each
    for(let i = 0; i < l; i++) {

      const filter = filters[i][0];

      // skip this loop if no filters are present
      if(!filter) continue;

      const todoFiltersItem = document.createElement("a");

      // can cause problem if applied on contexts or projects
      if(category === "priority") todoFiltersItem.classList.add(filter);

      // add attributes
      todoFiltersItem.setAttribute("data-filter", filter);
      todoFiltersItem.setAttribute("data-category", category);
      todoFiltersItem.setAttribute("data-prefix", autoCompletePrefix);
      todoFiltersItem.classList.add("button", category);
      todoFiltersItem.setAttribute("tabindex", 0)    
      todoFiltersItem.setAttribute("href", "#")    
      todoFiltersItem.innerHTML = filter;

      // configuration for filter drawer buttons
      if(!autoCompletePrefix) {

        // set highlighting if filter/category combination is on selected filters array
        selectedFilters.forEach(function(item) {
          if(JSON.stringify(item) === '["'+filter+'","'+category+'"]') todoFiltersItem.classList.toggle("is-dark")
        });

        if(filtersReducedCounted[filter]) {
          todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">" + filtersReducedCounted[filter] + "</span>";

          // add context menu
          todoFiltersItem.oncontextmenu = function(event) {
            
            filterContextInput.value = filter;
            filterContextInput.setAttribute("data-item", category);
            filterContextInput.focus();
            filterContextInput.onkeydown = function(event) {
              // prevent spaces in filters
              if(event.key === " ") return false
            }

            filterContext.style.left = event.x + "px";
            filterContext.style.top = event.y + "px";
            filterContext.classList.add("is-active");
            filterContext.onsubmit = function(event) {
              // prevent page reload
              event.preventDefault();

              saveFilter(filterContextInput.value, filter, category).then(function(response) {
                console.info(response);
              }).catch(function(error) {
                handleError(error);
              });

              // close context
              this.classList.remove("is-active");
            }

            filterContextDelete.onclick = function(event) {
              // prevent page reload
              event.preventDefault();

              getConfirmation(deleteFilter, translations.deleteCategoryPrompt, filter, category).then(function(response) {
                console.info(response);
              }).catch(function(error) {
                handleError(error);
              });
            }

            // jail the modal
            createModalJail(filterContext).then(function(response) {
              console.info(response);
            }).catch(function(error) {
              handleError(error);
            });


          }

          // create the event listener for filter selection by user
          todoFiltersItem.onclick = function() {
          
            // scroll up in todo list when filter is selected  
            todoTableWrapper.scrollTo(0, 0);

            selectFilter(this.getAttribute("data-filter"), this.getAttribute("data-category")).then(function(response) {
              console.info(response);
            }).catch(function(error) {
              handleError(error);
            });

            // trigger matomo event
            if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on filter tag", category]);
          }
        } else {
          todoFiltersItem.disabled = true;
          todoFiltersItem.classList.add("is-greyed-out");
          todoFiltersItem.innerHTML += " <span class=\"tag is-rounded\">0</span>";
        }

      // configuration for autocomplete buttons
      // add filter to input
      } else {
        todoFiltersItem.onclick = function(event) {
          addFilterToInput(this.getAttribute("data-filter"), autoCompletePrefix).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
        }
      }

      buttons.appendChild(todoFiltersItem);

    }

    return Promise.resolve(buttons);

  } catch (error) {
    error.functionName = generateFilterButtons.name;
    return Promise.reject(error);
  }
}

function generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix) {
  try {

    // select the container (filter drawer or autocomplete) in which filters will be shown
    if(autoCompleteCategory) {
      container = autoCompleteContainer;
      // empty default categories
      categories = [];
      // fill only with selected autocomplete category
      categories.push(autoCompleteCategory);
      // for the suggestion container, so all filters will be shown
      items.filtered = items.objects;
    // in filter drawer, filters are adaptive to the shown items
    } else {
      container = todoFilters;
      // needs to be reset every run, because it can be overwritten by previous autocomplete
      categories = ["priority", "contexts", "projects"];
    }

    // clean up container on each run
    container.innerHTML = "";

    categories.forEach(async (category) => {

      // array to collect all the available filters in the data
      let filters = new Array();
      const todoForLoop = (userData.showEmptyFilters) ? items.objects : items.filtered
      todoForLoop.forEach((todo) => {
        // check if the object has values in either the project or contexts field
        if(todo[category]) {
          // push all filters found so far into an array
          for (let filter in todo[category]) {

            // if user has not opted for showComplete we skip the filter of this particular item
            if(userData.showCompleted==false && todo.complete==true) {
              continue;
            // if task is hidden the filter will be marked
            } else if(todo.h) {
              filters.push([todo[category][filter],0]);
            } else {
              filters.push([todo[category][filter],1]);
            }
          }
        }
      });    

      // search within filters according to autoCompleteValue
      if(autoCompletePrefix) filters = filters.filter(function(filter) { 
        // (!userData.caseSensitive)
        //   autoCompleteValue = queryString.toLowerCase();
        //   filter.raw = item.raw.toLowerCase();
        return filter.toString().toLowerCase().includes(autoCompleteValue.toLowerCase());
      })

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

      // count reduced filter when persisted filters are present
      let filtersReduced = [];
      
      const l = items.filtered.length;
      for(let i = 0; i < l; i++) {
        const item = items.filtered[i];
        if(!item[category]) continue;
        // push all filters found so far into an array
        for(let filter in item[category]) {
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

      filtersReducedCounted = filtersReduced.reduce(function(filters, filter) {
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
        if(filters!==null) {
          return filters;
        }
      }, {});

      // TODO can this be done above already?
      // remove empty filter entries
      // filters = filters.filter(function(filter) {
      //   if(filter[0]) return filter;
      // });

      // Cancel if autcomplete container and no filters available
      // if(filters.length === 0 && autoCompletePrefix) {
      //   return;
      // }
      
      // build filter buttons and add them to a fragment
      const buttons = await generateFilterButtons(category, autoCompletePrefix).then(response => {
        return response;
      }).catch (error => {
        handleError(error);
      });

      // build and configure the category container and finally append the fragments
      const todoFiltersContainer = await generateCategoryContainer(category, autoCompletePrefix, buttons).then(response => {
        return response;
      }).catch (error => {
        handleError(error);
      });

      container.appendChild(todoFiltersContainer);

    });

    return Promise.resolve("Success: Filter data generated");

  } catch (error) {
    error.functionName = generateFilterData.name;
    return Promise.reject(error);
  }
}

export { applyFilters, applySearchInput, generateFilterData, selectFilter, categories, resetFilters };
