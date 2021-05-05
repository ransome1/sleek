"use strict";
// ########################################################################################################################
// DEFINE ELEMENTS
// ########################################################################################################################
const html = document.getElementById("html");
const body = document.getElementById("body");
const zoomStatus = document.getElementById("zoomStatus");
const zoomRangePicker = document.getElementById("zoomRangePicker");
const zoomUndo = document.getElementById("zoomUndo");
const resultStats = document.getElementById("resultStats");
const btnArchiveTodos = document.getElementById("btnArchiveTodos");
const priorityPicker = document.getElementById("priorityPicker");
const toggleNotifications = document.getElementById("toggleNotifications");
const toggleDarkmode = document.getElementById("toggleDarkmode");
const toggleMatomoEvents = document.getElementById("toggleMatomoEvents");
const btnNoResultContainerResetFilters = document.getElementById("btnNoResultContainerResetFilters");
const viewHeadlineTodoList = document.getElementById("viewHeadlineTodoList");
const sortBy = document.getElementById("sortBy");
const sortByDueDate = document.getElementById("sortByDueDate");
const sortByPriority = document.getElementById("sortByPriority");
const sortByContexts = document.getElementById("sortByContexts");
const sortByProjects = document.getElementById("sortByProjects");
const addTodoContainerHeadline = document.getElementById("addTodoContainerHeadline");
const addTodoContainerSubtitle = document.getElementById("addTodoContainerSubtitle");
const addTodoContainerButton = document.getElementById("addTodoContainerButton");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const modalChangeFileTitle = document.getElementById("modalChangeFileTitle");
const modalChangeFileOpen = document.getElementById("modalChangeFileOpen");
const modalChangeFileCreate = document.getElementById("modalChangeFileCreate");
const welcomeToSleek = document.getElementById("welcomeToSleek");
const recurrencePickerEvery = document.getElementById("recurrencePickerEvery");
const recurrencePickerDay = document.getElementById("recurrencePickerDay");
const recurrencePickerWeek = document.getElementById("recurrencePickerWeek");
const recurrencePickerMonth = document.getElementById("recurrencePickerMonth");
const recurrencePickerYear = document.getElementById("recurrencePickerYear");
const recurrencePickerNoRecurrence = document.getElementById("recurrencePickerNoRecurrence");
const messageLoggingTitle = document.getElementById("messageLoggingTitle");
const messageLoggingBody = document.getElementById("messageLoggingBody");
const messageLoggingButton = document.getElementById("messageLoggingButton");
const viewHeadlineAppView = document.getElementById("viewHeadlineAppView");
const viewToggleShowCompleted = document.getElementById("viewToggleShowCompleted");
const viewToggleSortCompletedLast = document.getElementById("viewToggleSortCompletedLast");
const viewToggleDueIsToday = document.getElementById("viewToggleDueIsToday");
const viewToggleDueIsFuture = document.getElementById("viewToggleDueIsFuture");
const viewToggleDueIsPast = document.getElementById("viewToggleDueIsPast");
const viewToggleShowHidden = document.getElementById("viewToggleShowHidden");
const viewToggleCompactView = document.getElementById("viewToggleCompactView");
const messageShareTitle = document.getElementById("messageShareTitle");
const messageShareBody = document.getElementById("messageShareBody");
const settingsTabSettings = document.getElementById("settingsTabSettings");
const settingsTabSettingsHeadline = document.getElementById("settingsTabSettingsHeadline");
const settingsTabSettingsLanguage = document.getElementById("settingsTabSettingsLanguage");
const settingsTabSettingsLanguageBody = document.getElementById("settingsTabSettingsLanguageBody");
const settingsTabSettingsArchive = document.getElementById("settingsTabSettingsArchive");
const settingsTabSettingsArchiveBody = document.getElementById("settingsTabSettingsArchiveBody");
const settingsTabSettingsArchiveButton = document.getElementById("settingsTabSettingsArchiveButton");
const settingsTabSettingsNotifications = document.getElementById("settingsTabSettingsNotifications");
const settingsTabSettingsNotificationsBody = document.getElementById("settingsTabSettingsNotificationsBody");
const settingsTabSettingsDarkmode = document.getElementById("settingsTabSettingsDarkmode");
const settingsTabSettingsDarkmodeBody = document.getElementById("settingsTabSettingsDarkmodeBody");
const settingsTabSettingsTray = document.getElementById("settingsTabSettingsTray");
const settingsTabSettingsTrayBody = document.getElementById("settingsTabSettingsTrayBody");
const settingsTabSettingsLogging = document.getElementById("settingsTabSettingsLogging");
const settingsTabSettingsLoggingBody = document.getElementById("settingsTabSettingsLoggingBody");
const settingsTabAbout = document.getElementById("settingsTabAbout");
const settingsTabAboutHeadline = document.getElementById("settingsTabAboutHeadline");
const settingsTabAboutContribute = document.getElementById("settingsTabAboutContribute");
const settingsTabAboutCopyrightLicense = document.getElementById("settingsTabAboutCopyrightLicense");
const settingsTabAboutCopyrightLicenseBody = document.getElementById("settingsTabAboutCopyrightLicenseBody");
const settingsTabAboutPrivacy = document.getElementById("settingsTabAboutPrivacy");
const settingsTabAboutPrivacyBody = document.getElementById("settingsTabAboutPrivacyBody");
const settingsTabAboutExternalLibraries = document.getElementById("settingsTabAboutExternalLibraries");
const helpTabKeyboardTitle = document.getElementById("helpTabKeyboardTitle");
const helpTabPrioritiesTitle = document.getElementById("helpTabPrioritiesTitle");
const helpTabPrioritiesBody = document.getElementById("helpTabPrioritiesBody");
const helpTabContextsProjectsTitle = document.getElementById("helpTabContextsProjectsTitle");
const helpTabContextsProjectsBody = document.getElementById("helpTabContextsProjectsBody");
const helpTabDatesRecurrencesTitle1 = document.getElementById("helpTabDatesRecurrencesTitle1");
const helpTabDatesRecurrencesBody1 = document.getElementById("helpTabDatesRecurrencesBody1");
const helpTabDatesRecurrencesTitle2 = document.getElementById("helpTabDatesRecurrencesTitle2");
const helpTabDatesRecurrencesBody2 = document.getElementById("helpTabDatesRecurrencesBody2");
const helpTab1Title = document.getElementById("helpTab1Title");
const helpTab2Title = document.getElementById("helpTab2Title");
const helpTab3Title = document.getElementById("helpTab3Title");
const helpTab4Title = document.getElementById("helpTab4Title");
const helpTabKeyboardTR1TD1 = document.getElementById("helpTabKeyboardTR1TD1");
const helpTabKeyboardTR2TD1 = document.getElementById("helpTabKeyboardTR2TD1");
const helpTabKeyboardTR3TD1 = document.getElementById("helpTabKeyboardTR3TD1");
const helpTabKeyboardTR4TD1 = document.getElementById("helpTabKeyboardTR4TD1");
const helpTabKeyboardTR5TD1 = document.getElementById("helpTabKeyboardTR5TD1");
const helpTabKeyboardTR6TD1 = document.getElementById("helpTabKeyboardTR6TD1");
const helpTabKeyboardTR7TD1 = document.getElementById("helpTabKeyboardTR7TD1");
const helpTabKeyboardTR8TD1 = document.getElementById("helpTabKeyboardTR8TD1");
const helpTabKeyboardTR9TD1 = document.getElementById("helpTabKeyboardTR9TD1");
const helpTabKeyboardTR10TD1 = document.getElementById("helpTabKeyboardTR10TD1");
const helpTabKeyboardTR1TH1 = document.getElementById("helpTabKeyboardTR1TH1");
const submitIssuesOnGithub = document.getElementById("submitIssuesOnGithub");
const reviewSourceforge = document.getElementById("reviewSourceforge");
const reviewWindowsStore = document.getElementById("reviewWindowsStore");
const shareTwitter = document.getElementById("shareTwitter");
const shareFacebook = document.getElementById("shareFacebook");
const shareLinkedin = document.getElementById("shareLinkedin");
const navBtnSettings = document.getElementById("navBtnSettings");
const showCompleted = document.getElementById("showCompleted");
const sortCompletedLast = document.getElementById("sortCompletedLast");
const showHidden = document.getElementById("showHidden");
const showDueIsToday = document.getElementById("showDueIsToday");
const showDueIsFuture = document.getElementById("showDueIsFuture");
const showDueIsPast = document.getElementById("showDueIsPast");
const toggleView = document.getElementById("toggleView");
const onboardingContainer = document.getElementById("onboardingContainer");
const addTodoContainer = document.getElementById("addTodoContainer");
const todoTable = document.getElementById("todoTable");
const navBtnFilter = document.getElementById("navBtnFilter");
const modalHelp = document.getElementById("modalHelp");
const btnMessageLogging = document.getElementById("btnMessageLogging");
const modalSettings = document.getElementById("modalSettings");
const btnFiltersResetFilters = document.getElementById("btnFiltersResetFilters");
const viewSelectSortBy = document.getElementById("viewSelectSortBy");
const themeLink = document.getElementById("themeLink");
const btnTheme = document.getElementById("btnTheme");
const btnSave = document.getElementById("btnSave");
const todoTableSearch = document.getElementById("todoTableSearch");
const noResultContainer = document.getElementById("noResultContainer");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const autoCompleteContainer = document.getElementById("autoCompleteContainer");
const todoFilters = document.getElementById("todoFilters");
const recurrencePickerInput = document.getElementById("recurrencePickerInput");
const recurrencePickerContainer = document.getElementById("recurrencePickerContainer");
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");
const modalFormAlert = document.getElementById("modalFormAlert");
const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");
const errorContainerClose = document.getElementById("errorContainerClose");
const settingsLanguage = document.getElementById("settingsLanguage");
const modalForm = document.getElementById("modalForm");
const a = document.querySelectorAll("a");
const modal = document.querySelectorAll('.modal');
const btnModalCancel = document.querySelectorAll(".btnModalCancel");
const btnOpenTodoFile = document.querySelectorAll(".btnOpenTodoFile");
const btnCreateTodoFile = document.querySelectorAll(".btnCreateTodoFile");
const btnChangeTodoFile = document.querySelectorAll(".btnChangeTodoFile");
const btnAddTodo = document.querySelectorAll(".btnAddTodo");
const btnResetFilters = document.querySelectorAll(".btnResetFilters");
const btnCopyToClipboard = document.querySelectorAll(".btnCopyToClipboard");
const navBtns = document.querySelectorAll(".navBtn");
const navBtnView = document.getElementById("navBtnView");
const navBtnHelp = document.getElementById("navBtnHelp");
const toggleTray = document.getElementById("toggleTray");
const messages = document.querySelectorAll(".message");
let _paq, friendlyLanguageName, drawer, content, filters, translations, appData, userData, form, todos, t0, t1, f0, f1;
// ########################################################################################################################
// FUNCTIONS
// ########################################################################################################################
function zoom(zoom) {
  try {
    //let zoom = userData.zoom;
    html.style.zoom = zoom + "%";
    zoomStatus.innerHTML = zoom + "%";
    zoomRangePicker.value = zoom;
    // persist zoom setting
    setUserData("zoom", zoom);
    // set zoom status in view container
    return Promise.resolve("Info: Zoom set to " + zoom + "%");
  } catch (error) {
    error.functionName = zoom.name;
    return Promise.reject(error);
  }
}
function showResultStats() {
  try {
    // we show some information on filters if any are set
    if(todos.visibleRows!=todos.items.objects.length) {
      resultStats.classList.add("is-active");
      resultStats.firstElementChild.innerHTML = translations.visibleTodos + "&nbsp;<strong>" + todos.visibleRows + " </strong>&nbsp;" + translations.of + "&nbsp;<strong>" + todos.items.objects.length + "</strong>";
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
          window.api.send("startFileWatcher", this.parentElement.getAttribute("data-path"));
          resetModal().then(response => {
            console.log(response);
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
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
        }
      }
      cell2.innerHTML = files[file][1];
    }
    return Promise.resolve("Success: File changer modal built and opened");
  } catch (error) {
    //error.functionName = arguments.callee.name;
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
// TODO Error handling
function startBuilding(searchString) {
  t0 = performance.now();
  filters.filterItems(todos.items.objects, searchString)
  .then(function(filtered) {
    todos.items.filtered = filtered;
    f0 = performance.now();
    filters.generateFilterData().then(response => {
      console.log(response);
      f1 = performance.now();
      console.log("Filters build:", f1 - f0, "ms");
    }).catch(error => {
      handleError(error);
    });
    return todos.generateGroups(filtered)
  })
  .then(function(groups) {
    return new Promise(function(resolve) {
      resolve(todos.generateTable(groups));
    });
  })
  .then(function(response) {
		console.log(response);
		return new Promise(function(resolve) {
			resolve(configureMainView());
		});
	})
	.then(function(response) {
		console.log(response);
		// display info based on filtered items
		showResultStats().then(response => {
			console.log(response);
			t1 = performance.now();
			console.log("Todos build:", t1 - t0, "ms");
		}).catch(error => {
			handleError(error);
		});
  })
  .catch(function(error) {
    handleError(error);
  });
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
    btnTheme.setAttribute("title", translations.toggleDarkMode);
    btnSave.innerHTML = translations.save;
    todoTableSearch.placeholder = translations.search;
    viewHeadlineTodoList.innerHTML = translations.viewHeadlineTodoList;
    viewHeadlineAppView.innerHTML = translations.viewHeadlineAppView;
    viewToggleShowCompleted.innerHTML = translations.completedTodos;
    viewToggleSortCompletedLast.innerHTML = translations.sortCompletedLast;
    viewToggleDueIsToday.innerHTML = translations.dueToday;
    viewToggleDueIsFuture.innerHTML = translations.dueFuture;
    viewToggleDueIsPast.innerHTML = translations.duePast;
    viewToggleShowHidden.innerHTML = translations.hiddenTodos;
    viewToggleCompactView.innerHTML = translations.compactView;
    sortBy.innerHTML = translations.sortBy;
    sortByDueDate.innerHTML = translations.dueDate;
    sortByPriority.innerHTML = translations.priority;
    sortByContexts.innerHTML = translations.contexts;
    sortByProjects.innerHTML = translations.projects;
    addTodoContainerHeadline.innerHTML = translations.addTodoContainerHeadline;
    addTodoContainerSubtitle.innerHTML = translations.addTodoContainerSubtitle;
    addTodoContainerButton.innerHTML = translations.addTodo;
    onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;
    onboardingContainerBtnOpen.innerHTML = translations.openFile;
    onboardingContainerBtnCreate.innerHTML = translations.createFile;
    noResultContainerHeadline.innerHTML = translations.noResults;
    noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;
    modalChangeFileTitle.innerHTML = translations.selectFile;
    modalChangeFileOpen.innerHTML = translations.openFile;
    modalChangeFileCreate.innerHTML = translations.createFile;
    welcomeToSleek.innerHTML = translations.welcomeToSleek;
    recurrencePickerEvery.innerHTML = translations.every;
    recurrencePickerDay.innerHTML = translations.day;
    recurrencePickerWeek.innerHTML = translations.week;
    recurrencePickerMonth.innerHTML = translations.month;
    recurrencePickerYear.innerHTML = translations.year;
    recurrencePickerNoRecurrence.innerHTML = translations.noRecurrence;
    messageLoggingTitle.innerHTML = translations.errorEventLogging;
    messageLoggingBody.innerHTML = translations.messageLoggingBody;
    messageLoggingButton.innerHTML = translations.settings;
    messageShareTitle.innerHTML = translations.messageShareTitle;
    messageShareBody.innerHTML = translations.messageShareBody;
    settingsTabSettings.innerHTML = translations.settings;
    settingsTabSettingsHeadline.innerHTML = translations.settings;
    settingsTabSettingsLanguage.innerHTML = translations.language;
    settingsTabSettingsLanguageBody.innerHTML = translations.settingsTabSettingsLanguageBody;
    settingsTabSettingsArchive.innerHTML = translations.settingsTabSettingsArchive;
    settingsTabSettingsArchiveBody.innerHTML = translations.settingsTabSettingsArchiveBody;
    settingsTabSettingsArchiveButton.innerHTML = translations.archive;
    settingsTabSettingsNotifications.innerHTML = translations.notifications;
    settingsTabSettingsNotificationsBody.innerHTML = translations.settingsTabSettingsNotificationsBody;
    settingsTabSettingsDarkmode.innerHTML = translations.darkmode;
    settingsTabSettingsDarkmodeBody.innerHTML = translations.settingsTabSettingsDarkmodeBody;
    settingsTabSettingsTray.innerHTML = translations.settingsTabSettingsTray;
    settingsTabSettingsTrayBody.innerHTML = translations.settingsTabSettingsTrayBody;
    settingsTabSettingsLogging.innerHTML = translations.errorEventLogging;
    settingsTabSettingsLoggingBody.innerHTML = translations.settingsTabSettingsLoggingBody;
    settingsTabAbout.innerHTML = translations.about;
    settingsTabAboutHeadline.innerHTML = translations.about;
    settingsTabAboutContribute.innerHTML = translations.settingsTabAboutContribute;
    settingsTabAboutCopyrightLicense.innerHTML = translations.settingsTabAboutCopyrightLicense;
    settingsTabAboutCopyrightLicenseBody.innerHTML = translations.settingsTabAboutCopyrightLicenseBody;
    settingsTabAboutPrivacy.innerHTML = translations.settingsTabAboutPrivacy;
    settingsTabAboutPrivacyBody.innerHTML = translations.settingsTabAboutPrivacyBody;
    settingsTabAboutExternalLibraries.innerHTML = translations.settingsTabAboutExternalLibraries;
    helpTabKeyboardTitle.innerHTML = translations.shortcuts;
    helpTabPrioritiesTitle.innerHTML = translations.helpTabPrioritiesTitle;
    helpTabPrioritiesBody.innerHTML = translations.helpTabPrioritiesBody;
    helpTabContextsProjectsTitle.innerHTML = translations.helpTabContextsProjectsTitle;
    helpTabContextsProjectsBody.innerHTML = translations.helpTabContextsProjectsBody;
    helpTabDatesRecurrencesTitle1.innerHTML = translations.helpTabDatesRecurrencesTitle1;
    helpTabDatesRecurrencesBody1.innerHTML = translations.helpTabDatesRecurrencesBody1;
    helpTabDatesRecurrencesTitle2.innerHTML = translations.helpTabDatesRecurrencesTitle2;
    helpTabDatesRecurrencesBody2.innerHTML = translations.helpTabDatesRecurrencesBody2;
    helpTab1Title.innerHTML = translations.shortcuts;
    helpTab2Title.innerHTML = translations.priorities;
    helpTab3Title.innerHTML = translations.helpTab3Title;
    helpTab4Title.innerHTML = translations.helpTab4Title;
    helpTabKeyboardTR1TD1.innerHTML = translations.addTodo;
    helpTabKeyboardTR2TD1.innerHTML = translations.find;
    helpTabKeyboardTR3TD1.innerHTML = translations.toggleCompletedTodos;
    helpTabKeyboardTR4TD1.innerHTML = translations.toggleDarkMode;
    helpTabKeyboardTR5TD1.innerHTML = translations.openFile;
    helpTabKeyboardTR6TD1.innerHTML = translations.settings;
    helpTabKeyboardTR7TD1.innerHTML = translations.helpTabKeyboardTR7TD1;
    helpTabKeyboardTR8TD1.innerHTML = translations.toggleFilter;
    helpTabKeyboardTR9TD1.innerHTML = translations.resetFilters;
    helpTabKeyboardTR1TH1.innerHTML = translations.function;
    helpTabKeyboardTR10TD1.innerHTML = translations.helpTabKeyboardTR10TD1;
    submitIssuesOnGithub.innerHTML = translations.submitIssuesOnGithub;
    reviewSourceforge.innerHTML = translations.reviewSourceforge;
    reviewWindowsStore.innerHTML = translations.reviewWindowsStore;
    shareTwitter.innerHTML = translations.shareTwitter;
    shareFacebook.innerHTML = translations.shareFacebook;
    shareLinkedin.innerHTML = translations.shareLinkedin;

    navBtnView.firstElementChild.setAttribute("title", translations.view);
    navBtnHelp.firstElementChild.setAttribute("title", translations.help);
    navBtnSettings.firstElementChild.setAttribute("title", translations.settings);
    btnOpenTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.openFile);
    });
    btnResetFilters.forEach(function(el) {
      el.getElementsByTagName('span')[0].innerHTML = translations.resetFilters;
    });
    btnCreateTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.createFile);
    });
    btnChangeTodoFile.forEach(function(el) {
      el.setAttribute("title", translations.openFile);
    });
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
    toggleView.checked = userData.compactView;
    toggleTray.checked = userData.tray;
    return Promise.resolve("Success: Toggles set");
  } catch(error) {
    error.functionName = setToggles.name;
    return Promise.reject(error);
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
function getUserData() {
  try {
    return new Promise(function(resolve) {
      window.api.send("userData");
      return window.api.receive("userData", (data) => {
        userData = data;
        resolve("Success: User data received");
      });
    });
  } catch(error) {
    error.functionName = getUserData.name;
    return Promise.reject(error);
  }
}
function getAppData() {
  try {
    return new Promise(function(resolve) {
      window.api.send("appData");
      return window.api.receive("appData", (data) => {
        appData = data;
        resolve("Success: App data received");
      });
    });
  } catch(error) {
    error.functionName = getAppData.name;
    return Promise.reject(error);
  }
}
function toggleCompactView(checked) {
  try {
    userData.compactView = checked;
    if(userData.compactView) {
      body.classList.add("compact");
    } else {
      body.classList.remove("compact");
    }
    // persist the sorting
    setUserData("compactView", userData.compactView);
    return Promise.resolve("Success: Compact view set to: " + userData.compactView);
  } catch(error) {
    error.functionName = toggleCompactView.name;
    return Promise.reject(error);
  }
}
function toggleTodos(name, variable) {
  try {
    if(userData[name]==false) {
      userData[name] = true;
    } else if(variable) {
      userData[name] = true;
    } else {
      userData[name] = false;
    }
    document.getElementById(name).checked = userData[name];
    // persist the sorting
    setUserData(name, userData[name]);
    // rebuild the content
    startBuilding();
    return Promise.resolve("Success: Show " + name + " todo set to: " + userData[name]);
  } catch(error) {
    error.functionName = toggleTodos.name;
    return Promise.reject(error);
  }
}
function configureMatomo() {
  try {
    if(!userData.uid) {
      // generate random number/string combination as user id and persist it
      var uid = Math.random().toString(36).slice(2);
      setUserData("uid", uid);
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
    if(appData.tray)_paq.push(['setCustomDimension', 19, appData.tray]);
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
		// set scaling factor if default font size has changed
		if(userData.zoom) {
			html.style.zoom = userData.zoom + "%";
			zoomStatus.innerHTML = userData.zoom + "%";
			zoomRangePicker.value = userData.zoom;
		}
		// check if compact view is suppose to be active
		if(userData.compactView) body.classList.add("compact");
		// add version number to about tab in settings modal
		document.getElementById("version").innerHTML = appData.version;
		if(typeof todos.items === "object") {
			// jump to previously added item
			if(document.getElementById("previousItem")) jumpToItem(document.getElementById("previousItem"))
			// add filename to application title
			if(userData.file) {
				switch (appData.os) {
					case "windows":
						document.title = userData.file.split("\\").pop() + " - sleek";
						break;
					default:
						document.title = userData.file.split("/").pop() + " - sleek";
						break;
				}
			}
			// show add todo buttons
			btnAddTodo.forEach(item => item.classList.remove("is-hidden"));
			// remove onboarding
			onboardingContainer.classList.remove("is-active");
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
			btnAddTodo.forEach(item => item.classList.add("is-hidden"));
			todoTableSearchContainer.classList.remove("is-active");
			addTodoContainer.classList.remove("is-active");
			noResultContainer.classList.remove("is-active");
			todoTable.classList.remove("is-active");
			navBtnFilter.classList.remove("is-active");
			onboardingContainer.classList.add("is-active");
			return Promise.resolve("Info: No file defined");
		}
  } catch(error) {
    onboardingContainer.classList.add("is-active");
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
function checkIsInViewport(item) {
  const rect = item.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
function registerEvents() {
  try {
    // ########################################################################################################################
    // ONCLICK DEFINITIONS, FILE AND EVENT LISTENERS
    // ########################################################################################################################
    a.forEach(el => el.addEventListener("click", function(el) {
      if(el.target.href && el.target.href === "#") el.preventDefault();
    }));
    navBtnHelp.onclick = function () {
      content.showContent(modalHelp);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
    }
    navBtnSettings.onclick = function () {
      content.showContent(modalSettings);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
    }
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
      todos.archiveTodos().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Archive"])
    }
    btnOpenTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "open");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Open file"]);
      }
    });
    btnChangeTodoFile.forEach(function(el) {
      el.onclick = function () {
        if(typeof userData.files === "object" && userData.files.length>0) {
          showFiles().then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
        } else {
          window.api.send("openOrCreateFile", "open");
        }
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Choose file"]);
      }
    });
    btnCreateTodoFile.forEach(function(el) {
      el.onclick = function () {
        window.api.send("openOrCreateFile", "create");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding/Change-Modal", "Click on Create file"]);
      }
    });
    btnModalCancel.forEach(function(el) {
      el.onclick = function() {
        el.parentElement.parentElement.parentElement.parentElement.classList.remove("is-active");
        resetModal().then(function(result) {
          console.log(result);
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
        resetModal().then(function(result) {
          console.log(result);
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
    todoTableSearch.addEventListener("input", function () {
      startBuilding(this.value)
    });
    toggleView.onclick = function() {
      toggleCompactView(this.checked).then(response => {
        console.log(response);
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Toggle compact view"]);
      }).catch(error => {
        handleError(error);
      });
    }
    const viewToggles = document.querySelectorAll('.viewToggle');
    viewToggles.forEach(function(viewToggle) {
      viewToggle.onclick = function() {
        toggleTodos(this.id).then(response => {
          console.log(response);
          // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Toggle " + this.id + " set to: " + this.value]);
        }).catch(error => {
          handleError(error);
        });
      }
    });
    toggleMatomoEvents.onclick = function() {
      //matomoEvents = this.checked;
      setUserData('matomoEvents', this.checked);
      configureMatomo(this.checked).then(response => {
        console.log(response);
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
    viewSelectSortBy.onchange = async function() {
      if(this.value) {
        await setUserData("sortBy", this.value);
        startBuilding();
        resetModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Sort by setting changed to: " + this.value]);
      }
    }
    zoomRangePicker.onchange = function() {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Zoom ranger dragged"]);
      zoom(this.value).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });
    }
    zoomUndo.onclick = function() {
      zoom(100).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Click on zoom undo"]);
    };
    // ########################################################################################################################
    // KEYBOARD SHORTCUTS
    // ########################################################################################################################
    modalHelp.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active");
    });
    modalChangeFile.addEventListener ("keydown", function () {
      if(event.key === "Escape") {
        resetModal().then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
      }
    });
    modalSettings.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active");
    });
    autoCompleteContainer.addEventListener ("keydown", function () {
      if(event.key === "Escape") this.classList.remove("is-active")
    });

    return Promise.resolve("Success: Events registered");
  } catch(error) {
    error.functionName = registerEvents.name;
    return Promise.reject(error);
  }
}
function resetFilters() {
  try {
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
function resetModal() {
  try {
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
    // defines when the composed filter is being filled with content and when it is emptied
    //let startComposing = false;
    // in case a category will be selected from suggestion box we need to remove the category from input value that has been written already
    //let autoCompleteValue = "";
    // + or @
    //let autoCompletePrefix = "";
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
function jumpToItem(item) {
  // jump to previously edited or added item
  // only scroll if new item is not in view
  if(!checkIsInViewport(item)) {
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
window.onload = function () {
  getAppData().then(function(response) {
    console.log(response);
    return new Promise(function(resolve) {
      resolve(getUserData());
    });
  }).then(async function(response) {
    console.log(response);
		drawer = await import("./js/drawer.mjs");
		content = await import("./js/content.mjs");
		configureMatomo().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
		zoom(userData.zoom).then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
		setTheme().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
		registerEvents().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
		checkDismissedMessages().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
		setToggles().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
    return new Promise(function(resolve) {
      window.api.send("translations", userData.language);
      window.api.receive("translations", (data) => {
        translations = data;
        setTranslations(translations);
        setFriendlyLanguageNames();
        resolve("Success: Translations loaded and applied");
      });
    });
  }).then(async function(response) {
    console.info(response);
		form = await import("./js/form.mjs");
		todos = await import("./js/todos.mjs");
		filters = await import("./js/filters.mjs");
    return new Promise(function(resolve) {
      resolve("Success: All modules imported");
    })
  }).then(function(response) {
    console.info(response);
    if(userData.file) {
      window.api.send("startFileWatcher", userData.file);
    // for users who upgrade from very old versions
    } else if(userData.pathToFile) {
      window.api.send("startFileWatcher", userData.pathToFile);
    } else {
			configureMainView().then(function(response) {
				console.log(response);
			}).catch(function(error) {
				handleError(error);
			});
    }
  }).catch(function(error) {
    handleError(error);
  });
}
window.api.receive("triggerFunction", (name, args) => {
  try {
    if(!args) args = new Array;
    switch (name) {
      case "showForm":
        form.show(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "resetModal":
        resetModal(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "archiveTodos":
        todos.archiveTodos(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showDrawer":
        drawer.showDrawer(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "handleError":
        handleError(...args);
        break;
      case "resetFilters":
        resetFilters(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "toggleTodos":
        toggleTodos(...args).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "showContent":
        content.showContent(document.getElementById(args[0])).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        break;
      case "setTheme":
        setTheme(...args).then(function(result) {
          console.log(result);
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
window.api.receive("refresh", (data) => {
	if(data===false) {
		configureMainView().then(function(response) {
			console.log(response);
		}).catch(function(error) {
			handleError(error);
		});
	} else {
		todos.generateItems(data).then(function() {
			startBuilding();
		}).catch(function(error) {
			handleError(error);
		});
	}
});
export { resetModal, setUserData, startBuilding, handleError, showMore, userData, appData, translations, modal, navBtns, _paq };
