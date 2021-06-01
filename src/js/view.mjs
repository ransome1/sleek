import { userData, setUserData, handleError, startBuilding, translations, resetModal } from "../render.js";

const html = document.getElementById("html");
const showCompleted = document.getElementById("showCompleted");
const showDueIsFuture = document.getElementById("showDueIsFuture");
const showDueIsPast = document.getElementById("showDueIsPast");
const showDueIsToday = document.getElementById("showDueIsToday");
const showHidden = document.getElementById("showHidden");
const sortBy = document.getElementById("sortBy");
const sortByContexts = document.getElementById("sortByContexts");
const sortByDueDate = document.getElementById("sortByDueDate");
const sortByPriority = document.getElementById("sortByPriority");
const sortByProjects = document.getElementById("sortByProjects");
const sortCompletedLast = document.getElementById("sortCompletedLast");
const toggleCompactView = document.getElementById("toggleCompactView");
const toggleDarkmode = document.getElementById("toggleDarkmode");
const toggleMatomoEvents = document.getElementById("toggleMatomoEvents");
const toggleNotifications = document.getElementById("toggleNotifications");
const toggleTray = document.getElementById("toggleTray");
const viewHeadlineAppView = document.getElementById("viewHeadlineAppView");
const viewHeadlineTodoList = document.getElementById("viewHeadlineTodoList");
const viewSelectSortBy = document.getElementById("viewSelectSortBy");
const viewToggleCompactView = document.getElementById("viewToggleCompactView");
const viewToggleDueIsFuture = document.getElementById("viewToggleDueIsFuture");
const viewToggleDueIsPast = document.getElementById("viewToggleDueIsPast");
const viewToggleDueIsToday = document.getElementById("viewToggleDueIsToday");
const viewToggles = document.querySelectorAll('.viewToggle');
const viewToggleShowCompleted = document.getElementById("viewToggleShowCompleted");
const viewToggleShowHidden = document.getElementById("viewToggleShowHidden");
const viewToggleSortCompletedLast = document.getElementById("viewToggleSortCompletedLast");
const zoomRangePicker = document.getElementById("zoomRangePicker");
const zoomUndo = document.getElementById("zoomUndo");

sortBy.innerHTML = translations.sortBy;
sortByContexts.innerHTML = translations.contexts;
sortByDueDate.innerHTML = translations.dueDate;
sortByPriority.innerHTML = translations.priority;
sortByProjects.innerHTML = translations.projects;
viewHeadlineAppView.innerHTML = translations.viewHeadlineAppView;
viewHeadlineTodoList.innerHTML = translations.viewHeadlineTodoList;
viewToggleDueIsFuture.innerHTML = translations.dueFuture;
viewToggleDueIsPast.innerHTML = translations.duePast;
viewToggleDueIsToday.innerHTML = translations.dueToday;
viewToggleShowCompleted.innerHTML = translations.completedTodos;
viewToggleShowHidden.innerHTML = translations.hiddenTodos;
viewToggleSortCompletedLast.innerHTML = translations.sortCompletedLast;
viewToggleCompactView.innerHTML = translations.compactView;

viewSelectSortBy.onchange = async function() {
  if(this.value) {
    await setUserData("sortBy", this.value);
    startBuilding();
    resetModal().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Sort by setting changed to: " + this.value]);
  }
}
zoomRangePicker.onchange = function() {
  zoom(this.value).then(response => {
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
    const zoomStatus = zoom + "\%";
    html.style.zoom = zoomStatus;
    document.getElementById("zoomStatus").innerHTML = zoomStatus;
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
    if(userData[toggle.id]==false || variable) {
      userData[toggle.id] = true;
    } else {
      userData[toggle.id] = false;
    }
    if(toggle.id==="compactView" && userData[toggle.id]) {
      body.classList.add("compact");
    } else if(toggle.id==="compactView" && !userData[toggle.id]) {
      body.classList.remove("compact");
    } else {
      startBuilding();
    }
    setUserData(toggle.id, userData[toggle.id]);
    return Promise.resolve("Success: Show " + toggle.id + " todo set to: " + userData[toggle.id]);
  } catch(error) {
    error.functionName = toggle.name;
    return Promise.reject(error);
  }
}
export { toggle };
