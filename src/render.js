"use strict";
import { isToday, isPast } from "./js/date.mjs";
import { createModalJail } from "./configs/modal.config.mjs";
// ########################################################################################################################
// DEFINE ELEMENTS
// ########################################################################################################################
const a = document.querySelectorAll("a");
const addTodoContainer = document.getElementById("addTodoContainer");
const addTodoContainerButton = document.getElementById("addTodoContainerButton");
const addTodoContainerHeadline = document.getElementById("addTodoContainerHeadline");
const addTodoContainerSubtitle = document.getElementById("addTodoContainerSubtitle");
const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const body = document.getElementById("body");
const btnCopyToClipboard = document.querySelectorAll(".btnCopyToClipboard");
const btnFilesCreateTodoFile = document.getElementById("btnFilesCreateTodoFile");
const btnFilesOpenTodoFile = document.getElementById("btnFilesOpenTodoFile");
const btnFiltersResetFilters = document.getElementById("btnFiltersResetFilters");
const btnMessageLogging = document.getElementById("btnMessageLogging");
const cancel = document.querySelectorAll("[role='cancel']");
const btnNoResultContainerResetFilters = document.getElementById("btnNoResultContainerResetFilters");
const btnOnboardingCreateTodoFile = document.getElementById("btnOnboardingCreateTodoFile");
const btnOnboardingOpenTodoFile = document.getElementById("btnOnboardingOpenTodoFile");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const btnSave = document.getElementById("btnSave");
const errorMessage = document.getElementById("errorMessage");
const filterContext = document.getElementById("filterContext");
const messageLoggingBody = document.getElementById("messageLoggingBody");
const messageLoggingButton = document.getElementById("messageLoggingButton");
const messageLoggingTitle = document.getElementById("messageLoggingTitle");
const messageShareBody = document.getElementById("messageShareBody");
const messageShareTitle = document.getElementById("messageShareTitle");
const messageGenericContainer = document.getElementById("messageGenericContainer");
const messageGenericMessage = document.getElementById("messageGenericMessage");
const messageGenericContainerClose = document.getElementById("messageGenericContainerClose");
const modal = document.querySelectorAll('.modal');
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileCreate = document.getElementById("modalChangeFileCreate");
const modalChangeFileOpen = document.getElementById("modalChangeFileOpen");
const modalForm = document.getElementById("modalForm");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalFormInput = document.getElementById("modalFormInput");
const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const noResultContainer = document.getElementById("noResultContainer");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const onboardingContainer = document.getElementById("onboardingContainer");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const resultStats = document.getElementById("resultStats");
const todoContext = document.getElementById("todoContext");
const todoFilters = document.getElementById("todoFilters");
const todoTable = document.getElementById("todoTable");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const welcomeToSleek = document.getElementById("welcomeToSleek");
const btnAddTodoContainer = document.getElementById("btnAddTodoContainer");
const modalPrompt = document.getElementById("modalPrompt");
const modalPromptContent = document.getElementById("modalPromptContent");
const modalPromptConfirm = document.getElementById("modalPromptConfirm");
const modalPromptCancel = document.getElementById("modalPromptCancel");
const modalBackground = document.querySelectorAll('.modal-background');
const modalClose = document.querySelectorAll('.close');

let
  a0,
  a1,
  appData,
  content,
  drawer,
  files,
  filters,
  form,
  matomo,
  t0,
  todos,
  translations,
  userData,
  onboarding,
  view;

