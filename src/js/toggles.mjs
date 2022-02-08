import { startBuilding, userData, setUserData, translations } from "../render.js";
import { handleError } from "./helper.mjs";
import { getConfirmation } from "./prompt.mjs";

const toggles = document.querySelectorAll(".toggle input[type=checkbox]");

export async function triggerToggle(inputField, toggle) {
  try {

    // if toggle is set the input fields value will be inverted
    if(toggle) inputField.checked = !inputField.checked;

    // persist setting retrieved from checkbox object
    await setUserData(inputField.id, inputField.checked).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

    // handle specific functions triggered after option is toggled
    switch(inputField.id) {
      case "compactView":
        (userData[inputField.id]) ? body.classList.add("compact") : body.classList.remove("compact")
        break;
      case "darkmode":
        window.api.send("darkmode", userData.darkmode);
        (userData[inputField.id]) ? body.classList.add("dark") : body.classList.remove("dark")
        break;
      case "tray":
        const setTray = function(setting) { 
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Settings", "Tray changed to: " + setting]);
          window.api.send("restart");
          return Promise.resolve("Info: Tray toggle changed to: " + setting);
        }
        getConfirmation(setTray, translations.restartPrompt, inputField.checked);
        break;
      case "fileTabs":
        // show or hide tab bar
        (userData.fileTabs) ? fileTabBar.classList.add("is-active") : fileTabBar.classList.remove("is-active")
        break;
    }

    // toggles in view drawer need to trigger rebuilding the table
    if(inputField.classList.contains("view")) startBuilding();

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