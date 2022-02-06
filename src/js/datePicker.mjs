// ******************************************************
// creates a new datepicker instance and attaches it to an element
// either fills in the modal form input or saves new date to an existant todo if it was passed
// destroyes datepicker instance when datepicker container looses focus
// ******************************************************

"use strict";

import { userData } from "../render.js";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
import { formatDate } from "./helper.mjs";
import { createTodoObject, items, editTodo } from "./todos.mjs";
import Datepicker from "../../node_modules/vanillajs-datepicker/js/Datepicker.js";
import de from "../../node_modules/vanillajs-datepicker/js/i18n/locales/de.js";
import it from "../../node_modules/vanillajs-datepicker/js/i18n/locales/it.js";
import es from "../../node_modules/vanillajs-datepicker/js/i18n/locales/es.js";
import fr from "../../node_modules/vanillajs-datepicker/js/i18n/locales/fr.js";
Object.assign(Datepicker.locales, de, it, es, fr);

let 
  modalFormInput,
  datePickerOptions = {
      autohide: true,
      language: userData.language,
      format: "yyyy-mm-dd",
      clearBtn: true,
      container: "body",
      calendarWeeks: true,
      weekStart: 1,
      beforeShowDay: function(date) {
        const today = new Date();
        if(date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) return { classes: "today" };
      }
    };

async function createDatepickerInstance(attachToElement, addDateToElement, extension, todo ) {

  try {

    // ******************************************************
    // create datepicker instance
    // ******************************************************

    const datePicker = await new Datepicker(attachToElement, datePickerOptions);

    // ******************************************************
    // prepare todo object if none has been passed
    // ******************************************************

    if(!todo) {
      modalFormInput = document.getElementById("modalFormInput");
      // generate the object of input value, so we don't overwrite previous inputs of user
      todo = createTodoObject(modalFormInput.value);
    }

    if(todo[extension]) datePicker.setDate(todo[extension]);

    datePicker.show();

    attachToElement.addEventListener("changeDate", function() {

      // ******************************************************
      // add due date to todo object or remove a given one if no date is passed
      // ******************************************************

      const date = datePicker.getDate();

      // fill in due date
      if(date) {
        todo[extension] = date;
        todo[extension + "String"] = formatDate(date);
      // reset due date in object
      } else {
        todo[extension] = undefined;
        todo[extension + "String"] = undefined;
      }

      // ******************************************************
      // if a todo is passed, it will be edited
      // ******************************************************

      if(!addDateToElement) {

        // get position of current todo in array
        const index = items.objects.map(function(item) { return item; }).indexOf(todo);

        // finally pass new todo on for changing
        editTodo(index, todo);

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Datepicker used to change a date"]);

      // ******************************************************
      // if no todo is passed, the result will be put into input field
      // ******************************************************

      } else {

        // if a due date is set, the recurrence picker will be shown);
        modalFormInput.value = todo.toString();

        // put focus on input field
        modalFormInput.focus();

        // resize the due date input field after date was added
        resizeInput(document.getElementById("datePickerInput"));

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
      }

    });

    // close datepicker when container loses focus
    attachToElement.onblur = function() { datePicker.destroy(); }

    // destroy datepicker on Escape
    attachToElement.onkeyup = function(event) { if(event.key === "Escape") datePicker.destroy(); }

    return Promise.resolve("Success: " + extension + " datepicker intance created");

  } catch(error) {
    error.functionName = createDatepickerInstance.name;
    return Promise.reject(error);
  }

}

export { createDatepickerInstance };
