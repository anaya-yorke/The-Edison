# The Edison - Architecture Overview

## Project Structure

The Edison is built using a modern React/Next.js architecture with TypeScript for type safety. The project structure follows best practices for organizing code in a scalable and maintainable way.

```
the-edison/
├── src/                  # Source files
│   ├── components/       # UI components
│   │   ├── StyleSelector.tsx
│   │   └── ProfessorRequirements.tsx
│   ├── styles/           # CSS/SCSS modules
│   │   ├── Home.module.css
│   │   ├── StyleSelector.module.css
│   │   ├── ProfessorRequirements.module.css
│   │   └── globals.css
│   ├── utils/            # Utility functions
│   │   ├── essayFormatter.ts
│   │   ├── export-compatibility.py
│   │   └── ai-formatter.py
│   ├── pages/            # Next.js page components
│   │   ├── index.tsx
│   │   └── _app.tsx
│   ├── hooks/            # Custom React hooks
│   └── assets/           # Static assets (images, fonts)
├── public/               # Public assets
│   ├── images/
│   └── fonts/
├── docs/                 # Documentation
│   ├── requirements.md
│   ├── ux-flow.md
│   ├── design-system.md
│   ├── citation-styles.md
│   └── architecture.md
├── tests/                # Test files
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project overview
```

## Component Architecture

The Edison uses a component-based architecture, with each component responsible for a specific part of the UI or functionality:

1. **Pages**
   - `index.tsx`: The main application page with the essay formatter UI
   - `_app.tsx`: The application wrapper for global styles and layout

2. **Components**
   - `StyleSelector`: Manages citation style selection (MLA, APA, Chicago, Harvard)
   - `ProfessorRequirements`: Handles custom formatting requirements and presets

3. **Utilities**
   - `essayFormatter.ts`: Core formatting logic for different citation styles
   - `export-compatibility.py`: Handles exporting to DOCX, PDF, and Google Docs
   - `ai-formatter.py`: AI-powered formatting and extraction utilities

## Data Flow

The application follows a unidirectional data flow pattern:

1. User inputs essay content and selects a citation style
2. User can (optionally) set custom professor requirements
3. When the user clicks "Format Essay", the essay is processed:
   - Text is analyzed to extract key components (title, author, etc.)
   - Content is formatted according to the selected citation style
   - Custom requirements are applied
4. The formatted essay is displayed in the preview area
5. User can export the formatted essay in various formats

## Technologies Used

- **Frontend**: React, Next.js, TypeScript
- **Styling**: CSS Modules
- **Backend** (for document processing): Python
- **AI Components**: Natural Language Processing for content extraction
- **Export Formats**: DOCX, PDF, Google Docs integration

## Design System

The design system (detailed in `design-system.md`) uses an 8-bit inspired interface with modern gradient treatments and subtle noise grain effects. The UI is specifically designed to appeal to Gen Z users while maintaining professional functionality.

Key design elements include:
- 8-bit pixel font for headings
- Modern gradient backgrounds with subtle noise grain texture
- High contrast for readability
- Responsive design for various devices

## Deployment

The Edison is deployed on Vercel for optimal performance and reliability. The deployment process uses:

1. **vercel.json** - Configures Vercel-specific deployment settings
2. **next.config.js** - Configures Next.js for proper path handling and optimization
3. **package.json scripts** - Includes build and export commands

The application uses continuous deployment through Vercel's GitHub integration, which automatically deploys:
- Production builds when changes are pushed to the main branch
- Preview builds for pull requests

To deploy the application manually:

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Future Development

Planned enhancements include:
- Expanded citation style support
- API for integration with other platforms
- Browser extension for direct integration with Google Docs
- Mobile application for on-the-go formatting
- Integration with reference management systems 