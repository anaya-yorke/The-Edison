# Essay Formatter - UX Flow & UI Design Document

## 1. Concept Overview

The Essay Formatter is a minimalist tool designed to instantly format academic essays according to standard citation styles (MLA, APA, Harvard, Chicago) without changing the content itself. The application focuses on streamlining the formatting process with a clean, 8-bit inspired interface that appeals to Gen Z users while maintaining professional functionality.

## 2. Key Features

- **One-click formatting** between different citation styles
- **Professor-specific constraint settings** that can be saved and reused
- **Direct export** to Word/Google Docs with formatting intact
- **Source formatter** that automatically formats citations and bibliography
- **Minimal UI** with reduced clicks and streamlined workflow
- **8-bit aesthetic** with modern gradient treatments

## 3. User Flow

```
┌────────────┐     ┌────────────┐     ┌────────────────┐     ┌────────────┐
│            │     │            │     │                │     │            │
│  Upload or │     │  Select    │     │  Adjust        │     │  Export to │
│  Paste     │────▶│  Format    │────▶│  Custom        │────▶│  Word/Docs │
│  Essay     │     │  Style     │     │  Requirements  │     │            │
│            │     │            │     │                │     │            │
└────────────┘     └────────────┘     └────────────────┘     └────────────┘
```

1. **Input**: Users paste text or upload their document
2. **Style Selection**: Choose format (MLA, APA, etc.) with a single click
3. **Custom Requirements**: Optional step to add professor-specific requirements
4. **Export**: Format and download/copy to clipboard

## 4. UI Components

### Header Section
- 8-bit logo and app name
- Minimalist navigation (if needed)
- User profile/settings (simplified)

### Main Interface
- Large, central text area for essay content
- Side panel with formatting options (collapsible)
- Prominent style selection buttons (MLA, APA, Harvard, Chicago)
- Custom requirements accordion section

### Format Control Panel
- Citation style selector (prominent, visual buttons)
- Professor requirements section (expandable)
- Source/citation management tool
- Export options (simplified)

### Visual Design Elements
- 8-bit pixel art icons and buttons
- Grain gradient backgrounds (subtle pastels to deep tones)
- High contrast text for accessibility
- Chunky, pixelated UI elements with modern gradient overlays

## 5. Screen Mockups

### Home Screen
```
┌─────────────────────────────────────────────────────┐
│ ██ ESSAY FORMATTER                             👤   │
├─────────────────────────────────────────────────────┤
│                                                     │
│     [MLA]    [APA]    [CHICAGO]    [HARVARD]       │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │                                                 │ │
│ │                                                 │ │
│ │           Paste or upload your essay            │ │
│ │                                                 │ │
│ │                                                 │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ + PROFESSOR REQUIREMENTS                            │
│                                                     │
│             [FORMAT & EXPORT]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### After Essay Entry
```
┌─────────────────────────────────────────────────────┐
│ ██ ESSAY FORMATTER                   STYLE: MLA 👤  │
├─────────────────────────────────────────────────────┤
│                                                     │
│     [MLA]    [APA]    [CHICAGO]    [HARVARD]       │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ John Smith                                      │ │
│ │ Professor Johnson                               │ │
│ │ English 101                                     │ │
│ │ 15 March 2025                                   │ │
│ │                                                 │ │
│ │ Title: The Impact of Technology                 │ │
│ │                                                 │ │
│ │ Lorem ipsum dolor sit amet, consectetur...      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ + PROFESSOR REQUIREMENTS                            │
│   ↳ [Font: Times New Roman][Spacing: Double]       │
│                                                     │
│   [COPY]  [DOWNLOAD .DOCX]  [SEND TO GOOGLE DOCS]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 6. Visual Style Guide

### Colors
- Primary Background: Soft black (#121212) with subtle grain texture
- Secondary Background: Deep purple-blue gradient (#2A0E61 to #1A0B36)
- Accent: Neon pink/purple (#FF00FF, #8A2BE2) for interactive elements
- Text: Off-white (#F5F5F5) for high contrast

### Typography
- Headings: 8-bit pixel font (e.g., "Press Start 2P")
- Body Text: Clean sans-serif (e.g., "Inter") for essay preview
- Buttons: Pixel-styled text for consistency with theme

### UI Elements
- Buttons: Chunky, 3D pixel-style with subtle hover animations
- Panels: Sharp corners with thin pixel borders
- Icons: 8-bit style consistent with the theme

## 7. Key Principles

1. **Minimal Clicks**: Every common action should be 1-2 clicks maximum
2. **Immediate Feedback**: Format changes should display in real-time
3. **Focus on Content**: Interface elements minimize when typing
4. **Save User Preferences**: Remember professor requirements for future use
5. **Export Flexibility**: Multiple export options without formatting loss

## 8. Technical Constraints

- Must preserve all formatting when exporting to Word/Google Docs
- Should handle various source types for bibliography formatting
- Responsive design to work on desktop and tablet devices
- No grammar checking (focuses only on formatting)

## 9. Next Steps

- User testing with student focus groups
- Integration with popular word processors
- Custom format template saving functionality
- Professor requirement presets
