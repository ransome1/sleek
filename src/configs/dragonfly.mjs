/* eslint-env browser */
/* jslint-env browser */
/* global window */
/* global document */
/* global console */

/*
 * DragonflyJS - v1.2.0 - 2018-07-17
 * https://getbutterfly.com/dragonflyjs-vanilla-javascript-drag-and-drop/
 * Copyright (c) 2018 Ciprian Popescu
 * Licensed GPLv3
 *
 * iMouseDown represents the current mouse button state: up or down
 * lMouseState represents the previous mouse button state so that we can check for button clicks and button releases:
 *
 * if (iMouseDown && !lMouseState) {} // button clicked
 * if (!iMouseDown && lMouseState) {} // button released
 */
var iMouseDown  = false;
var lMouseState = false;
var dragObject  = null;

var DragDrops   = [];
var curTarget   = null;
var lastTarget  = null;
var rootParent  = null;
var rootSibling = null;

Number.prototype.NaN0 = function () {
    "use strict";

    return isNaN(this) ? 0 : this;
};

function createDragContainer(element) {
    "use strict";

    var j = 0,
        cDrag = DragDrops.length;

    DragDrops[cDrag] = [];
    element.setAttribute("DropObj", cDrag);

    DragDrops[cDrag].push(element);


    for (j = 0; j < element.childNodes.length; j += 1) {
        if (element.childNodes[j].nodeName !== "#text") {
            element.childNodes[j].setAttribute("DragObj", cDrag);
        }
    }
}

function getPosition(e) {
    "use strict";

    var left = 0,
        top = 0;

    while (e.offsetParent) {
        left += e.offsetLeft + (e.currentStyle ? (parseInt(e.currentStyle.borderLeftWidth, 10)).NaN0() : 0);
        top  += e.offsetTop + (e.currentStyle ? (parseInt(e.currentStyle.borderTopWidth, 10)).NaN0() : 0);
        e = e.offsetParent;
    }

    left += e.offsetLeft + (e.currentStyle ? (parseInt(e.currentStyle.borderLeftWidth, 10)).NaN0() : 0);
    top += e.offsetTop + (e.currentStyle ? (parseInt(e.currentStyle.borderTopWidth, 10)).NaN0() : 0);

    return {
        x: left,
        y: top
    };
}