function getConfirmationResponse() {
  return new Promise((resolve, reject) => {
    modalPromptConfirm.onclick = function() {
      resolve("Info: Prompt confirmed");
    }
    modalPromptCancel.onclick = function() {
      reject("Info: Prompt canceled");
    }
  });
}
async function getConfirmation() {
  const fn = arguments[0];
  const vars = Array.prototype.slice.call(arguments, 2);
  modalPrompt.classList.add("is-active");
  modalPromptContent.innerHTML = arguments[1];
  createModalJail(modalPrompt);
  modalPromptConfirm.focus();
  // wait for user response
  await getConfirmationResponse().then(function(response) {
    console.info(response);
    modalPrompt.classList.remove("is-active");
    // if action is confirmed, start function
    fn.apply(null, vars).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
  }).catch(function(error) {
    console.info(error);
    modalPrompt.classList.remove("is-active");
  });
}
function configureMainView() {
  try {
    //
    focusRow();
    // generate file tabs
    files.generateFileList();
    // close filterContext if open
    if(document.getElementById("filterContext").classList.contains("is-active")) document.getElementById("filterContext").classList.remove("is-active");
    // set scaling factor if default font size has changed
    if(userData.zoom) {
      document.getElementById("html").style.zoom = userData.zoom + "%";
      document.getElementById("zoomStatus").innerHTML = userData.zoom + "%";
      document.getElementById("zoomRangePicker").value = userData.zoom;
    }
    // check if compact view is suppose to be active
    if(userData.compactView) body.classList.add("compact");
    // add version number to about tab in settings modal
    document.getElementById("version").innerHTML = appData.version;
    if(typeof todos.items === "object") {
      // jump to previously added item
      if(document.getElementById("previousItem")) jumpToItem(document.getElementById("previousItem"))
      // remove onboarding
      showOnboarding(false).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      // configure table view
      if(todos.items.objects.length===0) {
        addTodoContainer.classList.add("is-active");
        todoTableSearchContainer.classList.remove("is-active");
        todoTable.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        return Promise.resolve("Info: File is empty");
      } else if(todos.items.filtered.length===0) {
        addTodoContainer.classList.remove("is-active");
        todoTableSearchContainer.classList.add("is-active");
        noResultContainer.classList.add("is-active");
        return Promise.resolve("Info: No results");
        // TODO explain
      } else if(todos.items.filtered.length>0) {
        todoTableSearchContainer.classList.add("is-active");
        addTodoContainer.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        todoTable.classList.add("is-active");
        return Promise.resolve("Info: File has content and results are shown");
      }
    } else {
      showOnboarding(true).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      return Promise.resolve("Info: No file defined");
    }
  } catch(error) {
    showOnboarding(true).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    error.functionName = configureMainView.name;
    return Promise.reject(error);
  }
}
function checkDismissedMessages() {
  try {
    const messages = document.querySelectorAll("#messages .message");
    const dismissedMessages = userData.dismissedMessages;
    if(!dismissedMessages) return Promise.resolve("Info: No already checked messages found, will skip this check");
    messages.forEach((message) => {
      if(dismissedMessages.includes(message.getAttribute("data"))) {
        message.classList.remove("is-active");
      } else {
        message.classList.add("is-active");
      }
    });
    return Promise.resolve("Info: Checked for already dismissed messages");
  } catch(error) {
    error.functionName = checkDismissedMessages.name;
    return Promise.reject(error);
  }
}
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
function showGenericMessage(text) {
  try {
    if(text) {
      messageGenericContainer.classList.add("is-active");
      messageGenericMessage.innerHTML = text;
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Message", text])
    }
  } catch(error) {
    error.functionName = handleError.name;
    return Promise.reject(error);
  }
}
function handleError(error) {
  try {
    if(error) {
      console.error(error.name +" in function " + error.functionName + ": " + error.message);
      // if(appData.environment==="development") {
      //   errorContainer.classList.add("is-active");
      //   errorMessage.innerHTML = "<strong>" + error.name + "</strong> in function " + error.functionName + ": " + error.message;
      // }
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Error", error.functionName, error])
    }
  } catch(error) {
    error.functionName = handleError.name;
    return Promise.reject(error);
  }
}
function jumpToItem(item) {
  try {
    const isInViewport = function(item) {
      const rect = item.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    // jump to previously edited or added item
    // only scroll if new item is not in view
    if(!isInViewport(item)) {
      // scroll to view
      item.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
      // trigger a quick background ease in and out
      item.classList.add("is-highlighted");
      setTimeout(() => {
        item.classList.remove("is-highlighted");
        // after scrolling the marker will be removed
        item.removeAttribute("id");
      }, 1000);
    }
  } catch(error) {
    error.functionName = jumpToItem.name;
    return Promise.reject(error);
  }
}
function closeTodoContext() {
  // hide the context menu
  todoContext.classList.remove("is-active");
  todoContext.removeAttribute("data-item");
  // set focus on the last focused row
  focusRow();
}
function registerEvents() {
  try {
    // ########################################################################################################################
    // ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
    // ########################################################################################################################
    body.onclick = function(event) {
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
      content.showContent("modalSettings");
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Message", "Click on Settings"]);
    }
    btnFilesCreateTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "create");
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Change-Modal", "Click on Create file"]);
    }
    btnFilesOpenTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "open");
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Change-Modal", "Click on Open file"]);
    }
    btnOnboardingCreateTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "create");
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Onboarding", "Click on Create file"]);
    }
    btnOnboardingOpenTodoFile.onclick = function() {
      //TODO: thhis is a duplicate
      if(typeof userData.files === "object" && userData.files.length>0) {
        files.generateFileList().then(response => {
          console.info(response);
          modalChangeFile.classList.add("is-active");
          modalChangeFile.focus();
          createModalJail(modalChangeFile);
        }).catch(error => {
          handleError(error);
        });
      } else {
        window.api.send("openOrCreateFile", "open");
      }
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Onboarding", "Click on Open file"]);
    }
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
        if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Form", "Click on Cancel"]);
      }
    });
    btnAddTodoContainer.onclick = function () {
      // just in case the form will be cleared first
      resetModal().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      form.show();
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Menu", "Click on add todo"]);
    }
    btnCopyToClipboard.forEach(function(el) {
      el.onclick = function () {
        window.api.send("copyToClipboard", [errorMessage.innerHTML]);
        // trigger matomo event
        if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Error-Container", "Click on Copy to clipboard"]);
      }
    });
    btnFiltersResetFilters.onclick = function() {
      resetFilters(true);
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
    }
    btnNoResultContainerResetFilters.onclick = function() {
      resetFilters(true);
      // trigger matomo event
      if(userData.matomoEvents) matomo._paq.push(["trackEvent", "No Result Container", "Click on reset button"])
    }
    // errorContainerClose.onclick = function() {
    //   this.parentElement.classList.remove("is-active")
    // }
    messageGenericContainerClose.onclick = function() {
      this.parentElement.classList.remove("is-active")
    }
    modalBackground.forEach(function(el) {
      el.onclick = function() {
        const modalObject = document.getElementById(el.parentElement.id);
        if(modalObject.id==="modalPrompt") return false;
        // if modal is modalForm and input is equal the data item
        if(modalObject.id === "modalForm" && modalForm.getAttribute("data-item") !== document.getElementById("modalFormInput").value) {
          getConfirmation(resetModal, translations.modalBackgroundAttention, modalObject);
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
    error.functionName = registerEvents.name;
    return Promise.reject(error);
  }
}
async function pasteItemsToClipboard(items) {
  try {
    let groups = await todos.generateGroups(items);
    let itemsForClipboard;
    itemsForClipboard = "Status\t";
    itemsForClipboard += "Closed\t";
    itemsForClipboard += "Created\t";
    itemsForClipboard += "Priority\t";
    itemsForClipboard += "Started\t";
    itemsForClipboard += "Task\t";
    itemsForClipboard += "Due\t";
    itemsForClipboard += "Recurrence\t";
    itemsForClipboard += "Contexts\t";
    itemsForClipboard += "Projects\n";
    for(let i = 0; i < groups.length; i++) {
        let clipboardItem = "";
        if(groups[i][0] !== "null") {
          clipboardItem += "\n";
          clipboardItem += "-------------------------------------";
          clipboardItem += "\n";
          clipboardItem += groups[i][0];
          clipboardItem += "\n";
          clipboardItem += "-------------------------------------";
          clipboardItem += "\n";
          
        } else {
          clipboardItem += "\n\n\n";
        }
        itemsForClipboard += clipboardItem; 
        for(let j = 0; j < groups[i][1].length; j++) {
            clipboardItem = "";
            groups[i][1][j].complete ? clipboardItem += "Completed" : clipboardItem += "In progress";
            clipboardItem += "\t";
            (groups[i][1][j].completed !== null) ? clipboardItem += groups[i][1][j].completedString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].date !== null) ? clipboardItem += groups[i][1][j].dateString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].priority !== null) ? clipboardItem += groups[i][1][j].priority.toString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].tString !== undefined) ? clipboardItem += groups[i][1][j].tString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].text !== null) ? clipboardItem += groups[i][1][j].text : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].dueString !== undefined) ? clipboardItem += groups[i][1][j].dueString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].rec !== null) ? clipboardItem += groups[i][1][j].recString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].contexts !== null) ? clipboardItem += groups[i][1][j].contexts.toString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].projects !== null) ? clipboardItem += groups[i][1][j].projects.toString() : clipboardItem += "-";
            clipboardItem += "\n";
            itemsForClipboard += clipboardItem;
        }
    }
    window.api.send("copyToClipboard", [itemsForClipboard]);
    showGenericMessage(translations.visibleTodosCopiedToClipboard);
  } catch(error) {
    error.functionName = pasteItemsToClipboard.name;
    return Promise.reject(error);
  }
}

