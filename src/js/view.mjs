"use strict";
import { userData, translations } from "../render.js";
import { enableDragSort } from "../configs/dragndrop.mjs";

const viewHeadlineTodoList = document.getElementById("viewHeadlineTodoList");
const viewHeadlineFilterList = document.getElementById("viewHeadlineFilterList");
const compactViewHeadline = document.getElementById("compactViewHeadline");
const toggleDueIsFuture = document.getElementById("toggleDueIsFuture");
const toggleDueIsPast = document.getElementById("toggleDueIsPast");
const toggleDueIsToday = document.getElementById("toggleDueIsToday");
const toggleShowCompleted = document.getElementById("toggleShowCompleted");
const toggleShowHidden = document.getElementById("toggleShowHidden");
const toggleSortCompletedLast = document.getElementById("toggleSortCompletedLast");
const toggleShowEmptyFilters = document.getElementById("toggleShowEmptyFilters");
const sortByContainer = document.getElementById("sortByContainer");
const toggleDeferredTodos = document.getElementById("toggleDeferredTodos");
const viewInvertSorting = document.getElementById("viewInvertSorting");
const viewSortByFile = document.getElementById("viewSortByFile");
const viewSortBy = document.getElementById("viewSortBy");

viewSortBy.innerHTML = translations.sortBy;
viewHeadlineTodoList.innerHTML = translations.viewHeadlineTodoList;
viewHeadlineFilterList.innerHTML = translations.viewHeadlineFilterList;
toggleDueIsFuture.innerHTML = translations.dueFuture;
toggleDueIsPast.innerHTML = translations.duePast;
toggleDueIsToday.innerHTML = translations.dueToday;
toggleShowCompleted.innerHTML = translations.completedTodos;
toggleShowHidden.innerHTML = translations.hiddenTodos;
toggleSortCompletedLast.innerHTML = translations.sortCompletedLast;
compactViewHeadline.innerHTML = translations.compactView;
toggleShowEmptyFilters.innerHTML = translations.toggleShowEmptyFilters;
toggleDeferredTodos.innerHTML = translations.deferredTodos;
viewInvertSorting.innerHTML = translations.invertSorting;
viewSortByFile.innerHTML = translations.sortByFile;

// build the sortBy list
userData.sortBy.forEach(function(sortBy) {
  const sortByContainerElement = document.createElement("li");
  sortByContainerElement.setAttribute("data-id", sortBy);
  if(sortBy==="dueString") sortBy = "dueDate";
  sortByContainerElement.innerHTML = "<i class=\"fas fa-grip-vertical\"></i>";
  sortByContainerElement.innerHTML += translations[sortBy];
  sortByContainer.appendChild(sortByContainerElement);
});

enableDragSort("drag-sort-enable");