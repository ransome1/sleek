"use strict";
import { userData, translations } from "../render.js";
import { generateFileList } from "./files.mjs";
import { show } from "./form.mjs";
import { showDrawer } from "./drawer.mjs";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";

const addTodoContainerButton = document.getElementById("addTodoContainerButton");
const addTodoContainerHeadline = document.getElementById("addTodoContainerHeadline");
const addTodoContainerSubtitle = document.getElementById("addTodoContainerSubtitle");
const btnAddTodoContainer = document.getElementById("btnAddTodoContainer");
const btnOnboardingCreateTodoFile = document.getElementById("btnOnboardingCreateTodoFile");
const btnOnboardingOpenTodoFile = document.getElementById("btnOnboardingOpenTodoFile");
const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnView = document.getElementById("navBtnView");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const onboardingContainer = document.getElementById("onboardingContainer");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const todoTable = document.getElementById("todoTable");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
const welcomeToSleek = document.getElementById("welcomeToSleek");
const modalChangeFile = document.getElementById("modalChangeFile");

addTodoContainerButton.innerHTML = translations.addTodo;
addTodoContainerHeadline.innerHTML = translations.addTodoContainerHeadline;
addTodoContainerSubtitle.innerHTML = translations.addTodoContainerSubtitle;
noResultContainerHeadline.innerHTML = translations.noResults;
noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;
onboardingContainerBtnCreate.innerHTML = translations.createFile;
onboardingContainerBtnOpen.innerHTML = translations.openFile;
onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;
welcomeToSleek.innerHTML = translations.welcomeToSleek;

btnAddTodoContainer.onclick = function () {
  show().then(response => {
    console.info(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
}

btnOnboardingCreateTodoFile.onclick = function() {

  window.api.send("openOrCreateFile", "create");
  
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Create file"]);
}

btnOnboardingOpenTodoFile.onclick = function() {
  // if files are already available show file modal
  if(typeof userData.files === "object" && userData.files.length > 0) {

    generateFileList().then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
    
  // if NO files are available, file chooser will be opened
  } else {

    window.api.send("openOrCreateFile", "open");

  }

  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Open file"]);
}

export function showOnboarding() {
  try {

    // show onboarding
    if(arguments[0]) {

      navBtnAddTodo.classList.add("is-hidden");
      navBtnFilter.classList.add("is-hidden");
      navBtnView.classList.add("is-hidden");
      onboardingContainer.classList.add("is-active");
      todoTable.classList.remove("is-active");
      todoTableSearchContainer.classList.remove("is-active");
      modalChangeFile.classList.remove("is-active");
      showDrawer(false);

      return Promise.resolve("Success: Onboarding shown");

    // hide onboarding
    } else {

      navBtnAddTodo.classList.remove("is-hidden");
      navBtnFilter.classList.remove("is-hidden");
      navBtnView.classList.remove("is-hidden");
      onboardingContainer.classList.remove("is-active");
      todoTable.classList.add("is-active");
      todoTableSearchContainer.classList.add("is-active");

      return Promise.resolve("Success: Onboarding hidden");

    }

  } catch(error) {
    error.functionName = showOnboarding.name;
    return Promise.reject(error);
  }
}