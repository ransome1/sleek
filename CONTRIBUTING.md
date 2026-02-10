# Contributing to sleek

## 👩🏾‍💻 Become a contributer

We're actively inviting passionate contributors skilled in `React`, `TypeScript`, `Electron`, and `vitest` to join our collaborative effort. [Here you'll find our roadmap](https://github.com/users/ransome1/projects/3).

## Table of Contents

1. [Getting Started](#getting-started)
2. [Contributing](#contributing)
   - [Reporting Issues](#reporting-issues)
   - [Feature Requests](#feature-requests)
   - [Pull Requests](#pull-requests)
   - [GitHub Issue Backlog](#github-issue-backlog)
3. [Development Setup](#development-setup)
4. [Testing](#testing)
5. [Coding Guidelines](#coding-guidelines)
6. [Commit Guidelines](#commit-guidelines)

## Getting Started

Before contributing, make sure you have the latest version of Git and Node.js installed on your system.

## Contributing

### GitHub Backlog

Before contributing to sleek, we recommend reviewing the [GitHub Issue backlog](https://github.com/ransome1/sleek/issues) to align your contributions with existing issues. This helps avoid duplication of efforts and ensures that your work aligns with the project roadmap. If you find an issue that you would like to contribute to, please indicate your interest by commenting on the issue.

### Reporting Issues

If you encounter any issues or bugs while using sleek, please open an [issue on the GitHub repository](https://github.com/ransome1/sleek/issues). When reporting issues, please provide detailed information about the problem, including steps to reproduce and any error messages or logs if applicable.

### Feature Requests

**If your feature request is more of a loose idea and you are unsure about its implementation or potential impact, please discuss it first in the [GitHub Discussions section](https://github.com/ransome1/sleek/discussions). Engage with the community and gather feedback before submitting a formal feature request.**

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

To set up the development environment and run sleek locally, follow these steps:

1. Clone the repository: `git clone https://github.com/ransome1/sleek.git`
2. Install project dependencies: `npm install`
3. Start the development server: `npm run dev`

## Testing

sleek uses [vitest](https://vitest.dev/guide/) as the framework for unit testing. To run tests, use the following command: `npm test`

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
- Inform the maintainer if you've integrated dependencies that require acknowledgment.

Example:

```
Add new feature

Implement a new feature that allows users to customize settings.

Fixes #123
```

Thank you for taking the time to review these contributing guidelines. We appreciate your contributions and look forward to collaborating with you! If you have any questions, feel free to reach out to us.

Happy coding and testing!
