"use strict";
import { translations, startBuilding, userData } from "../render.js";
import { addTodo } from "./todos.mjs";
import { handleError, debounce } from "./helper.mjs";
import { _paq } from "./matomo.mjs";
import { focusRow } from "./keyboard.mjs";

const todoTableSearch = document.getElementById("todoTableSearch");
const todoTableSearchAddTodo = document.getElementById("todoTableSearchAddTodo");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const todoTableSearchLabel = document.getElementById("todoTableSearchLabel");

todoTableSearchLabel.innerHTML = translations.todoTxtSyntax;

todoTableSearch.addEventListener("keydown", function(event) {
  if(event.key === "Tab") {
    setTimeout (function () {
      focusRow(0);
      }, 10 
    );
  } else if(event.key === "Escape") {
    this.blur();
  }
});

todoTableSearch.addEventListener("input", debounce(function(event) {
  if(this.value) {
    todoTableSearchAddTodo.classList.add("is-active");
  } else {
    todoTableSearchAddTodo.classList.remove("is-active");
  }
  startBuilding();
}, 250));

todoTableSearch.onfocus = function() {
  if(this.value) {
    todoTableSearchAddTodo.classList.add("is-active");
  } else {
    todoTableSearchAddTodo.classList.remove("is-active");
  }
  todoTableSearchContainer.classList.add("is-focused");
}

todoTableSearch.onblur = function(event) {
  // if question mark is clicked, do not blur
  if(event.relatedTarget && event.relatedTarget.classList.contains("todoTableSearchQuestionmark")) return false;
  todoTableSearchContainer.classList.remove("is-focused");
}

// shortcuts for search input field
// todoTableSearch.addEventListener("keyup", function () {
//   if(event.key === "Escape") todoTableSearch.blur();
// });

window.addEventListener("keyup", function () {
  // find todo
  if(event.key==="f" && !document.getElementById("modalForm").classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
    todoTableSearch.focus();
  }
});

todoTableSearchAddTodo.onclick = function() {
  addTodo(todoTableSearch.value).then(response => {
    console.log(response);
    document.getElementById("todoTableSearch").value = null;
    document.getElementById("todoTableSearch").focus();
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Search", "Click on Add as new todo"]);
  }).catch(error => {
    handleError(error);
  });
}

