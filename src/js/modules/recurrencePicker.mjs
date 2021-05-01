"use strict";
import { resizeInput, translations, handleError } from "../../render.js";
import * as recurrences from "./recurrences.mjs";
const radioRecurrence = document.querySelectorAll("#recurrencePicker .selection");
export const recurrencePickerInput = document.getElementById("recurrencePickerInput");
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
            label = recurrencePickerDay;
            break;
          case "w":
            label = recurrencePickerWeek;
            break;
          case "m":
            label = recurrencePickerMonth;
            break;
          case "y":
            label = recurrencePickerYear;
            break;
        }
        label = translations.every + " " + recSplit.mul + " " + label.innerHTML;
      } else {
        switch (recSplit.period) {
          case "d":
            label = translations.daily;
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
    if(window.consent) _paq.push(["trackEvent", "Form", "Recurrence selected: " + label]);
    return Promise.resolve("Success: Recurrence added");
  } catch(error) {
    error.functionName = setInput.name;
    return Promise.reject(error);
  }
}
function showRecurrences(el) {
  recurrencePickerContainer.focus();
  recurrencePickerContainer.classList.toggle("is-active");
  // get object from current input
  let todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new HiddenExtension(), new RecExtension() ]);
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
    modalFormInput.value = todo.toString();
  }
  recurrencePickerSpinner.onchange = function() {
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  recurrencePickerIncrease.onclick = function(el) {
    el.preventDefault();
    recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value) + 1;
    recSplit.mul = Number(recurrencePickerSpinner.value);
    setRecurrenceOptionLabels(recSplit.mul);
    applyRecurrenceValue();
  }
  recurrencePickerDecrease.onclick = function(el) {
    el.preventDefault();
  	if (parseInt(recurrencePickerSpinner.value) > 1) {
  	  recurrencePickerSpinner.value = parseInt(recurrencePickerSpinner.value) - 1;
      recSplit.mul = Number(recurrencePickerSpinner.value);
      setRecurrenceOptionLabels(recSplit.mul);
      applyRecurrenceValue();
    }
  }
  radioRecurrence.forEach(function(el) {
    // remove old selection
    el.checked = false;
    // set pre selection
    if(recSplit.period === el.value) el.checked = true;
    el.onclick = function() {
      recSplit.period = el.value;
      applyRecurrenceValue();
      // hide the picker
      recurrencePickerContainer.classList.remove("is-active");
      modalFormInput.focus();
      // trigger matomo event
      if(window.consent) _paq.push(["trackEvent", "Form", "Recurrence selected: " + recSplit.period]);
    }
  });
}
function setRecurrenceOptionLabels(mul) {
  if(mul>1) {
    recurrencePickerDay.innerHTML = translations.day_plural;
    recurrencePickerWeek.innerHTML = translations.week_plural;
    recurrencePickerMonth.innerHTML = translations.month_plural;
    recurrencePickerYear.innerHTML = translations.year_plural;
  } else {
    recurrencePickerDay.innerHTML = translations.day;
    recurrencePickerWeek.innerHTML = translations.week;
    recurrencePickerMonth.innerHTML = translations.month;
    recurrencePickerYear.innerHTML = translations.year;
  }
}
