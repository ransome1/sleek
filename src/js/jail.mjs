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
      lastFocusableElement = focusableContent[focusableContent.length - 1],
      excludeModalFromArrowKeys = ["modalForm"];

    // add focus on the first focusable element
    firstFocusableElement.focus();

    modal.onkeydown = function(event) {

      // if arrow down key is pressed
      // we don't want this behaviour in modalForm
      if(event.key === "ArrowDown" && excludeModalFromArrowKeys.indexOf(modal.id) === -1) { 
        const focusedElementIndex = Array.prototype.indexOf.call(focusableContent, document.activeElement);
        // stop when the last element is reached and focus the first one
        if((focusedElementIndex + 1) === focusableContent.length) {
          firstFocusableElement.focus();
          return false;
        }
        focusableContent[focusedElementIndex + 1].focus();
        return false;
      }

      // if arrow up key is pressed
      // we don't want this behaviour in modalForm
      if(event.key === "ArrowUp" && excludeModalFromArrowKeys.indexOf(modal.id) === -1) {
        const focusedElementIndex = Array.prototype.indexOf.call(focusableContent, document.activeElement);
        // stop if the first element is reached and focus the last one
        if(focusedElementIndex === 0) {
          lastFocusableElement.focus();
          return false;
        }
        focusableContent[focusedElementIndex - 1].focus();
        return false;
      }

      // if tab key and shift are pressed
      if(event.key === "Tab" && event.shiftKey) {
        if(document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          return false;
        }

      // if tab key is pressed
      } else if(event.key === "Tab") {
        if(document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
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