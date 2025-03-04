# The Edison -- _never struggle with formatting an essay again_

Tired of switching between Google tabs, asking ChatGPT or Claude if your essay formatting is okay (when you know it's not) and struggling to fix formatting when you know they won't get it right?  
Tired of getting a B because you missed one simple formatting mistake?  
Tired of having to constantly pay to format essays?

Well, meet The Edison - a formatting tool that formats your essays perfectly in MLA, APA, Chicago, Harvard, or whatever format necessary. You don't have to cry anymore; The Edison is here to format your essay for you.

**[Try It Now](https://anaya-yorke.github.io/The-Edison)**

## Key Features

- **Instant formatting**: MLA, APA, Chicago, or Harvard styles in one click.
- **Save custom settings**: Store your professor's specific requirements.
- **Direct export**: Export directly to Word or Google Docs.
- **Automated citations**: Generate bibliographies automatically.
- **User-friendly**: Designed for quick and easy use.

## Supported Citation Styles

- **MLA (9th Edition)**
- **APA (7th Edition)**
- **Chicago (17th Edition)**
- **Harvard (2021)**

## How to Use

1. Paste your essay.
2. Select your citation style.
3. Enter any professor-specific requirements.
4. Click "Format Essay".
5. Export your formatted essay!

## For Developers

### Edison Agent

Edison Agent is an advanced automation tool that maintains the codebase with minimal human intervention. It handles routine maintenance tasks and can help keep the code healthy and up-to-date.

#### Automated Maintenance

- **Code Organization**: Maintains consistent file structure and code formatting.
- **Bug Detection & Fixing**: Automatically identifies and resolves common code issues.
- **UI Consistency**: Ensures design consistency across all components.
- **File Cleanup**: Detects and removes unused files and dead code.
- **Auto-Update**: Keeps dependencies, citation formats, and UI components up to date.
- **Deployment Fixer**: Automatically resolves Vercel deployment issues.
- **Deep Code Restructuring**: Completely reorganizes code into an optimal structure.

#### Using the Edison Agent

```bash
# Run all maintenance operations
node .github/scripts/edison-agent.js full

# Individual operations
node .github/scripts/edison-agent.js organize   # Organize code
node .github/scripts/edison-agent.js fix        # Fix bugs
node .github/scripts/edison-agent.js ui         # Ensure UI consistency
node .github/scripts/edison-agent.js cleanup    # Remove unused files
node .github/scripts/edison-agent.js update     # Update dependencies and formats
node .github/scripts/edison-agent.js deploy-fix # Fix deployment issues
node .github/scripts/edison-agent.js restructure # Deep code restructuring

# Generate a report without making changes
node .github/scripts/edison-agent.js report

# Additional flags
--dry-run           # Don't apply changes, just report
--safety safe|moderate|aggressive  # Control update aggressiveness
--pr                # Create a pull request with changes
--no-commit         # Skip committing changes
--target <project>  # Specify Vercel project for deployment fixes
--verbose           # Show detailed output
```

##### Auto-Update Feature

The auto-update feature keeps your codebase current by:
- Updating package dependencies to latest compatible versions
- Updating citation styles and formatting standards
- Refreshing UI components according to the design system
- Generating comprehensive update reports in `.github/reports/`

Usage examples:
```bash
# Safe update (minimal risk)
node .github/scripts/edison-agent.js update

# Moderate update (balanced approach)
node .github/scripts/edison-agent.js update --safety moderate

# Aggressive update (latest everything)
node .github/scripts/edison-agent.js update --safety aggressive

# Create a PR with the updates
node .github/scripts/edison-agent.js update --pr

# Just check what would be updated without making changes
node .github/scripts/edison-agent.js update --dry-run
```

##### Deployment Fixer

The deployment fixer automatically resolves common Vercel deployment issues:
- Analyzes deployment logs to identify failure causes
- Fixes TypeScript configuration issues
- Resolves memory limitations
- Updates Node.js version compatibility
- Corrects build configuration problems

Usage examples:
```bash
# Fix deployment issues
node .github/scripts/edison-agent.js deploy-fix

# Fix issues for a specific Vercel project
node .github/scripts/edison-agent.js deploy-fix --target my-project-name

# Generate a report without making changes
node .github/scripts/edison-agent.js deploy-fix --dry-run
```

##### Mini Code Organizer

The mini code organizer performs deep restructuring of your codebase:
- Analyzes the entire codebase for optimal organization
- Creates a logical folder structure based on code function
- Moves files to more appropriate locations
- Updates import statements throughout the codebase
- Removes unused files and duplicated code
- Creates index files for cleaner imports

Usage examples:
```bash
# Restructure the entire codebase
node .github/scripts/edison-agent.js restructure

# Generate a report without making changes
node .github/scripts/edison-agent.js restructure --dry-run

# Restructure and create a pull request
node .github/scripts/edison-agent.js restructure --pr
```

The mini organizer creates a detailed report in `.github/reports/` showing all changes made.

---

Designed to help students focus on writing, not formatting.
