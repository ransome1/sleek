import { activeFile, formatDate } from '../../main/util';
import { configStorage } from '../../main/config';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn(),
  },
}));

describe('activeFile', () => {

	const mockFiles = [
	  {
	    active: true,
	    path: '/Users/ransome/Development/sleek/src/testData/sample.txt',
	    filename: 'sample.txt',
	  },
	  {
	    active: false,
	    path: '/Users/ransome/Development/sleek/src/testData/sample1.txt',
	    filename: 'sample1.txt',
	  },
	];

	const mockActiveFile = {
		active: true,
		path: '/Users/ransome/Development/sleek/src/testData/sample.txt',
		filename: 'sample.txt',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns undefined when files is undefined', () => {
		(configStorage.get as jest.Mock).mockReturnValue(undefined);

		const result = activeFile();
		expect(result).toBeUndefined();
	});

	test('returns the active file in an array of file objects', () => {
		(configStorage.get as jest.Mock).mockReturnValue(mockFiles);
		const result = activeFile();
		expect(result).toEqual(mockActiveFile);
	});
});

describe('formatDate', () => {
	test('returns todo.txt compatible date string when passing a date', () => {
		const date = new Date('2023-07-07T14:02:34.093Z');
		const todoTxtDate = formatDate(date);
		expect(todoTxtDate).toEqual('2023-07-07');
	});
});
