"use strict";
// converts a date object into a todo.txt compatible string xxxx-xx-xx
// https://bobbyhadz.com/blog/javascript-format-date-yyyy-mm-dd
function convertDate(date) {

  if(typeof date === "string") {
    const datePieces = (date.split("-"));
    return new Date( datePieces[0], datePieces[1] - 1, datePieces[2] );
  }

  const padTo2Digits = function(num) {
    return num.toString().padStart(2, '0');
  }
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}
function isToday(date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
function isTomorrow(date) {
  const today = new Date()
  return date.getDate() === today.getDate()+1 &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
function isPast(date) {
  const today = new Date();
  if (date.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) return true;
  return false;
}
function isFuture(date) {
  const today = new Date();
  if (date.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) return true;
  return false;
}

export { convertDate, isToday, isTomorrow, isPast, isFuture };
