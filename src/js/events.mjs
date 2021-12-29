"use strict";
import { setUserData, translations, userData } from "../render.js";
import { resetFilters } from "./filters.mjs";
import { show } from "./form.mjs";
import { resetModal, closeTodoContext, handleError } from "./helper.mjs";
import { showContent } from "./content.mjs";
import { _paq } from "./matomo.mjs";
import { datePicker } from "./datePicker.mjs";
import { datePickerThreshold } from "./datePickerThreshold.mjs";

const a = document.querySelectorAll("a");
const body = document.getElementById("body");
const btnCopyToClipboard = document.querySelectorAll(".btnCopyToClipboard");
const btnFilesCreateTodoFile = document.getElementById("btnFilesCreateTodoFile");
const btnFilesOpenTodoFile = document.getElementById("btnFilesOpenTodoFile");
const btnAddTodoContainer = document.getElementById("btnAddTodoContainer");
const btnFiltersResetFilters = document.getElementById("btnFiltersResetFilters");
const btnNoResultContainerResetFilters = document.getElementById("btnNoResultContainerResetFilters");
const messageGenericContainerClose = document.getElementById("messageGenericContainerClose");
const modalForm = document.getElementById("modalForm");
const errorMessage = document.getElementById("errorMessage");
const filterContext = document.getElementById("filterContext");
const todoContext = document.getElementById("todoContext");
const btnMessageLogging = document.getElementById("btnMessageLogging");
const datePickerContainer = document.querySelector(".datepicker.datepicker-dropdown");

const modalBackground = document.querySelectorAll('.modal-background');
const modalClose = document.querySelectorAll('.close');
const cancel = document.querySelectorAll("[role='cancel']");
cancel.forEach(function(item) {
	item.innerHTML = translations.cancel;
});

export function register() {
  try {
    body.onclick = function(event) {
      // close datepicker if it's shown
      if(datePickerContainer.classList.contains("visible") && !datePickerContainer.contains(event.target)) {
        datePickerContainer.classList.remove("active");
        datePickerContainer.classList.remove("visible");        
      }
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
          closeTodoContext();
        }
      }
    }
    a.forEach(el => el.addEventListener("click", function(el) {
      if(el.target.href && el.target.href === "#") el.preventDefault();
    }));
    btnMessageLogging.onclick = function () {
      showContent("modalSettings");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Settings"]);
    }
    btnFilesCreateTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "create");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Change-Modal", "Click on Create file"]);
    }
    btnFilesOpenTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "open");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Change-Modal", "Click on Open file"]);
    }
    btnAddTodoContainer.onclick = function () {
      // just in case the form will be cleared first
      resetModal().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      show();
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
    }
    btnCopyToClipboard.forEach(function(el) {
      el.onclick = function () {
        window.api.send("copyToClipboard", [errorMessage.innerHTML]);
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Error-Container", "Click on Copy to clipboard"]);
      }
    });
    btnFiltersResetFilters.onclick = function() {
      resetFilters(true);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
    }
    btnNoResultContainerResetFilters.onclick = function() {
      resetFilters(true);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "No Result Container", "Click on reset button"])
    }
	// event for all cancel buttons
    cancel.forEach(function(el) {
      el.onclick = function(event) {
        event.preventDefault;
        el.parentElement.parentElement.parentElement.parentElement.classList.remove("is-active");
        resetModal().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Form", "Click on Cancel"]);
      }
    });
    messageGenericContainerClose.onclick = function() {
      this.parentElement.classList.remove("is-active")
    }
    modalBackground.forEach(function(el) {
      el.onclick = function() {
        const modalObject = document.getElementById(el.parentElement.id);
        if(modalObject.id==="modalPrompt") return false;
        // if modal is modalForm and input is equal the data item
        if(modalObject.id === "modalForm" && modalForm.getAttribute("data-item") !== document.getElementById("modalFormInput").value) {
          prompt.getConfirmation(resetModal, translations.modalBackgroundAttention, modalObject);
        } else {
          resetModal(modalObject).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
        }
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Background"]);
      }
    });
    modalClose.forEach(function(el) {
      el.onclick = function() {
        if(el.getAttribute("data-message")) {
          // persist closed message, so it won't show again
          if(!userData.dismissedMessages.includes(el.getAttribute("data-message"))) userData.dismissedMessages.push(el.getAttribute("data-message"))
          setUserData("dismissedMessages", userData.dismissedMessages);
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Close"]);
        } else {
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Modal", "Click on Close"]);
        }
        el.parentElement.parentElement.classList.remove("is-active");
      }
    });
    return Promise.resolve("Success: Events registered");
  } catch(error) {
    error.functionName = register.name;
    return Promise.reject(error);
  }
}