import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTodoObject } from './CreateTodoObjects';

vi.mock('electron', () => ({
    app: {
		getPath: vi.fn().mockReturnValue(''),
    },
  	// nativeTheme: {
    // 	on: vi.fn(),
    // 	themeSource: vi.fn(),
  	// },
}));

// vi.mock('./Stores', () => {
//   return {
//     SettingsStore: {
// 			set: vi.fn(),
// 			get: vi.fn(),
//     },
//   };
// });

// vi.mock('./index.js', () => {
// 	return {
// 		mainWindow: vi.fn(),
// 	};
// });

describe('createTodoObject', () => {
  it('should use pri extension as priority if no priority is set', () => {
    // Mock input string with a pri extension but no priority
    const lineNumber = 1;
    const string = 'Buy milk pri:C +groceries @home';

    // Call the function
    const result = createTodoObject(lineNumber, string);

    // Assertions
    expect(result.priority).toBe('C'); // pri extension should be used as priority
    expect(result.body).toBe('Buy milk +groceries @home');
    expect(result.projects).toEqual(['groceries']);
    expect(result.contexts).toEqual(['home']);
  });
});