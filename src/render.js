"use strict";
let 
  appData,
  events,
  filters,
  helper,
  keyboard,
  matomo,
  messages,
  onboarding,
  todos,
  translations,
  userData;

function startFileWatcher(file) {
  try {
    window.api.send("startFileWatcher", file);
    return new Promise(function(resolve) {
      return window.api.receive("startFileWatcher", function(response) {
        resolve(response);
      });
    });
  } catch(error) {
    error.functionName = startFileWatcher.name;
    return Promise.reject(error);
  }
}
async function setUserData(key, value) {
  try {
    userData[key] = value;
    userData = await window.api.invoke("userData", [key, value]);
    return Promise.resolve("Success: User data persisted for " + key + " with value: " + value);
  } catch(error) {
    error.functionName = setUserData.name;
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
    error.functionName = getTranslations.name;
    return Promise.reject(error);
  }
}
async function buildTable(fileContent, loadAll) {

    // start timer for table
    const t0 = performance.now();

    // refresh user data on each build
    userData = await window.api.invoke("userData");

    await todos.generateTodoTxtObjects(fileContent).then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    })

    //in case something is wrong with the items object, build process is interrupted
    if(typeof todos.items !== "object") throw(new Error("Info: No todo.txt data found, starting onboarding"))

    // apply persisted filters and update object key "filtered"
    filters.applyFilters().then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    });

    // if there is a queryString, we pass it on for additional filtering
    const queryString = document.getElementById("todoTableSearch").value;
    if(queryString.length > 0) filters.applySearchInput(queryString).then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    })
    
    // once we have the filtered objects, we can adjust the gui
    helper.setupInterface().then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    });

    // build the filters in drawer and autocomplete container
    filters.generateFilterData().then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    });
    
    // Group filtered todo.txt objects and add them to items object
    todos.generateGroupedObjects().then(function(response) {
      console.log(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // finally build the table based on filtered (and grouped) data 
    return todos.generateTable(loadAll).then(function() {
      return Promise.resolve("Success: Table build in " + (performance.now() - t0) + "ms");
    }).catch(function(error) {
      helper.handleError(error);
    });

}

window.onload = async function() {
  try {
    // start timer for app
    const a0 = performance.now();

    userData = await window.api.invoke("userData");
    appData = await window.api.invoke("appData");
    
    translations = await getTranslations();
    onboarding = await import("./js/onboarding.mjs");
    helper = await import("./js/helper.mjs");
    todos = await import("./js/todos.mjs");
    filters = await import("./js/filters.mjs");
    await import("./js/ipc.mjs");
    import("./js/navigation.mjs");
    import("./js/search.mjs");

    // if active file is available, ask main process to start a file watcher
    if(typeof userData.files === "object" && helper.getActiveFile()) {
      startFileWatcher(helper.getActiveFile()).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        helper.handleError(error);
      });

    // or start onboarding
    } else {
      onboarding.showOnboarding(true).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        helper.handleError(error);
      });
    }

    helper.initialSetupInterface().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    messages = await import("./js/messages.mjs");
    messages.checkDismissedMessages().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    events = await import("./js/events.mjs");
    events.registerEvents().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // load keyboard shortcuts
    keyboard = await import("./js/keyboard.mjs");
    keyboard.registerShortcuts().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // handle matomo tracking at last
    matomo = await import("./js/matomo.mjs");
    matomo.configureMatomo().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // stop timer for app
    console.info("App built in", performance.now() - a0, "ms");

  } catch(error) {
    error.functionName = window.onload;
    return Promise.reject(error);
  }    
}

export { setUserData, buildTable, userData, appData, translations, startFileWatcher };
