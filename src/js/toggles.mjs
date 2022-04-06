import { _paq } from "./matomo.mjs";
import { getConfirmation } from "./prompt.mjs";
import { handleError } from "./helper.mjs";
import { generateFileTabs } from "./files.mjs";
import { configureMatomo } from "./matomo.mjs";
import { buildTable, userData, setUserData, translations } from "../render.js";

const body = document.getElementById("body");
const toggles = document.querySelectorAll(".toggle input[type=checkbox]");
const setTray = function(setting) { 
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Tray changed to: " + setting]);
  
  // restart app
  window.api.send("restart");

  return Promise.resolve("Info: Tray toggle changed to: " + setting);
}

export function triggerToggle(inputField, toggle) {
  try {

    // if toggle is set the input fields value will be inverted
    if(toggle) inputField.checked = !inputField.checked;

    // persist setting retrieved from checkbox object
    setUserData(inputField.id, inputField.checked).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    // handle specific functions triggered after option is toggled
    switch(inputField.id) {
      case "matomoEvents":
        configureMatomo(inputField.checked).then(response => {
          console.info(response);
        }).catch(error => {
          handleError(error);
        });
        break;
      case "compactView":
        (userData[inputField.id]) ? body.classList.add("compact") : body.classList.remove("compact")
        break;
      case "tray":
        getConfirmation(setTray, translations.restartPrompt, inputField.checked);
        break;
      case "fileTabs":
        // reload file tab bar  
        generateFileTabs().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        break;
    }

    // toggles in view drawer need to trigger rebuilding the table
    if(inputField.classList.contains("view")) {
      buildTable().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
    }

    return Promise.resolve("Success: " + inputField.id + " toggle set to: " + inputField.checked);

  } catch(error) {
    error.functionName = triggerToggle.name;
    return Promise.reject(error);
  }
}

// setup the toggles
toggles.forEach(function(inputField) {

  // set checked according to user data
  inputField.checked = userData[inputField.id];
  
  // setup up the click event
  inputField.onclick = function() {
    triggerToggle(inputField).then(response => {
      console.log(response);
    }).catch(error => {
      handleError(error);
    });
  }
});