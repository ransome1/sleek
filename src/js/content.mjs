"use strict";
import { _paq } from "./matomo.mjs";
import { appData, userData, setUserData, translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { getConfirmation } from "./prompt.mjs";
import { handleError } from "./helper.mjs";

const addAsTodo = document.getElementById("addAsTodo");
const autoUpdateBody = document.getElementById("autoUpdateBody");
const autoUpdateHeadline = document.getElementById("autoUpdateHeadline");
const compactViewBody = document.getElementById("compactViewBody");
const compactViewHeadline = document.getElementById("compactViewHeadline");
const fileTabsBody = document.getElementById("fileTabsBody");
const fileTabsHeadline = document.getElementById("fileTabsHeadline");
const helpTab1Title = document.getElementById("helpTab1Title");
const helpTab2Title = document.getElementById("helpTab2Title");
const helpTab3Title = document.getElementById("helpTab3Title");
const helpTab4Title = document.getElementById("helpTab4Title");
const helpTab5Title = document.getElementById("helpTab5Title");
const helpTabContextsProjectsBody = document.getElementById("helpTabContextsProjectsBody");
const helpTabContextsProjectsTitle = document.getElementById("helpTabContextsProjectsTitle");
const helpTabDatesBody1 = document.getElementById("helpTabDatesBody1");
const helpTabDatesBody2 = document.getElementById("helpTabDatesBody2");
const helpTabDatesTitle1 = document.getElementById("helpTabDatesTitle1");
const helpTabDatesTitle2 = document.getElementById("helpTabDatesTitle2");
const helpTabKeyboardSubtitle1 = document.getElementById("helpTabKeyboardSubtitle1");
const helpTabKeyboardSubtitle2 = document.getElementById("helpTabKeyboardSubtitle2");
const helpTabKeyboardTitle = document.getElementById("helpTabKeyboardTitle");
const helpTabKeyboardTR10TD1 = document.getElementById("helpTabKeyboardTR10TD1");
const helpTabKeyboardTR11TD1 = document.getElementById("helpTabKeyboardTR11TD1");
const helpTabKeyboardTR12TD1 = document.getElementById("helpTabKeyboardTR12TD1");
const helpTabKeyboardTR13TD1 = document.getElementById("helpTabKeyboardTR13TD1");
const helpTabKeyboardTR14TD1 = document.getElementById("helpTabKeyboardTR14TD1");
const helpTabKeyboardTR15TD1 = document.getElementById("helpTabKeyboardTR15TD1");
const helpTabKeyboardTR16TD1 = document.getElementById("helpTabKeyboardTR16TD1");
const helpTabKeyboardTR17TD1 = document.getElementById("helpTabKeyboardTR17TD1");
const helpTabKeyboardTR18TD1 = document.getElementById("helpTabKeyboardTR18TD1");
const helpTabKeyboardTR19TD1 = document.getElementById("helpTabKeyboardTR19TD1");
const helpTabKeyboardTR1TD1 = document.getElementById("helpTabKeyboardTR1TD1");
const helpTabKeyboardTR1TH1 = document.getElementById("helpTabKeyboardTR1TH1");
const helpTabKeyboardTR20TD1 = document.getElementById("helpTabKeyboardTR20TD1");
const helpTabKeyboardTR21TD1 = document.getElementById("helpTabKeyboardTR21TD1");
const helpTabKeyboardTR22TD1 = document.getElementById("helpTabKeyboardTR22TD1");
const helpTabKeyboardTR23TD1 = document.getElementById("helpTabKeyboardTR23TD1");
const helpTabKeyboardTR24TD1 = document.getElementById("helpTabKeyboardTR24TD1");
const helpTabKeyboardTR25TD1 = document.getElementById("helpTabKeyboardTR25TD1");
const helpTabKeyboardTR26TD1 = document.getElementById("helpTabKeyboardTR26TD1");
const helpTabKeyboardTR27TD1 = document.getElementById("helpTabKeyboardTR27TD1");
const helpTabKeyboardTR2TD1 = document.getElementById("helpTabKeyboardTR2TD1");
const helpTabKeyboardTR3TD1 = document.getElementById("helpTabKeyboardTR3TD1");
const helpTabKeyboardTR4TD1 = document.getElementById("helpTabKeyboardTR4TD1");
const helpTabKeyboardTR5TD1 = document.getElementById("helpTabKeyboardTR5TD1");
const helpTabKeyboardTR6TD1 = document.getElementById("helpTabKeyboardTR6TD1");
const helpTabKeyboardTR7TD1 = document.getElementById("helpTabKeyboardTR7TD1");
const helpTabKeyboardTR8TD1 = document.getElementById("helpTabKeyboardTR8TD1");
const helpTabKeyboardTR9TD1 = document.getElementById("helpTabKeyboardTR9TD1");
const helpTabPrioritiesBody = document.getElementById("helpTabPrioritiesBody");
const helpTabPrioritiesTitle = document.getElementById("helpTabPrioritiesTitle");
const helpTabRecurrencesBody1 = document.getElementById("helpTabRecurrencesBody1");
const helpTabRecurrencesTitle1 = document.getElementById("helpTabRecurrencesTitle1");
const html = document.getElementById("html");
const language = document.getElementById("language");
const modalWindows = document.querySelectorAll(".modal");
const reviewSourceforge = document.getElementById("reviewSourceforge");
const reviewWindowsStore = document.getElementById("reviewWindowsStore");
const settingsTabAbout = document.getElementById("settingsTabAbout");
const settingsTabAboutContribute = document.getElementById("settingsTabAboutContribute");
const settingsTabAboutCopyrightLicense = document.getElementById("settingsTabAboutCopyrightLicense");
const settingsTabAboutCopyrightLicenseBody = document.getElementById("settingsTabAboutCopyrightLicenseBody");
const settingsTabAboutExternalLibraries = document.getElementById("settingsTabAboutExternalLibraries");
const settingsTabAboutHeadline = document.getElementById("settingsTabAboutHeadline");
const settingsTabAboutPrivacy = document.getElementById("settingsTabAboutPrivacy");
const settingsTabAboutPrivacyBody = document.getElementById("settingsTabAboutPrivacyBody");
const themeHeadline = document.getElementById("themeHeadline");
const themeBody = document.getElementById("themeBody");
const settingsTabSettingsHeadline = document.getElementById("settingsTabSettingsHeadline");
const settingsTabSettingsLanguage = document.getElementById("settingsTabSettingsLanguage");
const settingsTabSettingsLanguageBody = document.getElementById("settingsTabSettingsLanguageBody");
const settingsTabSettingsLogging = document.getElementById("settingsTabSettingsLogging");
const settingsTabSettingsLoggingBody = document.getElementById("settingsTabSettingsLoggingBody");
const settingsTabSettingsNotifications = document.getElementById("settingsTabSettingsNotifications");
const settingsTabSettingsNotificationsBody = document.getElementById("settingsTabSettingsNotificationsBody");
const settingsTabSettingsTray = document.getElementById("settingsTabSettingsTray");
const settingsTabSettingsTrayBody = document.getElementById("settingsTabSettingsTrayBody");
const shareFacebook = document.getElementById("shareFacebook");
const shareLinkedin = document.getElementById("shareLinkedin");
const shareTwitter = document.getElementById("shareTwitter");
const submitIssuesOnGithub = document.getElementById("submitIssuesOnGithub");
const zoom = document.getElementById("zoom");
const zoomBody = document.getElementById("zoomBody");
const zoomHeadline = document.getElementById("zoomHeadline");
const zoomUndo = document.getElementById("zoomUndo");

addAsTodo.innerHTML = translations.addAsTodo;
autoUpdateBody.innerHTML = translations.autoUpdateBody;
autoUpdateHeadline.innerHTML = translations.autoUpdateHeadline;
compactViewBody.innerHTML = translations.compactViewBody;
compactViewHeadline.innerHTML = translations.compactView;
fileTabsBody.innerHTML = translations.fileTabsBody;
fileTabsHeadline.innerHTML = translations.fileTabsHeadline;
helpTab1Title.innerHTML = translations.shortcuts;
helpTab2Title.innerHTML = translations.priorities;
helpTab3Title.innerHTML = translations.helpTab3Title;
helpTab4Title.innerHTML = translations.helpTab4Title;
helpTab5Title.innerHTML = translations.helpTab5Title;
helpTabContextsProjectsBody.innerHTML = translations.helpTabContextsProjectsBody;
helpTabContextsProjectsTitle.innerHTML = translations.helpTabContextsProjectsTitle;
helpTabDatesBody1.innerHTML = translations.helpTabDatesBody1;
helpTabDatesBody2.innerHTML = translations.helpTabDatesBody2;
helpTabDatesTitle1.innerHTML = translations.helpTabDatesTitle1;
helpTabDatesTitle2.innerHTML = translations.helpTabDatesTitle2;
helpTabKeyboardSubtitle1.innerHTML = translations.helpTabKeyboardSubtitle1;
helpTabKeyboardSubtitle2.innerHTML = translations.helpTabKeyboardSubtitle2;
helpTabKeyboardTitle.innerHTML = translations.shortcuts;
helpTabKeyboardTR10TD1.innerHTML = translations.helpTabKeyboardTR10TD1;
helpTabKeyboardTR11TD1.innerHTML = translations.copyVisibleTodosToClipboard;
helpTabKeyboardTR12TD1.innerHTML = translations.reload;
helpTabKeyboardTR13TD1.innerHTML = translations.helpTabKeyboardTR13TD1;
helpTabKeyboardTR14TD1.innerHTML = translations.helpTabKeyboardTR14TD1;
helpTabKeyboardTR15TD1.innerHTML = translations.helpTabKeyboardTR15TD1;
helpTabKeyboardTR16TD1.innerHTML = translations.helpTabKeyboardTR16TD1;
helpTabKeyboardTR17TD1.innerHTML = translations.helpTabKeyboardTR17TD1;
helpTabKeyboardTR18TD1.innerHTML = translations.toggleDeferredTodos;
helpTabKeyboardTR19TD1.innerHTML = translations.printCurrentView;
helpTabKeyboardTR1TD1.innerHTML = translations.addTodo;
helpTabKeyboardTR1TH1.innerHTML = translations.function;
helpTabKeyboardTR20TD1.innerHTML = translations.switchToSpecificFile;
helpTabKeyboardTR21TD1.innerHTML = translations.showHelp;
helpTabKeyboardTR22TD1.innerHTML = translations.switchToNextFile;
helpTabKeyboardTR23TD1.innerHTML = translations.switchToPreviousFile;
helpTabKeyboardTR24TD1.innerHTML = translations.closeTabOrWindow;
helpTabKeyboardTR25TD1.innerHTML = translations.helpTabKeyboardTR25TD1;
helpTabKeyboardTR26TD1.innerHTML = translations.helpTabKeyboardTR26TD1;
helpTabKeyboardTR27TD1.innerHTML = translations.helpTabKeyboardTR27TD1;
helpTabKeyboardTR2TD1.innerHTML = translations.find;
helpTabKeyboardTR3TD1.innerHTML = translations.toggleCompletedTodos;
helpTabKeyboardTR4TD1.innerHTML = translations.toggleTheme;
helpTabKeyboardTR5TD1.innerHTML = translations.openFile;
helpTabKeyboardTR6TD1.innerHTML = translations.settings;
helpTabKeyboardTR7TD1.innerHTML = translations.helpTabKeyboardTR7TD1;
helpTabKeyboardTR8TD1.innerHTML = translations.toggleFilter;
helpTabKeyboardTR9TD1.innerHTML = translations.resetFilters;
helpTabPrioritiesBody.innerHTML = translations.helpTabPrioritiesBody;
helpTabPrioritiesTitle.innerHTML = translations.helpTabPrioritiesTitle;
helpTabRecurrencesBody1.innerHTML = translations.helpTabRecurrencesBody1;
helpTabRecurrencesTitle1.innerHTML = translations.helpTabRecurrencesTitle1;
reviewSourceforge.innerHTML = translations.reviewSourceforge;
reviewWindowsStore.innerHTML = translations.reviewWindowsStore;
settingsTabAbout.innerHTML = translations.about;
settingsTabAboutContribute.innerHTML = translations.settingsTabAboutContribute;
settingsTabAboutCopyrightLicense.innerHTML = translations.settingsTabAboutCopyrightLicense;
settingsTabAboutCopyrightLicenseBody.innerHTML = translations.settingsTabAboutCopyrightLicenseBody;
settingsTabAboutExternalLibraries.innerHTML = translations.settingsTabAboutExternalLibraries;
settingsTabAboutHeadline.innerHTML = translations.about;
settingsTabAboutPrivacy.innerHTML = translations.settingsTabAboutPrivacy;
settingsTabAboutPrivacyBody.innerHTML = translations.settingsTabAboutPrivacyBody;
themeHeadline.innerHTML = translations.themeHeadline;
themeBody.innerHTML = translations.themeBody;
settingsTabSettingsHeadline.innerHTML = translations.settings;
settingsTabSettingsLanguage.innerHTML = translations.language;
settingsTabSettingsLanguageBody.innerHTML = translations.settingsTabSettingsLanguageBody;
settingsTabSettingsLogging.innerHTML = translations.errorEventLogging;
settingsTabSettingsLoggingBody.innerHTML = translations.settingsTabSettingsLoggingBody;
settingsTabSettingsNotifications.innerHTML = translations.notifications;
settingsTabSettingsNotificationsBody.innerHTML = translations.settingsTabSettingsNotificationsBody;
settingsTabSettingsTray.innerHTML = translations.settingsTabSettingsTray;
settingsTabSettingsTrayBody.innerHTML = translations.settingsTabSettingsTrayBody;
shareFacebook.innerHTML = translations.shareFacebook;
shareLinkedin.innerHTML = translations.shareLinkedin;
shareTwitter.innerHTML = translations.shareTwitter;
submitIssuesOnGithub.innerHTML = translations.submitIssuesOnGithub;
zoomBody.innerHTML = translations.zoomBody;
zoomHeadline.innerHTML = translations.zoomHeadline;

language.onchange = function() {
  // only continue if language code has been passed
  if(!this.value) return false;

  getConfirmation(setLanguage, translations.restartPrompt, this.value).then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Language changed to: " + this.value]);
}
theme.onchange = function() {
  // only continue if language code has been passed
  if(!this.value) return false;
  
  window.api.send("setTheme", this.value)

  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Theme changed to: " + this.value]);
}
zoom.onchange = function() {
  setZoom(this.value).then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Zoom ranger dragged"]);
}
zoomUndo.onclick = function() {
  setZoom(100).then(response => {
    console.log(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "View-Drawer", "Click on zoom undo"]);
};

function setZoom(value) {
  try {
    // manipulate dom
    html.style.zoom = value + "%";

    // update the range picker
    zoom.value = value;

    // update the input field
    document.getElementById("zoomStatus").innerHTML = value + "%";

    // persist zoom setting
    setUserData("zoom", value).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    return Promise.resolve("Info: Zoom set to " + value + "%");

  } catch (error) {
    error.functionName = setZoom.name;
    return Promise.reject(error);
  }
}
function setLanguage(languageCode) {
  window.api.send("changeLanguage", languageCode);
}
function setFriendlyLanguageNames() {
  try {

    // generate user friendly entries for language selection menu
    const friendlyLanguageName = {
      de: "Deutsch",
      en: "English",
      it: "Italiano",
      es: "Español",
      fr: "Français",
      zh: "简体中文",
      pt: "Português do Brasil",
      jp: "日本語",
      tr: "Türkçe",
      hu: "Magyar",
      cs: "Čeština",
      pl: "Polski"
    }
    appData.languages.forEach((languageCode) => {
      let option = document.createElement("option");
      option.text = friendlyLanguageName[languageCode];
      option.value = languageCode;
      if(languageCode === userData.language) option.selected = true;
      language.add(option);
    });

    return Promise.resolve("Success: Friendly language names added to select field in settings");

  } catch(error) {
    error.functionName = setFriendlyLanguageNames.name;
    return Promise.reject(error);
  }
}
export function showModal(modalId) {
  try {

    // in case a content window was open, it will be closed
    modalWindows.forEach(function(modalWindow) { modalWindow.classList.remove("is-active") });

    const modal = document.getElementById(modalId);
    // show the actual window
    modal.classList.add("is-active");

    // create the modal jail, so tabbing won't leave modal
    createModalJail(modal).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    const tabs = modal.querySelectorAll(".tabs ul li");
    // only if any tabs are found
    if(tabs.length > 0) {

      tabs.forEach(function(tab, index) {
              
        // put highlight on first tab
        (index === 0) ? tab.classList.add("is-active") : tab.classList.remove("is-active")

        tab.onclick = function() {
          
          // hide all cards
          cards.forEach(function(card) { card.classList.remove("is-active") });
          
          // hide all tabs
          tabs.forEach(function(tab) { tab.classList.remove("is-active") });

          // show selected tab
          tab.classList.add("is-active");

          // show selected card
          cards[index].classList.add("is-active");

          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
        }

      });
    }

    const cards = modal.querySelectorAll(".modal-card section");
    cards.forEach(function(card, index) {
      // activate first card only, remove highlightings of all others
      (index === 0) ? card.classList.add("is-active") : card.classList.remove("is-active");
    });

    return Promise.resolve("Success: Showing content container " + modalId);

  } catch(error) {
    error.functionName = showModal.name;
    return Promise.reject(error);
  }
}
// generate friendly names for language dropdown
setFriendlyLanguageNames().then(function(response) {
  console.info(response);
}).catch(function(error) {
  handleError(error);
});