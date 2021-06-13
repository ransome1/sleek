"use strict";
import { translations, startBuilding } from "../render.js";

const todoTableSearch = document.getElementById("todoTableSearch");

todoTableSearch.placeholder = translations.search;

todoTableSearch.addEventListener("input", debounce(function() {
  startBuilding()
}, 250));

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
