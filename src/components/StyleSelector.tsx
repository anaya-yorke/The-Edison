import React from 'react';
import styles from '../styles/StyleSelector.module.css';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleSelect
}) => {
  // Define the available citation styles
  const citationStyles = [
    { id: 'MLA', name: 'MLA', description: '9th Edition' },
    { id: 'APA', name: 'APA', description: '7th Edition' },
    { id: 'CHICAGO', name: 'CHICAGO', description: '17th Edition' },
    { id: 'HARVARD', name: 'HARVARD', description: '2021' }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Citation Style</h2>
      <div className={styles.styleButtons}>
        {citationStyles.map((style) => (
          <button
            key={style.id}
            className={`${styles.styleButton} ${selectedStyle === style.id ? styles.selected : ''}`}
            onClick={() => onStyleSelect(style.id)}
            aria-pressed={selectedStyle === style.id}
          >
            <span className={styles.styleName}>{style.name}</span>
            <span className={styles.styleVersion}>{style.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector; 