"use strict";

// counts all tabable elements
// limits tabbing to those elements until modal is closed
// works also backwards using shift + tab
// loops when finished
export function createModalJail(modal) {
  try {

    if(typeof modal !== "object") return Promise.resolve("Info: No modal passed, can't create jail");

    const 
      focusableElements = "[tabindex=\"0\"]:not([tabindex=\"-1\"])",
      focusableContent = modal.querySelectorAll(focusableElements),
      firstFocusableElement = modal.querySelectorAll(focusableElements)[0],
      lastFocusableElement = focusableContent[focusableContent.length - 1];

    // add focus on the first focusable element
    firstFocusableElement.focus();

    modal.onkeydown = function(event) {

      // if tab key and shift are pressed
      if(event.key === "Tab" && event.shiftKey) {
        if(document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          //event.preventDefault();
          return false;
        }

      // if tab key is pressed
      } else if(event.key === "Tab") {
        if(document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          //event.preventDefault();
          return false;
        }
      }
    }

    return Promise.resolve("Success: Created jail for " + modal.id);

  } catch(error) {
    error.functionName = createModalJail.name;
    return Promise.reject(error);
  }
}