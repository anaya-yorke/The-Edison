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

The Edison Agent is an advanced automation system built into our project that helps maintain code quality and organization. This system includes:

#### Automated Maintenance

- **Code Organization**: Automatically organizes files and code structure
- **Bug Detection & Fixing**: Identifies and fixes common code issues
- **UI Consistency**: Ensures a consistent UI design across components
- **File Cleanup**: Detects and removes unused and duplicate files
- **Auto-Update**: Keeps dependencies and formatting standards up-to-date

#### How to Use the Edison Agent

Run the agent from the `.github/scripts` directory:

```bash
# Full maintenance run
node .github/scripts/edison-agent.js full

# Only run specific operations
node .github/scripts/edison-agent.js organize   # Code organization
node .github/scripts/edison-agent.js fix        # Bug detection and fixing
node .github/scripts/edison-agent.js ui         # UI consistency
node .github/scripts/edison-agent.js cleanup    # File cleanup
node .github/scripts/edison-agent.js update     # Update dependencies and formats
node .github/scripts/edison-agent.js report     # Generate report without changes

# Common flags
--dry-run                  # Don't apply changes, just report
--safety=safe              # Safety level (safe, moderate, aggressive)
--pr                       # Create a pull request with changes
--branch=feature-branch    # Create changes on a specific branch
--no-commit                # Skip committing changes
```

The agent runs with safe defaults but can be adjusted for more aggressive automation using the safety level settings.

#### Auto-Update Feature

The Auto-Update feature ensures that The Edison stays current with:

- **Package Dependencies**: Updates npm packages to their latest compatible versions
- **Citation Formats**: Updates citation styles with the latest formatting rules
- **UI Components**: Keeps UI designs consistent with the design system
- **Design Standards**: Automatically applies design system changes to CSS variables

The auto-update operation backs up files before making changes and can be safely run with:

```bash
# Safe mode (minor and patch updates only)
node .github/scripts/edison-agent.js update

# Moderate mode (interactive updates)
node .github/scripts/edison-agent.js update --safety=moderate

# Aggressive mode (all updates including major versions)
node .github/scripts/edison-agent.js update --safety=aggressive
```

Each update run generates a detailed report in `.github/reports/` for review.

---

Designed to help students focus on writing, not formatting.
