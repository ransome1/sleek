import Store from 'electron-store'
import { userDataDirectory } from '../Util'

export const FiltersStore = new Store({
	cwd: userDataDirectory,
	name: 'filters',
	projectName: 'sleek'
})