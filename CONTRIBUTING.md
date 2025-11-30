# Contributing to Sleek0

## Table of Contents

1. [Getting Started](#getting-started)
2. [Contributing](#contributing)
    - [Reporting Issues](#reporting-issues)
    - [Feature Requests](#feature-requests)
    - [Pull Requests](#pull-requests)
3. [Development Setup](#development-setup)
4. [Testing](#testing)
5. [Coding Guidelines](#coding-guidelines)
6. [Commit Guidelines](#commit-guidelines)

## Getting Started

Before contributing, make sure you have the latest version of Git and Node.js installed on your system.

## Contributing

### Reporting Issues

If you encounter any issues or bugs while using Sleek0, please open an issue on the GitHub repository. When reporting issues, please provide detailed information about the problem, including steps to reproduce and any error messages or logs if applicable.

### Feature Requests

If you have ideas for new features or improvements, we encourage you to open a feature request issue on GitHub. Describe the desired functionality or improvement in detail to help us understand and evaluate the suggestion.

### Pull Requests

We welcome pull requests for bug fixes, enhancements, or new features. To contribute code, please follow these steps:

1. Fork the repository and create a new branch based on the `main` branch.
2. Make your changes in the new branch, adhering to the [coding guidelines](#coding-guidelines).
3. Write tests using [vitest](https://vitest.dev/guide/) to cover your changes.
4. Ensure that your code and tests pass by running `npm run test`.
5. Commit your changes using [proper commit guidelines](#commit-guidelines).
6. Push your branch to your forked repository.
7. Open a pull request against the main repository's `main` branch.
8. Provide a clear description of your changes and the problem they solve.

We will review your pull request as soon as possible. Your contributions are greatly appreciated!

## Development Setup

To set up the development environment and run Sleek0 locally, follow these steps:

1. Clone the repository
2. Install project dependencies: `npm install`
3. Start the development server: `npm run dev`

## Testing

Sleek0 uses [vitest](https://vitest.dev/guide/) as the framework for unit testing. To run tests, use the following command: `npm test`

To contribute to the testing efforts, consider the following:

- Write tests to cover new features or changes in functionality.
- Test files are kept in separate files, for example Module.ts & Module.test.ts
- Ensure that existing tests pass before making new contributions.
- Aim for high test coverage to maintain code quality.

## Coding Guidelines

To maintain code consistency, readability, and quality, please adhere to the following guidelines:

- Write lean and efficient code. Avoid unnecessary complexity or redundant logic.
- Follow the [React coding style guide](https://reactjs.org/docs/style-guide.html) for writing React components.
- Use meaningful and descriptive variable and function names.
- Write clear and concise comments when necessary.
- Prioritize code readability over cleverness.
- Consider the user interface and user experience when adding new functionality. Strive for an intuitive and visually appealing interface.

## Commit Guidelines

When making commits, please follow these guidelines:

- Use descriptive and meaningful commit messages.
- Separate the subject from the body with a blank line.
- Start the subject with a verb in the imperative mood (e.g., "Add," "Fix," "Update").
- Keep the subject line short and concise (preferably 50 characters or less).
- Provide additional details in the body if needed.
- Reference relevant issues or pull requests in the commit message if applicable.

Example:
```
Add new feature

Implement a new feature that allows users to customize settings.

Fixes #123
```

Thank you for taking the time to review these contributing guidelines. We appreciate your contributions and look forward to collaborating with you!

Happy coding and testing!
