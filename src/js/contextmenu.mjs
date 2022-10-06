import {show} from "./form.mjs";
import {handleError, pasteItemToClipboard} from "./helper.mjs";
import {translations, userData} from "../render.js";
import {_paq} from "./matomo.mjs";
import {createModalJail} from "./jail.mjs";
import {items} from "./todos.mjs";

const todoContext = document.getElementById("todoContext");
const todoContextPriorityIncrease = document.getElementById("todoContextPriorityIncrease");
const todoContextPriorityDecrease = document.getElementById("todoContextPriorityDecrease");
const todoContextDelete = document.getElementById("todoContextDelete");
const todoContextCopy = document.getElementById("todoContextCopy");
const todoContextUseAsTemplate = document.getElementById("todoContextUseAsTemplate");

todoContextDelete.innerHTML = translations.delete;
todoContextCopy.innerHTML = translations.copy;
todoContextUseAsTemplate.innerHTML = translations.useAsTemplate;

async function createTodoContext(event, todoTableRow) {
    try {
        // get index of to do
        let index = await items.objects.map(function(object) {return object.raw; }).indexOf(todoTableRow.getAttribute("data-item"));
        // retrieve to do object
        const todo = items.objects[index]

        todoContext.setAttribute("data-item", todoTableRow.getAttribute("data-item"))
        todoContext.setAttribute("data-item", todoTableRow.getAttribute("data-item"))

        setEvents(index, todo);
        todoContext.classList.add("is-active");
        setPosition(event);

        // ugly but necessary: if triggered to fast arrow right will do a first row change in jail
        setTimeout(function() {
            createModalJail(todoContext, true).then(response => {
                console.log(response);
            }).catch(error => {
                handleError(error);
            });
        }, 10);

        return Promise.resolve("Success: Context opened");

    } catch(error) {
        error.functionName = createTodoContext.name;
        return Promise.reject(error);
    }
}

function changePriority(index, direction) {
    const todo = items.objects[index];

    let nextIndex = 97;

    // in case a todo has no priority and the 1st grouping method is priority
    if (!todo.priority && userData.sortBy[0] === "priority") {
        const index = items.grouped.length - 2;
        // this receives the lowest available priority group
        (index >= 0) ? nextIndex = items.grouped[index][0].toLowerCase().charCodeAt(0) : nextIndex = 97
        // change priority based on current priority
    } else if (todo.priority) {
        const currentPriority = todo.priority.toLowerCase().charCodeAt(0)
        nextIndex = currentPriority + direction;
    }

    if (nextIndex <= 96 || nextIndex >= 123) return false

    todo.priority = String.fromCharCode(nextIndex).toUpperCase();

    //write the data to the file
    window.api.send("writeToFile", [todo.toString(), index]);

    todoContext.classList.remove("is-active");
    todoContext.removeAttribute("data-item");

    // trigger matomo event
    if (userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Priority changer"]);
}

async function useAsTemplate(todo) {
    show(todo.toString(), true).then(response => {
        console.log(response);
    }).catch(error => {
        handleError(error);
    });

    todoContext.classList.toggle("is-active");
    todoContext.removeAttribute("data-item");

    // trigger matomo event
    if (userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Use as template"]);
}

async function copyTodo(todo) {
    pasteItemToClipboard(todo).then(response => {
        console.log(response);
    }).catch(error => {
        handleError(error);
    });

    todoContext.classList.toggle("is-active");
    todoContext.removeAttribute("data-item");

    // trigger matomo event
    if (userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Copy"]);
}

async function deleteTodo(index) {
    //send index to main process in order to delete line
    window.api.send("writeToFile", [undefined, index, undefined]);

    todoContext.classList.remove("is-active");
    todoContext.removeAttribute("data-item");

    // trigger matomo event
    if (userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Delete"]);
}

function setEvents(index, todo) {
    // set event listeners for buttons

    // click on increase priority option
    todoContextPriorityIncrease.onclick = () => changePriority(index, -1);
    todoContextPriorityIncrease.onkeypress = function (event) {
        if (event.key !== "Enter") return false;
        changePriority(index, -1);
    }

    // click on decrease priority option
    todoContextPriorityDecrease.onclick = () => changePriority(index, 1);
    todoContextPriorityDecrease.onkeypress = function (event) {
        if (event.key !== "Enter") return false;
        changePriority(index, 1);
    }

    // click on use as template option
    todoContextUseAsTemplate.onclick = () => useAsTemplate(todo);
    todoContextUseAsTemplate.onkeypress = function (event) {
        if (event.key !== "Enter") return false;
        useAsTemplate(todo);
    }

    // click on copy
    todoContextCopy.onclick = () => copyTodo(todo);
    todoContextCopy.onkeypress = function (event) {
        if (event.key !== "Enter") return false;
        copyTodo(todo);
    }

    // click on delete
    todoContextDelete.onclick = () => deleteTodo(index);
    todoContextDelete.onkeypress = function (event) {
        if (event.key !== "Enter") return false;
        deleteTodo(index);
    }
}

function setPosition(event) {
    // set location of context menu

    const box = todoContext.getBoundingClientRect()

    /*if (window.innerWidth < box.width) {
        todoContext.style.left = "0px"; // not necessary, the window doesn't get this small
    } else */
    if (event.pageX + box.width > window.innerWidth) {
        todoContext.style.left = (event.pageX - box.width) + "px";
    } else {
        todoContext.style.left = event.pageX + "px";
    }

    /* if (window.innerHeight < box.height) {
        todoContext.style.top = "0px"; // not necessary, the window doesn't get this small
    } else  */
    if (event.pageY + box.height > window.innerHeight) {
        todoContext.style.top = (event.pageY - box.height) + "px";
    } else {
        todoContext.style.top = event.pageY + "px";
    }
}

export { createTodoContext };
