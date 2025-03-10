import React, { useState, useEffect } from 'react';

// Add viewport meta tag to ensure proper scaling
const ViewportMeta = () => (
  <div dangerouslySetInnerHTML={{
    __html: `
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="description" content="Edison - Document formatting application with AI features" />
      <meta name="theme-color" content="#e6e6fa" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @media (max-width: 768px) {
          .two-column-layout {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        
        /* Improve accessible focus styles */
        *:focus-visible {
          outline: 2px solid #4299e1;
          outline-offset: 2px;
        }
      </style>
    `
  }} />
);

// Pastel Theme Colors
const pastelColors = {
  blush: '#ffb6c1',
  lavender: '#e6e6fa',
  mint: '#98fb98',
  peach: '#ffdab9',
  sky: '#87ceeb',
  lemon: '#fffacd',
  lilac: '#c8a2c8',
  coral: '#f08080',
  honeydew: '#f0fff0',
  powder: '#b0e0e6',
};

// Design System Constants
const designSystem = {
  spacing: {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
  },
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    darkBackground: '#1a202c',
    darkSurface: '#2d3748',
    darkText: '#e2e8f0',
    lightText: '#333333',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)',
    sticker: '0 2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
  }
};

// Upload Icon Component
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Sticker Component
const Sticker = ({ emoji, size = 36, rotation, onClick, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const randomRotation = rotation || Math.floor(Math.random() * 16) - 8;
  
  const stickerStyle = {
    position: 'absolute',
    fontSize: `${size}px`,
    transform: `rotate(${randomRotation}deg) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
    transition: 'transform 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    zIndex: 10,
    filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.15))`,
    userSelect: 'none',
    ...style,
  };
  
  return (
    <div
      style={stickerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {emoji}
    </div>
  );
};

// Badge Component
const Badge = ({ label, color, icon }) => {
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: pastelColors[color] || pastelColors.lavender,
    color: '#333',
    borderRadius: designSystem.borderRadius.full,
    fontSize: '12px',
    fontWeight: '500',
  };
  
  return (
    <div style={badgeStyle}>
      {icon && <span>{icon}</span>}
      {label}
    </div>
  );
};

// Breakpoints for responsive design
const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Custom hook for responsive design
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// App Container Component
const AppContainer = () => {
  const [currentTheme, setCurrentTheme] = useState('lavender');
  const [selectedStickers, setSelectedStickers] = useState(['✨', '📚']);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Responsive state
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg}px)`);

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? designSystem.spacing[2] : designSystem.spacing[4],
    fontFamily: designSystem.typography.fontFamily,
    backgroundColor: isDarkMode ? designSystem.colors.darkBackground : designSystem.colors.background,
    color: isDarkMode ? designSystem.colors.darkText : designSystem.colors.lightText,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? designSystem.spacing[2] : designSystem.spacing[3],
  };
  
  const addSticker = (emoji) => {
    setSelectedStickers([...selectedStickers, emoji]);
    setShowStickerPicker(false);
  };
  
  const removeSticker = (index) => {
    const newStickers = [...selectedStickers];
    newStickers.splice(index, 1);
    setSelectedStickers(newStickers);
  };

  // Sticker positions
  const stickerPositions = [
    { top: '70px', right: '180px' }, // Near header
    { top: '85px', right: '120px' },
    { top: '65px', right: '220px' },
    { top: '110px', left: '350px' }, // Near tabs
    { top: '140px', left: '200px' },
    { top: '95px', left: '240px' },
    { top: '25px', right: '100px' }, // Top right
    { top: '40px', right: '140px' },
  ];
  
  return (
    <div style={containerStyle}>
      <Header 
        currentTheme={currentTheme} 
        setTheme={setCurrentTheme}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      
      {/* Stickers positioned around the UI */}
      {selectedStickers.map((emoji, index) => (
        <Sticker 
          key={index}
          emoji={emoji}
          size={36 + (index % 3) * 8} // Varying sizes
          style={stickerPositions[index % stickerPositions.length]}
          onClick={() => removeSticker(index)} // Click to remove
        />
      ))}
      
      <MainContent 
        currentTheme={currentTheme}
        onAddSticker={() => setShowStickerPicker(true)}
        isDarkMode={isDarkMode}
      />
      
      {/* Sticker Picker */}
      {showStickerPicker && (
        <StickerPicker 
          onSelect={addSticker}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
};

// Header Component
const Header = ({ currentTheme, setTheme, isDarkMode, setIsDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg}px)`);
  
  const headerStyle = {
    backgroundColor: isDarkMode ? `${pastelColors[currentTheme]}30` : pastelColors[currentTheme],
    borderRadius: designSystem.borderRadius.lg,
    padding: isMobile ? designSystem.spacing[2] : designSystem.spacing[4],
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    position: 'relative',
    gap: isMobile ? designSystem.spacing[2] : 0,
  };
  
  const titleStyle = {
    color: isDarkMode ? designSystem.colors.darkText : '#333',
    fontSize: isMobile ? '24px' : '28px',
    fontWeight: '600',
    margin: 0,
  };
  
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Edison</h1>
      <div style={{ 
        display: 'flex', 
        gap: designSystem.spacing[2], 
        alignItems: 'center',
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'space-between' : 'flex-end'
      }}>
        <ThemeSelector currentTheme={currentTheme} setTheme={setTheme} />
        <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>
    </header>
  );
};

