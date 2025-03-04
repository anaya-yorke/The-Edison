import React, { useState } from 'react';
import StickerManager from './StickerManager';
import { colorPalette } from './KDDIEmojiLibrary';

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
  }
};

// Badge Component
const Badge = ({ label, color, icon }) => {
  // Calculate text color based on background color
  const getTextColor = (bgColor) => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const textColor = getTextColor(color);
  
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: color,
    color: textColor,
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

// Main Application Component
const EdisonApp = () => {
  const [currentTheme, setCurrentTheme] = useState(colorPalette.pastelPink);
  const [activeTab, setActiveTab] = useState('format');
  const [selectedFormat, setSelectedFormat] = useState('mla');
  const [mathPrecision, setMathPrecision] = useState(true);
  const [smartCitations, setSmartCitations] = useState(false);
  
  // Calculate text color based on current theme
  const getTextColor = (bgColor) => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  const textColor = getTextColor(currentTheme);

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
    position: 'relative',
  };
  
  return (
    <StickerManager>
      <div style={containerStyle}>
        <Header 
          currentTheme={currentTheme} 
          setTheme={setCurrentTheme}
          textColor={textColor}
        />
        
        <MainContent 
          currentTheme={currentTheme}
          textColor={textColor}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          mathPrecision={mathPrecision}
          setMathPrecision={setMathPrecision}
          smartCitations={smartCitations}
          setSmartCitations={setSmartCitations}
        />
      </div>
    </StickerManager>
  );
};

// Header Component
const Header = ({ currentTheme, setTheme, textColor }) => {
  const headerStyle = {
    backgroundColor: currentTheme,
    borderRadius: designSystem.borderRadius.lg,
    padding: designSystem.spacing[4],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  };
  
  const titleStyle = {
    color: textColor,
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
  };
  
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Edison</h1>
      <div style={{ display: 'flex', gap: designSystem.spacing[2], alignItems: 'center' }}>
        <ThemeSelector 
          currentTheme={currentTheme} 
          setTheme={setTheme} 
        />
        <ThemeToggle textColor={textColor} />
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
    backgroundColor: currentTheme,
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
  
  const colorOptionStyle = (color, isSelected) => ({
    width: '24px',
    height: '24px',
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: color,
    border: isSelected ? '2px solid #333' : '2px solid transparent',
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
          {Object.entries(colorPalette).map(([name, color]) => (
            <div
              key={name}
              style={colorOptionStyle(color, color === currentTheme)}
              onClick={() => handleColorSelect(color)}
              title={name.replace(/([A-Z])/g, ' $1').trim()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Theme Toggle Component
const ThemeToggle = ({ textColor }) => {
  const [isLight, setIsLight] = useState(true);
  
  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '18px',
    padding: '4px',
  };
  
  const toggleTextStyle = {
    color: textColor,
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

// Main Content Component
const MainContent = ({ 
  currentTheme, 
  textColor,
  activeTab,
  setActiveTab,
  selectedFormat,
  setSelectedFormat,
  mathPrecision,
  setMathPrecision,
  smartCitations,
  setSmartCitations
}) => {
  return (
    <main>
      <TabNavigation 
        currentTheme={currentTheme} 
        textColor={textColor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <TwoColumnLayout>
        <DocumentSection currentTheme={currentTheme} />
        <FormatSection 
          currentTheme={currentTheme}
          textColor={textColor}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          mathPrecision={mathPrecision}
          setMathPrecision={setMathPrecision}
          smartCitations={smartCitations}
          setSmartCitations={setSmartCitations}
        />
      </TwoColumnLayout>
      <ProgressSection currentTheme={currentTheme} />
    </main>
  );
};

// Tab Navigation Component
const TabNavigation = ({ currentTheme, textColor, activeTab, setActiveTab }) => {
  const tabContainerStyle = {
    display: 'flex',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[4],
  };
  
  const tabStyle = (isActive) => ({
    padding: `${designSystem.spacing[2]} ${designSystem.spacing[4]}`,
    borderRadius: designSystem.borderRadius.md,
    backgroundColor: isActive ? currentTheme : designSystem.colors.surface,
    color: isActive ? textColor : '#333',
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
const TwoColumnLayout = ({ children }) => {
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '8fr 5fr', // Golden ratio approximation
    gap: designSystem.spacing[5],
  };
  
  return <div style={layoutStyle}>{children}</div>;
};

// Card Component
const Card = ({ children, title, currentTheme, textColor, badges = [] }) => {
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
    color: currentTheme,
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
    border: `2px dashed ${currentTheme}`,
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
const FormatSection = ({ 
  currentTheme, 
  textColor,
  selectedFormat,
  setSelectedFormat,
  mathPrecision,
  setMathPrecision,
  smartCitations,
  setSmartCitations
}) => {
  const optionStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.md,
    border: `1px solid ${isSelected ? currentTheme : '#e2e8f0'}`,
    backgroundColor: isSelected ? `${currentTheme}20` : 'white',
    marginBottom: designSystem.spacing[2],
  });
  
  const radioStyle = (isSelected) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `2px solid ${isSelected ? currentTheme : '#e2e8f0'}`,
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
    backgroundColor: currentTheme,
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
    backgroundColor: isActive ? currentTheme : '#e2e8f0',
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
    backgroundColor: isPrimary ? currentTheme : 'white',
    color: isPrimary ? textColor : '#333',
    border: isPrimary ? 'none' : `1px solid ${currentTheme}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
  });
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: designSystem.spacing[4]}}>
      <Card 
        title="Format Style" 
        currentTheme={currentTheme}
        textColor={textColor}
        badges={[{ label: "Formatting", icon: "📝", color: currentTheme }]}
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
        textColor={textColor}
        badges={[{ label: "Smart AI", icon: "🧠", color: currentTheme }]}
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
      }}>
        <button style={buttonStyle(true)}>Format</button>
        <button style={buttonStyle(false)}>Export</button>
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
    backgroundColor: currentTheme,
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

export default EdisonApp;
