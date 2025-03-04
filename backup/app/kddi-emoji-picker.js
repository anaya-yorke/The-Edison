s// KDDIEmojiPicker.js
import React, { useState } from 'react';
import { kddiEmojis, colorPalette, getEmojiImageUrl, getTextColor } from './KDDIEmojiLibrary';

const KDDIEmojiPicker = ({ onSelectEmoji, onClose, selectedColor }) => {
  // State to track the active category tab
  const [activeCategory, setActiveCategory] = useState(Object.keys(kddiEmojis)[0]);
  
  // State to store the selected background color
  const [selectedBgColor, setSelectedBgColor] = useState(selectedColor || colorPalette.pastelPink);
  
  // Calculate the text color for the selected background
  const textColor = getTextColor(selectedBgColor);
  
  // Modal overlay style
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
  
  // Picker container style
  const pickerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  };
  
  // Title style with the selected background color
  const titleStyle = {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: textColor,
    textAlign: 'center',
    backgroundColor: selectedBgColor,
    padding: '8px 12px',
    borderRadius: '8px',
  };
  
  // Category tabs container
  const tabsContainerStyle = {
    display: 'flex',
    overflowX: 'auto',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '4px',
  };
  
  // Individual tab style
  const tabStyle = (isActive) => ({
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${selectedBgColor}` : 'none',
    fontWeight: isActive ? '600' : 'normal',
    color: isActive ? selectedBgColor : '#64748b',
    whiteSpace: 'nowrap',
  });
  
  // Emoji grid container
  const emojiGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
    overflowY: 'auto',
    maxHeight: '300px',
    padding: '8px 4px',
  };
  
  // Individual emoji button style
  const emojiButtonStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  };
  
  // Styles for emoji images
  const emojiImageStyle = {
    width: '32px', 
    height: '32px',
    imageRendering: 'pixelated', // Keeps the pixel art crisp
  };
  
  // Color picker container
  const colorPickerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    justifyContent: 'center',
  };
  
  // Individual color option style
  const colorOptionStyle = (color, isSelected) => ({
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: color,
    cursor: 'pointer',
    border: isSelected ? '2px solid #333' : '1px solid #ddd',
    boxShadow: isSelected ? '0 0 0 2px rgba(99, 102, 241, 0.4)' : 'none',
    transition: 'transform 0.2s ease',
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
  });
  
  // Instructions style
  const instructionsStyle = {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '12px',
    textAlign: 'center',
    padding: '8px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
  };
  
  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedBgColor(color);
  };
  
  // Handle emoji selection with the current background color
  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(emoji, selectedBgColor);
  };
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={pickerStyle} onClick={e => e.stopPropagation()}>
        <h3 style={titleStyle}>Choose a KDDI Sticker</h3>
        
        {/* Category tabs */}
        <div style={tabsContainerStyle}>
          {Object.keys(kddiEmojis).map(category => (
            <div
              key={category}
              style={tabStyle(category === activeCategory)}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>
        
        {/* Emoji grid */}
        <div style={emojiGridStyle}>
          {kddiEmojis[activeCategory].map(emoji => (
            <button
              key={emoji.unified}
              style={emojiButtonStyle}
              onClick={() => handleEmojiSelect(emoji)}
              title={emoji.description}
            >
              <img 
                src={getEmojiImageUrl(emoji.unified)} 
                alt={emoji.shortName}
                style={emojiImageStyle}
              />
            </button>
          ))}
        </div>
        
        {/* Color picker */}
        <div style={colorPickerStyle}>
          {Object.entries(colorPalette).map(([name, color]) => (
            <div
              key={name}
              style={colorOptionStyle(color, color === selectedBgColor)}
              onClick={() => handleColorSelect(color)}
              title={name.replace(/([A-Z])/g, ' $1').trim()}
            />
          ))}
        </div>
        
        {/* Instructions */}
        <div style={instructionsStyle}>
          <strong>Tip:</strong> Double-click a sticker to move it. Double-click again to fix it in place.
        </div>
      </div>
    </div>
  );
};

export default KDDIEmojiPicker;
