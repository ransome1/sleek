/* Made with love by @fitri
 This is a component of my ReactJS project
 https://codepen.io/fitri/full/oWovYj/ */

"use strict";
import { setUserData, startBuilding } from "../render.js";

function reorderSortingLevel() {
  let sortBy = new Array;
  const children = document.getElementById("sortByContainer").children;
  for(let i=0; i<children.length; i++) {
    if(!children[i].getAttribute("data-id")) continue;
    sortBy.push(children[i].getAttribute("data-id"));
  }
  setUserData("sortBy", sortBy);
  startBuilding();
}

export function enableDragSort(listClass) {
  const sortableLists = document.getElementsByClassName(listClass);
  Array.prototype.map.call(sortableLists, (list) => {enableDragList(list)});
}

function enableDragList(list) {
  Array.prototype.map.call(list.children, (item) => {enableDragItem(item)});
}

function enableDragItem(item) {
  item.setAttribute("draggable", true)
  item.ondrag = handleDrag;
  item.ondragend = handleDrop;
}

function handleDrag(item) {
  const selectedItem = item.target,
        list = selectedItem.parentNode,
        x = event.clientX,
        y = event.clientY;

  selectedItem.classList.add("drag-sort-active");
  let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

  if (list === swapItem.parentNode) {
    swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
    list.insertBefore(selectedItem, swapItem);
  }
}

function handleDrop(item) {
  item.target.classList.remove("drag-sort-active");
  reorderSortingLevel();
}