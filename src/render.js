"use strict";
import { isToday } from "./js/date.mjs";
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
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnArchiveTodos = document.getElementById("btnArchiveTodos");
const btnChangeTodoFile = document.querySelectorAll(".btnChangeTodoFile");
const btnCopyToClipboard = document.querySelectorAll(".btnCopyToClipboard");
const btnCreateTodoFile = document.querySelectorAll(".btnCreateTodoFile");
const btnFiltersResetFilters = document.getElementById("btnFiltersResetFilters");
const btnMessageLogging = document.getElementById("btnMessageLogging");
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnNoResultContainerResetFilters = document.getElementById("btnNoResultContainerResetFilters");
//const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const btnSave = document.getElementById("btnSave");
const btnTheme = document.getElementById("btnTheme");
const errorContainer = document.getElementById("errorContainer");
const errorContainerClose = document.getElementById("errorContainerClose");
const errorMessage = document.getElementById("errorMessage");
const messageLoggingBody = document.getElementById("messageLoggingBody");
const messageLoggingButton = document.getElementById("messageLoggingButton");
const messageLoggingTitle = document.getElementById("messageLoggingTitle");
const messages = document.querySelectorAll(".message");
const messageShareBody = document.getElementById("messageShareBody");
const messageShareTitle = document.getElementById("messageShareTitle");
const modal = document.querySelectorAll('.modal');
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileCreate = document.getElementById("modalChangeFileCreate");
const modalChangeFileOpen = document.getElementById("modalChangeFileOpen");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");
const modalChangeFileTitle = document.getElementById("modalChangeFileTitle");
const modalForm = document.getElementById("modalForm");
const modalFormAlert = document.getElementById("modalFormAlert");
const modalHelp = document.getElementById("modalHelp");
const modalSettings = document.getElementById("modalSettings");
const noResultContainer = document.getElementById("noResultContainer");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const onboardingContainer = document.getElementById("onboardingContainer");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const resultStats = document.getElementById("resultStats");
const themeLink = document.getElementById("themeLink");
const todoFilters = document.getElementById("todoFilters");
const todoTable = document.getElementById("todoTable");
const todoTableSearch = document.getElementById("todoTableSearch");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const welcomeToSleek = document.getElementById("welcomeToSleek");
const btnOnboardingOpenTodoFile = document.getElementById("btnOnboardingOpenTodoFile");
const btnOnboardingCreateTodoFile = document.getElementById("btnOnboardingCreateTodoFile");
const btnFilesOpenTodoFile = document.getElementById("btnFilesOpenTodoFile");
const btnFilesCreateTodoFile = document.getElementById("btnFilesCreateTodoFile");
const btnOpenTodoFile = document.getElementById("btnOpenTodoFile");
const todoContext = document.getElementById("todoContext");
const showEmptyFilters = document.getElementById("showEmptyFilters");

let
  append = false,
  _paq, a0,
  a1,
  appData,
  content,
  drawer,
  f0,
  f1,
  filters,
  form,
  friendlyLanguageName,
  t0,
  t1,
  todos,
  translations,
  userData,
  view;

