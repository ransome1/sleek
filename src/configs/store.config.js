const electron = require("electron");
const path = require("path");
const fs = require("fs");
class Store {
  constructor(opts) {
    
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    
    let userDataPath;
    
    if(process.env.PORTABLE_EXECUTABLE_FILE) {
      userDataPath = path.join(path.dirname(process.env.PORTABLE_EXECUTABLE_FILE), "config", "sleek");
      //if(!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, {recursive: true});
    
    } else if(!process.env.PORTABLE_EXECUTABLE_FILE && !process.windowsStore && process.platform==="win32") {
      userDataPath = path.dirname(process.execPath);
      //if(!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, {recursive: true});
    
    // in development or testing environment switch to specific userData folder
    } else if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing") {
      userDataPath = path.join((electron.app || electron.remote.app).getPath("userData"), "..", "sleek_" + process.env.NODE_ENV);

    } else {
      userDataPath = (electron.app || electron.remote.app).getPath("userData");
    }

    if(!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, {recursive: true});

    // We"ll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + ".json");
    this.data = parseDataFile(this.path, opts.defaults);
  }
  // This will just return the property on the `data` object
  get(key) {
    return this.data[key];
  }
  // ...and this will set it
  set(key, val) {
    this.data[key] = val;
    // Wait, I thought using the node.js" synchronous APIs was bad form?
    // We"re not writing a server so there"s not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.

    // only persist data in development or production environment
    if(process.env.NODE_ENV !== "testing") fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

// class dismissedNotifications {
//   constructor(opts) {
//     let userDataPath = userDataPath = (electron.app || electron.remote.app).getPath("userData");   
//     this.path = path.join(userDataPath, opts.configName + ".json");
//     this.data = parseDataFile(this.path, opts.defaults);
//   }
  
//   get(key) {
//     return this.data[key];
//   }
  
//   set(key, val) {
//     this.data[key] = val;
//   }
// }

function parseDataFile(filePath, defaults) {
  // We"ll try/catch it in case the file doesn"t exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    console.log("Persisted data located at: " + filePath);
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

// expose the class
module.exports = Store;