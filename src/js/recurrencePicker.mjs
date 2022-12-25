"use strict";
import { userData, translations } from "../render.js";
import { handleError } from "./helper.mjs";
import { _paq } from "./matomo.mjs";
import { resizeInput } from "./form.mjs";
import { RecExtension } from "./todotxtExtensions.mjs";
import { generateTodoTxtObject, items, editTodo } from "./todos.mjs";
import * as recurrences from "./recurrences.mjs";

const radioRecurrence = document.querySelectorAll("#recurrencePickerContainer .selection");
const recurrencePickerContainer = document.getElementById("recurrencePickerContainer");
const recurrencePickerInput = document.getElementById("recurrencePickerInput");
const recurrencePickerSpinner = document.getElementById("recurrencePickerSpinner");
const recurrencePickerDay = document.getElementById("recurrencePickerDay");
const recurrencePickerBusinessDay = document.getElementById("recurrencePickerBusinessDay");
const recurrencePickerWeek = document.getElementById("recurrencePickerWeek");
const recurrencePickerMonth = document.getElementById("recurrencePickerMonth");
const recurrencePickerYear = document.getElementById("recurrencePickerYear");
const recurrencePickerEvery = document.getElementById("recurrencePickerEvery");
const recurrencePickerNoRecurrence = document.getElementById("recurrencePickerNoRecurrence");

recurrencePickerBusinessDay.innerHTML = translations.bday;
recurrencePickerWeek.innerHTML = translations.week;
recurrencePickerMonth.innerHTML = translations.month;
recurrencePickerDay.innerHTML = translations.day;
recurrencePickerYear.innerHTML = translations.year;
recurrencePickerNoRecurrence.innerHTML = translations.noRecurrence;
recurrencePickerEvery.innerHTML = translations.every;
recurrencePickerInput.value = translations.noRecurrence;

recurrencePickerInput.onfocus = function(element) {
  // only like this compatible with body click event in event.mjs
  setTimeout(function() {
    showRecurrences(element.target, document.getElementById("modalFormInput").value);
  }, 200);
};

recurrencePickerInput.onchange = function() {
  resizeInput(this).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
}

export function setInput(recurrence) {
  try {
    let recSplit = recurrences.splitRecurrence(recurrence);
    let label;
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
      recurrencePickerInput.value = label;
    } else {
      recurrencePickerInput.value = translations.noRecurrence;
    }

    resizeInput(recurrencePickerInput);
    
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Recurrence selected: " + label]);
    
    return label;

  } catch(error) {
    error.functionName = setInput.name;
    return Promise.reject(error);
  }
}
export async function showRecurrences(trigger, todo) {

  // get position of current todo in array
  const index = items.objects.map(function(item) { return item; }).indexOf(todo);

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

    setInput(value);

    if(trigger.id === "recurrencePickerInput") {
      document.getElementById("modalFormInput").value = todo.toString();
      document.getElementById("modalFormInput").focus();
      return false;
    }

    if(index === -1) return false;
    // finally pass new todo on for changing
    editTodo(index, todo).then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error);
    });

  }

  const elementBounds = trigger.getBoundingClientRect();
  recurrencePickerContainer.style.left = elementBounds.x + "px";
  recurrencePickerContainer.style.top = elementBounds.y + elementBounds.height + "px";
  recurrencePickerContainer.focus();
  recurrencePickerContainer.classList.toggle("is-active");

  document.getElementById("recurrencePickerIncrease").focus();
  
  // create object if input is string
  if(typeof todo === "string") todo = await generateTodoTxtObject(todo);

  let recSplit = recurrences.splitRecurrence(todo.rec);
  setRecurrenceOptionLabels(recSplit.mul);
  recurrencePickerSpinner.value = recSplit.mul;
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
      //document.getElementById("modalFormInput").focus();
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