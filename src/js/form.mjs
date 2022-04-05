"use strict";
import { _paq } from "./matomo.mjs";
import { createModalJail } from "./jail.mjs";
import { generateFilterData } from "./filters.mjs";
import { handleError } from "./helper.mjs";
import { items, item, setTodoComplete, generateTodoTxtObject } from "./todos.mjs";
import { getCaretPosition } from "./helper.mjs";
import { showRecurrences, setInput } from "./recurrencePicker.mjs";
import { userData, setUserData, translations } from "../render.js";

const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const btnItemStatus = document.getElementById("btnItemStatus");
const btnSave = document.getElementById("btnSave");
const datePickerInput = document.getElementById("datePickerInput");
const modalForm = document.getElementById("modalForm");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalFormInput = document.getElementById("modalFormInput");
const modalFormInputResize = document.getElementById("modalFormInputResize");
const priorityPicker = document.getElementById("priorityPicker");
const todoContext = document.getElementById("todoContext");

btnSave.innerHTML = translations.save;
btnCancel.innerHTML = translations.cancel;
datePickerInput.placeholder = translations.formSelectDueDate;

btnItemStatus.onclick = async function() {
  try {
    // pass data item to function, not the actual value
    const todo = await generateTodoTxtObject(modalForm.getAttribute("data-item")).then(response => {
      return response;
    }).catch(error => {
      handleError(error);
    });

    setTodoComplete(todo).then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });

    // clear and close form
    resetForm().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Done/In progress"]);

    return false;

  } catch(error) {
    error.functionName = "btnItemStatus.onclick";
    handleError(error);
    return Promise.reject(error);
  }
}

modalFormInputResize.onclick = function() {
  try {
    // pass input type of this element
    replaceInput(this.getAttribute("data-input-type")).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      handleError(error);
    });

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Resize"]);

    return false;

  } catch(error) {
    error.functionName = "modalFormInputResize.onclick";
    handleError(error);
    return Promise.reject(error);
  }
}

modalForm.onsubmit = async function(event) {
  try {
    
    event.preventDefault();

    const modalFormInput = document.getElementById("modalFormInput");

    // if available it indicates that a todo is edited and NOT added
    const dataItem = modalForm.getAttribute("data-item");

    // in case there hasn't been a passed data item, we just push the input value as a new item into the array
    // replace new lines with spaces (https://stackoverflow.com/a/34936253)
    const inputValue = modalFormInput.value.replaceAll(/[\r\n]+/g, String.fromCharCode(16));

    // create todo object from input value
    let todo = await generateTodoTxtObject(inputValue).then(response => {
      return response;
    }).catch(error => {
      handleError(error);
    });

    // we add the current date to the start date attribute of the todo.txt object
    if(userData.appendStartDate) todo.date = new Date();

    // check if todo already exists 
    let index;
    // get the index for EDITING
    if(dataItem) {
      index = items.objects.map(function(item) { return item.toString(); }).indexOf(dataItem);  
    // get the index for checking for duplicates
    } else {
      index = items.objects.map(function(item) { return item.toString(); }).indexOf(todo.toString());
    }

    // handle warnings in case of false user input
    // only while adding we check and prevent duplicate todo
    if(!dataItem && index !== -1) {
      modalFormAlert.innerHTML = translations.formInfoDuplicate;
      modalFormAlert.parentElement.classList.add("is-active", "is-warning");
      console.log("Info: Todo already exists in file, won't write duplicate");
      return false;
  
    // check if todo text is empty
    } else if(!todo.text) {
      modalFormAlert.innerHTML = translations.formInfoIncomplete;
      modalFormAlert.parentElement.classList.add("is-active", "is-warning");
      console.log("Info: Todo is incomplete");
      return false;
    }

    // adding: append a new item to array
    // edit: use index to replace the existing item
    (index === -1 && !dataItem) ? items.objects.push(todo) : items.objects.splice(index, 1, todo);

    // mark the todo for anchor jump after next reload
    item.previous = todo;

    // send file to main process to save it
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);

    // close and clean up the modal
    resetForm().then(function(response) {
      console.log(response);
    }).catch(function(error) {
      handleError(error);
    });

    console.log("Success: Changes written to file");

    return false;

  } catch(error) {
    error.functionName = "modalForm.onsubmit";
    handleError(error);
    return Promise.reject(error);
  }
}

