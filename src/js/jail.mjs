"use strict";

export function createModalJail(modal) {
  // add all the elements inside modal which you want to make focusable
  let currentElement = 0;
  // stop if jail has to be removed
  if(!modal) return false;
  const focusableElements = "[tabindex]:not([tabindex=\"-1\"])";
  const focusableContent = modal.querySelectorAll(focusableElements);
  // only continue if there is anything to jail
  if(focusableContent.length === 0) return false;
  const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
  const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

  firstFocusableElement.focus();

  document.addEventListener("keydown", function(event) {
    const isInputFocused = document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput";
    // interrupt with any other key is pressed
    if (!isInputFocused) {
      // setup navigation with arrow keys
      // move focus down using arrow key down
      if(event.keyCode === 40 || event.keyCode === 39) {
        // stop if end of todos is reached
        if(currentElement >= focusableContent.length-1) return false;
        currentElement++;
        let row = focusableContent[currentElement];
        row.focus();
        return false;
      }
      // move focus up using arrow key up
      if(event.keyCode === 38 || event.keyCode === 37) {
        if(currentElement === 0) return false;
        currentElement--;
        let row = focusableContent[currentElement];
        row.focus();
        return false;
      }
    }
    let isTabPressed = event.key === "Tab" || event.keyCode === 9;
    if (!isTabPressed) {
      return false;
    } else {
      currentElement++;
    }
    // set the first tab
    if (event.shiftKey) { // if shift key pressed for shift + tab combination
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus(); // add focus for the last focusable element
        event.preventDefault();
      }
    } else { // if tab key is pressed
      if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
        firstFocusableElement.focus(); // add focus for the first focusable element
        event.preventDefault();
      }
    }
  });
}
