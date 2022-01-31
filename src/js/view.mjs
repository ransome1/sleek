"use strict";
import { userData, setUserData, startBuilding, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";

const html = document.getElementById("html");
const body = document.getElementById("body");
const sortBy = document.getElementById("sortBy");
//const viewHeadlineAppView = document.getElementById("viewHeadlineAppView");
const viewHeadlineTodoList = document.getElementById("viewHeadlineTodoList");
const viewHeadlineFilterList = document.getElementById("viewHeadlineFilterList");
const settingsToggleCompactView = document.getElementById("settingsToggleCompactView");
const viewToggleDueIsFuture = document.getElementById("viewToggleDueIsFuture");
const viewToggleDueIsPast = document.getElementById("viewToggleDueIsPast");
const viewToggleDueIsToday = document.getElementById("viewToggleDueIsToday");
const viewToggles = document.querySelectorAll('.viewToggle');
const viewToggleShowCompleted = document.getElementById("viewToggleShowCompleted");
const viewToggleShowHidden = document.getElementById("viewToggleShowHidden");
const viewToggleSortCompletedLast = document.getElementById("viewToggleSortCompletedLast");
const settingsDragZoom = document.getElementById("settingsDragZoom");
const zoomRangePicker = document.getElementById("zoomRangePicker");
const zoomUndo = document.getElementById("zoomUndo");
const viewToggleShowEmptyFilters = document.getElementById("viewToggleShowEmptyFilters");
const sortByContainer = document.getElementById("sortByContainer");
const viewToggleDeferredTodos = document.getElementById("viewToggleDeferredTodos");
const settingsToggleFileTabs = document.getElementById("settingsToggleFileTabs");
const viewInvertSorting = document.getElementById("viewInvertSorting");
const viewSortByFile = document.getElementById("viewSortByFile");

viewSortBy.innerHTML = translations.sortBy;
//viewHeadlineAppView.innerHTML = translations.viewHeadlineAppView;
viewHeadlineTodoList.innerHTML = translations.viewHeadlineTodoList;
viewHeadlineFilterList.innerHTML = translations.viewHeadlineFilterList;
viewToggleDueIsFuture.innerHTML = translations.dueFuture;
viewToggleDueIsPast.innerHTML = translations.duePast;
viewToggleDueIsToday.innerHTML = translations.dueToday;
viewToggleShowCompleted.innerHTML = translations.completedTodos;
viewToggleShowHidden.innerHTML = translations.hiddenTodos;
viewToggleSortCompletedLast.innerHTML = translations.sortCompletedLast;
settingsToggleCompactView.innerHTML = translations.compactView;
zoomRangePicker.innerHTML = translations.zoomRangePicker;
settingsDragZoom.innerHTML = translations.settingsDragZoom;
viewToggleShowEmptyFilters.innerHTML = translations.viewToggleShowEmptyFilters;
viewToggleDeferredTodos.innerHTML = translations.deferredTodos;
settingsToggleFileTabs.innerHTML = translations.fileTabs;
viewInvertSorting.innerHTML = translations.invertSorting;
viewSortByFile.innerHTML = translations.sortByFile;

// build the sortBy list
userData.sortBy.forEach((sortBy) => {
  const sortByContainerElement = document.createElement("li");
  sortByContainerElement.setAttribute("data-id", sortBy);
  if(sortBy==="dueString") sortBy = "dueDate";
  sortByContainerElement.innerHTML = "<i class=\"fas fa-grip-vertical\"></i>";
  sortByContainerElement.innerHTML += translations[sortBy];
  sortByContainer.appendChild(sortByContainerElement);
});

import { enableDragSort } from "../configs/dragndrop.mjs";
enableDragSort("drag-sort-enable");

zoomRangePicker.onchange = function() {
  const value = this.value;
  zoom(value).then(response => {
    console.log(response);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Zoom ranger dragged"]);
  }).catch(error => {
    handleError(error);
  });
}
zoomUndo.onclick = function() {
  zoom(100).then(response => {
    console.log(response);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Click on zoom undo"]);
  }).catch(error => {
    handleError(error);
  });
};
viewToggles.forEach(function(viewToggle) {
  // set checked according to user data
  viewToggle.checked = userData[viewToggle.id];
  // setup up the click event
  viewToggle.onclick = function() {
    toggle(this.id).then(response => {
      console.log(response);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Toggle " + this.id + " set to: " + this.value]);
    }).catch(error => {
      handleError(error);
    });
  }
});
function zoom(zoom) {
  try {
    html.style.zoom = zoom + "%";
    document.getElementById("zoomStatus").innerHTML = zoom + "%";
    zoomRangePicker.value = zoom;
    // persist zoom setting
    setUserData("zoom", zoom);
    return Promise.resolve("Info: Zoom set to " + zoom + "%");
  } catch (error) {
    error.functionName = zoom.name;
    return Promise.reject(error);
  }
}
function toggle(toggleName, variable) {
  try {
    const toggle = document.getElementById(toggleName);
    if(userData[toggle.id] === false || variable) {
      userData[toggle.id] = true;
      toggle.checked = true;
    } else {
      userData[toggle.id] = false;
      toggle.checked = false;
    }
    // TODO: Make more generic
    if(toggle.id==="compactView" && userData[toggle.id]) {
      body.classList.add("compact");
    } else if(toggle.id==="compactView" && !userData[toggle.id]) {
      body.classList.remove("compact");
    } else {
      startBuilding();
    }
    setUserData(toggle.id, userData[toggle.id]);
    return Promise.resolve("Success: " + toggle.id + " set to: " + userData[toggle.id]);
  } catch(error) {
    error.functionName = toggle.name;
    return Promise.reject(error);
  }
}
export { toggle };
