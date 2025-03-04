# The Edison - Testing

This directory contains tests for The Edison project. The tests are organized according to the project structure.

## Test Structure

- `components/`: Tests for React components
- `utils/`: Tests for utility functions
- `hooks/`: Tests for custom React hooks (to be added as needed)
- `pages/`: Tests for page components (to be added as needed)

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Testing Tools

- [Jest](https://jestjs.io/): JavaScript testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): For testing React components
- [jest-dom](https://github.com/testing-library/jest-dom): Custom Jest matchers for DOM testing

## Best Practices

1. **Component Tests**: Focus on testing behavior, not implementation details.
2. **Utility Tests**: Ensure all edge cases are covered.
3. **Coverage**: Aim for high test coverage, especially for critical paths.
4. **Mocking**: Use mocks for external dependencies and services.

## Adding New Tests

When adding new components or utilities to the project, please add corresponding tests in this directory following the established patterns. 