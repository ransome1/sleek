"use strict";
import { userData, setUserData } from "../render.js";
// ########################################################################################################################
// RESIZEABLE FILTER DRAWER
// https://spin.atomicobject.com/2019/11/21/creating-a-resizable-html-element/
// ########################################################################################################################
export const getHandleElement = document.getElementById("handle");
const getResizeableElement = () => { return document.getElementById("drawerContainer"); };
const minPaneSize = 400;
const maxPaneSize = document.body.clientWidth * .75
const setPaneWidth = (width) => {
  getResizeableElement().style.setProperty("--resizeable-width", `${width}px`);
  setUserData("drawerWidth", `${width}`);
};
// restore persisted width of filter drawer
if(userData.drawerWidth) setPaneWidth(userData.drawerWidth);
const getPaneWidth = () => {
  const pxWidth = getComputedStyle(getResizeableElement())
    .getPropertyValue("--resizeable-width");
  return parseInt(pxWidth, 10);
};
export const startDragging = (event) => {
  event.preventDefault();
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
    const paneOriginAdjustment = ("left" === "right") ? 1 : -1;
    setPaneWidth((xOffset - moveEvent.pageX ) * paneOriginAdjustment + startingPaneWidth);
  };
  document.body.addEventListener("pointermove", mouseDragHandler);
};
getResizeableElement().style.setProperty("--max-width", `${maxPaneSize}px`);
getResizeableElement().style.setProperty("--min-width", `${minPaneSize}px`);

getHandleElement.addEventListener("mousedown", startDragging);