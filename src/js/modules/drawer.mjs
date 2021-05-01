"use strict";
import { setUserData, showMore, userData, handleError, navBtns } from "../../render.js";
// ########################################################################################################################
// RESIZEABLE FILTER DRAWER
// https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
// ########################################################################################################################
const getResizeableElement = () => { return document.getElementById("drawerContainer"); };
const getHandleElement = () => { return document.getElementById("handle"); };
const minPaneSize = 400;
const maxPaneSize = document.body.clientWidth * .75
const setPaneWidth = (width) => {
  getResizeableElement().style.setProperty("--resizeable-width", `${width}px`);
  setUserData("drawerWidth", `${width}`);
};
const getPaneWidth = () => {
  const pxWidth = getComputedStyle(getResizeableElement())
    .getPropertyValue("--resizeable-width");
  return parseInt(pxWidth, 10);
};
const startDragging = (event) => {
  event.preventDefault();
  const host = getResizeableElement();
  const startingPaneWidth = getPaneWidth();
  const xOffset = event.pageX;
  const mouseDragHandler = (moveEvent) => {
    moveEvent.preventDefault();
    const primaryButtonPressed = moveEvent.buttons === 1;
    if (!primaryButtonPressed) {
      setPaneWidth(Math.min(Math.max(getPaneWidth(), minPaneSize), maxPaneSize));
      document.body.removeEventListener("pointermove", mouseDragHandler);
      return;
    }
    const paneOriginAdjustment = "left" === "right" ? 1 : -1;
    setPaneWidth((xOffset - moveEvent.pageX ) * paneOriginAdjustment + startingPaneWidth);
  };
  const remove = document.body.addEventListener("pointermove", mouseDragHandler);
};
getResizeableElement().style.setProperty("--max-width", `${maxPaneSize}px`);
getResizeableElement().style.setProperty("--min-width", `${minPaneSize}px`);
getHandleElement().addEventListener("mousedown", startDragging);

document.getElementById("filterDrawer").addEventListener ("keydown", function () {
  if(event.key === "Escape") {
    showDrawer(false, navBtnFilter.id, filterDrawer.id).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
  }
});
document.getElementById("viewDrawer").addEventListener ("keydown", function () {
  if(event.key === "Escape") {
    showDrawer(false, navBtnView.id, viewDrawer.id).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
  }
});

const drawers = document.querySelectorAll(".drawer");
const drawerCloser = document.querySelectorAll(".drawerClose").forEach(function(drawerClose) {
  drawerClose.onclick = function() {
    showDrawer(false).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    // trigger matomo event
    if(window.consent) _paq.push(["trackEvent", "Drawer", "Click on close button"])
  }
})
function showDrawer(variable, buttonId, drawerId) {
  try {
    switch (drawerId) {
      case "viewDrawer":
        if(userData.showCompleted) {
          viewToggleSortCompletedLast.parentElement.classList.remove("is-hidden");
        } else {
          viewToggleSortCompletedLast.parentElement.classList.add("is-hidden");
        }
        // set viewContainer sort select
        Array.from(viewSelectSortBy.options).forEach(function(item) {
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

export { setPaneWidth, showDrawer };
