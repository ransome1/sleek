"use strict";

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
          helper.handleError(error);
        });
        break;
      case "showForm":
        var form = await import("../js/form.mjs");
        form.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "archiveTodos":
        var prompt = await import("../js/prompt.mjs");
        prompt.getConfirmation(todos.archiveTodos, await getTranslation("archivingPrompt"));
        break;
      case "showDrawer":
        var drawer = await import("../js/drawer.mjs");
        drawer.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "handleError":
        helper.handleError(...args);
        break;
      case "resetFilters":
        filters.resetFilters(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "showModal":
        const content = await import("../js/content.mjs");
        content.showModal(args[0]).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "setupInterface":
        helper.setupInterface().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "toggleDarkmode":
        helper.toggleDarkmode().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "toggle":
        const toggles = await import("../js/toggles.mjs");
        toggles.triggerToggle(document.getElementById(...args), true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
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
		helper.handleError(error);
	});
});