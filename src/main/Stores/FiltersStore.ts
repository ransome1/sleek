import Store from 'electron-store'
import { userDataDirectory } from '../Shared'

export const FiltersStore = new Store({
	cwd: userDataDirectory,
	name: 'filters',
	projectName: 'sleek'
})