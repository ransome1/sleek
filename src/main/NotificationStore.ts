import Store from 'electron-store'
import { userDataDirectory } from './Util'

export const NotificationStore = new Store({
  cwd: userDataDirectory,
  name: 'notifiedTodoObjects'
})

// const notifiedTodoObjectsPath = path.join(userDataDirectory, 'notifiedTodoObjects.json')
// if (!fs.existsSync(notifiedTodoObjectsPath)) {
//   const defaultNotifiedTodoObjectsData = {}
//   writeToFile(JSON.stringify(defaultNotifiedTodoObjectsData), notifiedTodoObjectsPath, null)
// }