"use strict";
import { setUserData, showMore, userData, handleError, navBtns, _paq } from "../render.js";
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
getHandleElement.addEventListener("mousedown", startDragging);

navBtnFilter.onclick = function() {
  // close filter drawer first
  viewDrawer.classList.remove("is-active")
  navBtnView.classList.remove("is-highlighted")
  showDrawer("toggle", this.id, filterDrawer.id).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
}
navBtnView.onclick = function() {
  // close filter drawer first
  filterDrawer.classList.remove("is-active")
  navBtnFilter.classList.remove("is-highlighted")
  showDrawer("toggle", this.id, viewDrawer.id).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on view"]);
}

// open filter drawer if it has been persisted
if(userData.filterDrawer) {
  showDrawer(true, navBtnFilter.id, filterDrawer.id).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
// open view drawer if it has been persisted
} else if(userData.viewDrawer) {
  showDrawer(true, navBtnView.id, viewDrawer.id).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
}

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
function showDrawer(variable, buttonId, drawerId) {
  try {
    const viewToggleSortCompletedLast = document.getElementById("viewToggleSortCompletedLast");
    switch (drawerId) {
      case "viewDrawer":
        if(userData.showCompleted) {
          viewToggleSortCompletedLast.parentElement.classList.remove("is-hidden");
        } else {
          viewToggleSortCompletedLast.parentElement.classList.add("is-hidden");
        }
        // set viewContainer sort select
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
      case "toggle":
        buttonId.classList.toggle("is-highlighted");
        drawerId.classList.toggle("is-active");
      break;
    }
    // if any of the drawers is active now, also show the container
    drawers.forEach(function(drawer) {
      if(drawer.classList.contains("is-active")) {
        drawerContainer.classList.add("is-active");
        setUserData(drawer.id, true);
      } else {
        setUserData(drawer.id, false);
      }
    });
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
    // if more toggle is open we close it as user doesn't need it anymore
    showMore(false);
    return Promise.resolve("Success: Drawer toggled");
  } catch(error) {
    error.functionName = showDrawer.name;
    return Promise.reject(error);
  }
}

export { showDrawer };
