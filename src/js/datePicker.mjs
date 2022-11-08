// ******************************************************
// creates a new datepicker instance and attaches it to an element
// either fills in the modal form input or saves new date to an existant todo if it was passed
// destroyes datepicker instance when datepicker container looses focus
// ******************************************************

"use strict";

import { userData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
import { convertDate } from "./date.mjs";
import { generateTodoTxtObject, items, editTodo } from "./todos.mjs";
import Datepicker from "../../node_modules/vanillajs-datepicker/js/Datepicker.js";
import de from "../../node_modules/vanillajs-datepicker/js/i18n/locales/de.js";
import it from "../../node_modules/vanillajs-datepicker/js/i18n/locales/it.js";
import es from "../../node_modules/vanillajs-datepicker/js/i18n/locales/es.js";
import fr from "../../node_modules/vanillajs-datepicker/js/i18n/locales/fr.js";
Object.assign(Datepicker.locales, de, it, es, fr);

const datePickerInput = document.getElementById("datePickerInput");
const datePickerResult = document.getElementById("datePickerResult");
datePickerResult.innerHTML = translations.dueDate;

let 
  extension,
  modalFormInput,
  datePicker,
  datePickerOptions = {
    autohide: false,
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

function fillDatePickerInput(todo) {
  // empty it
  datePickerResult.innerHTML = "";

  const dateTypes = ["due", "t"];
  dateTypes.forEach(function(type) {
    if(!todo[type]) return false;
    datePickerResult.innerHTML += `<span class="prefix">${type}:</span>${todo[type + "String"]}&nbsp;`;
  });
  // if it's still empty fill it with placeholder text
  if(datePickerResult.innerHTML === "") datePickerResult.innerHTML = translations.formSelectDueDate;

  // put focus on input field
  document.getElementById("modalFormInput").focus();

}

async function createDatepickerInstance(attachToElement, addDateToElement, extension, todo ) {

  try {

    const applyDate = function() {
      
      // ******************************************************
      // if a todo is passed, it will be edited
      // ******************************************************

      if(!addDateToElement) {

        // get position of current todo in array
        const index = items.objects.map(function(item) { return item; }).indexOf(todo);

        // finally pass new todo on for changing
        editTodo(index, todo).then(response => {
          console.log(response)
        }).catch(error => {
          console.log(error);
        });

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Datepicker used to change a date"]);

      // ******************************************************
      // if no todo is passed, the result will be put into input field
      // ******************************************************

      } else {

        document.getElementById("modalFormInput").value = todo.toString();

        fillDatePickerInput(todo);

        // resize the due date input field after date was added
        resizeInput(datePickerInput);

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Datepicker used to add date to input"]);
      }

    }

    // ******************************************************
    // prepare todo object if none has been passed
    // ******************************************************

    if(!todo) {
      // generate the object of input value, so we don't overwrite previous inputs of user
      todo = await generateTodoTxtObject(document.getElementById("modalFormInput").value).then(response => {
        return response;
      }).catch(error => {
        handleError(error);
      });
    }

    // if there is an active datepicker, it will be destroyed
    if(datePicker) datePicker.destroy();

    // ******************************************************
    // create datepicker instance
    // ******************************************************

    datePicker = await new Datepicker(attachToElement, datePickerOptions);
    if(todo.due) datePicker.setDate(todo.due);

    // close datepicker when container loses focus
    attachToElement.onblur = function() { datePicker.destroy(); }

    // destroy datepicker on Escape
    attachToElement.onkeyup = function(event) { if(event.key === "Escape") datePicker.destroy(); }

    // insert due and threshold buttons
    const header = document.createRange().createContextualFragment(`
    <div class="dateSwitcher tabs is-centered">
      <ul>
        <li class="is-active">
          <a href="#">Due</a>
        </li>
        <li>
          <a href="#">Threshold</a>
        </li>
      </ul>
    </div>`);
    const datepickerContainer = document.querySelector(".datepicker .datepicker-picker");
    const firstChild = document.querySelector(".datepicker .datepicker-picker .datepicker-header");
    datepickerContainer.insertBefore(header, firstChild);
    const tabs = datepickerContainer.querySelectorAll("li");
    const dueButton = tabs[0];
    const thresholdButton = tabs[1];

    // add header
    datepickerContainer.insertBefore(header, firstChild);

    dueButton.addEventListener("click", function(event) {
      datePicker.setDate();
      if(todo.due) datePicker.setDate(todo.due);
      this.classList.add("is-active");
      tabs[1].classList.remove("is-active");
      extension = "due";
    });

    thresholdButton.addEventListener("click", function(event) {
      datePicker.setDate();
      if(todo.t) datePicker.setDate(todo.t);
      this.classList.add("is-active");
      tabs[0].classList.remove("is-active");
      extension = "t";
    });

    // intercept the clear button event
    const clearButton = datepickerContainer.querySelector(".clear-btn");
    clearButton.addEventListener("click", function(event) {
      event.stopImmediatePropagation();
      delete todo[extension];
      delete todo[extension + "String"];
      applyDate(todo, addDateToElement);
    });

    datepickerContainer.addEventListener("click", async function(event) {

      if(!event.target.classList.contains("datepicker-cell")) return false;
      //if(event.target.indexOf(".datepicker-cell.day.selected.focused")) console.log(true);

      //const date = datePicker.getDate();
      const date = await datePicker.getDate();

      if(date) {
        todo[extension] = date;
        todo[extension + "String"] = convertDate(date);
      }
      applyDate(todo, addDateToElement);
    });

    datePicker.show();

    return Promise.resolve("Success: " + extension + " datepicker intance created");

  } catch(error) {
    error.functionName = createDatepickerInstance.name;
    return Promise.reject(error);
  }

}

export { createDatepickerInstance, fillDatePickerInput };
