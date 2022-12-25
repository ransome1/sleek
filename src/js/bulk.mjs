"use strict";

import { items } from "./todos.mjs";
import { handleError } from "./helper.mjs";
import { createModalJail } from "./jail.mjs";

const bulkEditForm = document.getElementById("bulkEditForm");
const bulkEditFormPriorityPicker = document.getElementById("bulkEditFormPriorityPicker");
const bulkEditFormAddTags = document.getElementById("bulkEditFormAddTags");
const bulkEditFormRemoveTags = document.getElementById("bulkEditFormRemoveTags");
const bulkEditFormSubmit = document.getElementById("bulkEditFormSubmit");
const bulkEditFormHeadlineCount = document.getElementById("bulkEditFormHeadlineCount");

bulkEditForm.onkeypress = function(event) {
	if(event.key === "Enter") this.requestSubmit();
}

bulkEditForm.onsubmit = async function() {
	const tagsToAdd = {
		combined: bulkEditFormAddTags.value.split(" "),
		contexts: new Array,
		projects: new Array
	}
	const tagsToRemove = {
		combined: bulkEditFormRemoveTags.value.split(" "),
		contexts: new Array,
		projects: new Array
	}
	tagsToAdd.combined.forEach(tag => {
		if(tag.length === 1) return false
		if(tag.slice(0,1) === "@") tagsToAdd.contexts.push(tag.slice(1))
		if(tag.slice(0,1) === "+") tagsToAdd.projects.push(tag.slice(1))
	})
	tagsToRemove.combined.forEach(tag => {
		if(tag.length === 1) return false
		if(tag.slice(0,1) === "@") tagsToRemove.contexts.push(tag.slice(1))
		if(tag.slice(0,1) === "+") tagsToRemove.projects.push(tag.slice(1))
	})
	addTags(tagsToAdd).then(response => {
		console.log(response);
	}).catch(error => {
		handleError(error);
	});
	removeTags(tagsToRemove).then(response => {
		console.log(response);
	}).catch(error => {
		handleError(error);
	});
	if(bulkEditFormPriorityPicker.value) {
	    items.selected.forEach(index => {
	      items.objects[index].priority = bulkEditFormPriorityPicker.value;
	      //write the data to the file and advice to focus the row after reload
	      window.api.send("writeToFile", [items.objects[index].toString(), index]);
	    });
	}

	bulkEditForm.classList.remove("is-active")
	items.selected = new Array;
}

bulkEditFormSubmit.onclick = function(event) {
  bulkEditForm.requestSubmit();
}

function showBulkModal() {
	try {
		createModalJail(bulkEditForm).then(response => {
			console.log(response);
		}).catch(error => {
			handleError(error);
		});
		bulkEditFormHeadlineCount.innerHTML = items.selected.length;
		todoContext.classList.remove("is-active");
		bulkEditForm.classList.add("is-active");
		bulkEditFormAddTags.value = null;
		bulkEditFormRemoveTags.value = null;
		bulkEditFormPriorityPicker.selectedIndex = 0;
		return Promise.resolve("Success: Bulkd modal emptied and shown");
	} catch(error) {
		error.functionName = addTags.name;
		return Promise.reject(error);
	}
}

function addTags(tagsToAdd) {
  try {
    items.selected.forEach(index => {
      if(tagsToAdd.contexts.length > 0) {
        tagsToAdd.contexts.forEach(context => {
          if(items.objects[index].contexts === null) items.objects[index].contexts = new Array;
          if(items.objects[index].contexts.indexOf(context) === -1) items.objects[index].contexts.push(context)
        })
      }
      if(tagsToAdd.projects.length > 0) {
        tagsToAdd.projects.forEach(project => {
          if(items.objects[index].projects === null) items.objects[index].projects = new Array;
          if(items.objects[index].projects.indexOf(project) === -1) items.objects[index].projects.push(project)
        })
      }
      //write the data to the file and advice to focus the row after reload
      window.api.send("writeToFile", [items.objects[index].toString(), index]);
    });
    return Promise.resolve("Success: Tags added to todos");
  } catch(error) {
    error.functionName = addTags.name;
    return Promise.reject(error);
  }
}

function removeTags(tagsToRemove) {
  try {
    items.selected.forEach(index => {
      if(items.selected.contexts !== null && tagsToRemove.contexts.length > 0) {
        tagsToRemove.contexts.forEach(context => {
        	const indexOfContext = items.objects[index].contexts.indexOf(context)
        	if(indexOfContext !== -1) items.objects[index].contexts.splice(indexOfContext, 1)
        })
        if(items.objects[index].contexts.length === 0) items.objects[index].contexts = null;
      }
      if(items.selected.projects !== null && tagsToRemove.projects.length > 0) {
        tagsToRemove.projects.forEach(project => {
        	const indexOfProject = items.objects[index].projects.indexOf(project)
        	if(indexOfProject !== -1) items.objects[index].projects.splice(indexOfProject, 1)
        })
        if(items.objects[index].projects.length === 0) items.objects[index].projects = null;
      }
      //write the data to the file and advice to focus the row after reload
      window.api.send("writeToFile", [items.objects[index].toString(), index]);
    });
    return Promise.resolve("Success: Tags removed from todos");
  } catch(error) {
    error.functionName = removeTags.name;
    return Promise.reject(error);
  }
}

export { showBulkModal }