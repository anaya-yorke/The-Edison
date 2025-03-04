# Dependency Management

This document explains how to manage and update dependencies in The Edison project.

## Available Scripts

### `npm run update-deps`

Updates all dependencies to their latest versions. This script:
- Checks for updates to all dependencies
- Updates package.json with the latest versions
- Runs npm install to apply the updates

**Note**: This may include breaking changes. Use with caution in production code.

### `npm run update-deps:interactive`

Opens an interactive interface where you can:
- See which packages have updates available
- Choose which packages to update
- View changelogs and release notes
- Select specific versions to install

This is the safest way to update dependencies as you can review each change.

### `npm run update-deps:safe`

Updates dependencies to their latest minor and patch versions only. This script:
- Checks for updates that don't include major version changes
- Updates package.json with compatible versions
- Runs npm install to apply the updates

This is safer than `update-deps` as it avoids major version changes that might include breaking changes.

## Best Practices

1. **Regular Updates**: Run `update-deps:safe` weekly to stay current with bug fixes and security patches.

2. **Major Updates**: Use `update-deps:interactive` when you want to update to major versions:
   - Review changelogs before updating
   - Test thoroughly after updates
   - Update one major dependency at a time

3. **Before Deployment**:
   - Run `npm audit` to check for security vulnerabilities
   - Address any high or critical vulnerabilities
   - Test the application thoroughly after updates

4. **Version Control**:
   - Always update dependencies in a separate branch
   - Commit package.json and package-lock.json together
   - Include relevant update notes in commit messages

## Handling Breaking Changes

If you encounter issues after updating dependencies:

1. Check the failing dependency's changelog for breaking changes
2. Look for migration guides in the dependency's documentation
3. Consider rolling back to the previous version using:
   ```bash
   npm install package-name@previous-version
   ```
4. Update your code to accommodate breaking changes

## Automated Updates

The project is configured to:
- Automatically check for dependency updates
- Run security audits
- Maintain compatibility with specified Node.js versions

### GitHub Dependabot

Dependabot is enabled for this repository and will:
- Create pull requests for dependency updates
- Include changelog entries and release notes
- Label PRs based on update type (patch, minor, major)

## Troubleshooting

If you encounter issues with dependency updates:

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Remove node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for peer dependency conflicts:
   ```bash
   npm ls
   ```

4. Use `npm why package-name` to understand why a package is installed 