// KDDISticker.js
import React, { useState, useRef, useEffect } from 'react';
import { getEmojiImageUrl, getTextColor } from './KDDIEmojiLibrary';

const KDDISticker = ({ 
  emoji, 
  id, 
  initialPosition, 
  backgroundColor,
  onPositionChange, 
  onRemove 
}) => {
  // State for position and interaction states
  const [position, setPosition] = useState(initialPosition || { top: 100, left: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Reference to the sticker element
  const stickerRef = useRef(null);
  
  // Offset from the cursor to the sticker's origin
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    // Only start dragging if the sticker is in draggable mode
    if (!isDraggable) return;
    
    // Prevent default browser behavior
    e.preventDefault();
    
    // Calculate the offset of the click from the sticker's origin
    const rect = stickerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setIsDragging(true);
    
    // Add event listeners for mouse movement and release
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse movement during dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate new position based on mouse position and offset
    const newPosition = {
      left: e.clientX - dragOffset.current.x,
      top: e.clientY - dragOffset.current.y
    };
    
    // Update position
    setPosition(newPosition);
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Remove event listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // Notify parent of position change
    if (onPositionChange) {
      onPositionChange(id, position);
    }
  };
  
  // Handle double click to toggle draggable mode
  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsDraggable(!isDraggable);
  };
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Get the appropriate text color for the background
  const textColor = getTextColor(backgroundColor);
  
  // KDDI-style sticker styles
  const stickerStyle = {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    cursor: isDraggable ? 'move' : 'pointer',
    zIndex: isDragging ? 1000 : 10,
    userSelect: 'none',
    touchAction: 'none',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  };
  
  // KDDI-style sticker container with custom background
  const stickerContainerStyle = {
    position: 'relative',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' :
            isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' :
            'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  };
  
  // Background with custom color and border to indicate draggable state
  const backgroundStyle = {
    position: 'absolute',
    width: '54px',
    height: '54px',
    borderRadius: '6px',
    backgroundColor: backgroundColor,
    border: `1px solid ${isDraggable ? '#6366f1' : 'rgba(0,0,0,0.05)'}`,
    boxShadow: isDraggable ? '0 0 0 2px rgba(99, 102, 241, 0.4)' : 'none',
  };
  
  // KDDI-style emoji image with pixel-perfect rendering
  const emojiImageStyle = {
    width: '40px',
    height: '40px',
    position: 'relative',
    zIndex: 2,
    imageRendering: 'pixelated', // Keep pixel art sharp
  };
  
  // Remove button that appears in draggable mode
  const removeButtonStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: isDraggable ? '#EF4444' : 'transparent',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 3,
    opacity: isDraggable ? 1 : 0,
    transition: 'opacity 0.2s ease, background-color 0.2s ease',
    border: '1px solid white',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  };
  
  // Draggable indicator badge
  const draggableBadgeStyle = {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '2px 4px',
    borderRadius: '4px',
    backgroundColor: '#6366f1',
    color: 'white',
    fontSize: '9px',
    fontWeight: 'bold',
    zIndex: 3,
    opacity: isDraggable ? 1 : 0,
    transition: 'opacity 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    pointerEvents: 'none',
  };
  
  return (
    <div 
      ref={stickerRef}
      style={stickerStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={stickerContainerStyle}>
        <div style={backgroundStyle}></div>
        
        <img 
          src={getEmojiImageUrl(emoji.unified)} 
          alt={emoji.shortName}
          style={emojiImageStyle}
        />
        
        <div 
          style={removeButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (isDraggable && onRemove) {
              onRemove(id);
            }
          }}
        >
          ×
        </div>
        
        <div style={draggableBadgeStyle}>
          Move
        </div>
      </div>
    </div>
  );
};

export default KDDISticker;
