"use strict";
import { translations, startBuilding, userData } from "../render.js";
import { addTodo } from "./todos.mjs";
import { handleError, debounce } from "./helper.mjs";
import { _paq } from "./matomo.mjs";

const todoTableSearch = document.getElementById("todoTableSearch");
const todoTableSearchAddTodo = document.getElementById("todoTableSearchAddTodo");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const todoTableSearchLabel = document.getElementById("todoTableSearchLabel");

todoTableSearchLabel.innerHTML = translations.todoTxtSyntax;

todoTableSearch.oninput = debounce(function() {
  // on focus show addTodo button
  todoTableSearchAddTodo.classList.add("is-active");

  // rebuild table
  startBuilding();
}, 250)

todoTableSearch.onfocus = function() {
  // add blue highlighting to search bar
  todoTableSearchContainer.classList.add("is-focused");
}

todoTableSearch.onblur = function(event) {
  // if input loses focus addTodo will be hidden
  todoTableSearchContainer.classList.remove("is-focused");

  // if question mark is clicked, do not blur
  if(event.relatedTarget && event.relatedTarget.classList.contains("todoTableSearchQuestionmark")) return false;
}

todoTableSearchAddTodo.onclick = function() {
  addTodo(todoTableSearch.value).then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });

  // empty and focus search bar
  todoTableSearch.value = null;
  todoTableSearch.focus();

  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Search", "Click on Add as new todo"]);
}

todoTableSearchAddTodo.onblur = function() {
  // hide addTodo as soon as it loses focus
  this.classList.remove("is-active");
}