// Theme Selector Component
const ThemeSelector = ({ currentTheme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectorStyle = {
    position: 'relative',
  };
  
  const currentColorStyle = {
    width: '32px',
    height: '32px',
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: pastelColors[currentTheme],
    border: '2px solid white',
    cursor: 'pointer',
  };
  
  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.md,
    padding: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    width: '160px',
    boxShadow: designSystem.shadows.md,
    zIndex: 100,
  };
  
  const colorOptionStyle = (color) => ({
    width: '24px',
    height: '24px',
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: pastelColors[color],
    border: currentTheme === color ? '2px solid #333' : '2px solid transparent',
    cursor: 'pointer',
  });
  
  const handleColorSelect = (color) => {
    setTheme(color);
    setIsOpen(false);
  };
  
  return (
    <div style={selectorStyle}>
      <div 
        style={currentColorStyle} 
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div style={dropdownStyle}>
          {Object.keys(pastelColors).map(color => (
            <div
              key={color}
              style={colorOptionStyle(color)}
              onClick={() => handleColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Theme Toggle Component
const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  
  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '18px',
    padding: '4px',
    minWidth: isMobile ? 'auto' : '120px',
  };
  
  const toggleTextStyle = {
    color: '#333',
    fontSize: '14px',
    padding: '0 8px',
    display: isMobile ? 'none' : 'block', // Hide text on mobile
  };
  
  const toggleButtonStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: '0.3s',
    position: 'relative',
    transform: isDarkMode ? 'translateX(28px)' : 'translateX(0)',
    cursor: 'pointer',
  };
  
  return (
    <div style={toggleContainerStyle}>
      <span style={toggleTextStyle}>Light</span>
      <div 
        style={toggleButtonStyle} 
        onClick={() => setIsDarkMode(!isDarkMode)} 
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        role="switch"
        aria-checked={isDarkMode}
      />
      <span style={toggleTextStyle}>Dark</span>
    </div>
  );
};

// Sticker Picker Component
const StickerPicker = ({ onSelect, onClose }) => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };
  
  const pickerStyle = {
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing[3],
    width: '300px',
    boxShadow: designSystem.shadows.md,
  };
  
  const titleStyle = {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
  };
  
  const stickerGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
  };
  
  const stickerStyle = {
    fontSize: '24px',
    cursor: 'pointer',
    textAlign: 'center',
    userSelect: 'none',
    transition: 'transform 0.2s',
  };
  
  const StickerItem = ({ emoji, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div 
        style={{
          ...stickerStyle, 
          transform: isHovered ? 'scale(1.2)' : 'scale(1)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(emoji)}
      >
        {emoji}
      </div>
    );
  };
  
  // Common emoji stickers
  const emojis = [
    '😊', '🌟', '🎉', '💯', '👍', '❤️', 
    '🌈', '✨', '🍀', '🎵', '🔥', '💡', 
    '📚', '🏆', '🚀', '🍕', '🌱', '��',
    '💼', '⭐', '🎨', '🧠', '🎓', '📝'
  ];
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={pickerStyle} onClick={e => e.stopPropagation()}>
        <h3 style={titleStyle}>Choose a Sticker</h3>
        <div style={stickerGridStyle}>
          {emojis.map((emoji, index) => (
            <StickerItem 
              key={index} 
              emoji={emoji}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = ({ currentTheme, onAddSticker, isDarkMode }) => {
  return (
    <main>
      <TabNavigation currentTheme={currentTheme} isDarkMode={isDarkMode} />
      <TwoColumnLayout currentTheme={currentTheme}>
        <DocumentSection currentTheme={currentTheme} isDarkMode={isDarkMode} />
        <FormatSection currentTheme={currentTheme} onAddSticker={onAddSticker} isDarkMode={isDarkMode} />
      </TwoColumnLayout>
      <ProgressSection currentTheme={currentTheme} isDarkMode={isDarkMode} />
    </main>
  );
};

// Tab Navigation Component
const TabNavigation = ({ currentTheme, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('format');
  
  const tabContainerStyle = {
    display: 'flex',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[4],
  };
  
  const tabStyle = (isActive) => ({
    padding: `${designSystem.spacing[2]} ${designSystem.spacing[4]}`,
    borderRadius: designSystem.borderRadius.md,
    backgroundColor: isActive 
      ? isDarkMode ? `${pastelColors[currentTheme]}30` : pastelColors[currentTheme]
      : isDarkMode ? designSystem.colors.darkSurface : designSystem.colors.surface,
    color: isDarkMode ? designSystem.colors.darkText : '#333',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px',
    boxShadow: isActive ? 'none' : designSystem.shadows.sm,
  });
  
  return (
    <div style={tabContainerStyle}>
      <button 
        style={tabStyle(activeTab === 'format')}
        onClick={() => setActiveTab('format')}
      >
        Format Essay
      </button>
      <button 
        style={tabStyle(activeTab === 'history')}
        onClick={() => setActiveTab('history')}
      >
        History
      </button>
    </div>
  );
};

// Two Column Layout Component
const TwoColumnLayout = ({ children, currentTheme }) => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg}px)`);
  
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '8fr 5fr', // Responsive layout
    gap: isMobile ? designSystem.spacing[3] : designSystem.spacing[5],
    className: 'two-column-layout', // For external CSS
  };
  
  return <div style={layoutStyle}>{children}</div>;
};

// Card Component
const Card = ({ children, title, currentTheme, badges = [], isDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);

  const cardStyle = {
    backgroundColor: isDarkMode ? designSystem.colors.darkSurface : designSystem.colors.surface,
    borderRadius: designSystem.borderRadius.lg,
    padding: isMobile ? designSystem.spacing[2] : designSystem.spacing[4],
    boxShadow: designSystem.shadows.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? designSystem.spacing[2] : designSystem.spacing[3],
    width: '100%',
    overflow: 'hidden',
  };
  
  const headerStyle = {
    display: 'flex',
    flexDirection: isMobile && badges.length > 1 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile && badges.length > 1 ? 'flex-start' : 'center',
    gap: isMobile && badges.length > 1 ? '8px' : 0,
  };
  
  const titleStyle = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: pastelColors[currentTheme],
    margin: 0,
  };
  
  const badgesContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };
  
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {title && <h2 style={titleStyle}>{title}</h2>}
        {badges.length > 0 && (
          <div style={badgesContainerStyle}>
            {badges.map((badge, index) => (
              <Badge 
                key={index}
                label={badge.label}
                color={badge.color || currentTheme}
                icon={badge.icon}
              />
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

// Document Section Component
const DocumentSection = ({ currentTheme, isDarkMode }) => {
  const dropZoneStyle = {
    border: `2px dashed ${pastelColors[currentTheme]}`,
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing[4],
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
    gap: designSystem.spacing[2],
    textAlign: 'center',
  };
  
  const placeholderLineStyle = {
    height: '1px',
    backgroundColor: isDarkMode ? '#4a5568' : '#e2e8f0',
    width: '100%',
    margin: `${designSystem.spacing[2]} 0`,
  };
  
  const uploadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: designSystem.spacing[1],
    padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
    borderRadius: designSystem.borderRadius.md,
    border: isDarkMode ? `1px solid #4a5568` : `1px solid #e2e8f0`,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
    color: isDarkMode ? '#a0aec0' : '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: designSystem.spacing[2],
  };
  
  return (
    <Card title="Document" currentTheme={currentTheme} isDarkMode={isDarkMode}>
      <div style={dropZoneStyle}>
        <div style={placeholderLineStyle}></div>
        <div style={placeholderLineStyle}></div>
        <div style={placeholderLineStyle}></div>
        <div style={{...placeholderLineStyle, width: '70%'}}></div>
        
        <div style={{color: isDarkMode ? '#a0aec0' : '#94a3b8', marginTop: designSystem.spacing[3]}}>
          Drop your file here
        </div>
        
        <div style={placeholderLineStyle}></div>
        <div style={placeholderLineStyle}></div>
        <div style={{...placeholderLineStyle, width: '85%'}}></div>
      </div>
      
      <button style={uploadButtonStyle}>
        <UploadIcon />
        Upload
      </button>
    </Card>
  );
};

// Format Section Component
const FormatSection = ({ currentTheme, onAddSticker, isDarkMode }) => {
  const [selectedFormat, setSelectedFormat] = useState('mla');
  const [mathPrecision, setMathPrecision] = useState(true);
  const [smartCitations, setSmartCitations] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  
  const optionStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? `${designSystem.spacing[1]} ${designSystem.spacing[2]}` : designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.md,
    border: `1px solid ${isSelected ? pastelColors[currentTheme] : isDarkMode ? '#4a5568' : '#e2e8f0'}`,
    backgroundColor: isSelected 
      ? isDarkMode ? `${pastelColors[currentTheme]}20` : `${pastelColors[currentTheme]}20`
      : isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
    marginBottom: designSystem.spacing[2],
    color: isDarkMode ? designSystem.colors.darkText : '#333',
    fontSize: isMobile ? '14px' : '16px',
  });
  
  const radioStyle = (isSelected) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `2px solid ${isSelected ? pastelColors[currentTheme] : isDarkMode ? '#4a5568' : '#e2e8f0'}`,
    marginRight: designSystem.spacing[2],
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  
  const radioInnerStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: pastelColors[currentTheme],
  };
  
  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${designSystem.spacing[1]} 0`,
    color: isDarkMode ? designSystem.colors.darkText : '#333',
  };
  
  const toggleStyle = (isActive) => ({
    width: '40px',
    height: '24px',
    backgroundColor: isActive ? pastelColors[currentTheme] : isDarkMode ? '#4a5568' : '#e2e8f0',
    borderRadius: '12px',
    position: 'relative',
    cursor: 'pointer',
    transition: '0.3s',
  });
  
  const toggleKnobStyle = (isActive) => ({
    width: '18px',
    height: '18px',
    backgroundColor: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '3px',
    left: isActive ? '19px' : '3px',
    transition: '0.3s',
  });
  
  const buttonStyle = (isPrimary) => ({
    padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
    backgroundColor: isPrimary 
      ? pastelColors[currentTheme] 
      : isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
    color: isPrimary ? '#333' : isDarkMode ? designSystem.colors.darkText : '#333',
    border: isPrimary ? 'none' : `1px solid ${pastelColors[currentTheme]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
  });
  
  const stickerButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `1px solid ${pastelColors[currentTheme]}`,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
    color: pastelColors[currentTheme],
    cursor: 'pointer',
    fontSize: '16px',
  };
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: designSystem.spacing[4]}}>
      <Card 
        title="Format Style" 
        currentTheme={currentTheme}
        badges={[{ label: "Formatting", icon: "📝" }]}
        isDarkMode={isDarkMode}
      >
        <div style={optionStyle(selectedFormat === 'mla')} onClick={() => setSelectedFormat('mla')}>
          <div style={radioStyle(selectedFormat === 'mla')}>
            {selectedFormat === 'mla' && <div style={radioInnerStyle}></div>}
          </div>
          <span>MLA (9th Edition)</span>
        </div>
        
        <div style={optionStyle(selectedFormat === 'apa')} onClick={() => setSelectedFormat('apa')}>
          <div style={radioStyle(selectedFormat === 'apa')}>
            {selectedFormat === 'apa' && <div style={radioInnerStyle}></div>}
          </div>
          <span>APA (7th Edition)</span>
        </div>
        
        <div style={optionStyle(selectedFormat === 'chicago')} onClick={() => setSelectedFormat('chicago')}>
          <div style={radioStyle(selectedFormat === 'chicago')}>
            {selectedFormat === 'chicago' && <div style={radioInnerStyle}></div>}
          </div>
          <span>Chicago (17th Edition)</span>
        </div>
      </Card>
      
      <Card 
        title="AI Features" 
        currentTheme={currentTheme}
        badges={[{ label: "Smart AI", icon: "🧠" }]}
        isDarkMode={isDarkMode}
      >
        <div style={toggleContainerStyle}>
          <span>Math Precision</span>
          <div style={toggleStyle(mathPrecision)} onClick={() => setMathPrecision(!mathPrecision)}>
            <div style={toggleKnobStyle(mathPrecision)}></div>
          </div>
        </div>
        
        <div style={toggleContainerStyle}>
          <span>Smart Citations</span>
          <div style={toggleStyle(smartCitations)} onClick={() => setSmartCitations(!smartCitations)}>
            <div style={toggleKnobStyle(smartCitations)}></div>
          </div>
        </div>
      </Card>
      
      <div style={{
        display: 'flex', 
        gap: designSystem.spacing[2], 
        marginTop: designSystem.spacing[2],
        alignItems: 'center'
      }}>
        <button style={buttonStyle(true)}>Format</button>
        <button style={buttonStyle(false)}>Export</button>
        <button style={stickerButtonStyle} onClick={onAddSticker}>
          😊
        </button>
      </div>
    </div>
  );
};

// Progress Section Component
const ProgressSection = ({ currentTheme, isDarkMode }) => {
  const progressBarContainerStyle = {
    height: '10px',
    backgroundColor: isDarkMode ? '#4a5568' : '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden',
    margin: `${designSystem.spacing[3]} 0`,
  };
  
  const progressBarStyle = {
    height: '100%',
    width: '50%',
    backgroundColor: pastelColors[currentTheme],
    borderRadius: '5px',
  };
  
  const statusTextStyle = {
    color: isDarkMode ? '#a0aec0' : '#64748b',
    fontSize: '14px',
  };
  
  return (
    <div>
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle}></div>
      </div>
      <div style={statusTextStyle}>
        50% complete · 5 citations detected · MLA format
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <ViewportMeta />
      <AppContainer />
    </>
  );
}
