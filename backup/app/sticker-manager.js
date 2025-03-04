// StickerManager.js
import React, { useState, useRef, useEffect } from 'react';
import KDDISticker from './KDDISticker';
import KDDIEmojiPicker from './KDDIEmojiPicker';
import { initKDDIEmojiLibrary, colorPalette } from './KDDIEmojiLibrary';

const StickerManager = ({ children }) => {
  // Initialize state for stickers
  const [stickers, setStickers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(colorPalette.pastelPink);
  
  // Reference for sticker IDs
  const nextId = useRef(1);
  
  // Initialize the KDDI emoji library on component mount
  useEffect(() => {
    initKDDIEmojiLibrary();
    
    // Load saved stickers from localStorage if available
    const savedStickers = localStorage.getItem('edisonStickers');
    if (savedStickers) {
      try {
        setStickers(JSON.parse(savedStickers));
        
        // Find the highest ID in saved stickers to continue from there
        const highestId = Math.max(...JSON.parse(savedStickers).map(s => s.id), 0);
        nextId.current = highestId + 1;
      } catch (e) {
        console.error('Error loading saved stickers:', e);
      }
    }
  }, []);
  
  // Save stickers to localStorage when they change
  useEffect(() => {
    localStorage.setItem('edisonStickers', JSON.stringify(stickers));
  }, [stickers]);
  
  // Add a new sticker
  const handleAddSticker = (emoji, backgroundColor) => {
    // Create a new sticker with a random position
    const newSticker = {
      id: nextId.current++,
      emoji,
      position: {
        top: 100 + Math.random() * 300,
        left: 100 + Math.random() * 600
      },
      backgroundColor: backgroundColor || currentTheme
    };
    
    setStickers([...stickers, newSticker]);
    setShowPicker(false);
    // Update current theme color for next sticker
    setCurrentTheme(backgroundColor || currentTheme);
  };
  
  // Update sticker position
  const handlePositionChange = (id, position) => {
    setStickers(stickers.map(sticker => 
      sticker.id === id ? { ...sticker, position } : sticker
    ));
  };
  
  // Remove a sticker
  const handleRemoveSticker = (id) => {
    setStickers(stickers.filter(sticker => sticker.id !== id));
  };
  
  // Style for the add sticker button
  const addButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: currentTheme,
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    zIndex: 100,
    border: 'none',
  };
  
  // Style for the button icon
  const buttonIconStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
  };
  
  return (
    <div>
      {/* The main app content */}
      {children}
      
      {/* Render all stickers */}
      {stickers.map(sticker => (
        <KDDISticker
          key={sticker.id}
          id={sticker.id}
          emoji={sticker.emoji}
          initialPosition={sticker.position}
          backgroundColor={sticker.backgroundColor}
          onPositionChange={handlePositionChange}
          onRemove={handleRemoveSticker}
        />
      ))}
      
      {/* Emoji picker modal */}
      {showPicker && (
        <KDDIEmojiPicker
          onSelectEmoji={handleAddSticker}
          onClose={() => setShowPicker(false)}
          selectedColor={currentTheme}
        />
      )}
      
      {/* Add sticker button */}
      <button 
        style={addButtonStyle} 
        onClick={() => setShowPicker(true)}
        title="Add Sticker"
        aria-label="Add Sticker"
      >
        <span style={buttonIconStyle}>+</span>
      </button>
    </div>
  );
};

export default StickerManager;
