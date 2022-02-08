"use strict";
import { translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { handleError } from "./helper.mjs";

const modalPrompt = document.getElementById("modalPrompt");
const modalPromptContent = document.getElementById("modalPromptContent");
const modalPromptCancel = document.getElementById("modalPromptCancel");
const modalPromptConfirm = document.getElementById("modalPromptConfirm");

modalPromptConfirm.innerHTML = translations.confirm;
modalPromptCancel.innerHTML = translations.cancel;

// will respond to either of the two clicks
function getConfirmationResponse() {
	try {

		return new Promise((resolve, reject) => {
			modalPromptConfirm.onclick = function() {
				resolve("Info: Prompt confirmed");
			}
			modalPromptCancel.onclick = function() {
				reject("Info: Prompt canceled");
			}
		});

	} catch(error) {
		error.functionName = getConfirmationResponse.name;
		return Promise.reject(error);
  }
}

// async function thats shows the prompt window and waits for getConfirmationResponse to respond
export async function getConfirmation() {
	try {

		// only continue if there is anything to execute
		if(arguments.length === 0) return Promise.resolve("Info: Not enough arguments have been passed");

		// the function that has been passed
		const functionToExecute = arguments[0];

		// the text for prompt window
		const promptText = arguments[1];

		// and its parameters
		const args = Array.prototype.slice.call(arguments, 2);
				
		// show modal window
		modalPrompt.classList.add("is-active");

		// prompt text that has been passed (second argument)
		modalPromptContent.innerHTML = promptText;
		
		// create the modal jail, so tabbing won't leave modal
		createModalJail(modalPrompt).then(function(response) {
			console.info(response);
		}).catch(function(error) {
			handleError(error);
		});

		// wait for user response
		await getConfirmationResponse().then(function() {
			// if prompt is confirmed, execute function
			functionToExecute.apply(null, args).then(function(response) {
				console.info(response);
			}).catch(function(error) {
				handleError(error);
			});
		// if prompt is canceled
		}).catch(function(error) {
			handleError(error);
		});

		// close prompt modal
		modalPrompt.classList.remove("is-active");

		return Promise.resolve("Success: " + functionToExecute + " has been executed");
		
	} catch(error) {
		error.functionName = getConfirmation.name;
		return Promise.reject(error);
	}
}