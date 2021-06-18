"use strict";
import { setUserData, userData, handleError } from "../render.js";
import { _paq } from "./matomo.mjs";
import { getHandleElement, startDragging } from "./drawer_handle.mjs";

const drawerContainer = document.getElementById("drawerContainer");
const todoTable = document.getElementById("todoTable");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnView = document.getElementById("navBtnView");
const drawers = document.querySelectorAll("nav ul li.drawer");

document.getElementById("drawerClose").onclick = function() {
  showDrawer(null, null, true).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Drawer", "Click on close button"])
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
getHandleElement.addEventListener("mousedown", startDragging);
navBtnFilter.onclick = function() {
  showDrawer(this, this.getAttribute("data-drawer")).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
}
navBtnView.onclick = function() {
  showDrawer(this, this.getAttribute("data-drawer")).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on view"]);
}

export function showDrawer(button, drawer, close) {
  try {
    // close drawers and the container and persist it
    if(close) {
      drawerContainer.classList.remove("is-active");
      drawers.forEach((item) => {
        item.classList.remove("is-highlighted");
        document.getElementById(item.getAttribute("data-drawer")).classList.remove("is-active");
        setUserData(item.getAttribute("data-drawer"), false);
      });
      return Promise.resolve("Success: Drawer closed");
    }
    // close open drawers, open the new one and persist it
    drawer = document.getElementById(drawer);
    if(drawer.classList.contains("is-active")) {
      drawerContainer.classList.remove("is-active");
      drawer.classList.remove("is-active");
      button.classList.remove("is-highlighted");
      setUserData(drawer.id, false);
      return Promise.resolve("Success: Drawer closed");
    } else {
      drawerContainer.classList.add("is-active");
      drawers.forEach((item) => {
        item.classList.remove("is-highlighted");
        document.getElementById(item.getAttribute("data-drawer")).classList.remove("is-active");
      });
      drawer.classList.add("is-active");
      button.classList.add("is-highlighted");
      setUserData(drawer.id, true);
      return Promise.resolve("Success: Drawer opened");
    }
  } catch(error) {
    error.functionName = showDrawer.name;
    return Promise.reject(error);
  }
}
