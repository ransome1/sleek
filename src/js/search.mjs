"use strict";
import { translations, startBuilding, handleError, userData } from "../render.js";
import { addTodo } from "./todos.mjs";

const todoTableSearch = document.getElementById("todoTableSearch");
const todoTableSearchAddTodo = document.getElementById("todoTableSearchAddTodo");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");

todoTableSearchLabel.innerHTML = translations.todoTxtSyntax;

todoTableSearch.addEventListener("input", debounce(function() {
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
todoTableSearch.addEventListener("keyup", function () {
  if(event.key === "Escape") todoTableSearch.blur();
});

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

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
	let timeout;
	return function() {
		let
      context = this,
      args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
