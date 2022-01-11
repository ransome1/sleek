"use strict";
import { userData, translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { generateFileList } from "./files.mjs";
import { _paq } from "./matomo.mjs";
import { handleError, configureMainView } from "./helper.mjs";

const addTodoContainerButton = document.getElementById("addTodoContainerButton");
const addTodoContainerHeadline = document.getElementById("addTodoContainerHeadline");
const addTodoContainerSubtitle = document.getElementById("addTodoContainerSubtitle");
const btnOnboardingCreateTodoFile = document.getElementById("btnOnboardingCreateTodoFile");
const btnOnboardingOpenTodoFile = document.getElementById("btnOnboardingOpenTodoFile");
const onboardingContainer = document.getElementById("onboardingContainer");
const onboardingContainerBtnCreate = document.getElementById("onboardingContainerBtnCreate");
const onboardingContainerBtnOpen = document.getElementById("onboardingContainerBtnOpen");
const onboardingContainerSubtitle = document.getElementById("onboardingContainerSubtitle");
const welcomeToSleek = document.getElementById("welcomeToSleek");
const noResultContainerHeadline = document.getElementById("noResultContainerHeadline");
const noResultContainerSubtitle = document.getElementById("noResultContainerSubtitle");
const modalChangeFile = document.getElementById("modalChangeFile");
const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const todoTable = document.getElementById("todoTable");
const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");

export let onboarding;

onboardingContainerBtnCreate.innerHTML = translations.createFile;
onboardingContainerBtnOpen.innerHTML = translations.openFile;
onboardingContainerSubtitle.innerHTML = translations.onboardingContainerSubtitle;
welcomeToSleek.innerHTML = translations.welcomeToSleek;
addTodoContainerButton.innerHTML = translations.addTodo;
addTodoContainerHeadline.innerHTML = translations.addTodoContainerHeadline;
addTodoContainerSubtitle.innerHTML = translations.addTodoContainerSubtitle;
noResultContainerHeadline.innerHTML = translations.noResults;
noResultContainerSubtitle.innerHTML = translations.noResultContainerSubtitle;

btnOnboardingCreateTodoFile.onclick = function() {
      window.api.send("openOrCreateFile", "create");
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Create file"]);
    }
btnOnboardingOpenTodoFile.onclick = function() {
  //TODO: this is a duplicate
  if(typeof userData.files === "object" && userData.files.length>0) {
    generateFileList().then(response => {
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
  if(userData.matomoEvents) _paq.push(["trackEvent", "Onboarding", "Click on Open file"]);
}

export function showOnboarding(variable) {
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