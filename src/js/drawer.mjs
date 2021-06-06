"use strict";
import { setUserData, userData, handleError, _paq } from "../render.js";
import { navBtns } from "./navigation.mjs";
import { getHandleElement, startDragging } from "./drawer_handle.mjs";

const viewDrawer = document.getElementById("viewDrawer");
const filterDrawer = document.getElementById("filterDrawer");
const drawerContainer = document.getElementById("drawerContainer");
const todoTable = document.getElementById("todoTable");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnView = document.getElementById("navBtnView");
const drawers = document.querySelectorAll(".drawer");

document.querySelectorAll(".drawerClose").forEach(function(drawerClose) {
  drawerClose.onclick = function() {
    showDrawer(false).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Drawer", "Click on close button"])
  }
})
document.getElementById("filterDrawer").addEventListener ("keydown", function () {
  if(event.key === "Escape") {
    showDrawer(false, navBtnFilter.id, this.id).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
  }
});
document.getElementById("viewDrawer").addEventListener ("keydown", function () {
  if(event.key === "Escape") {
    showDrawer(false, document.getElementById("navBtnView").id, this.id).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
  }
});
getHandleElement.addEventListener("mousedown", startDragging);
navBtnFilter.onclick = function() {
  let toggle = true;
  if(document.getElementById("drawerContainer").classList.contains("is-active")) toggle = false;
  showDrawer(toggle, "navBtnFilter", "filterDrawer").then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
}
navBtnView.onclick = function() {
  let toggle = true;
  if(document.getElementById("drawerContainer").classList.contains("is-active")) toggle = false;
  showDrawer(toggle, this.id, viewDrawer.id).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on view"]);
}
// open filter drawer if it has been persisted
showDrawer(userData.filterDrawer, "navBtnFilter", "filterDrawer").then(function(result) {
  console.log(result);
}).catch(function(error) {
  handleError(error);
});
export function showDrawer(variable, buttonId, drawerId) {
  try {

    if(!variable && !buttonId && !drawerId) {
      drawerContainer.classList.remove("is-active");
      filterDrawer.classList.remove("is-active");
      viewDrawer.classList.remove("is-active");
      navBtnFilter.classList.remove("is-highlighted");
      navBtnView.classList.remove("is-highlighted");
      setUserData("filterDrawer", false);
      return Promise.resolve("Success: Drawer closed");
    }
    const viewToggleSortCompletedLast = document.getElementById("viewToggleSortCompletedLast");
    switch (drawerId) {
      case "viewDrawer":
        // highlight persisted selection in dropdown
        Array.from(document.getElementById("viewSelectSortBy").options).forEach(function(item) {
          if(item.value===userData.sortBy) item.selected = true
        });
        break;
    }
    buttonId = document.getElementById(buttonId);
    drawerId = document.getElementById(drawerId);
    // always hide the drawer container first
    drawerContainer.classList.remove("is-active");
    // next show or hide the single drawers
    switch(variable) {
      case true:
        buttonId.classList.add("is-highlighted");
        drawerId.classList.add("is-active");
        drawerContainer.classList.add("is-active");
      break;
      case false:
        drawers.forEach(function(drawer) {
          drawer.classList.remove("is-active");
        });
        navBtns.forEach(function(navBtn) {
          navBtn.classList.remove("is-highlighted");
        });
        drawerContainer.classList.remove("is-active");
      break;
    }
    setUserData(drawerId.id, variable);
    // persist filter drawer state
    if(drawerId && drawerId.classList.contains("is-active")) {
      // if the drawer is open the table needs a fixed width to overlap the viewport
      todoTable.style.minWidth = "45em";
      todoTableSearchContainer.style.minWidth = "45em";
    } else {
      // undo what has been done
      todoTable.style.minWidth = "auto";
      todoTableSearchContainer.style.minWidth = "auto";
    }
    return Promise.resolve("Success: Drawer toggled");
  } catch(error) {
    error.functionName = showDrawer.name;
    return Promise.reject(error);
  }
}
