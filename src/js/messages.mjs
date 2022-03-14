"use strict";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";
import { showModal } from "./content.mjs";
import { userData, translations } from "../render.js";

const btnMessageLogging = document.getElementById("btnMessageLogging");
const messages = document.getElementById("messages");
const messageGenericContainer = document.getElementById("messageGenericContainer");
const messageGenericTitle = document.getElementById("messageGenericTitle");
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

btnMessageLogging.onclick = function () {
  showModal("modalSettings").then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Settings"]);
}

export function checkDismissedMessages() {
  try {
    const availableMessages = document.querySelectorAll("#messages .message");
    if(!userData.dismissedMessages) return Promise.resolve("Info: No already checked messages found, will skip this check");
    availableMessages.forEach((message) => {
      if(message.id === "messageGenericContainer") return false;
      (userData.dismissedMessages.includes(message.getAttribute("data"))) ? message.classList.remove("is-active") : message.classList.add("is-active");
    });
    return Promise.resolve("Info: Checked for already dismissed messages");
  } catch(error) {
    error.functionName = checkDismissedMessages.name;
    return Promise.reject(error);
  }
}

export function showGenericMessage(text, autoClose) {
  try {
    
    if(!text) return Promise.reject("Error: No text passed, can't copy anything to clipboard");
    
    messageGenericContainer.classList.add("is-active");
    messageGenericMessage.innerHTML = text;

    // if number, hide the container after 3 seconds
    if(typeof autoClose === "number") {
      setTimeout(function() {
        messageGenericContainer.classList.remove("is-active");
      }, autoClose * 1000);
    }

    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Success: Text copied to clipboard"])

    return Promise.resolve("Success: Todo text copied to clipboard");

  } catch(error) {
    error.functionName = handleError.name;
    return Promise.reject(error);
  }
}

// function showMessage(id, title, body, autoClose) {
//   try {

//     messages.innerHTML += `
//       <article class="message fixed is-active" data="${id}">
//         <div class="message-header">
//           <p>${title}</p>
//           <button class="delete close" role="cancel" data-message="${id}" tabindex="-1"></button>
//         </div>
//         <div class="message-body">
//           <p>${body}</p>
//         </div>
//       </article>`;

//     // trigger matomo event
//     if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Success: Text copied to clipboard"])

//     //return Promise.resolve("Success: Todo text copied to clipboard");

//   } catch(error) {
//     error.functionName = showMessage.name;
//     return Promise.reject(error);
//   }
// }

// export function fetchMessages() {
//   try {

//     const fetchPromise = fetch("https://www.robbfolio.de/dev/fetch.json", {
//       method: "POST",
//       cache: "no-cache",
//       headers: {
//         "Content-Type": "application/json"
//       }
//     });

//     fetchPromise
//       .then(response => {
//         if(!response.ok) throw new Error(`HTTP error: ${response.status}`)
//         return response.json();
//       })
//       .then(json => {
//         if(typeof json !== "object") throw new Error("Error: Data is not an JSON object")
//         let l = json.messages.length;
//         for(let i = 0; i < l; i++) showMessage(json.messages[i].id, json.messages[i].title, json.messages[i].body, 10)
//       });

//   } catch(error) {
//     error.functionName = checkDismissedMessages.name;
//     return Promise.reject(error);
//   }
// }

// fetchMessages();