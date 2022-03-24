const { AppImageUpdater } = require("electron-updater");

const autoUpdater = new AppImageUpdater();

autoUpdater.allowPrerelease = false;

autoUpdater
  .on("update-available", () => {
    console.log("Update available");
  })
  .on("update-not-available", () => {
    console.log("No update");
  })
  .on("error", (error) => {
    console.log("Error in updater: " + error);
  })
  .on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
    console.log(log_message);
  })
  .on("update-downloaded", () => {
    console.log("Update downloaded");
  });

  module.exports = autoUpdater;