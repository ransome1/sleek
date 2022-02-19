"use strict";
import { userData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";

const messageGenericContainer = document.getElementById("messageGenericContainer");
const messageGenericMessage = document.getElementById("messageGenericMessage");
const messageLoggingBody = document.getElementById("messageLoggingBody");
const messageLoggingButton = document.getElementById("messageLoggingButton");
const messageLoggingTitle = document.getElementById("messageLoggingTitle");
const messageShareBody = document.getElementById("messageShareBody");
const messageShareTitle = document.getElementById("messageShareTitle");

messageLoggingBody.innerHTML = translations.messageLoggingBody;
messageLoggingButton.innerHTML = translations.settings;
messageLoggingTitle.innerHTML = translations.errorEventLogging;
messageShareBody.innerHTML = translations.messageShareBody;
messageShareTitle.innerHTML = translations.messageShareTitle;

export function checkDismissedMessages() {
  try {
    const availableMessages = document.querySelectorAll("#messages .message");
    if(!userData.dismissedMessages) return Promise.resolve("Info: No already checked messages found, will skip this check");
    availableMessages.forEach((message) => {
      (userData.dismissedMessages.includes(message.getAttribute("data"))) ? message.classList.remove("is-active") : message.classList.add("is-active");
    });
    return Promise.resolve("Info: Checked for already dismissed messages");
  } catch(error) {
    error.functionName = checkDismissedMessages.name;
    return Promise.reject(error);
  }
}

export function showGenericMessage(text) {
  try {
    if(text) {
      messageGenericContainer.classList.add("is-active");
      messageGenericMessage.innerHTML = text;
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Message", text])
    }
  } catch(error) {
    error.functionName = handleError.name;
    return Promise.reject(error);
  }
}