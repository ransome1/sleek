"use strict";

import { buildTable, translations } from "../render.js";
import { setupInterface, handleError } from "./helper.mjs";
import { showDrawer } from "./drawer.mjs";
import { resetFilters } from "./filters.mjs";
import { triggerToggle } from "./toggles.mjs";

//const helper = await import("./helper.mjs");
//const render = await import("../render.js");

// receives todo.txt data from main process as string and passes it to build function
window.api.receive("buildTable", (args) => {
  buildTable(...args).then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
});

window.api.receive("triggerFunction", async (name, args) => {
  try {

    if(!args) args = new Array;

    switch(name) {
      case "showOnboarding":
        const onboarding = await import("../js/onboarding.mjs");
        onboarding.showOnboarding(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showForm":
        var form = await import("../js/form.mjs");
        form.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showGenericMessage":
        const messages = await import("../js/messages.mjs");
        messages.showGenericMessage(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "archiveTodos":
        const prompt = await import("../js/prompt.mjs");
        const todos = await import("../js/todos.mjs");
        prompt.getConfirmation(todos.archiveTodos, translations.archivingPrompt);
        break;
      case "showDrawer":
        showDrawer(document.getElementById("navBtnFilter")).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "handleError":
        handleError(...args);
        break;
      case "resetFilters":
        resetFilters(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showModal":
        const content = await import("../js/content.mjs");
        content.showModal(args[0]).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "setupInterface":
        setupInterface().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "toggle":
        triggerToggle(document.getElementById(...args), true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
    }
  } catch(error) {
    error.functionName = "triggerFunction";
    return Promise.reject(error);
  }
});