"use strict";

export function createModalJail(modal) {

  const 
    focusableElements = "[tabindex]:not([tabindex=\"-1\"])",
    focusableContent = modal.querySelectorAll(focusableElements),
    firstFocusableElement = modal.querySelectorAll(focusableElements)[0],
    lastFocusableElement = focusableContent[focusableContent.length - 1];

  // add focus on the first focusable element
  firstFocusableElement.focus();

  modal.addEventListener("keydown", function(event) {

    // continue only if tab is pressed
    if(event.key !== "Tab") return false;

    // if tab key and shift are pressed
    if(event.shiftKey) {
      if(document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        event.preventDefault();
        return false;
      }
    // if tab key is pressed
    } else {
      if(document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
        return false;
      }
    }
  });
}