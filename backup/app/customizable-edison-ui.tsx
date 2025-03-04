import React, { useState } from 'react';

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

// Sticker Component
const Sticker = ({ emoji, size = 36, rotation, onClick }: { emoji: string, size?: number, rotation?: number, onClick?: () => void }) => {
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

// App Container Component
const AppContainer = () => {
  const [currentTheme, setCurrentTheme] = useState('lavender');
  const [selectedStickers, setSelectedStickers] = useState(['✨', '📚']);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: designSystem.spacing[4],
    fontFamily: designSystem.typography.fontFamily,
    backgroundColor: designSystem.colors.background,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: designSystem.spacing[3],
  };
  
  const addSticker = (emoji) => {
    setSelectedStickers([...selectedStickers, emoji]);
    setShowStickerPicker(false);
  };
  
  // Get random position for stickers
  const getStickerPosition = (index) => {
    // Areas where stickers can appear
    const positions = [
      { top: '70px', right: '180px' }, // Near header
      { top: '85px', right: '120px' },
      { top: '65px', right: '220px' },
      { top: '110px', left: '350px' }, // Near tabs
      { top: '140px', left: '200px' },
      { top: '95px', left: '240px' },
      { top: '25px', right: '100px' }, // Top right
      { top: '40px', right: '140px' },
    ];
    
    return positions[index % positions.length];
  };
  
  return (
    <div style={containerStyle}>
      <Header 
        currentTheme={currentTheme} 
        setTheme={setCurrentTheme} 
      />
      
      {/* Stickers positioned around the UI */}
      {selectedStickers.map((emoji, index) => (
        <Sticker 
          key={index}
          emoji={emoji}
          size={36 + (index % 3) * 8} // Varying sizes
          {...getStickerPosition(index)}
        />
      ))}
      
      <MainContent 
        currentTheme={currentTheme}
        onAddSticker={() => setShowStickerPicker(true)}
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
const Header = ({ currentTheme, setTheme }) => {
  const headerStyle = {
    backgroundColor: pastelColors[currentTheme],
    borderRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing[4],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  };
  
  const titleStyle = {
    color: '#333',
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
  };
  
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Edison</h1>
      <div style={{ display: 'flex', gap: designSystem.spacing[2], alignItems: 'center' }}>
        <ThemeSelector currentTheme={currentTheme} setTheme={setTheme} />
        <ThemeToggle />
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
const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(true);
  
  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '18px',
    padding: '4px',
  };
  
  const toggleTextStyle = {
    color: '#333',
    fontSize: '14px',
    padding: '0 8px',
  };
  
  const toggleButtonStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: '0.3s',
    position: 'relative',
  };
  
  return (
    <div style={toggleContainerStyle}>
      <span style={toggleTextStyle}>Light</span>
      <div style={toggleButtonStyle} onClick={() => setIsLight(!isLight)} />
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
    ':hover': {
      transform: 'scale(1.2)',
    }
  };
  
  // Common emoji stickers
  const emojis = [
    '😊', '🌟', '🎉', '💯', '👍', '❤️', 
    '🌈', '✨', '🍀', '🎵', '🔥', '💡', 
    '📚', '🏆', '🚀', '🍕', '🌱', '🎮',
    '💼', '⭐', '🎨', '🧠', '🎓', '📝'
  ];
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={pickerStyle} onClick={e => e.stopPropagation()}>
        <h3 style={titleStyle}>Choose a Sticker</h3>
        <div style={stickerGridStyle}>
          {emojis.map((emoji, index) => (
            <div 
              key={index} 
              style={stickerStyle}
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = ({ currentTheme, onAddSticker }) => {
  return (
    <main>
      <TabNavigation currentTheme={currentTheme} />
      <TwoColumnLayout currentTheme={currentTheme}>
        <DocumentSection currentTheme={currentTheme} />
        <FormatSection currentTheme={currentTheme} onAddSticker={onAddSticker} />
      </TwoColumnLayout>
      <ProgressSection currentTheme={currentTheme} />
    </main>
  );
};

// Tab Navigation Component
const TabNavigation = ({ currentTheme }) => {
  const [activeTab, setActiveTab] = useState('format');
  
  const tabContainerStyle = {
    display: 'flex',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[4],
  };
  
  const tabStyle = (isActive) => ({
    padding: `${designSystem.spacing[2]} ${designSystem.spacing[4]}`,
    borderRadius: designSystem.borderRadius.md,
    backgroundColor: isActive ? pastelColors[currentTheme] : designSystem.colors.surface,
    color: '#333',
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
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '8fr 5fr', // Golden ratio approximation
    gap: designSystem.spacing[5],
  };
  
  return <div style={layoutStyle}>{children}</div>;
};

// Card Component
const Card = ({ children, title, currentTheme, badges = [] }) => {
  const cardStyle = {
    backgroundColor: designSystem.colors.surface,
    borderRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing[4],
    boxShadow: designSystem.shadows.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: designSystem.spacing[3],
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: pastelColors[currentTheme],
    margin: 0,
  };
  
  const badgesContainerStyle = {
    display: 'flex',
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
const DocumentSection = ({ currentTheme }) => {
  const dropZoneStyle = {
    border: `2px dashed ${pastelColors[currentTheme]}`,
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing[4],
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    gap: designSystem.spacing[2],
    textAlign: 'center',
  };
  
  const placeholderLineStyle = {
    height: '1px',
    backgroundColor: '#e2e8f0',
    width: '100%',
    margin: `${designSystem.spacing[2]} 0`,
  };
  
  const uploadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: designSystem.spacing[1],
    padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
    borderRadius: designSystem.borderRadius.md,
    border: `1px solid #e2e8f0`,
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: designSystem.spacing[2],
  };
  
  return (
    <Card title="Document" currentTheme={currentTheme}>
      <div style={dropZoneStyle}>
        <div style={placeholderLineStyle}></div>
        <div style={placeholderLineStyle}></div>
        <div style={placeholderLineStyle}></div>
        <div style={{...placeholderLineStyle, width: '70%'}}></div>
        
        <div style={{color: '#94a3b8', marginTop: designSystem.spacing[3]}}>
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

// Upload Icon Component
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Format Section Component
const FormatSection = ({ currentTheme, onAddSticker }) => {
  const [selectedFormat, setSelectedFormat] = useState('mla');
  const [mathPrecision, setMathPrecision] = useState(true);
  const [smartCitations, setSmartCitations] = useState(false);
  
  const optionStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.md,
    border: `1px solid ${isSelected ? pastelColors[currentTheme] : '#e2e8f0'}`,
    backgroundColor: isSelected ? `${pastelColors[currentTheme]}20` : 'white',
    marginBottom: designSystem.spacing[2],
  });
  
  const radioStyle = (isSelected) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `2px solid ${isSelected ? pastelColors[currentTheme] : '#e2e8f0'}`,
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
  };
  
  const toggleStyle = (isActive) => ({
    width: '40px',
    height: '24px',
    backgroundColor: isActive ? pastelColors[currentTheme] : '#e2e8f0',
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
    backgroundColor: isPrimary ? pastelColors[currentTheme] : 'white',
    color: isPrimary ? '#333' : '#333',
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
    backgroundColor: 'white',
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
const ProgressSection = ({ currentTheme }) => {
  const progressBarContainerStyle = {
    height: '10px',
    backgroundColor: '#e2e8f0',
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
    color: '#64748b',
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
  return <AppContainer />;
}
