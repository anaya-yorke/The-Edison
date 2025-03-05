import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/ProfessorRequirements.module.css';

interface Requirement {
  id: string;
  name: string;
  options: string[];
  value: string;
}

interface ProfessorRequirementsProps {
  onRequirementsChange: (requirements: Record<string, string>) => void;
  expanded: boolean;
}

const ProfessorRequirements: React.FC<ProfessorRequirementsProps> = ({
  onRequirementsChange,
  expanded
}) => {
  // Default formatting requirements
  const defaultRequirements: Requirement[] = [
    { 
      id: 'font', 
      name: 'Font', 
      options: ['Times New Roman', 'Arial', 'Calibri', 'Courier New'], 
      value: 'Times New Roman' 
    },
    { 
      id: 'fontSize', 
      name: 'Font Size', 
      options: ['10pt', '11pt', '12pt', '14pt'], 
      value: '12pt' 
    },
    { 
      id: 'lineSpacing', 
      name: 'Line Spacing', 
      options: ['Single', '1.5', 'Double'], 
      value: 'Double' 
    },
    { 
      id: 'margins', 
      name: 'Margins', 
      options: ['1 inch', '1.25 inch', '1.5 inch'], 
      value: '1 inch' 
    }
  ];

  const [requirements, setRequirements] = useState<Requirement[]>(defaultRequirements);
  const [presets, setPresets] = useState<Record<string, Record<string, string>>>({
    'Default': defaultRequirements.reduce((acc, req) => ({ ...acc, [req.id]: req.value }), {}),
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('Default');

  // When a requirement changes, notify parent component
  useEffect(() => {
    const requirementsObject = requirements.reduce((acc, req) => ({
      ...acc,
      [req.id]: req.value
    }), {});
    
    onRequirementsChange(requirementsObject);
  }, [requirements, onRequirementsChange]);

  // Handle value change for a specific requirement
  const handleRequirementChange = (id: string, value: string) => {
    setRequirements(prevRequirements => 
      prevRequirements.map(req => 
        req.id === id ? { ...req, value } : req
      )
    );
  };

  // Save current requirements as a preset
  const savePreset = () => {
    const presetName = prompt('Enter a name for this preset (e.g. "Professor Smith - ENG101"):');
    if (presetName && presetName.trim() !== '') {
      const newPreset = requirements.reduce((acc, req) => ({
        ...acc,
        [req.id]: req.value
      }), {});
      
      setPresets(prevPresets => ({
        ...prevPresets,
        [presetName.trim()]: newPreset
      }));
      
      setSelectedPreset(presetName.trim());
    }
  };

  // Load a preset
  const loadPreset = (presetName: string) => {
    if (presets[presetName]) {
      setSelectedPreset(presetName);
      
      // Update requirements with preset values
      setRequirements(prevRequirements => 
        prevRequirements.map(req => ({
          ...req,
          value: presets[presetName][req.id] || req.value
        }))
      );
    }
  };

  if (!expanded) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Professor Requirements</h3>
        <div className={styles.presetSelector}>
          <select 
            value={selectedPreset}
            onChange={(e) => loadPreset(e.target.value)}
            className={styles.presetDropdown}
          >
            {Object.keys(presets).map(presetName => (
              <option key={presetName} value={presetName}>
                {presetName}
              </option>
            ))}
          </select>
          <button 
            onClick={savePreset}
            className={styles.saveButton}
          >
            Save Current
          </button>
        </div>
      </div>
      
      <div className={styles.requirements}>
        {requirements.map(requirement => (
          <div key={requirement.id} className={styles.requirementRow}>
            <label htmlFor={requirement.id} className={styles.requirementLabel}>
              {requirement.name}:
            </label>
            <select
              id={requirement.id}
              value={requirement.value}
              onChange={(e) => handleRequirementChange(requirement.id, e.target.value)}
              className={styles.requirementSelect}
            >
              {requirement.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorRequirements; 