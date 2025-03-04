# The Edison - Design System

## 🎨 Design Philosophy

The Edison combines nostalgic 8-bit pixel aesthetics with modern gradient treatments and subtle noise grain textures. This unique blend creates a UI that appeals specifically to Gen Z users while maintaining a professional and functional academic tool.

## 🌈 Color Palette

### Primary Colors
- **Primary Background**: Soft black (#121212) with subtle grain texture
- **Secondary Background**: Deep purple-blue gradient (#2A0E61 to #1A0B36)
- **Accent Pink**: Vibrant pink (#FF00FF) for buttons and interactive elements
- **Accent Purple**: Deep purple (#8A2BE2) for secondary interactive elements
- **Text White**: Off-white (#F5F5F5) for high contrast text

### Gradient Treatments
- **Primary Gradient**: Linear gradient from #FF00FF to #8A2BE2 (135deg)
- **Background Gradient**: Linear gradient from #2A0E61 to #1A0B36 (90deg)
- **Button Gradient**: Linear gradient from #FF00FF to #8A2BE2 (90deg)

### Noise Grain
- All gradients should have a subtle noise grain overlay (5-10% opacity)
- Background elements use 8-10% noise
- Interactive elements use 5-7% noise

## 🖋️ Typography

### Headings
- **Font**: "Press Start 2P" (Google Fonts) for 8-bit pixel style
- **Weights**: Single weight
- **Sizes**:
  - H1: 32px
  - H2: 24px
  - H3: 18px
  - H4: 16px

### Body Text
- **Font**: "Inter" (Google Fonts) for clean readability
- **Weights**: Regular (400), Medium (500), Semi-Bold (600)
- **Sizes**:
  - Body: 16px
  - Small: 14px
  - Caption: 12px

### Essay Content
- **Font**: "Times New Roman" or user-selected font based on style guide
- **Fallback**: System serif font

## 🧩 UI Components

### Buttons
- **Primary**: Chunky 8-bit style with gradient fill and 1px pixel border
- **Secondary**: Outlined 8-bit style with 2px pixel border
- **States**: Normal, Hover, Active, Disabled
- **Hover Effect**: Slight scale (1.05) and brightness increase (10%)

### Input Fields
- **Style**: Sharp cornered with 1px pixel border
- **States**: Default, Focus, Error, Disabled
- **Focus**: Accent color border with subtle glow effect

### Panels & Cards
- **Style**: Sharp corners with pixel border (1-2px)
- **Background**: Subtle gradient with noise grain
- **Shadow**: Subtle, pixelated drop shadow (4px offset, 70% opacity)

### Icons
- **Style**: 8-bit pixel art icons (24×24px base size)
- **States**: Normal, Active, Disabled
- **Animation**: Subtle hover animations for interactive icons

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Layout Adjustments
- **Mobile**: Single column, stacked elements
- **Tablet**: Two-column layout where appropriate
- **Desktop**: Full multi-column layout

## 🖼️ Layout Components

### Header
- 8-bit logo and app name
- Minimalist navigation
- User profile/settings icon

### Main Interface
- Central editor area with clear border
- Style selection buttons at the top
- Professor requirements panel (collapsible)
- Format control panel (right side, collapsible)

### Footer
- Minimal with essential links
- Export action buttons

## 💫 Animations & Interactions

### Transitions
- Button hover: 0.2s ease-in-out
- Panel expand/collapse: 0.3s ease
- Style change: 0.4s transition with subtle flash effect

### Micro-Interactions
- Button clicks: Subtle "press" effect (scale down to 0.98)
- Success actions: 8-bit "completion" animation
- Format change: Text briefly highlights then settles

## 🧪 Implementation Guidelines

### CSS
- Use CSS custom properties for color and size values
- Implement noise grain with SVG filters
- Use transform and opacity for animations (GPU acceleration)

### Assets
- All icons should be available in SVG format
- Use sprite sheets for animated elements
- Optimize all assets for web delivery

### Accessibility
- Maintain WCAG 2.1 AA compliance
- Ensure 4.5:1 contrast ratio for all text
- Provide alternative text for all visual elements
- Support keyboard navigation for all interactive elements

---

This design system creates a unique blend of nostalgic 8-bit aesthetics with modern design principles, delivering a UI that's both functional for academic document formatting and visually appealing to Gen Z users. 