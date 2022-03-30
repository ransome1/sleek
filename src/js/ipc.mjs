"use strict";

import { translations } from "../render.js";
import { handleError } from "./helper.mjs";
import { showDrawer } from "./drawer.mjs";
import { resetFilters } from "./filters.mjs";
import { triggerToggle } from "./toggles.mjs";

window.api.receive("triggerFunction", async (name, args) => {
  try {

    const helper = await import("./helper.mjs");

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
        helper.setupInterface().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "toggleDarkmode":
        triggerToggle(document.getElementById("darkmode"), true).then(function(response) {
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

// receives todo.txt data from main process as string and passes it to build function
window.api.receive("buildTable", async (args) => {
  const helper = await import("./helper.mjs");
	const render = await import("../render.js");
	render.buildTable(...args).then(function(response) {
		console.info(response);
	}).catch(function(error) {
		handleError(error);
	});
});