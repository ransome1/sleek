"use strict";
import { translations, userData } from "../render.js";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
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
datePickerInput.onfocus = function () {
  datePicker.update();
  autoCompleteContainer.classList.remove("is-active");
  resizeInput(datePickerInput);
};
datePickerInput.addEventListener("changeDate", function (e) {
  // we only update the object if there is a date selected. In case of a refresh it would throw an error otherwise
  if(e.detail.date) {
    // generate the object on what is written into input, so we don't overwrite previous inputs of user
    let todo = new TodoTxtItem(document.getElementById("modalFormInput").value, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
    todo.due = new Date(e.detail.date);
    todo.dueString = new Date(e.detail.date.getTime() - (e.detail.date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
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
  }
});
datePickerInput.placeholder = translations.formSelectDueDate;
Object.assign(Datepicker.locales, de, it, es, fr);
const datePicker = new Datepicker(datePickerInput, {
  autohide: true,
  language: userData.language,
  format: "yyyy-mm-dd",
  clearBtn: true,
  beforeShowDay: function(date) {
    let today = new Date();
    if (date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()) {
      return { classes: 'today'};
    }
  }
});
document.querySelector(".datepicker .clear-btn").onclick = function() {
  let todo = new TodoTxtItem(document.getElementById("modalFormInput").value, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
  todo.due = undefined;
  todo.dueString = undefined;
  document.getElementById("modalFormInput").value = todo.toString();
  resizeInput(datePickerInput);
  datePicker.hide();
}
export { datePickerInput, datePicker};