priorityPicker.onchange = function() {
  try {
    setPriority(this.value).then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Priority selected: " + this.value]);

  } catch(error) {
    error.functionName = "priorityPicker.onchange";
    handleError(error);
    return Promise.reject(error);
  }
}

datePickerInput.onchange = function() {
  resizeInput(this).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
}

datePickerInput.onfocus = async function() {
  const datePicker = await import("./datePicker.mjs");
  datePicker.createDatepickerInstance(this, true, "due").then(() => {
    console.log("Success: Date picker created")
  }).catch(error => {
    handleError(error);
  });
}

function addInputEvents(element) {
  try {
    element.oninput = function(event) {

      // if textarea is used adjust input size
      if(userData.useTextarea) {
        resizeInput(element).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      }
  
      const caretPosition = getCaretPosition(element);
      const inputValue = element.value;
      let autoCompleteCategory = "";
      let autoCompletePrefix = "";
      let autoCompleteValue ="";
      
      // TODO: describe
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
        return false;
      }

      // TODO: can/should this be done in filters.mjs?
      // map prefix to category
      if(autoCompletePrefix === "+") {
        autoCompleteCategory = "projects";
      } else if(autoCompletePrefix === "@") {
        autoCompleteCategory = "contexts";
      } else {
        // interrupt in case no filter is being asked for
        return false;
      }

      // align autocomplete container with input field
      positionAutoCompleteContainer().then(response => {
        console.log(response);
      }).catch (error => {
        handleError(error);
      });

      // parsed data will be passed to generate filter data and build the filter buttons
      generateFilterData(autoCompleteCategory, autoCompleteValue, autoCompletePrefix, caretPosition).then(response => {
        console.log(response);
      }).catch (error => {
        handleError(error);
      });

      return false;

    }

    element.onfocus = function() {
      modalForm.classList.add("is-focused");
      
      // hide autocomplete container 
      autoCompleteContainer.blur();
      autoCompleteContainer.innerHTML = "";
      autoCompleteContainer.classList.remove("is-active");
    }

    element.onblur = function() {
      modalForm.classList.remove("is-focused");
    }

    element.onkeydown = function(event) {
      // submit form with Ctrl/CMD and Enter
      if(event.key==="Enter" && (event.ctrlKey || event.metaKey)) {
         btnSave.click();
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Pressed Ctrl/CMD and Enter for Submit"]);
      }
    }

    return Promise.resolve("Info: Events added to input field");

  } catch(error) {
    error.functionName = setupInput.name;
    return Promise.reject(error);
  }
}

// aligns width of container with width of input element
// is positioned at the bottom of the input field with a negative offset
function positionAutoCompleteContainer() {
  try {
    
    const modalFormInput = document.getElementById("modalFormInput");
    
    // Adjust position of suggestion box to input field
    const modalFormInputPosition = modalFormInput.getBoundingClientRect();

    autoCompleteContainer.style.width = modalFormInput.offsetWidth + "px";
    autoCompleteContainer.style.top = modalFormInputPosition.bottom - 30 + "px";
    autoCompleteContainer.style.left = modalFormInputPosition.left + "px";

    return Promise.resolve("Info: Position of autocomplete container adjusted");

  } catch(error) {
    error.functionName = positionAutoCompleteContainer.name;
    return Promise.reject(error);
  }
}

async function resizeInput() {
  try {

    // loop through passed objects
    for(let i = 0; i < arguments.length; i++) {
      const input = await arguments[i];

      // skip if passed element is not an object
      if(typeof input !== "object") continue;

      if(input.tagName==="TEXTAREA" && input.id==="modalFormInput") {
        input.style.height = "auto";
        input.style.height = await input.scrollHeight + "px";
      }

      // just using inputs value is not enough to determine visual length, we need additional length
      let additionalLength = 6;

      // Chinese and Japanese need additional extra lengths
      if(userData.language === "jp" || userData.language === "zh") additionalLength = 11;
      
      // adjust input size to its value
      if(input.id !== "modalFormInput" && input.value) {
        input.style.width = input.value.length + additionalLength + "ch";
      // adjust input size to its placeholder when value is not available
      } else if(input.id !== "modalFormInput" && !input.value && input.placeholder) {
        input.style.width = input.placeholder.length + additionalLength + "ch";
      }
    }

    return Promise.resolve("Success: Input element(s) resized");

  } catch (error) {
    error.functionName = resizeInput.name;
    return Promise.reject(error);
  }
}

