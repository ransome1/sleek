import Store from 'electron-store'
import { userDataDirectory } from '../Util'

export const NotificationsStore = new Store({
  cwd: userDataDirectory,
  name: 'notifiedTodoObjects',
  projectName: 'sleek'
})