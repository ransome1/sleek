"use strict";
import { userData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
import { formatDate } from "./helper.mjs";
import { items, currentTodo, editTodo } from "./todos.mjs";
import { RecExtension, SugarDueExtension, ThresholdExtension } from "./todotxtExtensions.mjs";
import "../../node_modules/jstodotxt/jsTodoExtensions.js";
import "../../node_modules/jstodotxt/jsTodoTxt.js";
import Datepicker from "../../node_modules/vanillajs-datepicker/js/Datepicker.js";
import de from "../../node_modules/vanillajs-datepicker/js/i18n/locales/de.js";
import it from "../../node_modules/vanillajs-datepicker/js/i18n/locales/it.js";
import es from "../../node_modules/vanillajs-datepicker/js/i18n/locales/es.js";
import fr from "../../node_modules/vanillajs-datepicker/js/i18n/locales/fr.js";

const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const datePickerInput = document.getElementById("datePickerInput");
const datePickerContainer = document.querySelector(".datepicker.datepicker-dropdown");

datePickerInput.onfocus = function () {
  datePicker.show();
  autoCompleteContainer.classList.remove("is-active");
  resizeInput(datePickerInput);
};
datePickerInput.addEventListener("changeDate", function (e) {
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(document.getElementById("modalForm").classList.contains("is-active")) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    let todo = new TodoTxtItem(document.getElementById("modalFormInput").value, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
    if(datePicker.getDate()) {
      todo.due = datePicker.getDate();
      todo.dueString = formatDate(datePicker.getDate());
    } else {
      // in case delete button is pushed
      todo.due = undefined;
      todo.dueString = undefined;
    }
    // if suggestion box was open, it needs to be closed
    autoCompleteContainer.classList.remove("is-active");
    autoCompleteContainer.blur();
    // if a due date is set, the recurrence picker will be shown);
    document.getElementById("modalFormInput").value = todo.toString();
    document.getElementById("modalFormInput").focus();
    resizeInput(datePickerInput);
    datePicker.hide();
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
  } else {
    // get position of current todo in array
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(currentTodo.toString());
    // change the date
    if(datePicker.getDate()) {
      currentTodo.due = datePicker.getDate();
      currentTodo.dueString = formatDate(datePicker.getDate());
    } else {
      // in case delete button is pushed
      currentTodo.due = undefined;
      currentTodo.dueString = undefined;
    }
    // finally pass new todo on for changing
    editTodo(index, currentTodo);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Datepicker used to change a date"]);
  }
  document.querySelector(".datepicker.datepicker-dropdown").classList.remove("visible");
});
datePickerInput.placeholder = translations.formSelectDueDate;
Object.assign(Datepicker.locales, de, it, es, fr);
const datePicker = new Datepicker(datePickerInput, {
  autohide: true,
  language: userData.language,
  format: "yyyy-mm-dd",
  clearBtn: true,
  calendarWeeks: true,
  weekStart: 1,
  beforeShowDay: function(date) {
    let today = new Date();
    if (date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()) {
      return { classes: 'today'};
    }
  }
});
// document.querySelector(".datepicker .clear-btn").onclick = function() {
//   let todo = new TodoTxtItem(document.getElementById("modalFormInput").value, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
//   todo.due = undefined;
//   todo.dueString = undefined;
//   document.getElementById("modalFormInput").value = todo.toString();
//   resizeInput(datePickerInput);
//   datePicker.hide();
// }
export { datePickerInput, datePicker };