function mouseCoords(ev) {
    "use strict";

    if (ev.pageX || ev.pageY) {
        return {
            x: ev.pageX,
            y: ev.pageY
        };
    }

    return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function mouseMove(ev) {
    "use strict";

    ev = ev || window.event;

    /*
     * We are setting target to whatever item the mouse is currently on
     * Firefox uses event.target here, MSIE uses event.srcElement
     */
    var elementInstance,
        dragHelper = document.querySelector(".drag-helper"),
        activeCont = null,
        target = ev.target || ev.srcElement,
        mousePos = mouseCoords(ev),
        origClass,
        dragConts,
        dragObj,
        pos,
        i,
        j;

    // mouseOut event - fires if the item the mouse is on has changed
    if (lastTarget && (target !== lastTarget)) {
        // Reset the classname for the target element
        origClass = lastTarget.getAttribute("origClass");
        if (origClass) {
            lastTarget.className = origClass;
        }
    }

    /*
     * dragObj is the grouping the item is in (set from the createDragContainer function)
     * if the item is not in a grouping we ignore it since it can"t be dragged with this script
     */
    dragObj = target.getAttribute("DragObj");

    // If the mouse was moved over an element that is draggable
    if (dragObj !== null) {
        // If the user is just starting to drag the element
        if (iMouseDown && !lMouseState) {
            // mouseDown target
            curTarget = target;

            // Record the mouse x and y offset for the element
            rootParent = curTarget.parentNode;
            rootSibling = curTarget.nextSibling;

            // Remove anything that is in the dragHelper div so we can put a new item in it
            for (i = 0; i < dragHelper.childNodes.length; i += 1) {
                dragHelper.removeChild(dragHelper.childNodes[i]);
            }

            // Make a copy of the current item and put it in the drag helper
            dragHelper.appendChild(curTarget.cloneNode(true));
            dragHelper.style.display = "block";

            // Set the class on the helper div if necessary
            dragHelper.classList.add("drag-box-dragging");

            // Disable dragging from the helper div (it"s already being dragged)
            dragHelper.firstChild.removeAttribute("DragObj");

            // Record the current position of all drag/drop targets related to the element
            dragConts = DragDrops[dragObj];

            // First record the width/height of the drag item, then hide it since it is going to (potentially) be moved out of its parent
            curTarget.setAttribute("startWidth", parseInt(curTarget.offsetWidth, 10));
            curTarget.setAttribute("startHeight", parseInt(curTarget.offsetHeight, 10));
            curTarget.style.display = "none";

            // Loop through each possible drop container
            for (i = 0; i < dragConts.length; i += 1) {
                elementInstance = dragConts[i];

                pos = getPosition(dragConts[i]);

                // Save the width, height and position of each container
                elementInstance.setAttribute("startWidth", parseInt(elementInstance.offsetWidth, 10));
                elementInstance.setAttribute("startHeight", parseInt(elementInstance.offsetHeight, 10));
                elementInstance.setAttribute("startLeft", pos.x);
                elementInstance.setAttribute("startTop", pos.y);

                // Loop through each child element of each container
                for (j = 0; j < dragConts[i].childNodes.length; j += 1) {
                    elementInstance = dragConts[i].childNodes[j];

                    if ((elementInstance.nodeName === "#text") || (dragConts[i].childNodes[j] === curTarget)) {
                        continue;
                    }

                    pos = getPosition(dragConts[i].childNodes[j]);

                    // Save the width, height and position of each element
                    elementInstance.setAttribute("startWidth", parseInt(elementInstance.offsetWidth, 10));
                    elementInstance.setAttribute("startHeight", parseInt(elementInstance.offsetHeight, 10));
                    elementInstance.setAttribute("startLeft", pos.x);
                    elementInstance.setAttribute("startTop", pos.y);
                }
            }
        }
    }

    // If we get in here we are dragging something
    if (curTarget) {

        dragConts = DragDrops[curTarget.getAttribute("DragObj")];

        var xPos = mousePos.x + (parseInt(curTarget.getAttribute("startWidth"), 10) / 2),
            yPos = mousePos.y + (parseInt(curTarget.getAttribute("startHeight"), 10) / 2);

        // Move helper div to wherever the mouse is
        dragHelper.style.top = mousePos.y - parseInt(curTarget.getAttribute("startHeight"))/2 + "px";
        dragHelper.style.left = mousePos.x - parseInt(curTarget.getAttribute("startWidth"))/2 + "px";

        // Check each drop container to see if target object is "inside" the container
        for (i = 0; i < dragConts.length; i += 1) {
            activeCont = dragConts[i];
        }

        // beforeNode will hold the first node AFTER where div belongs
        var beforeNode = null;

        // Loop through each child node (skipping text nodes)
        for (i = activeCont.childNodes.length - 1; i >= 0; i -= 1) {
            elementInstance = activeCont.childNodes[i];

            if (elementInstance.nodeName === "#text") {
                continue;
            }

            // If the current item is "After" the item being dragged
            if (curTarget !== activeCont.childNodes[i] && ((parseInt(elementInstance.getAttribute("startLeft"), 10) + parseInt(elementInstance.getAttribute("startWidth"), 10)) > xPos) && ((parseInt(elementInstance.getAttribute("startTop"), 10) + parseInt(elementInstance.getAttribute("startHeight"), 10)) > yPos)) {
                beforeNode = activeCont.childNodes[i];
            }
        }

        // The item being dragged belongs before another item
        if (beforeNode) {
            if (beforeNode !== curTarget.nextSibling) {
                activeCont.insertBefore(curTarget, beforeNode);
            }
            // The item being dragged belongs at the end of the current container
        } else {
            if ((curTarget.nextSibling) || (curTarget.parentNode !== activeCont)) {
                activeCont.appendChild(curTarget);
            }
        }

        // Make drag item visible
        if (curTarget.style.display !== "") {
            curTarget.style.display = "";
            curTarget.style.visibility = "hidden";
        }
    }

    // Track the current mouse state so we can compare against it next time
    lMouseState = iMouseDown;

    // mouseMove target
    lastTarget  = target;

    if (dragObject) {
        dragObject.style.position = "absolute";
        dragObject.style.top = mousePos.y;
        dragObject.style.left = mousePos.x;
    }

    // Track the current mouse state so we can compare against it next time
    lMouseState = iMouseDown;

    // Prevent items on the page from being highlighted while dragging
    if (curTarget || dragObject) {
        return false;
    }
}

function mouseUp(callback, event) {
    "use strict";

    if(!iMouseDown) return false;

    var dragHelper = document.querySelector(".drag-helper");
    if (curTarget) {
        dragHelper.style.display = "none";

        if (curTarget.style.display === "none") {
            if (rootSibling) {
                rootParent.insertBefore(curTarget, rootSibling);
            } else {
                rootParent.appendChild(curTarget);
            }
        }
        curTarget.style.display = "";
        curTarget.style.visibility = "visible";
    }
    curTarget = null;
    dragObject = null;
    iMouseDown = false;

    // Add AJAX event here
    if (typeof callback === "function") {
        callback();
    }
}

function mouseDown(ev) {
    "use strict";

    ev = ev || window.event;

    var target = ev.target || ev.srcElement;

    iMouseDown = true;

    if (target.onmousedown || target.getAttribute("DragObj")) {
        return false;
    }
}

export function dragonfly(element, callback) {
    "use strict";

    createDragContainer(document.querySelector(element));

    var dragHelper = document.createElement("div");
    dragHelper.style.cssText = "position: absolute; display: none;";
    dragHelper.classList.add("drag-helper");

    document.body.appendChild(dragHelper);

    document.getElementById("sortByContainer").addEventListener("mousemove", function () {
      mouseMove();
    });
    document.getElementById("sortByContainer").addEventListener("mousedown", function () {
      mouseDown();
    });
    document.addEventListener("mouseup", function (event) {
      mouseUp(callback);
    });
}