async function setPriority(priority) {
  try {
    const modalFormInput = document.getElementById("modalFormInput");
    let index = 0;
    
    let todo = await generateTodoTxtObject(modalFormInput.value).then(response => {
      return response;
    }).catch(error => {
      handleError(error);
    });

    // get index if priority was already found in object
    if(todo.priority) index = todo.priority.toLowerCase().charCodeAt(0)-96;

    // in this case priority will be added or substracted by 1
    if(typeof priority === "number") {

      // add the passed value to index
      index += priority;

      // in case desired option is out of alphabet we stop
      if(index <= 0 || index >= 27) return Promise.resolve("Info: Priority unchanged");

      priorityPicker.selectedIndex = index;
      todo.priority = priorityPicker.value;

    // in this case only select value according to whatever had been passed
    } else if(typeof priority === "string" && priority !== "") {
      priorityPicker.value = priority;
      todo.priority = priorityPicker.value;

    // if argument is undefined or if string is empty priority will be removed
    } else {
      priorityPicker.selectedIndex = 0;
      todo.priority = null;
    }

    // write back to input
    modalFormInput.value = todo.toString();

    modalFormInput.focus();

    return Promise.resolve("Info: Priority changed to: " + todo.priority);

  } catch(error) {
    error.functionName = setPriority.name;
    return Promise.reject(error);
  }
}

function resetForm() {
  try {

    const modalFormInput = document.getElementById("modalFormInput");
    
    // clear the content in the input field as it's not needed anymore
    modalFormInput.value = null;

    // remove is-active from modal
    modalForm.classList.remove("is-active");

    // remove any previously set data-item attributes
    modalForm.removeAttribute("data-item");

    // hide "complete" button
    btnItemStatus.classList.remove("is-active");

    // select first element in priority picker
    priorityPicker.querySelectorAll("option")[0].selected = "selected";

    // empty datepicker input element
    datePickerInput.value = null;

    // if recurrence picker was open it is now being closed
    recurrencePickerContainer.classList.remove("is-active");

    // clear previous recurrence selection
    recurrencePickerInput.value = null;

    // hide autocomplete container
    autoCompleteContainer.classList.remove("is-active");

    // clean up the alert box
    modalFormAlert.parentElement.classList.remove("is-active", "is-warning", "is-danger");
    modalFormAlert.innerHTML = null;
  
    return Promise.resolve("Success: Form closed and cleaned up");

  } catch (error) {
    error.functionName = resetForm.name;
    return Promise.reject(error);
  }
}

async function show(todo, templated) {
  try {

    const modalFormInput = document.getElementById("modalFormInput");

    // hide "complete" button
    btnItemStatus.classList.add("is-hidden");

    //
    if(todo) {
      // we need to check if there already is a due date in the object
      todo = await generateTodoTxtObject(todo).then(response => {
        return response;
      }).catch(error => {
        handleError(error);
      });

      // set the priority
      if(todo.priority) priorityPicker.value = todo.priority;
      
      // this is a new templated todo task
      if(templated) {  
        // erase the original creation date and description
        if(userData.appendStartDate) todo.date = new Date();
        todo.text = "____________";
        modalFormInput.value = todo.toString();
        
        // automatically select the placeholder description
        let selectStart = modalFormInput.value.indexOf(todo.text);
        let selectEnd = selectStart + todo.text.length;
        modalFormInput.setSelectionRange(selectStart, selectEnd);

      // edit todo view
      } else {

        // show "complete" button
        btnItemStatus.classList.remove("is-hidden");

        // only show the complete button on open items
        (todo.complete) ? btnItemStatus.innerHTML = translations.inProgress : btnItemStatus.innerHTML = translations.done;

        const value = todo.toString();

        // pass todo string to form data item
        modalForm.setAttribute("data-item", value);

        // if textarea is being used replace invisible multiline ascii character with new line
        (userData.useTextarea) ? modalFormInput.value = value.replaceAll(String.fromCharCode(16),"\r\n") : modalFormInput.value = value;

      }

      // if there is a recurrence
      if(todo.rec) setInput(todo.rec)
      // if so we paste it into the input field
      if(todo.dueString) datePickerInput.value = todo.dueString;
    }
    
    // resize all necessary input elements
    resizeInput(modalFormInput, datePickerInput, recurrencePickerInput).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });
    
    // create the modal jail, so tabbing won't leave modal
    createModalJail(modalForm).then(function(result) {
      console.log(result);
    }).catch(function(error) {
      handleError(error);
    });

    // show modal and set focus to input element
    modalForm.classList.add("is-active");
    
    // put focus into the input field
    modalFormInput.focus();

    return Promise.resolve("Info: Show/Edit todo window opened");

  } catch (error) {
    error.functionName = show.name;
    return Promise.reject(error);
  }
}

