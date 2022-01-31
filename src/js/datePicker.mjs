// ******************************************************
// creates a new datepicker instance and attaches it to an element
// either fills in the modal form input or saves new date to an existant todo if it was passed
// destroyes datepicker instance when datepicker container looses focus
// ******************************************************

"use strict";

import { userData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
import { handleError, formatDate } from "./helper.mjs";
import { createTodoObject, items, editTodo } from "./todos.mjs";
import Datepicker from "../../node_modules/vanillajs-datepicker/js/Datepicker.js";
import de from "../../node_modules/vanillajs-datepicker/js/i18n/locales/de.js";
import it from "../../node_modules/vanillajs-datepicker/js/i18n/locales/it.js";
import es from "../../node_modules/vanillajs-datepicker/js/i18n/locales/es.js";
import fr from "../../node_modules/vanillajs-datepicker/js/i18n/locales/fr.js";

const datePickerOptions = {
    autohide: true,
    language: userData.language,
    format: "yyyy-mm-dd",
    clearBtn: true,
    container: "body",
    calendarWeeks: true,
    weekStart: 1,
    beforeShowDay: function(date) {
      let today = new Date();
      if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
        return { classes: "today" };
      }
    }
  }
let datePicker;

function createDatepickerInstance(attachToElement, todo) {
  try {

    datePicker = new Datepicker(attachToElement, datePickerOptions);

    Object.assign(Datepicker.locales, de, it, es, fr);

    // TODO: not generic, can't be used for threshold picker
    if(todo.due) datePicker.setDate(todo.due);

    datePicker.show();

    // prevent body event listener to be triggered
    attachToElement.onclick = function() { event.stopPropagation(); }

    // close datepicker when container loses focus
    attachToElement.onblur = function() { datePicker.destroy(); }

    attachToElement.addEventListener("changeDate", function() {

      // if a todo is passed, it will be edited
      if(todo) {

        // add due date to todo object
        if(datePicker.getDate()) {
          todo.due = datePicker.getDate();
          todo.dueString = formatDate(datePicker.getDate());
        // reset due date in object
        } else {
          todo.due = undefined;
          todo.dueString = undefined;
        }

        // get position of current todo in array
        const index = items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());

        // finally pass new todo on for changing
        editTodo(index, todo);

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Datepicker used to change a date"]);

      // if no todo is passed, the result will be put into input field
      } else {

        const modalFormInput = document.getElementById("modalFormInput");

        // generate the object of input value, so we don't overwrite previous inputs of user
        let todo = createTodoObject(modalFormInput.value);

        // add due date to todo object
        if(datePicker.getDate()) {
          todo.due = datePicker.getDate();
          todo.dueString = formatDate(datePicker.getDate());
        // reset due date in object
        } else {
          todo.due = undefined;
          todo.dueString = undefined;
        }

        // if a due date is set, the recurrence picker will be shown);
        modalFormInput.value = todo.toString();

        // put focus on input field
        modalFormInput.focus();

        // resize the due date input field after date was added
        resizeInput(datePickerInput);

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
      }

    });

    // destroy datepicker on Escape
    attachToElement.addEventListener("keyup", function(event) {
      if(event.key === "Escape") datePicker.destroy();
    });

    return Promise.resolve("Success: Datepicker intance created");

  } catch(error) {
    error.functionName = createDatepickerInstance.name;
    return Promise.reject(error);
  }

}

export { createDatepickerInstance };
