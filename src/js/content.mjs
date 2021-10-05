"use strict";
import { modal, userData, appData, setUserData, translations, handleError, setTheme, getConfirmation } from "../render.js";
import { _paq } from "./matomo.mjs";
import { createModalJail } from "../configs/modal.config.mjs";

const reviewSourceforge = document.getElementById("reviewSourceforge");
const reviewWindowsStore = document.getElementById("reviewWindowsStore");
const shareFacebook = document.getElementById("shareFacebook");
const shareLinkedin = document.getElementById("shareLinkedin");
const shareTwitter = document.getElementById("shareTwitter");
const submitIssuesOnGithub = document.getElementById("submitIssuesOnGithub");
const contentTabs = document.querySelectorAll('.modal.content ul li');
const contentTabsCards = document.querySelectorAll('.modal.content section');
const helpTab1Title = document.getElementById("helpTab1Title");
const helpTab2Title = document.getElementById("helpTab2Title");
const helpTab3Title = document.getElementById("helpTab3Title");
const helpTab4Title = document.getElementById("helpTab4Title");
const helpTab5Title = document.getElementById("helpTab5Title");
const helpTabContextsProjectsBody = document.getElementById("helpTabContextsProjectsBody");
const helpTabContextsProjectsTitle = document.getElementById("helpTabContextsProjectsTitle");
const helpTabDatesBody1 = document.getElementById("helpTabDatesBody1");
const helpTabDatesBody2 = document.getElementById("helpTabDatesBody2");
const helpTabRecurrencesBody1 = document.getElementById("helpTabRecurrencesBody1");
const helpTabDatesTitle1 = document.getElementById("helpTabDatesTitle1");
const helpTabDatesTitle2 = document.getElementById("helpTabDatesTitle2");
const helpTabRecurrencesTitle1 = document.getElementById("helpTabRecurrencesTitle1");
const helpTabKeyboardTitle = document.getElementById("helpTabKeyboardTitle");
const helpTabKeyboardTR1TD1 = document.getElementById("helpTabKeyboardTR1TD1");
const helpTabKeyboardTR1TH1 = document.getElementById("helpTabKeyboardTR1TH1");
const helpTabKeyboardTR2TD1 = document.getElementById("helpTabKeyboardTR2TD1");
const helpTabKeyboardTR3TD1 = document.getElementById("helpTabKeyboardTR3TD1");
const helpTabKeyboardTR4TD1 = document.getElementById("helpTabKeyboardTR4TD1");
const helpTabKeyboardTR5TD1 = document.getElementById("helpTabKeyboardTR5TD1");
const helpTabKeyboardTR6TD1 = document.getElementById("helpTabKeyboardTR6TD1");
const helpTabKeyboardTR7TD1 = document.getElementById("helpTabKeyboardTR7TD1");
const helpTabKeyboardTR8TD1 = document.getElementById("helpTabKeyboardTR8TD1");
const helpTabKeyboardTR9TD1 = document.getElementById("helpTabKeyboardTR9TD1");
const helpTabKeyboardTR10TD1 = document.getElementById("helpTabKeyboardTR10TD1");
const helpTabKeyboardTR11TD1 = document.getElementById("helpTabKeyboardTR11TD1");
const helpTabKeyboardTR12TD1 = document.getElementById("helpTabKeyboardTR12TD1");
const helpTabPrioritiesBody = document.getElementById("helpTabPrioritiesBody");
const helpTabPrioritiesTitle = document.getElementById("helpTabPrioritiesTitle");
const settingsLanguage = document.getElementById("settingsLanguage");
const settingsTabAbout = document.getElementById("settingsTabAbout");
const settingsTabAboutContribute = document.getElementById("settingsTabAboutContribute");
const settingsTabAboutCopyrightLicense = document.getElementById("settingsTabAboutCopyrightLicense");
const settingsTabAboutCopyrightLicenseBody = document.getElementById("settingsTabAboutCopyrightLicenseBody");
const settingsTabAboutExternalLibraries = document.getElementById("settingsTabAboutExternalLibraries");
const settingsTabAboutHeadline = document.getElementById("settingsTabAboutHeadline");
const settingsTabAboutPrivacy = document.getElementById("settingsTabAboutPrivacy");
const settingsTabAboutPrivacyBody = document.getElementById("settingsTabAboutPrivacyBody");
const settingsTabSettings = document.getElementById("settingsTabSettings");
const settingsTabSettingsDarkmode = document.getElementById("settingsTabSettingsDarkmode");
const settingsTabSettingsHeadline = document.getElementById("settingsTabSettingsHeadline");
const settingsTabSettingsLanguage = document.getElementById("settingsTabSettingsLanguage");
const settingsTabSettingsLanguageBody = document.getElementById("settingsTabSettingsLanguageBody");
const settingsTabSettingsLogging = document.getElementById("settingsTabSettingsLogging");
const settingsTabSettingsLoggingBody = document.getElementById("settingsTabSettingsLoggingBody");
const settingsTabSettingsNotifications = document.getElementById("settingsTabSettingsNotifications");
const settingsTabSettingsNotificationsBody = document.getElementById("settingsTabSettingsNotificationsBody");
const settingsTabSettingsTray = document.getElementById("settingsTabSettingsTray");
const settingsTabSettingsTrayBody = document.getElementById("settingsTabSettingsTrayBody");
const helpTabKeyboardSubtitle = document.getElementById("helpTabKeyboardSubtitle");
const helpTabKeyboardTR13TD1 = document.getElementById("helpTabKeyboardTR13TD1");
const helpTabKeyboardTR14TD1 = document.getElementById("helpTabKeyboardTR14TD1");
const helpTabKeyboardTR15TD1 = document.getElementById("helpTabKeyboardTR15TD1");
const helpTabKeyboardTR16TD1 = document.getElementById("helpTabKeyboardTR16TD1");
const helpTabKeyboardTR17TD1 = document.getElementById("helpTabKeyboardTR17TD1");
const toggleDarkmode = document.getElementById("toggleDarkmode");
const toggleNotifications = document.getElementById("toggleNotifications");
const toggleTray = document.getElementById("toggleTray");

