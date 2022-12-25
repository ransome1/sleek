"use strict";
import { setUserData, translations, userData } from "../render.js";
import { resetForm } from "./form.mjs";
import { handleError } from "./helper.mjs";
import { showModal } from "./content.mjs";
import { _paq } from "./matomo.mjs";
import { getConfirmation } from "./prompt.mjs";

const body = document.getElementById("body");
const modalForm = document.getElementById("modalForm");
const filterContext = document.getElementById("filterContext");
const todoContext = document.getElementById("todoContext");
const cancelButtons = document.querySelectorAll("[role='cancel']");

export function registerEvents() {
  try {
    body.addEventListener("click", async function(event) {

      // close todo context if click is outside of it
      if(filterContext.classList.contains("is-active")) {
        if(!filterContext.contains(event.target)) {
          filterContext.classList.remove("is-active");
          filterContext.removeAttribute("data-item");
        }
      }
      // close todo context if click is outside of it
      if(todoContext.classList.contains("is-active")) {
        if(!todoContext.contains(event.target)) {
          todoContext.classList.remove("is-active");
        }
      }
      // close recurrence picker container if click is outside of it
      if(recurrencePickerContainer.classList.contains("is-active")) {
        if(!recurrencePickerContainer.contains(event.target)) {
          recurrencePickerContainer.classList.remove("is-active");
        }
      }
    });

    // event for all cancel buttons
    cancelButtons.forEach(function(cancelButton) {
      cancelButton.onclick = function(event) {
        event.preventDefault();
        // in case this is a message, closing will be persisted
        if(cancelButton.getAttribute("data-message") && !userData.dismissedMessages.includes(cancelButton.getAttribute("data-message"))) {
          userData.dismissedMessages.push(cancelButton.getAttribute("data-message"));
          setUserData("dismissedMessages", userData.dismissedMessages);
        }
        const parentElement = this.closest(".modal, .message");
        parentElement.classList.remove("is-active");
        if(parentElement.id === "modalForm") {
          resetForm().then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
        }
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
      }
    });

    return Promise.resolve("Success: Events registered");

  } catch(error) {
    error.functionName = registerEvents.name;
    return Promise.reject(error);
  }
}