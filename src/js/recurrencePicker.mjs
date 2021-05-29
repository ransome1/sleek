"use strict";
import { userData, translations, handleError, _paq } from "../render.js";
import { resizeInput } from "./form.mjs";
import { RecExtension } from "./todotxtExtensions.mjs";
import * as recurrences from "./recurrences.mjs";
const modalFormInput = document.getElementById("modalFormInput");
const radioRecurrence = document.querySelectorAll("#recurrencePicker .selection");
const recurrencePickerContainer = document.getElementById("recurrencePickerContainer");
const recurrencePickerInput = document.getElementById("recurrencePickerInput");
const recurrencePickerSpinner = document.getElementById("recurrencePickerSpinner");
const recurrencePickerDay = document.getElementById("recurrencePickerDay");
recurrencePickerDay.innerHTML = translations.day;
const recurrencePickerBusinessDay = document.getElementById("recurrencePickerBusinessDay");
recurrencePickerBusinessDay.innerHTML = translations.bday;
const recurrencePickerWeek = document.getElementById("recurrencePickerWeek");
recurrencePickerWeek.innerHTML = translations.week;
const recurrencePickerMonth = document.getElementById("recurrencePickerMonth");
recurrencePickerMonth.innerHTML = translations.month;
const recurrencePickerYear = document.getElementById("recurrencePickerYear");
recurrencePickerYear.innerHTML = translations.year;
const recurrencePickerEvery = document.getElementById("recurrencePickerEvery");
recurrencePickerEvery.innerHTML = translations.every;
const recurrencePickerNoRecurrence = document.getElementById("recurrencePickerNoRecurrence");
recurrencePickerNoRecurrence.innerHTML = translations.noRecurrence;


resizeInput(recurrencePickerInput);
recurrencePickerInput.onfocus = function(el) { showRecurrences(el) };
recurrencePickerInput.placeholder = translations.noRecurrence;
export function setInput(recurrence) {
  try {
    let recSplit = recurrences.splitRecurrence(recurrence);
    let label = translations.noRecurrence;
    if(recSplit.period !== undefined) {
      if(recSplit.mul > 1) {
        switch (recSplit.period) {
          case "d":
            label = translations.day_plural;
            break;
          case "b":
            label = translations.bday_plural;
            break;
          case "w":
            label = translations.week_plural;
            break;
          case "m":
            label = translations.month_plural;
            break;
          case "y":
            label = translations.year_plural;
            break;
        }
        label = translations.every + " " + recSplit.mul + " " + label;
      } else {
        switch (recSplit.period) {
          case "d":
            label = translations.daily;
            break;
          case "b":
            label = translations.bdaily;
            break;  
          case "w":
            label = translations.weekly;
            break;
          case "m":
            label = translations.monthly;
            break;
          case "y":
            label = translations.yearly;
            break;
        }
      }
    }
    recurrencePickerInput.value = label;
    resizeInput(recurrencePickerInput);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Recurrence selected: " + label]);
    return Promise.resolve("Success: Recurrence added");
  } catch(error) {
    error.functionName = setInput.name;
    return Promise.reject(error);
  }
}
function showRecurrences() {
  recurrencePickerContainer.focus();
  recurrencePickerContainer.classList.toggle("is-active");
  // get object from current input
  let todo = new TodoTxtItem(document.getElementById("modalFormInput").value, [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
  let recSplit = recurrences.splitRecurrence(todo.rec);
  setRecurrenceOptionLabels(recSplit.mul);
  recurrencePickerSpinner.value = recSplit.mul;
  // function to apply recurrence's value on changes
  const applyRecurrenceValue = function() {
    let value = recSplit.toString();
    if(value !== undefined) {
      todo.rec = value;
      todo.recString = value;
    } else {
      // clear RecExtension
      todo.rec = undefined;
      todo.recString = undefined;
    }
    setInput(value).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    document.getElementById("modalFormInput").value = todo.toString();
  }
  recurrencePickerSpinner.onchange = function() {
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  document.getElementById("recurrencePickerIncrease").onclick = function(el) {
    el.preventDefault();
    recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value) + 1;
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  document.getElementById("recurrencePickerDecrease").onclick = function(el) {
    el.preventDefault();
    if(parseInt(recurrencePickerSpinner.value)>1) {
      recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value)-1;
      recSplit.mul = Number(recurrencePickerSpinner.value);
      setRecurrenceOptionLabels(recSplit.mul);
      applyRecurrenceValue();
    }
  }
  radioRecurrence.forEach(function(radioButton) {
    // remove old selection
    radioButton.checked = false;
    // set pre selection
    if(recSplit.period === radioButton.value) radioButton.checked = true;
    radioButton.onclick = function() {
      recSplit.period = radioButton.value;
      applyRecurrenceValue();
      // hide the picker
      recurrencePickerContainer.classList.remove("is-active");
      document.getElementById("modalFormInput").focus();
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Recurrence selected: " + recSplit.period]);
    }
  });
}
function setRecurrenceOptionLabels(mul) {
  if(mul>1) {
    recurrencePickerBusinessDay.innerHTML = translations.bday_plural;
    recurrencePickerDay.innerHTML = translations.day_plural;
    recurrencePickerWeek.innerHTML = translations.week_plural;
    recurrencePickerMonth.innerHTML = translations.month_plural;
    recurrencePickerYear.innerHTML = translations.year_plural;
  } else {
    recurrencePickerBusinessDay.innerHTML = translations.bday;
    recurrencePickerDay.innerHTML = translations.day;
    recurrencePickerWeek.innerHTML = translations.week;
    recurrencePickerMonth.innerHTML = translations.month;
    recurrencePickerYear.innerHTML = translations.year;
  }
}
