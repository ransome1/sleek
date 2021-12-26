"use strict";

let 
  a0,
  appData, 
  helper,
  translations, 
  onboarding,
  filters,
  userData,
  todos;
function getUserData() {
  try {
    window.api.send("userData");
    return new Promise(function(resolve) {
      return window.api.receive("userData", function(data) {
        resolve(data);
      });
    });
  } catch(error) {
    error.functionName = getUserData.name;
    return Promise.reject(error);
  }
}
function setUserData(key, value) {
  try {
    userData[key] = value;
    // don't persist any data in test
    if(appData.environment === "testing") {
      console.log("Info: In testings no user data will be persisted");
      return Promise.resolve();
    }
    window.api.send("userData", [key, value]);
    return Promise.resolve("Success: Config (" + key + ") persisted");
  } catch(error) {
    error.functionName = setUserData.name;
    return Promise.reject(error);
  }
}
function getAppData() {
  try {
    window.api.send("appData");
    return new Promise(function(resolve) {
      return window.api.receive("appData", (data) => {
        resolve(data);
      });
    });
  } catch(error) {
    error.functionName = getAppData.name;
    return Promise.reject(error);
  }
}
function getTranslations() {
  try {
    window.api.send("translations");
    return new Promise(function(resolve) {
      return window.api.receive("translations", function(data) {
        resolve(data);
      });
    });
  } catch(error) {
    error.functionName = getUserData.name;
    return Promise.reject(error);
  }
}
async function startBuilding(loadAll) {
  try {
    const t0 = performance.now();
    todos.items.filtered = await filters.filterItems(todos.items.objects);
    await filters.generateFilterData();
    const groups = await todos.generateGroups(todos.items.filtered);
    userData = await getUserData();
    await todos.generateTable(groups, loadAll);
    await helper.configureMainView();
    window.api.send("update-badge", helper.getBadgeCount());
    console.info("Table build:", performance.now() - t0, "ms");
  } catch(error) {
    error.functionName = startBuilding.name;
    return Promise.reject(error);
  }
}
window.onload = async function () {
  a0 = performance.now();
  userData = await getUserData();
  appData = await getAppData();
  translations = await getTranslations();
  todos = await import("./js/todos.mjs");
  filters = await import("./js/filters.mjs");
  const keyboard = await import("./js/keyboard.mjs");
  helper = await import("./js/helper.mjs");
  const events = await import("./js/events.mjs");
  const messages = await import("./js/messages.mjs");
  onboarding = await import("./js/onboarding.mjs");
  if(userData.files && userData.files.length > 0 && helper.getActiveFile()) {
    window.api.send("startFileWatcher", [helper.getActiveFile(), 0]);
  } else {
    onboarding.showOnboarding(true).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });
  }
  helper.setTheme().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    helper.handleError(error);
  });
  messages.checkDismissedMessages().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    helper.handleError(error);
  });
  events.register().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    helper.handleError(error);
  });
  keyboard.registerShortcuts().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    helper.handleError(error);
  });
  import("./js/navigation.mjs");
  import("./js/search.mjs");
  const matomo = await import("./js/matomo.mjs");
  matomo.configureMatomo().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    helper.handleError(error);
  });
  console.info("App build:", performance.now() - a0, "ms");
}
window.api.receive("triggerFunction", async (name, args) => {
  try {
    if(!args) args = new Array;
    switch (name) {
      case "showOnboarding":
        onboarding.showOnboarding(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "showForm":
        var form = await import("./js/form.mjs");
        form.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "resetModal":
        helper.resetModal(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "archiveTodos":
        var prompt = await import("./js/prompt.mjs");
        prompt.getConfirmation(todos.archiveTodos, translations.archivingPrompt);
        break;
      case "showDrawer":
        var drawer = await import("./js/drawer.mjs");
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
      case "toggle":
        var view = await import("./js/view.mjs");
        view.toggle(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "showContent":
        var content = await import("./js/content.mjs");
        content.showContent(args[0]).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          helper.handleError(error);
        });
        break;
      case "setTheme":
        helper.setTheme(...args).then(function(response) {
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
window.api.receive("refresh", async (args) => {
  todos.generateItems(args[0]).then(function() {
    startBuilding(args[1]);
  }).catch(function(error) {
    helper.handleError(error);
  });
});
export { setUserData, startBuilding, userData, appData, translations };
