"use strict";
import { setUserData, userData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";
import { createModalJail } from "./jail.mjs";
import { enableDragSort } from "../configs/dragndrop.mjs";
import { resetFilters } from "./filters.mjs";
import("./drawer_handle.mjs");

const btnFiltersResetFilters = document.getElementById("btnFiltersResetFilters");
const compactViewHeadline = document.getElementById("compactViewHeadline");
const drawerClose = document.getElementById("drawerClose");
const sortByContainer = document.getElementById("sortByContainer");
const toggleDeferredTodos = document.getElementById("toggleDeferredTodos");
const toggleDueIsFuture = document.getElementById("toggleDueIsFuture");
const toggleDueIsPast = document.getElementById("toggleDueIsPast");
const toggleDueIsToday = document.getElementById("toggleDueIsToday");
const toggleShowCompleted = document.getElementById("toggleShowCompleted");
const toggleShowEmptyFilters = document.getElementById("toggleShowEmptyFilters");
const toggleShowHidden = document.getElementById("toggleShowHidden");
const toggleSortCompletedLast = document.getElementById("toggleSortCompletedLast");
const viewHeadlineFilterList = document.getElementById("viewHeadlineFilterList");
const viewHeadlineTodoList = document.getElementById("viewHeadlineTodoList");
const viewInvertSorting = document.getElementById("viewInvertSorting");
const viewSortBy = document.getElementById("viewSortBy");
const viewSortByFile = document.getElementById("viewSortByFile");

compactViewHeadline.innerHTML = translations.compactView;
toggleDeferredTodos.innerHTML = translations.deferredTodos;
toggleDueIsFuture.innerHTML = translations.dueFuture;
toggleDueIsPast.innerHTML = translations.duePast;
toggleDueIsToday.innerHTML = translations.dueToday;
toggleShowCompleted.innerHTML = translations.completedTodos;
toggleShowEmptyFilters.innerHTML = translations.toggleShowEmptyFilters;
toggleShowHidden.innerHTML = translations.hiddenTodos;
toggleSortCompletedLast.innerHTML = translations.sortCompletedLast;
viewHeadlineFilterList.innerHTML = translations.viewHeadlineFilterList;
viewHeadlineTodoList.innerHTML = translations.viewHeadlineTodoList;
viewInvertSorting.innerHTML = translations.invertSorting;
viewSortBy.innerHTML = translations.sortBy;
viewSortByFile.innerHTML = translations.sortByFile;

export function showDrawer(button) {
  try {

    const buttons = document.querySelectorAll("nav ul li a.drawerTrigger");
    const drawerContainer = document.getElementById("drawerContainer");

    // check if button/drawer are active and therefor sould be closed
    let close = true;
    if(button) close = document.getElementById(button.getAttribute("data-drawer")).classList.contains("is-active");

    // close all drawers and remove all highlightings from buttons
    buttons.forEach((button) => {
      
      // remove all highlighting on buttons
      button.classList.remove("is-highlighted", "is-active");

        // remove active state of drawer
      const drawer = document.getElementById(button.getAttribute("data-drawer"));
      drawer.classList.remove("is-active");

      // remove active state of drawer container
      drawerContainer.classList.remove("is-active");
  
      // persist setting for each drawer
      setUserData(drawer.id, false).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
    });
    
    // open a specific drawer
    if(!close && button) {

      // get the specific drawer
      const drawer = document.getElementById(button.getAttribute("data-drawer"));
      drawer.classList.add("is-active");
      button.classList.add("is-highlighted");
      drawerContainer.classList.add("is-active");
      
      setUserData(drawer.id, true).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });

      createModalJail(drawer).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });

      return Promise.resolve("Success: Drawer " + drawer.id + " opened");

    }

    return Promise.resolve("Success: Drawer closed");

  } catch(error) {
    error.functionName = showDrawer.name;
    return Promise.reject(error);
  }
}

btnFiltersResetFilters.onclick = function() {
  resetFilters(true);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
}

drawerClose.onclick = function() {
  showDrawer().then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Drawer", "Click on close button"])
}

// close or open drawer on start if setting was persisted
if(userData.filterDrawer) {
  const navBtnFilter = document.getElementById("navBtnFilter");
  showDrawer(navBtnFilter).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
} else if(userData.viewDrawer) {
  const navBtnView = document.getElementById("navBtnView");
  showDrawer(navBtnView).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
}

// build the sortBy list
userData.sortBy.forEach(function(sortBy) {
  const sortByContainerElement = document.createElement("li");
  sortByContainerElement.setAttribute("data-id", sortBy);
  if(sortBy==="dueString") sortBy = "dueDate";
  sortByContainerElement.innerHTML = "<i class=\"fas fa-grip-vertical\"></i>";
  sortByContainerElement.innerHTML += translations[sortBy];
  sortByContainer.appendChild(sortByContainerElement);
});

// trigger drawer drag function
enableDragSort("drag-sort-enable");