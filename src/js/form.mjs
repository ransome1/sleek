"use strict";
import "../../node_modules/jstodotxt/jsTodoExtensions.js";
import { userData, setUserData, translations } from "../render.js";
import { handleError } from "./helper.mjs";
import { _paq } from "./matomo.mjs";
import { RecExtension, SugarDueExtension, ThresholdExtension } from "./todotxtExtensions.mjs";
import { generateFilterData } from "./filters.mjs";
import { items, item, setTodoComplete, createTodoObject } from "./todos.mjs";
import { createModalJail } from "./jail.mjs";
import { resetModal } from "./helper.mjs";
import { showRecurrences, setInput } from "./recurrencePicker.mjs";

const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalForm = document.getElementById("modalForm");
const modalFormInputLabel = document.getElementById("modalFormInputLabel");
const modalFormInputResize = document.getElementById("modalFormInputResize");
const priorityPicker = document.getElementById("priorityPicker");
const btnSave = document.getElementById("btnSave");
const btnItemStatus = document.getElementById("btnItemStatus");
const todoContext = document.getElementById("todoContext");

btnSave.innerHTML = translations.save;
modalFormInputLabel.innerHTML = translations.todoTxtSyntax;

btnItemStatus.onclick = function() {
  setTodoComplete(modalForm.getAttribute("data-item")).then(response => {
    resetModal().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    console.log(response);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);
  }).catch(error => {
    handleError(error);
  });
}
modalFormInputResize.onclick = function() {
  toggleInputSize(this.getAttribute("data-input-type"));
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Resize"]);
}
btnSave.onclick = function() {
  submitForm().then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Submit"]);
}
modalFormInput.addEventListener("keyup", modalFormInputEvent);
modalFormInput.addEventListener("keydown", () => {
  keyDown();
});
modalFormInput.onfocus = function() {
  modalForm.classList.add("is-focused");
}
modalFormInput.onblur = function() {
  modalForm.classList.remove("is-focused");
}
modalForm.addEventListener("submit", function(event) {
  event.preventDefault;
});
// modalForm.addEventListener ("click", function() {
//   // close recurrence picker if click is outside of recurrence container
//   if(!event.target.closest("#recurrencePickerContainer") && event.target!=recurrencePickerInput) document.getElementById("recurrencePickerContainer").classList.remove("is-active")
// });
priorityPicker.addEventListener("change", e => {
  setPriority(e.target.value).then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });
});
// priorityPicker.onfocus = function() {
//   // close suggestion box if focus comes to priority picker
//   autoCompleteContainer.classList.remove("is-active");
// };
// TODO add try and catch
function keyDown() {
  // regular submit
  if(modalFormInput.type !=="textarea" && event.key === "Enter") {
    submitForm().then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Pressed Enter for Submit"]);
  }

  // submit form with Ctrl/CMD and Enter
  if(event.key==="Enter" && (event.ctrlKey || event.metaKey)) {
    submitForm().then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Pressed Ctrl/CMD and Enter for Submit"]);
  }
}
function getCaretPosition(inputId) {
  var content = inputId;
  if((content.selectionStart!=null)&&(content.selectionStart!=undefined)){
    var position = content.selectionStart;
    return position;
  } else {
    return false;
  }
}
function positionAutoCompleteContainer() {
  // Adjust position of suggestion box to input field
  let modalFormInputPosition = modalFormInput.getBoundingClientRect();
  autoCompleteContainer.style.width = modalFormInput.offsetWidth + "px";
  autoCompleteContainer.style.top = modalFormInputPosition.top + modalFormInput.offsetHeight - 40 + "px";
  autoCompleteContainer.style.left = modalFormInputPosition.left + "px";
}
async function modalFormInputEvent() {
  positionAutoCompleteContainer();
  resizeInput(modalFormInput);
  let autoCompleteValue ="";
  let autoCompletePrefix = "";
  let caretPosition = getCaretPosition(modalFormInput);
  let autoCompleteCategory = "";
  let inputValue = modalFormInput.value;
  if((inputValue.charAt(caretPosition-2) === " " || inputValue.charAt(caretPosition-2) === "\n") && (inputValue.charAt(caretPosition-1) === "@" || inputValue.charAt(caretPosition-1) === "+")) {
    autoCompleteValue = inputValue.substr(caretPosition, inputValue.lastIndexOf(" ")).split(" ").shift();
    autoCompletePrefix = inputValue.charAt(caretPosition-1);
  } else if(inputValue.charAt(caretPosition) === " ") {
    autoCompleteValue = inputValue.substr(inputValue.lastIndexOf(" ", caretPosition-1)+2).split(" ").shift();
    autoCompletePrefix = inputValue.charAt(inputValue.lastIndexOf(" ", caretPosition-1)+1);
  } else if(inputValue.charAt(inputValue.lastIndexOf(" ", caretPosition)+1) === "@" || inputValue.charAt(inputValue.lastIndexOf(" ", caretPosition)+1) === "+") {
    autoCompleteValue = inputValue.substr(inputValue.lastIndexOf(" ", caretPosition)+2).split(" ").shift();
    autoCompletePrefix = inputValue.charAt(inputValue.lastIndexOf(" ", caretPosition)+1);
  } else {
    autoCompleteContainer.classList.remove("is-active");
    autoCompleteContainer.blur();
    return false;
  }
  // suppress suggestion box if caret is at the end of word
  if(autoCompletePrefix==="+" || autoCompletePrefix==="@") {
    if(autoCompletePrefix==="+") {
      autoCompleteCategory = "projects";
    } else if(autoCompletePrefix=="@") {
      autoCompleteCategory = "contexts";
    }
    // parsed data will be passed to generate filter data and build the filter buttons
    await generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix, caretPosition).then(response => {
      // jail the auto complete container
      console.log(response);
    }).catch (error => {
      handleError(error);
    });
  } else {
    autoCompleteContainer.classList.remove("is-active");
    autoCompleteContainer.blur();
  }
}
// TODO add try catch
async function resizeInput(input) {
  if(input.tagName==="TEXTAREA" && input.id==="modalFormInput") {
    input.style.height = "auto"
    await input.scrollHeight;
    input.style.height = input.scrollHeight+"px";
    return false;
  } else if (input.type==="text" && input.id==="modalFormInput") {
    return false;
  }
  let additionalLength = 6;
  if(userData.language === "jp" || userData.language === "zh") additionalLength = 11;
  if(input.value) {
    input.style.width = input.value.length + additionalLength + "ch";
  } else if(!input.value && input.placeholder) {
    input.style.width = input.placeholder.length + additionalLength + "ch";
  }
}
function setPriority(priority) {
  try {
    const setPriorityInput = function(priority) {
      if(priority===null) {
        priorityPicker.selectedIndex = 0;
      } else {
        Array.from(priorityPicker.options).forEach(function(option) {
          if(option.value===priority) {
            priorityPicker.selectedIndex = option.index;
          }
        });
      }
    }
    let todo = createTodoObject(modalFormInput.value);
    if((priority==="down" || priority==="up") && !todo.priority) {
      todo.priority = "A";
    } else if(priority==="up" && todo.priority!="a") {
      todo.priority = String.fromCharCode(todo.priority.charCodeAt(0)-1).toUpperCase();
    } else if(priority==="down" && todo.priority!="z") {
      todo.priority = String.fromCharCode(todo.priority.charCodeAt(0)+1).toUpperCase();
    } else if(priority && priority.match(/[A-Z]/i)) {
      todo.priority = priority.toUpperCase();
    } else {
      todo.priority = null;
    }
    if(todo.priority===null || todo.priority.match(/[a-z]/i)) {
      modalFormInput.value = todo.toString();
      setPriorityInput(todo.priority);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Priority changed to: " + todo.priority]);
      return Promise.resolve("Success: Priority changed to " + todo.priority)
    }
    return Promise.resolve("Info: Priority unchanged")
  } catch(error) {
    error.functionName = setPriority.name;
    return Promise.reject(error);
  }
}
function setDueDate(days) {
  try {
    const todo = new TodoTxtItem(modalFormInput.value, [ new DueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
    if(days===0) {
      todo.due = undefined;
      todo.dueString = undefined;
    } else if(days && todo.due) {
      todo.due = new Date(new Date(todo.dueString).setDate(new Date(todo.dueString).getDate() + days));
      todo.dueString = todo.due.toISOString().substr(0, 10);
    } else if(days && !todo.due) {
      todo.due = new Date(new Date().setDate(new Date().getDate() + days));
      todo.dueString = todo.due.toISOString().substr(0, 10);
    }
    modalFormInput.value = todo.toString();
    return Promise.resolve("Success: Due date changed to " + todo.dueString)
  } catch(error) {
    error.functionName = setDueDate.name;
    return Promise.reject(error);
  }
}

function show(todo, templated) {
  try {  

    const datePickerInput = document.getElementById("datePickerInput");
    datePickerInput.placeholder = translations.formSelectDueDate;

    // adjust size of datepicker input
    resizeInput(datePickerInput);

    // create and show a datepicker instance to an input, when its focused
    datePickerInput.onfocus = async function() {
      const datePicker = await import("./datePicker.mjs");
      datePicker.createDatepickerInstance(this, false).then(response => {
        console.log("Success: Date picker created")
      }).catch(error => {
        handleError(error);
      });
    }

    // ******************************************************
    // setup recurrence picker
    // ******************************************************

    const recurrencePickerInput = document.getElementById("recurrencePickerInput");
    recurrencePickerInput.placeholder = translations.noRecurrence;

    //
    resizeInput(recurrencePickerInput);

    recurrencePickerInput.onfocus = function() {
      showRecurrences();
    }

    // remove any previously set data-item attributes
    modalForm.setAttribute("data-item", "");
    // adjust size of recurrence picker input field
    //datePickerInput.value = null;
    
    modalFormInput.value = null;
    modalFormAlert.innerHTML = null;
    modalFormAlert.parentElement.classList.remove("is-active", "is-warning", "is-danger");
    // close context menu
    todoContext.classList.remove("is-active");
    //
    if(todo) {
      // replace invisible multiline ascii character with new line
      // we need to check if there already is a due date in the object
      todo = createTodoObject(todo);
      // set the priority
      setPriority(todo.priority);
      //
      if(templated === true) {
        // this is a new templated todo task
        // erase the original creation date and description
        todo.date = new Date();
        todo.text = "____________";
        modalFormInput.value = todo.toString();
        //modalTitle.innerHTML = translations.addTodo;
        // automatically select the placeholder description
        let selectStart = modalFormInput.value.indexOf(todo.text);
        let selectEnd = selectStart + todo.text.length;
        modalFormInput.setSelectionRange(selectStart, selectEnd);
        btnItemStatus.classList.add("is-hidden");
      } else {
        // pass todo string to form data item
        modalForm.setAttribute("data-item", todo.toString());
        // this is an existing todo task to be edited
        modalFormInput.value = todo.toString();
        btnItemStatus.classList.remove("is-hidden");
      }
      // only show the complete button on open items
      if(todo.complete === false) {
        btnItemStatus.innerHTML = translations.done;
      } else {
        btnItemStatus.innerHTML = translations.inProgress;
      }
      // if there is a recurrence
      if(todo.rec) {
        setInput(todo.rec).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // if so we paste it into the input field
      if(todo.dueString) {
        datePickerInput.value = todo.dueString;
      }
    } else {
      btnItemStatus.classList.add("is-hidden");
    }
    // switch to textarea if needed
    if(userData.useTextarea) toggleInputSize("input");
    // adjust size of picker inputs
    //resizeInput(datePickerInput);
    
    // create the modal jail, so tabbing won't leave modal
    createModalJail(modalForm);
    // show modal and set focus to input element
    modalForm.classList.add("is-active");
    // put focus into the input field
    // TODO: Seem to not work
    modalFormInput.focus();
    return Promise.resolve("Info: Show/Edit todo window opened");
  } catch (error) {
    error.functionName = show.name;
    return Promise.reject(error);
  }
}
function submitForm() {
  try {
    // check if there is an input in the text field, otherwise indicate it to the user
    // input value and data item are the same, nothing has changed, nothing will be written
    if(modalForm.getAttribute("data-item") === modalFormInput.value) {
      // close and reset any modal
      resetModal().then(function(result) {
        console.log(result);
      }).catch(function(error) {
        handleError(error);
      });
      return Promise.resolve("Info: Nothing has changed, won't write anything.");
    // Edit todo
    } else if(modalForm.getAttribute("data-item")) {
      // get index of todo
      const index = items.objects.map(function(item) {return item.toString(); }).indexOf(modalForm.getAttribute("data-item"));
      // create a todo.txt object
      // replace new lines with spaces (https://stackoverflow.com/a/34936253)
      const inputValue = modalFormInput.value.replaceAll(/[\r\n]+/g, String.fromCharCode(16));
      let todo = createTodoObject(inputValue);
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = translations.formInfoDuplicate;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.resolve("Info: Todo already exists in file, won't write duplicate");
      // check if todo text is empty
      } else if(!todo.text && !todo.h) {
        modalFormAlert.innerHTML = translations.formInfoIncomplete;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.resolve("Info: Todo is incomplete");
      }
      // jump to index, remove 1 item there and add the value from the input at that position
      items.objects.splice(index, 1, todo);
    // Add todo
    } else if(!modalForm.getAttribute("data-item") && modalFormInput.value!="") {
      // in case there hasn't been a passed data item, we just push the input value as a new item into the array
      // replace new lines with spaces (https://stackoverflow.com/a/34936253)
      const inputValue = modalFormInput.value.replaceAll(/[\r\n]+/g, String.fromCharCode(16));
      let todo = createTodoObject(inputValue);
      // we add the current date to the start date attribute of the todo.txt object
      todo.date = new Date();
      // check and prevent duplicate todo
      if(items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString())!=-1) {
        modalFormAlert.innerHTML = translations.formInfoDuplicate;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.resolve("Info: Todo already exists in file, won't write duplicate");
      // check if todo text is empty
      } else if(!todo.text && !todo.h) {
        modalFormAlert.innerHTML = translations.formInfoIncomplete;
        modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
        modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
        return Promise.resolve("Info: Todo is incomplete");
      }
      // we build the array
      items.objects.push(todo);
      // mark the todo for anchor jump after next reload
      item.previous = todo.toString();
    } else if(modalFormInput.value=="") {
      modalFormAlert.innerHTML = translations.formInfoNoInput;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-danger');
      modalFormAlert.parentElement.classList.add("is-active", 'is-warning');
      return Promise.resolve("Info: Will not write empty todo");
    }
    //write the data to the file
    // a newline character is added to prevent other todo.txt apps to append new todos to the last line
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);
    // close and reset any modal
    resetModal().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Submit"]);
    return Promise.resolve("Success: Changes written to file");
  // if the input field is empty, let users know
  } catch (error) {
    // if writing into file is denied throw alert
    modalFormAlert.innerHTML = translations.formErrorWritingFile;
    modalFormAlert.parentElement.classList.add("is-active", 'is-danger');
    error.functionName = submitForm.name;
    return Promise.reject(error);
  }
}
function toggleInputSize(type) {
  let newInputElement;
  let value = "";
  if(modalFormInput.value!=="") {
    value = modalFormInput.value.replaceAll("\n", String.fromCharCode(16));
  }
  switch (type) {
    case "input":
      newInputElement = document.createElement("textarea");
      newInputElement.value = value.replaceAll(String.fromCharCode(16),"\r\n");
      modalFormInputResize.setAttribute("data-input-type", "textarea");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-compress-alt\"></i>";
      setUserData("useTextarea", true);
      break;
    case "textarea":
      newInputElement = document.createElement("input");
      newInputElement.value = value;
      newInputElement.type = "text";
      modalFormInputResize.setAttribute("data-input-type", "input");
      modalFormInputResize.innerHTML = "<i class=\"fas fa-expand-alt\"></i>";
      setUserData("useTextarea", false);
      break;
  }
  newInputElement.id = "modalFormInput";
  newInputElement.setAttribute("tabindex", 0);
  newInputElement.setAttribute("class", "input is-medium");
  // replace old element with the new one
  modalFormInput.replaceWith(newInputElement);
  positionAutoCompleteContainer();
  resizeInput(modalFormInput);
  modalFormInput.onfocus = function() {
    modalForm.classList.add("is-focused");
  }
  modalFormInput.onblur = function() {
    modalForm.classList.remove("is-focused");
  }
  modalFormInput.focus();
  createModalJail(modalForm);

  modalFormInput.addEventListener("keydown", () => {
    keyDown();
  });
  modalFormInput.addEventListener("keyup", () => {
    keyUp();
  });
}

window.onresize = function() {
  try {
    positionAutoCompleteContainer();
  } catch(error) {
    error.functionName = "window.onresize";
    handleError(error);
    return Promise.reject(error);
  }
}

export { show, resizeInput, setPriority, setDueDate, submitForm, toggleInputSize, getCaretPosition};