// replaces the current input element with another one
// input vs textarea
// adds all neccessary events and attributes, as they get lost with replacement
async function replaceInput(type) {
  try {

    // detect element on each run
    let modalFormInput = await document.getElementById("modalFormInput");

    // replace line breaks with unique character that can be stored
    const value = await modalFormInput.value.replaceAll("\n", String.fromCharCode(16));

    let newInputElement;

    // switch the type by replacing elemnt
    switch (type) {
      case "input":
        newInputElement = document.createElement("textarea");
        newInputElement.value = value.replaceAll(String.fromCharCode(16),"\r\n");
        newInputElement.placeholder = translations.todoTxtSyntax;
        modalFormInputResize.setAttribute("data-input-type", "textarea");
        modalFormInputResize.innerHTML = "<i class=\"fas fa-compress-alt\"></i>";
        setUserData("useTextarea", true);
        break;
      case "textarea":
        newInputElement = document.createElement("input");
        newInputElement.value = value;
        newInputElement.type = "text";
        newInputElement.placeholder = translations.todoTxtSyntax;
        modalFormInputResize.setAttribute("data-input-type", "input");
        modalFormInputResize.innerHTML = "<i class=\"fas fa-expand-alt\"></i>";
        setUserData("useTextarea", false);
        break;
    }
    newInputElement.id = "modalFormInput";
    newInputElement.setAttribute("tabindex", 0);
    newInputElement.setAttribute("class", "input is-medium");
    modalFormInput.replaceWith(newInputElement);

    // reinitialse the element for further usage
    modalFormInput = await document.getElementById("modalFormInput");

    // reposition the autocomplete container
    positionAutoCompleteContainer().then(result => {
      console.log(result);
    }).catch (error => {
      handleError(error);
    });

    // resize textarea only
    if(userData.useTextarea) {
      resizeInput(modalFormInput).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        handleError(error);
      });
    }

    // add on-events to new input element
    await addInputEvents(modalFormInput).then(result => {
      console.log(result);
    }).catch (error => {
      handleError(error);
    });

    // finally set focus on input
    modalFormInput.focus();

    return Promise.resolve("Success: Input type changed to: " + modalFormInput.type);

  } catch (error) {
    error.functionName = replaceInput.name;
    return Promise.reject(error);
  }
}

// repositions autocomplete container when sleeks window size is changed
window.onresize = function() {
  try {
    // only continue when container is visible
    if(autoCompleteContainer.classList.contains("is-active")) {
      positionAutoCompleteContainer().then(result => {
        console.log(result);
      }).catch (error => {
        handleError(error);
      });
    }
  } catch(error) {
    error.functionName = "window.onresize";
    handleError(error);
    return Promise.reject(error);
  }
}

addInputEvents(modalFormInput).then(function(result) {
  console.log(result);
}).catch(function(error) {
  handleError(error);
});

// switch to textarea if needed
if(userData.useTextarea) {
  replaceInput("input").then(response => {
    console.log(response);
  }).catch (error => {
    handleError(error);
  });
}

export { show, resizeInput, setPriority, resetForm};
