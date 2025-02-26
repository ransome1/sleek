import Store from 'electron-store'
import { userDataDirectory } from '../Shared'

export const NotificationsStore = new Store({
  cwd: userDataDirectory,
  name: 'notifiedTodoObjects',
  projectName: 'sleek'
})