"use strict";
import { translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { handleError } from "./helper.mjs";

const modalPromptConfirm = document.getElementById("modalPromptConfirm");
const modalPromptCancel = document.getElementById("modalPromptCancel");

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
export async function getConfirmation() {
	const modalPrompt = document.getElementById("modalPrompt");
	const modalPromptContent = document.getElementById("modalPromptContent");

	modalPromptConfirm.innerHTML = translations.confirm;
	modalPromptCancel.innerHTML = translations.cancel;
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