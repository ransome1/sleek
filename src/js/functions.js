export function showForm(todo, templated) {
  try {
      // in case a content window was open, it will be closed
      modal.forEach(function(el) {
        el.classList.remove("is-active");
      });
      // in case the more toggle menu is open we close it!3KL7jeuduikbngbkfuvgflctnfguvjfdtgdnngbbfnfbkhnbtetllfhndlknfnfj

      showMore(false);
      // clear the input value in case there was an old one
      modalFormInput.value = null;
      modalForm.classList.toggle("is-active");
      // clean up the alert box first
      modalFormAlert.innerHTML = null;
      modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
      // here we configure the headline and the footer buttons
      if(todo) {
        // replace invisible multiline ascii character with new line
        todo = todo.replaceAll(String.fromCharCode(16),"\r\n");
        // we need to check if there already is a due date in the object
        todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension() ]);
        // set the priority
        setPriorityInput(todo.priority);
        //
        if(templated === true) {
          // this is a new templated todo task
          // erase the original creation date and description
          todo.date = null;
          todo.text = "____________";
          modalFormInput.value = todo;
          modalTitle.innerHTML = window.translations.addTodo;
          // automatically select the placeholder description
          let selectStart = modalFormInput.value.indexOf(todo.text);
          let selectEnd = selectStart + todo.text.length;
          modalFormInput.setSelectionRange(selectStart, selectEnd);
          btnItemStatus.classList.remove("is-active");
        } else {
          // this is an existing todo task to be edited
          // put the initially passed todo to the modal data field
          modalForm.setAttribute("data-item", todo.toString());
          modalFormInput.value = todo;
          modalTitle.innerHTML = window.translations.editTodo;
          btnItemStatus.classList.add("is-active");
        }
        //btnItemStatus.classList.add("is-active");
        // only show the complete button on open items
        if(todo.complete === false) {
          btnItemStatus.innerHTML = window.translations.done;
        } else {
          btnItemStatus.innerHTML = window.translations.inProgress;
        }
        // if there is a recurrence
        if(todo.rec) {
          setRecurrenceInput(todo.rec).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
        }
        // if so we paste it into the input field
        if(todo.dueString) {
          dueDatePicker.setDate(todo.dueString);
          dueDatePickerInput.value = todo.dueString;
          // only show the recurrence picker when a due date is set
          recurrencePicker.classList.add("is-active");
        } else {
          // hide the recurrence picker when a due date is not set
          recurrencePicker.classList.remove("is-active");
          // if not we clean it up
          dueDatePicker.setDate({
            clear: true
          });
          dueDatePickerInput.value = null;
        }
      } else {
        // hide the recurrence picker when a due date is not set
        recurrencePicker.classList.remove("is-active");
        // if not we clean it up
        dueDatePicker.setDate({
          clear: true
        });
        dueDatePickerInput.value = null;
        modalTitle.innerHTML = window.translations.addTodo;
        btnItemStatus.classList.remove("is-active");
      }
      // adjust size of recurrence picker input field
      resizeInput(recurrencePickerInput);
      // adjust size of due date picker input field
      resizeInput(dueDatePickerInput);
      //resizeInput(recurrencePickerInput);
      // in any case put focus into the input field
      modalFormInput.focus();
      // if textarea, resize to content length
      if(modalFormInput.tagName==="TEXTAREA") {
        modalFormInput.style.height="auto";
        modalFormInput.style.height= modalFormInput.scrollHeight+"px";
      }
      positionAutoCompleteContainer();
      return Promise.resolve("Info: Show/Edit todo window opened");
  } catch (error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