function configureMatomo() {
  try {
    if(!userData.uid) {
      // generate random number/string combination as user id and persist it
      var uid = Math.random().toString(36).slice(2);
      setUserData("uid", uid);
    }

    const todoRange = function(count) {
      if(count<50) {
        return "<50"
      } else if (count>50&&count<=100) {
        return "51-100"
      } else if(count>100&&count<=150) {
        return "101-150"
      } else if(count>151&&count<=200) {
        return "151-200"
      } else if(count>201&&count<=300) {
        return "201-300"
      } else if(count>300) {
        return ">301"
      }
    }
    // only continue if app is connected to the internet
    if(!navigator.onLine) return Promise.resolve("Info: App is offline, Matomo will not be loaded");
    _paq = window._paq = window._paq || [];
    if(appData.development) return Promise.resolve("Info: Machine is development machine, logging will be skipped")
    if(userData.uid)_paq.push(['setUserId', userData.uid]);
    if(userData.theme)_paq.push(['setCustomDimension', 1, userData.theme]);
    if(userData.language)_paq.push(['setCustomDimension', 2, userData.language]);
    if(typeof userData.notifications === "boolean")_paq.push(['setCustomDimension', 3, userData.notifications]);
    if(typeof userData.matomoEvents === "boolean")_paq.push(['setCustomDimension', 4, userData.matomoEvents]);
    if(appData.version)_paq.push(['setCustomDimension', 5, appData.version]);
    if(userData.window)_paq.push(['setCustomDimension', 6, userData.window.width+"x"+userData.window.height]);
    if(typeof userData.showCompleted === "boolean")_paq.push(['setCustomDimension', 7, userData.showCompleted]);
    if(userData.files>0) _paq.push(['setCustomDimension', 8, userData.files.length]);
    if(typeof userData.useTextarea === "boolean")_paq.push(['setCustomDimension', 9, userData.useTextarea]);
    if(typeof userData.compactView === "boolean")_paq.push(['setCustomDimension', 10, userData.compactView]);
    if(typeof userData.sortCompletedLast === "boolean")_paq.push(['setCustomDimension', 11, userData.sortCompletedLast]);
    if(typeof userData.showHidden === "boolean")_paq.push(['setCustomDimension', 12, userData.showHidden]);
    if(typeof userData.showDueIsToday === "boolean")_paq.push(['setCustomDimension', 13, userData.showDueIsToday]);
    if(typeof userData.showDueIsFuture === "boolean")_paq.push(['setCustomDimension', 14, userData.showDueIsFuture]);
    if(typeof userData.showDueIsPast === "boolean")_paq.push(['setCustomDimension', 15, userData.showDueIsPast]);
    if(userData.sortBy)_paq.push(['setCustomDimension', 16, userData.sortBy]);
    if(userData.zoom)_paq.push(['setCustomDimension', 17, userData.zoom]);
    if(appData.channel)_paq.push(['setCustomDimension', 18, appData.channel]);
    if(typeof userData.tray === "boolean")_paq.push(['setCustomDimension', 19, userData.tray]);
    if(typeof userData.showEmptyFilters === "boolean")_paq.push(['setCustomDimension', 20, userData.showEmptyFilters]);
    if(todos.items) _paq.push(['setCustomDimension', 21, todoRange(todos.items.objects.length)]);
    _paq.push(['requireConsent']);
    _paq.push(['setConsentGiven']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['trackVisibleContentImpressions']);
    (function() {
      var u="https://www.robbfolio.de/matomo/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '3']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
    if(userData.matomoEvents) {
      // user has given consent to process their data
      return Promise.resolve("Info: Consent given, Matomo error and event logging enabled");
    } else {
      // revoke matomoEvents consent
      _paq.push(['forgetConsentGiven']);
      return Promise.resolve("Info: No consent given, Matomo error and event logging disabled");
    }
  } catch(error) {
    error.functionName = configureMatomo.name;
    return Promise.reject(error);
  }
}
function configureMainView() {
  try {
    // close filterMenu if open
    if(document.getElementById("filterMenu").classList.contains("is-active")) document.getElementById("filterMenu").classList.remove("is-active");
    // set scaling factor if default font size has changed
    if(userData.zoom) {
      html.style.zoom = userData.zoom + "%";
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
      // add filename to application title
      setWindowTitle(userData.file);
      // show add todo buttons
      btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
      // remove onboarding
      showOnboarding(false).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      // check if archive button should be enabled
      setButtonState("btnArchiveTodos");
      // file is defined, but content is empty
      if(userData.file && todos.items.objects.length===0) {
        addTodoContainer.classList.add("is-active");
        todoTableSearchContainer.classList.remove("is-active");
        todoTable.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        return Promise.resolve("Info: File is empty");
      } else if(userData.file && todos.items.filtered.length===0) {
        addTodoContainer.classList.remove("is-active");
        todoTableSearchContainer.classList.add("is-active");
        noResultContainer.classList.add("is-active");
        return Promise.resolve("Info: No results");
        // TODO explain
      } else if(userData.file && todos.visibleRows>0 && todos.items.filtered.length>0) {
        todoTableSearchContainer.classList.add("is-active");
        addTodoContainer.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        todoTable.classList.add("is-active");
        navBtnFilter.classList.add("is-active");
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
function getTranslations(language) {
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
// TODO Error handling
function handleError(error) {
  if(error) {
    console.error(error.name +" in function " + error.functionName + ": " + error.message);
    errorContainer.classList.add("is-active");
    errorMessage.innerHTML = "<strong>" + error.name + "</strong> in function " + error.functionName + ": " + error.message;
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", error.functionName, error])
  }
}
function jumpToItem(item) {
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
}
// TODO Error handling
function debounce(func, wait, immediate) {
  // https://davidwalsh.name/javascript-debounce-function
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
function registerEvents() {
  try {
    // ########################################################################################################################
    // ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
    // ########################################################################################################################
    a.forEach(el => el.addEventListener("click", function(el) {
      if(el.target.href && el.target.href === "#") el.preventDefault();
    }));
    btnMessageLogging.onclick = function () {
      content.showContent(modalSettings);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Message", "Click on Settings"]);
    }
    btnTheme.onclick = function() {
			setTheme(true);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Theme"])
    }
    btnArchiveTodos.onclick = function() {
      todos.archiveTodos().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Archive"])
    }
    /*btnOpenTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "open");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
      }
    })
    btnChangeTodoFile.forEach(function(el) {
      el.onclick = function () {
        if(typeof userData.files === "object" && userData.files.length>0) {
          showFiles().then(response => {
            console.info(response);
          }).catch(error => {
            handleError(error);
          });
        } else {
          window.api.send("openOrCreateFile", "open");
        }
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Choose file"]);
      }
    });*/
    /*btnCreateTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "create");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Create file"]);
      }
    });*/

    btnOpenTodoFile.onclick = function() {
      if(typeof userData.files === "object" && userData.files.length>0) {
        showFiles().then(response => {
          console.info(response);
        }).catch(error => {
          handleError(error);
        });
      } else {
        window.api.send("openOrCreateFile", "open");
      }
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "menu", "Click on Files"]);
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

    btnOnboardingCreateTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "create");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Create file"]);
    }

    btnOnboardingOpenTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "open");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Open file"]);
    }

    btnModalCancel.forEach(function(el) {
      el.onclick = function() {
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
    btnAddTodo.forEach(function(el) {
      el.onclick = function () {
        // just in case the form will be cleared first
        resetModal().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        form.show();
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
      }
    });
    btnCopyToClipboard.forEach(function(el) {
      el.onclick = function () {
        window.api.send("copyToClipboard", [errorMessage.innerHTML]);
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Error-Container", "Click on Copy to clipboard"]);
      }
    });
    btnFiltersResetFilters.onclick = function() {
      resetFilters();
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Filter-Drawer", "Click on reset button"])
    }
    btnNoResultContainerResetFilters.onclick = function() {
      resetFilters();
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "No Result Container", "Click on reset button"])
    }
    todoTable.onclick = function() {
      if(event.target.classList.contains("flex-table")) {
        showMore(false);
      }
    }
    todoTableSearch.addEventListener("input", debounce(function() {
      startBuilding()
    }, 250));
    toggleMatomoEvents.onclick = function() {
      //matomoEvents = this.checked;
      setUserData('matomoEvents', this.checked);
      configureMatomo(this.checked).then(response => {
        console.info(response);
      }).catch(error => {
        handleError(error);
      });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Logging", this.checked])
    }
    toggleNotifications.onclick = function() {
      //notifications = this.checked;
      setUserData('notifications', this.checked);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Notifications", this.checked])
    }
    toggleDarkmode.onclick = function() {
      setTheme(true);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Dark mode", this.checked])
    }
    toggleTray.onclick = function() {
      setUserData("tray", this.checked);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Tray", this.checked])
      // restart
      window.api.send("restart");
    }
    settingsLanguage.onchange = function() {
      userData.language = this.value;
      window.api.send("userData", ["language", userData.language]);
      window.api.send("changeLanguage", this.value);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Language changed to: " + this.value]);
    }
    errorContainerClose.onclick = function() {
      this.parentElement.classList.remove("is-active")
    }
    return Promise.resolve("Success: Events registered");
  } catch(error) {
    error.functionName = registerEvents.name;
    return Promise.reject(error);
  }
}
function registerKeyboardShortcuts() {
  try {
    // CMD/metaKey only works on keydown
    window.addEventListener("keydown", function(event) {
      // open file
      if((event.ctrlKey || event.metaKey) && event.key === "o" && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        window.api.send("openOrCreateFile", "open");
      }
      // create file
      if((event.ctrlKey || event.metaKey) && event.key === "c" && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        window.api.send("openOrCreateFile", "create");
      }
    }, true)
    window.addEventListener("keyup", function(event) {
      // open settings
      if(event.key === "," && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        content.showContent(document.getElementById("modalSettings")).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // open help
      if(event.key === "?" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        content.showContent(document.getElementById("modalHelp")).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // create new todo
      if(event.key==="n" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        form.show().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // find todo
      if(event.key==="f" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        todoTableSearch.focus();
      }
      // reset filters
      if(event.key==="0" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        resetFilters().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // toggle completed todos
      if(event.key==="h" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        view.toggle("showCompleted").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // archive todos
      if(event.key==="a" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        todos.archiveTodos().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // toggle dark mode
      if(event.key==="d" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        setTheme(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // show filter drawer
      if(event.key==="b" && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        drawer.showDrawer("toggle", "navBtnFilter", "filterDrawer").then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      }
      // reload window
      if((event.key === "." || event.key === "F5") && !modalForm.classList.contains("is-active") && (document.activeElement.id!="todoTableSearch" && document.activeElement.id!="filterMenuInput" && document.activeElement.id!="modalFormInput")) {
        location.reload(true);
      }
    }, true)
    // shortcuts for search input field
    todoTableSearch.addEventListener("keyup", function () {
      if(event.key === "Escape") todoTableSearch.blur();
    });
    // shortcuts for modal form
    modalForm.addEventListener ("keyup", function(event) {
      // priority up
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowUp") {
        form.setPriority("up");
      }
      // priority down
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowDown") {
        form.setPriority("down");
      }
      // clear priority
      if(!(event.ctrlKey || event.metaKey) && event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        form.setPriority(null);
      }
      // set priority directly
      if(event.altKey && event.key.length===1 && event.key.match(/[A-Z]/i)) {
        form.setPriority(event.key.substr(0,1)).then(response => {
          console.log(response);
        }).catch(error => {
          handleError(error);
        });
      }
      // submit form
      if(event.key==="Enter" && (event.ctrlKey || event.metaKey)) {
        form.submitForm().then(response => {
          console.log(response);
        }).catch(error => {
          handleError(error);
        });
      }
      if(event.key === "Escape" && !autoCompleteContainer.classList.contains("is-active")) {
        resetModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      } else if(event.key === "Escape" && autoCompleteContainer.classList.contains("is-active")) {
        autoCompleteContainer.classList.remove("is-active");
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
    // event for closing modal windows
    modal.forEach(function(element) {
      element.addEventListener("keydown", function(event) {
        if(event.key === "Escape" && !autoCompleteContainer.classList.contains("is-active")) {
          //this.classList.remove("is-active");
          resetModal(this).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
        }
      });
    });
    autoCompleteContainer.addEventListener ("keyup", function() {
      if(event.key === "Escape") {
        this.classList.remove("is-active");
        modalFormInput.focus();
      }
    });
    return Promise.resolve("Success: Keyboard shortcuts registered");
  } catch(error) {
    error.functionName = registerKeyboardShortcuts.name;
    return Promise.reject(error);
  }
}
function resetFilters() {
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
    todoTableSearch.value = null;
    // regenerate the data
    startBuilding();
    return Promise.resolve("Success: Filters resetted");
  } catch(error) {
    error.functionName = resetFilters.name;
    return Promise.reject(error);
  }
}
function resetModal(modal) {
  try {
    if(modal) {
      // remove is-active from modal
      modal.classList.remove("is-active");
      // remove any previously set data-item attributes
      modal.removeAttribute("data-item");
    }
    // reset priority setting
    priorityPicker.selectedIndex = 0;
    // if recurrence picker was open it is now being closed
    recurrencePickerContainer.classList.remove("is-active");
    // clear previous recurrence selection
    recurrencePickerInput.value = null;
    // if file chooser was open it is now being closed
    modalChangeFile.classList.remove("is-active");
    // hide suggestion box if it was open
    autoCompleteContainer.classList.remove("is-active");
    // remove focus from suggestion container
    autoCompleteContainer.blur();
    // close
    modalForm.classList.remove("is-active");
    // remove the data item as we don't need it anymore
    modalForm.removeAttribute("data-item");
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
function setButtonState(button) {
  switch (button) {
    case "btnArchiveTodos":
    if(todos.items.complete.length>0) {
      btnArchiveTodos.disabled = false;
    } else {
      btnArchiveTodos.disabled = true;
    }
    break;
    default:
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
      setUserData("theme", theme);
    }
    switch (theme) {
      case "light":
      toggleDarkmode.checked = false;
      themeLink.href = "";
      break;
      case "dark":
      toggleDarkmode.checked = true;
      themeLink.href = appData.path + "/css/" + theme + ".css";
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
    btnTheme.setAttribute("title", translations.toggleDarkMode);
    messageLoggingBody.innerHTML = translations.messageLoggingBody;
    messageLoggingButton.innerHTML = translations.settings;
    messageLoggingTitle.innerHTML = translations.errorEventLogging;
    messageShareBody.innerHTML = translations.messageShareBody;
    messageShareTitle.innerHTML = translations.messageShareTitle;
    modalChangeFileCreate.innerHTML = translations.createFile;
    modalChangeFileOpen.innerHTML = translations.openFile;
    modalChangeFileTitle.innerHTML = translations.selectFile;
    noResultContainerHeadline.innerHTML = translations.noResults;
    noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;
    onboardingContainerBtnCreate.innerHTML = translations.createFile;
    onboardingContainerBtnOpen.innerHTML = translations.openFile;
    onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;

    todoTableSearch.placeholder = translations.search;
    welcomeToSleek.innerHTML = translations.welcomeToSleek;

    /*btnOpenTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.openFile);
    });*/
    btnResetFilters.forEach(function(el) {
      el.getElementsByTagName('span')[0].innerHTML = translations.resetFilters;
    });
    /*btnCreateTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.createFile);
    });
    btnChangeTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.openFile);
    });*/
    btnModalCancel.forEach(function(el) {
      el.innerHTML = translations.cancel;
    });
    btnAddTodo.forEach(function(el) {
      el.setAttribute("title", translations.addTodo);
    });
    return Promise.resolve("Success: Translations set");
  } catch(error) {
    error.functionName = setTranslations.name;
    return Promise.reject(error);
  }
}
function setUserData(key, value) {
  try {
    userData[key] = value;
    window.api.send("userData", [key, value]);
    return Promise.resolve("Success: Config (" + key + ") persisted");
  } catch(error) {
    error.functionName = setUserData.name;
    return Promise.reject(error);
  }
}
function setToggles() {
  try {
    // set the toggles in settings
    toggleMatomoEvents.checked = userData.matomoEvents;
    toggleNotifications.checked = userData.notifications;
    showCompleted.checked = userData.showCompleted;
    sortCompletedLast.checked = userData.sortCompletedLast;
    showHidden.checked = userData.showHidden;
    showDueIsToday.checked = userData.showDueIsToday;
    showDueIsFuture.checked = userData.showDueIsFuture;
    showDueIsPast.checked = userData.showDueIsPast;
    toggleTray.checked = userData.tray;
    compactView.checked = userData.compactView;
    showEmptyFilters.checked = userData.showEmptyFilters;
    return Promise.resolve("Success: Toggles set");
  } catch(error) {
    error.functionName = setToggles.name;
    return Promise.reject(error);
  }
}
function setWindowTitle(file) {
  if(file) {
    switch (appData.os) {
      case "windows":
      document.title = file.split("\\").pop() + " - sleek";
      break;
      default:
      document.title = file.split("/").pop() + " - sleek";
      break;
    }
  } else {
    document.title = "sleek";
  }
}
function setFriendlyLanguageNames() {
  try {
    appData.languages.forEach((language) => {
      // generate user friendly entries for language selection menu
      switch (language) {
        case "de":
        friendlyLanguageName = "Deutsch"
        break;
        case "en":
        friendlyLanguageName = "English"
        break;
        case "it":
        friendlyLanguageName = "Italiano"
        break;
        case "es":
        friendlyLanguageName = "‎Español"
        break;
        case "fr":
        friendlyLanguageName = "Français"
        break;
        case "zh":
        friendlyLanguageName = "Chinese (简体中文)"
        break;
        default:
        return;
      }
      var option = document.createElement("option");
      option.text = friendlyLanguageName;
      option.value = language;
      if(language===userData.language) option.selected = true;
      settingsLanguage.add(option);
    });
    return Promise.resolve("Success: Friendly language names added to select field in settings");
  } catch(error) {
    error.functionName = setFriendlyLanguageNames.name;
    return Promise.reject(error);
  }
}
function showOnboarding(variable) {
  try {
    if(variable) {
      onboardingContainer.classList.add("is-active");
      btnAddTodo.forEach(item => item.classList.add("is-hidden"));
      navBtnFilter.classList.add("is-hidden");
      navBtnView.classList.add("is-hidden");
      todoTable.classList.remove("is-active");
      todoTableSearchContainer.classList.remove("is-active");
      return Promise.resolve("Info: Show onboarding");
    } else {
      onboardingContainer.classList.remove("is-active");
      btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
      navBtnFilter.classList.remove("is-hidden");
      navBtnView.classList.remove("is-hidden");
      todoTable.classList.add("is-active");
      todoTableSearchContainer.classList.add("is-active");
      return Promise.resolve("Info: Hide onboarding");
    }
  } catch(error) {
    error.functionName = arguments.callee.name;
    return Promise.reject(error);
  }
}
function showResultStats() {
  try {
    // we show some information on filters if any are set
    if(todos.items.filtered.length!=todos.items.objects.length) {
      resultStats.classList.add("is-active");
      resultStats.firstElementChild.innerHTML = translations.visibleTodos + "&nbsp;<strong>" + todos.items.filtered.length + " </strong>&nbsp;" + translations.of + "&nbsp;<strong>" + todos.items.objects.length + "</strong>";
      return Promise.resolve("Info: Result box is shown");
    } else {
      resultStats.classList.remove("is-active");
      return Promise.resolve("Info: Result box is hidden");
    }
  } catch(error) {
    error.functionName = showResultStats.name;
    return Promise.reject(error);
  }
}
function showMore(variable) {
  if(variable) {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.add("is-active")
    });
  } else {
    document.querySelectorAll(".todoTableItemMore").forEach(function(item) {
      item.classList.remove("is-active")
    });
  }
}
function showFiles() {
  try {
    let files = userData.files;
    modalChangeFile.classList.add("is-active");
    modalChangeFile.focus();
    modalChangeFileTable.innerHTML = "";
    for (let file in files) {
      // skip if file doesn't exist
      var table = modalChangeFileTable;
      table.classList.add("files");
      var row = table.insertRow(0);
      row.setAttribute("data-path", files[file][1]);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      if(files[file][0]===1) {
        cell1.innerHTML = "<button class=\"button\" disabled>" + translations.selected + "</button>";
      } else {
        cell1.innerHTML = "<button class=\"button is-link\">" + translations.select + "</button>";
        cell1.onclick = function() {
          setUserData("selectedFilters", []);
          resetModal().then(response => {
            window.api.send("startFileWatcher", this.parentElement.getAttribute("data-path"));
            console.info(response);
          }).catch(error => {
            handleError(error);
          });
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "File", "Click on select button"]);
        }
        cell3.innerHTML = "<i class=\"fas fa-minus-circle\"></i>";
        cell3.title = translations.delete;
        cell3.onclick = function() {
          let path = this.parentElement.getAttribute("data-path");
          // remove file from files array
          files = files.filter(function(file) {
            return file[1] != path;
          });
          // persist new files array
          setUserData("files", files);
          // after array is updated, open the modal again
          showFiles().then(response => {
            console.info(response);
          }).catch(error => {
            handleError(error);
          });
        }
      }
      cell2.innerHTML = files[file][1];
    }
    return Promise.resolve("Success: File changer modal built and opened");
  } catch (error) {
    return Promise.reject(error);
  }
}

function getBadgeCount() {
  let count = 0;
  todos.items.objects.forEach((item) => {
    if(!item.complete && item.due && isToday(item.due)) count++;
  });
  return count;
}

async function startBuilding(searchString, append) {
  try {

    t0 = performance.now();

    todos.items.filtered = await filters.filterItems(todos.items.objects, searchString);

    filters.generateFilterData();

    const groups = await todos.generateGroups(todos.items.filtered);

    userData = await getUserData();

    await todos.generateTable(groups, append);

    configureMainView();

    showResultStats();

    window.api.send("update-badge", getBadgeCount());

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
  if(userData.file) {
    window.api.send("startFileWatcher", userData.file);
  // for users who upgrade from very old versions
  } else if(userData.pathToFile) {
    window.api.send("startFileWatcher", userData.pathToFile);
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
  setToggles().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  setTranslations(translations).then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  setFriendlyLanguageNames(translations).then(function(response) {
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
  drawer = await import("./js/drawer.mjs");
  view = await import("./js/view.mjs");
  await import("./js/navigation.mjs");

  configureMatomo().then(function(response) {
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
        todos.archiveTodos(...args).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showDrawer":
        drawer.showDrawer(...args).then(function(response) {
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
        content.showContent(document.getElementById(args[0])).then(function(response) {
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
window.api.receive("refresh", async function(content) {
  todos.generateItems(content).then(function() {
    startBuilding();
  }).catch(function(error) {
    handleError(error);
  });
});

export { resetModal, setUserData, startBuilding, handleError, showMore, userData, appData, translations, modal, _paq };