helpTabKeyboardSubtitle.innerHTML = translations.helpTabKeyboardSubtitle;
helpTabKeyboardTR13TD1.innerHTML = translations.helpTabKeyboardTR13TD1;
helpTabKeyboardTR14TD1.innerHTML = translations.helpTabKeyboardTR14TD1;
helpTabKeyboardTR15TD1.innerHTML = translations.helpTabKeyboardTR15TD1;
helpTabKeyboardTR16TD1.innerHTML = translations.helpTabKeyboardTR16TD1;
helpTabKeyboardTR17TD1.innerHTML = translations.helpTabKeyboardTR17TD1;
helpTab1Title.innerHTML = translations.shortcuts;
helpTab2Title.innerHTML = translations.priorities;
helpTab3Title.innerHTML = translations.helpTab3Title;
helpTab4Title.innerHTML = translations.helpTab4Title;
helpTab5Title.innerHTML = translations.helpTab5Title;
helpTabContextsProjectsBody.innerHTML = translations.helpTabContextsProjectsBody;
helpTabContextsProjectsTitle.innerHTML = translations.helpTabContextsProjectsTitle;
helpTabDatesBody1.innerHTML = translations.helpTabDatesBody1;
helpTabDatesBody2.innerHTML = translations.helpTabDatesBody2;
helpTabRecurrencesBody1.innerHTML = translations.helpTabRecurrencesBody1;
helpTabDatesTitle1.innerHTML = translations.helpTabDatesTitle1;
helpTabDatesTitle2.innerHTML = translations.helpTabDatesTitle2;
helpTabRecurrencesTitle1.innerHTML = translations.helpTabRecurrencesTitle1;
helpTabKeyboardTitle.innerHTML = translations.shortcuts;
helpTabKeyboardTR10TD1.innerHTML = translations.helpTabKeyboardTR10TD1;
helpTabKeyboardTR1TD1.innerHTML = translations.addTodo;
helpTabKeyboardTR1TH1.innerHTML = translations.function;
helpTabKeyboardTR2TD1.innerHTML = translations.find;
helpTabKeyboardTR3TD1.innerHTML = translations.toggleCompletedTodos;
helpTabKeyboardTR4TD1.innerHTML = translations.toggleDarkMode;
helpTabKeyboardTR5TD1.innerHTML = translations.openFile;
helpTabKeyboardTR6TD1.innerHTML = translations.settings;
helpTabKeyboardTR7TD1.innerHTML = translations.helpTabKeyboardTR7TD1;
helpTabKeyboardTR8TD1.innerHTML = translations.toggleFilter;
helpTabKeyboardTR9TD1.innerHTML = translations.resetFilters;
helpTabKeyboardTR11TD1.innerHTML = translations.createFile;
helpTabKeyboardTR12TD1.innerHTML = translations.reload;
helpTabPrioritiesBody.innerHTML = translations.helpTabPrioritiesBody;
helpTabPrioritiesTitle.innerHTML = translations.helpTabPrioritiesTitle;
settingsTabAbout.innerHTML = translations.about;
settingsTabAboutContribute.innerHTML = translations.settingsTabAboutContribute;
settingsTabAboutCopyrightLicense.innerHTML = translations.settingsTabAboutCopyrightLicense;
settingsTabAboutCopyrightLicenseBody.innerHTML = translations.settingsTabAboutCopyrightLicenseBody;
settingsTabAboutExternalLibraries.innerHTML = translations.settingsTabAboutExternalLibraries;
settingsTabAboutHeadline.innerHTML = translations.about;
settingsTabAboutPrivacy.innerHTML = translations.settingsTabAboutPrivacy;
settingsTabAboutPrivacyBody.innerHTML = translations.settingsTabAboutPrivacyBody;
//settingsTabSettings.innerHTML = translations.settings;
settingsTabSettingsDarkmode.innerHTML = translations.darkmode;
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
reviewSourceforge.innerHTML = translations.reviewSourceforge;
reviewWindowsStore.innerHTML = translations.reviewWindowsStore;
submitIssuesOnGithub.innerHTML = translations.submitIssuesOnGithub;

