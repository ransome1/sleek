"use strict";
let 
  helper,
  translations,
  appData,
  userData;

function getUserData() {
  try {
    window.api.send("userData");
    return new Promise(function(resolve) {
      return window.api.receive("userData", function(userData) {
        resolve(userData);
      });
    });
  } catch(error) {
    error.functionName = getUserData.name;
    return Promise.reject(error);
  }
}
function startFileWatcher(file, isTabItem) {
  try {
    window.api.send("startFileWatcher", [file, isTabItem]);
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
function setUserData(key, value) {
  try {
    userData[key] = value;
    // don't persist any data in testing environment
    if(appData.environment === "testing") {
      return Promise.resolve("Info: In testings no user data will be persisted");
    }

    window.api.send("userData", [key, value]);

    return new Promise(function(resolve) {
      return window.api.receive("userData", function(data) {
        userData = data;
        resolve("Success: User data persisted for " + key + " with value: " + value);
      });
    });
  } catch(error) {
    error.functionName = setUserData.name;
    return Promise.reject(error);
  }
}
function getAppData() {
  try {
    window.api.send("appData");
    return new Promise(function(resolve) {
      return window.api.receive("appData", (appData) => {
        resolve(appData);
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
    error.functionName = getTranslations.name;
    return Promise.reject(error);
  }
}
async function buildTable(fileContent, loadAll) {
  try {
    // start timer for table
    const t0 = performance.now();

    // refresh user data on each build
    userData = await getUserData();

    // pass new todo file content on to function that will produce todo.txt objects
    // function will put it into items object
    // only generate items if new content is passed
    const todos = await import("./js/todos.mjs");
    if(fileContent) await todos.generateTodoTxtObjects(fileContent).then(function() {
      console.log("Success: Passed on file content to create todo.txt objects")
    }).catch(function(error) {
      helper.handleError(error);
    })

    //in case something is wrong with the items object, build process is interrupted
    if(typeof todos.items !== "object") throw(new Error("Info: No todo.txt data found, starting onboarding"))

    // import filter module only when needed
    const filters = await import("./js/filters.mjs");

    // apply persisted filters and update object key "filtered"
    await filters.filterItems().then(function(response) {
      console.log(response)
    }).catch(function(error) {
      helper.handleError(error);
    });
    
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
    await todos.generateGroupedObjects().then(function(response) {
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

  } catch(error) {
    
    const onboarding = await import("./js/onboarding.mjs");
    onboarding.showOnboarding(true).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    const messages = await import("./js/messages.mjs");
    messages.showGenericMessage(error);

    error.functionName = buildTable.name;
    return Promise.reject(error);
  }
}

window.onload = async function() {
  try {
    // start timer for app
    const a0 = performance.now();

    userData = await getUserData();
    appData = await getAppData();
    translations = await getTranslations();  
    helper = await import("./js/helper.mjs");
    await import("./js/ipc.mjs");
    import("./js/navigation.mjs");
    import("./js/search.mjs");

    // if active file is available, ask main process to start a file watcher
    if(typeof userData.files === "object") {
      startFileWatcher(helper.getActiveFile(), 0).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        helper.handleError(error);
      });

    // or start onboarding
    } else {
      const onboarding = await import("./js/onboarding.mjs");      
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

    const messages = await import("./js/messages.mjs");
    messages.checkDismissedMessages().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    const events = await import("./js/events.mjs");
    events.registerEvents().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // load keyboard shortcuts
    const keyboard = await import("./js/keyboard.mjs");
    keyboard.registerShortcuts().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      helper.handleError(error);
    });

    // handle matomo tracking at last
    const matomo = await import("./js/matomo.mjs");
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

export { getUserData, setUserData, buildTable, userData, appData, translations, startFileWatcher };
