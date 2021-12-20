export function createModalJail(modal) {
  // add all the elements inside modal which you want to make focusable
  const focusableElements = '[tabindex]:not([tabindex="-1"])';
  const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
  const focusableContent = modal.querySelectorAll(focusableElements);
  const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal
  let currentContextRow = 0;

  firstFocusableElement.focus();

  document.addEventListener("keydown", function(event) {
    // move focus down using arrow key down
    if(event.keyCode === 40) {
      if(modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
      // stop if end of todos is reached
      if(currentContextRow >= focusableContent.length-1) return false;
      currentContextRow++;
      let row = focusableContent[currentContextRow];
      row.focus();
      return false;
    }
    // move focus up using arrow key up
    if(event.keyCode === 38) {
      if(modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
      if(currentContextRow === 0) return false;
      currentContextRow--;
      let row = focusableContent[currentContextRow];
      row.focus();
      return false;
    }
    let isTabPressed = event.key === "Tab" || event.keyCode === 9;
    if (!isTabPressed) {
      return;
    }
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