contentTabs.forEach(tab => tab.addEventListener("click", function() {
  contentTabs.forEach(function(tab) {
    tab.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
}));

settingsLanguage.onchange = function() {
  getConfirmation(setLanguage, translations.restartPrompt, this.value);
}
toggleNotifications.onclick = function() {
  setUserData("notifications", this.checked);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Notifications", this.checked])
}
toggleDarkmode.onclick = function() {
  setTheme(true);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Dark mode", this.checked])
}
toggleTray.onclick = function(event) {
  event.preventDefault();
  getConfirmation(setTray, translations.restartPrompt, this.checked);
}

toggleNotifications.checked = userData.notifications;
toggleTray.checked = userData.tray;

function setTray(setting) {
  setUserData("tray", setting);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Tray changed to: " + setting]);
  window.api.send("restart");
  return Promise.resolve("Info: Tray changed to: " + setting);
}
function setLanguage(language) {
  if(appData.environment==="testing") return false;
  userData.language = language;
  window.api.send("userData", ["language", userData.language]);
  window.api.send("changeLanguage", language);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Language changed to: " + language]);
}
function showTab(tab) {
  contentTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  document.getElementById(tab).classList.add("is-active");
}
function showContent(id) {
  try {
    const section = document.getElementById(id);
    // in case a content window was open, it will be closed
    modal.forEach(function(el) {
      el.classList.remove("is-active");
    });
    contentTabs.forEach(function(el) {
      el.classList.remove("is-active");
    });
    contentTabsCards.forEach(function(el) {
      el.classList.remove("is-active");
    });
    let firstTab = section.querySelector(".tabs");
    firstTab.firstElementChild.firstElementChild.classList.add("is-active");
    let firstSection = section.querySelector("section");
    firstSection.classList.add("is-active");
    section.classList.add("is-active");
    section.focus();
    // create the modal jail, so tabbing won't leave modal
    createModalJail(section);
    return Promise.resolve("Info: Content is shown");
  } catch(error) {
    error.functionName = showContent.name;
    return Promise.reject(error);
  }
}
function setFriendlyLanguageNames() {
  try {
    appData.languages.forEach((language) => {
      // generate user friendly entries for language selection menu
      let friendlyLanguageName;
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
        friendlyLanguageName = "简体中文"
        break;
        case "pt":
        friendlyLanguageName = "Português do Brasil"
        break;
        case "jp":
        friendlyLanguageName = "日本語"
        break;
        case "tr":
        friendlyLanguageName = "Türkçe"
        break;
        case "hu":
        friendlyLanguageName = "Magyar"
        break;
        case "cs":
        friendlyLanguageName = "Čeština"
        break;
        default:
        return;
      }
      let option = document.createElement("option");
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

setFriendlyLanguageNames().then(function(response) {
  console.info(response);
}).catch(function(error) {
  handleError(error);
});

export { showContent };
