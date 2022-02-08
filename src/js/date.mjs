"use strict";
function convertDate(date) {
  let day = ("0" + (date.getDate())).slice(-2)
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let year = date.getFullYear();
  return year + "-" + month + "-" + day;
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