let currentRow = -1;
function focusRow(row) {
  if(row) currentRow = row;

  if(currentRow === -1) return false;
  let todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
  if(typeof todoTableRow === "object") todoTableRow.focus();
  return false;
}
function registerKeyboardShortcuts() {
  try {
    // CMD/metaKey only works on keydown
    window.addEventListener("keydown", function(event) {
      // open focused element
      if (event.keyCode === 13) {
        // TODO: This is ugly
        if(todoContext.classList.contains("is-active") || modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
        let todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
        todos.show(todoTableRow.getAttribute("data-item"));
        return false;
      }
      // move focus down in table list
      if (event.keyCode === 40) {
        if(todoContext.classList.contains("is-active") || modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
        // stop if end of todos is reached
        if(currentRow >= todoTable.querySelectorAll(".todo").length-1) return false;
        currentRow++;
        focusRow();
        return false;
      }
      // move focus up in table list
      if (event.keyCode === 38) {
        if(todoContext.classList.contains("is-active") || modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
        if(currentRow === 0) return false;
        currentRow--;
        focusRow();
        return false;
      }
      // close context menu
      if (event.keyCode === 37 && todoContext.classList.contains("is-active")) {
        todoContext.classList.remove("is-active")
        focusRow();
        return false;
      }
      // set todo complete
      if (event.keyCode === 37) {
        if(todoContext.classList.contains("is-active") || modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
        const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow].getAttribute("data-item");
        todos.setTodoComplete(todoTableRow).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }

      // open context
      if (event.keyCode === 39) {
        if(todoContext.classList.contains("is-active") || modalForm.classList.contains("is-active") || document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput") return false;
        focusRow();
        const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
        todos.createTodoContext(todoTableRow);
        return false;
      }
      // // open file
      // if((event.ctrlKey || event.metaKey) && event.key === "o" && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
      //   window.api.send("openOrCreateFile", "open");
      // }
      // create file
      if((event.ctrlKey || event.metaKey) && event.key === "c" && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        pasteItemsToClipboard(todos.items.filtered);
      }
      // close tab or window
      if((event.ctrlKey || event.metaKey) && event.key === "w") {
        const isTabFound = userData.files.findIndex(file => {
          return file[2] === 1;
        });
        if(isTabFound >= 0) {
          let index = userData.files.findIndex(file => file[0] === 1);
          files.removeFileFromList(index, 1);
        } else {
          window.api.send("closeWindow");
        }
      }
      // cycle through tabs
      if(event.ctrlKey && !event.shiftKey  && event.keyCode === 9) {
        let index = userData.files.findIndex(file => file[0] === 1);
        if(!userData.files[index+1]) {
          window.api.send("startFileWatcher", [userData.files[0][1], 1]);
        } else {
          window.api.send("startFileWatcher", [userData.files[index+1][1], 1]);
        }
      }
      if(event.ctrlKey && event.shiftKey && event.keyCode === 9) {
        let index = userData.files.findIndex(file => file[0] === 1);
        if(!userData.files[index-1]) {
          window.api.send("startFileWatcher", [userData.files[userData.files.length-1][1], 1]);
        } else {
          window.api.send("startFileWatcher", [userData.files[index-1][1], 1]);
        }
      }
      // escape in context menu
      if(event.key === "Escape" && todoContext.classList.contains("is-active")) {
        closeTodoContext();
      }
      // switch files
      // TODO: restrict this on files in tab bar
      const regex=/^[1-9]+$/;
      if(event.key.match(regex) && userData.files.length > 1 && userData.files[event.key-1] && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        if(userData.files[event.key-1][1]) window.api.send("startFileWatcher", [userData.files[event.key-1][1]]);
      }
      // open settings
      if(event.key === "," && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        content.showContent("modalSettings").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // open help
      if(event.key === "?" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        content.showContent("modalHelp").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // toggle dark mode
      if(event.key==="d" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        setTheme(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // reset filters
      if(event.key==="0" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        if(onboarding) return false;
        resetFilters(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // toggle completed todos
      if(event.key==="h" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        if(onboarding) return false;
        view.toggle("showCompleted").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // toggle deferred todos
      if(event.key==="t" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        if(onboarding) return false;
        view.toggle("deferredTodos").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // archive todos
      if(event.key==="a" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        // abort when onboarding is shown
        if(onboarding) return false;
        // abort when no completed todos are present
        if(todos.items.complete.length===0) return false;
        // handle user confirmation and pass callback function
        getConfirmation(todos.archiveTodos, translations.archivingPrompt);
      }
      // show filter drawer
      if(event.key==="b" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        drawer.show(document.getElementById("navBtnFilter"), document.getElementById("navBtnFilter").getAttribute("data-drawer")).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // reload window
      if((event.key === "." || event.key === "F5") && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        location.reload(true);
      }
    }, true)
    window.addEventListener("keyup", function(event) {
      // create new todo
      if(event.key==="n" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterContextInput" && document.activeElement.id!="modalFormInput")) {
        if(onboarding) return false;
        form.show().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
    }, true)
    // shortcuts for modal form
    modalForm.addEventListener ("keydown", function(event) {
      // priority up
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowUp") {
        form.setPriority("up");
      }
      // priority down
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowDown") {
        form.setPriority("down");
      }
      // TODO: Shortcut removed to to issues on MacOS
      // clear priority
      // if(!(event.ctrlKey || event.metaKey) && event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      //   form.setPriority(null);
      // }
      // set priority directly
      if(event.altKey && event.key.length === 1 && event.key.match(/[A-Z]/i)) {
        form.setPriority(event.key.substr(0,1)).then(response => {
          console.log(response);
        }).catch(error => {
          handleError(error);
        });
      }
      // due date plus 1
      if((event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowUp") {
        form.setDueDate(1);
      }
      // due date minus 1
      if((event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowDown") {
        form.setDueDate(-1);
      }
      // reset due date
      if((event.ctrlKey || event.metaKey) && event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        form.setDueDate(0);
      }
    });
    // escape in autocomplete container
    autoCompleteContainer.addEventListener ("keyup", function() {
      if(event.key === "Escape") {
        this.classList.remove("is-active");
        modalFormInput.focus();
      }
    });
    // event for closing modal windows
    modal.forEach(function(element) {
      element.addEventListener("keydown", function(event) {
        if(event.key === "Escape") {
          if(autoCompleteContainer.classList.contains("is-active")) return false;
          if(document.getElementById("recurrencePickerContainer").classList.contains("is-active")) return false;
          if(document.querySelector(".datepicker.datepicker-dropdown").classList.contains("is-active")) return false;
          resetModal(this).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
        }
      });
    });
    return Promise.resolve("Success: Keyboard shortcuts registered");
  } catch(error) {
    error.functionName = registerKeyboardShortcuts.name;
    return Promise.reject(error);
  }
}
function resetFilters(refresh) {
  try {
    // scroll back to top
    document.getElementById("todoTableWrapper").scrollTo(0,0);
    // clear the persisted filers, by setting it to undefined the object entry will be removed fully
    setUserData("selectedFilters", new Array);
    //
    setUserData("hideFilterCategories", new Array);
    // empty old filter container
    todoFilters.innerHTML = "";
    // clear search input
    document.getElementById("todoTableSearch").value = null;
    // regenerate the data
    if(refresh) startBuilding();
    return Promise.resolve("Success: Filters resetted");
  } catch(error) {
    error.functionName = resetFilters.name;
    return Promise.reject(error);
  }
}
// TODO refactor
function resetModal(modal) {
  try {
    if(modal) {
      // remove is-active from modal
      modal.classList.remove("is-active");
      // remove any previously set data-item attributes
      modal.removeAttribute("data-item");
    }
    // reset priority setting
    document.getElementById("priorityPicker").selectedIndex = 0;
    // if recurrence picker was open it is now being closed
    document.getElementById("recurrencePickerContainer").classList.remove("is-active");
    // clear previous recurrence selection
    document.getElementById("recurrencePickerInput").value = null;
    // if file chooser was open it is now being closed
    modalChangeFile.classList.remove("is-active");
    // hide suggestion box if it was open
    autoCompleteContainer.classList.remove("is-active");
    // remove focus from suggestion container
    autoCompleteContainer.blur();
    // close
    modalForm.classList.remove("is-active");
    // remove the data item as we don't need it anymore
    //modalForm.removeAttribute("data-item");
    modalForm.setAttribute("data-item", "");
    // clean up the modal
    modalFormAlert.parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
    // clear the content in the input field as it's not needed anymore
    document.getElementById("modalFormInput").value = null;
    return Promise.resolve("Info: Modal closed and cleaned up");
  } catch (error) {
    error.functionName = resetModal.name;
    return Promise.reject(error);
  }
}
function setTheme(switchTheme) {
  try {
    let theme = userData.theme;
    if(switchTheme) {
      switch (theme) {
        case "dark":
        theme = "light";
        break;
        case "light":
        theme = "dark";
        break;
        default:
        theme = "light";
        break;
      }
      window.api.send("setTheme", theme);
      setUserData("theme", theme);
    }
    switch (theme) {
      case "light":
      body.classList.remove("dark");
      document.getElementById("toggleDarkmode").checked = false;
      break;
      case "dark":
      body.classList.add("dark");
      document.getElementById("toggleDarkmode").checked = true;
      break;
    }
    return Promise.resolve("Success: Theme set to " + theme);
  } catch(error) {
    error.functionName = setTheme.name;
    return Promise.reject(error);
  }
}
function setTranslations() {
  try {
    addTodoContainerButton.innerHTML = translations.addTodo;
    addTodoContainerHeadline.innerHTML = translations.addTodoContainerHeadline;
    addTodoContainerSubtitle.innerHTML = translations.addTodoContainerSubtitle;
    btnSave.innerHTML = translations.save;
    messageLoggingBody.innerHTML = translations.messageLoggingBody;
    messageLoggingButton.innerHTML = translations.settings;
    messageLoggingTitle.innerHTML = translations.errorEventLogging;
    messageShareBody.innerHTML = translations.messageShareBody;
    messageShareTitle.innerHTML = translations.messageShareTitle;
    modalChangeFileCreate.innerHTML = translations.createFile;
    modalChangeFileOpen.innerHTML = translations.openFile;
    //modalChangeFileTitle.innerHTML = translations.selectFile;
    noResultContainerHeadline.innerHTML = translations.noResults;
    noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;
    onboardingContainerBtnCreate.innerHTML = translations.createFile;
    onboardingContainerBtnOpen.innerHTML = translations.openFile;
    onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;
    welcomeToSleek.innerHTML = translations.welcomeToSleek;
    modalPromptConfirm.innerHTML = translations.confirm;
    modalPromptCancel.innerHTML = translations.cancel;
    btnResetFilters.forEach(function(el) {
      el.getElementsByTagName('span')[0].innerHTML = translations.resetFilters;
    });
    cancel.forEach(function(item) {
      item.innerHTML = translations.cancel;
    });
    navBtnAddTodo.setAttribute("title", translations.addTodo);
    return Promise.resolve("Success: Translations set");
  } catch(error) {
    error.functionName = setTranslations.name;
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
function showOnboarding(variable) {
  try {
    onboarding = variable;
    if(variable) {
      onboardingContainer.classList.add("is-active");
      navBtnAddTodo.classList.add("is-hidden");
      navBtnFilter.classList.add("is-hidden");
      document.getElementById("navBtnView").classList.add("is-hidden");
      todoTable.classList.remove("is-active");
      todoTableSearchContainer.classList.remove("is-active");
      return Promise.resolve("Info: Show onboarding");
    } else {
      onboardingContainer.classList.remove("is-active");
      navBtnAddTodo.classList.remove("is-hidden");
      navBtnFilter.classList.remove("is-hidden");
      document.getElementById("navBtnView").classList.remove("is-hidden");
      todoTable.classList.add("is-active");
      todoTableSearchContainer.classList.add("is-active");
      return Promise.resolve("Info: Hide onboarding");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}

function getBadgeCount() {
  let count = 0;
  todos.items.objects.forEach((item) => {
    if(!item.complete && item.due && (isToday(item.due) || isPast(item.due))) count++;
  });
  return count;
}

async function startBuilding(loadAll) {
  try {

    t0 = performance.now();

    todos.items.filtered = await filters.filterItems(todos.items.objects);

    filters.generateFilterData();

    const groups = await todos.generateGroups(todos.items.filtered);

    userData = await getUserData();

    await todos.generateTable(groups, loadAll);

    configureMainView();

    window.api.send("update-badge", getBadgeCount());

    console.info("Table build:", performance.now() - t0, "ms");

  } catch(error) {
    error.functionName = startBuilding.name;
    return Promise.reject(error);
  }
}

function getActiveFile() {
  const index = userData.files.findIndex(file => file[0] === 1);
  if(index!==-1) {
    const file = userData.files[index][1];
    return file;
  }
  return false;
}

window.onload = async function () {
  a0 = performance.now();
  userData = await getUserData();
  appData = await getAppData();
  translations = await getTranslations();
  todos = await import("./js/todos.mjs");
  filters = await import("./js/filters.mjs");
  drawer = await import("./js/drawer.mjs");
  files = await import("./js/files.mjs");
  //TODO: Refactoring
  if(userData.files && userData.files.length > 0 && getActiveFile()) {
    window.api.send("startFileWatcher", [getActiveFile(), 0]);
  } else {
    showOnboarding(true).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
  }
  setTheme().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  checkDismissedMessages().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  setTranslations(translations).then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  registerEvents().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  registerKeyboardShortcuts().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  form = await import("./js/form.mjs");
  content = await import("./js/content.mjs");
  view = await import("./js/view.mjs");
  import("./js/navigation.mjs");
  import("./js/search.mjs");
  matomo = await import("./js/matomo.mjs");
  await matomo.configureMatomo().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  a1 = performance.now();
  console.info("App build:", a1 - a0, "ms");
}
window.api.receive("triggerFunction", (name, args) => {
  try {
    if(!args) args = new Array;
    switch (name) {
      case "showOnboarding":
        showOnboarding(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showForm":
        form.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "resetModal":
        resetModal(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "archiveTodos":
        getConfirmation(todos.archiveTodos, translations.archivingPrompt);
        break;
      case "showDrawer":
        drawer.show(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "handleError":
        handleError(...args);
        break;
      case "resetFilters":
        resetFilters(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "toggle":
        view.toggle(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showContent":
        content.showContent(args[0]).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "setTheme":
        setTheme(...args).then(function(response) {
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
window.api.receive("refresh", async (args) => {
  todos.generateItems(args[0]).then(function() {
    startBuilding(args[1], args[2]);
  }).catch(function(error) {
    handleError(error);
  });
});

export { getActiveFile, showOnboarding, resetFilters, resetModal, setUserData, startBuilding, handleError, userData, appData, translations, modal, setTheme, getConfirmation, focusRow };
