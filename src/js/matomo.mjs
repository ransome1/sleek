"use strict";
import { appData, userData, setUserData } from "../render.js";
import { items } from "./todos.mjs";
import { handleError } from "./helper.mjs";

const matomoEvents = document.getElementById("matomoEvents");

let _paq;

function configureMatomo() {
  try {
    _paq = window._paq = window._paq || [];
    // only continue if app is connected to the internet
    if(!navigator.onLine) return Promise.resolve("Info: App is offline, Matomo will not be loaded");
    // only continue if machine is no dvelopment machine
    if(appData.environment) return Promise.resolve("Info: No tracking in development and testing environment");
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
    if(userData.sortBy)_paq.push(['setCustomDimension', 16, userData.sortBy.join(", ")]);
    if(userData.zoom)_paq.push(['setCustomDimension', 17, userData.zoom]);
    if(appData.channel)_paq.push(['setCustomDimension', 18, appData.channel]);
    if(typeof userData.tray === "boolean")_paq.push(['setCustomDimension', 19, userData.tray]);
    if(typeof userData.showEmptyFilters === "boolean")_paq.push(['setCustomDimension', 20, userData.showEmptyFilters]);
    if(items) _paq.push(['setCustomDimension', 21, todoRange(items.objects.length)]);
    if(typeof userData.deferredTodos === "boolean")_paq.push(['setCustomDimension', 22, userData.deferredTodos]);
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

matomoEvents.onclick = function() {
  setUserData('matomoEvents', this.checked);
  configureMatomo(this.checked).then(response => {
    console.info(response);
  }).catch(error => {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Setting", "Click on Logging", this.checked])
}

matomoEvents.checked = userData.matomoEvents;

export { _paq, configureMatomo };
