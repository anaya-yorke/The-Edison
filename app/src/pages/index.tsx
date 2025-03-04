import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import StyleSelector from '../components/forms/StyleSelector';
import ProfessorRequirements from '../components/forms/ProfessorRequirements';

export default function Home() {
  // State for the essay content and selected style
  const [essayContent, setEssayContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('MLA');
  const [profRequirements, setProfRequirements] = useState(false);
  const [requirements, setRequirements] = useState<Record<string, string>>({});
  const [isFormatted, setIsFormatted] = useState(false);

  // Handle style selection
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    if (isFormatted) {
      // If already formatted, reformat with new style
      formatEssay(essayContent, style, requirements);
    }
  };

  // Handle essay input
  const handleEssayInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayContent(e.target.value);
    setIsFormatted(false);
  };

  // Toggle professor requirements section
  const toggleProfRequirements = () => {
    setProfRequirements(!profRequirements);
  };

  // Handle requirements changes
  const handleRequirementsChange = (newRequirements: Record<string, string>) => {
    setRequirements(newRequirements);
    if (isFormatted) {
      // If already formatted, reformat with new requirements
      formatEssay(essayContent, selectedStyle, newRequirements);
    }
  };

  // Format the essay based on selected style and requirements
  const formatEssay = (content: string, style: string, reqs: Record<string, string>) => {
    // In a real app, this would process the essay with the backend
    // For now, we'll just simulate formatting by setting isFormatted to true
    setIsFormatted(true);
  };

  // Handle the format button click
  const handleFormat = () => {
    if (essayContent.trim() === '') {
      alert('Please enter essay content before formatting.');
      return;
    }
    
    formatEssay(essayContent, selectedStyle, requirements);
  };

  // Handle export (in a real app this would generate a file)
  const handleExport = (format: 'docx' | 'pdf' | 'google') => {
    if (!isFormatted) {
      alert('Please format your essay before exporting.');
      return;
    }
    
    switch (format) {
      case 'docx':
        alert('Exporting as DOCX...');
        break;
      case 'pdf':
        alert('Exporting as PDF...');
        break;
      case 'google':
        alert('Exporting to Google Docs...');
        break;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>The Edison - Essay Formatter</title>
        <meta name="description" content="Never struggle with formatting an essay again" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>
          <h1 className={styles.title}>The Edison</h1>
          <p className={styles.subtitle}>Essay Formatter</p>
        </div>
        <div className={styles.userSection}>
          <button className={styles.getTicket}>Get Your Free Ticket</button>
        </div>
      </header>

      <main className={styles.main}>
        <StyleSelector 
          selectedStyle={selectedStyle} 
          onStyleSelect={handleStyleSelect} 
        />

        <div className={styles.editorContainer}>
          {!isFormatted ? (
            <textarea 
              className={styles.essayInput} 
              placeholder="Paste or upload your essay" 
              onChange={handleEssayInput}
              value={essayContent}
            />
          ) : (
            <div className={styles.essayPreview}>
              {/* This would show the formatted essay based on selected style */}
              <div className={styles.essayContent}>
                {/* Example of formatted content - in a real app this would be dynamically generated */}
                <p>John Smith</p>
                <p>Professor Johnson</p>
                <p>English 101</p>
                <p>15 March 2025</p>
                <p>&nbsp;</p>
                <h2 className={styles.essayTitle}>Title: The Impact of Technology</h2>
                <p>&nbsp;</p>
                <p>{essayContent || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profRequirementsToggle} onClick={toggleProfRequirements}>
          {profRequirements ? '- HIDE PROFESSOR REQUIREMENTS' : '+ PROFESSOR REQUIREMENTS'}
        </div>

        <ProfessorRequirements 
          onRequirementsChange={handleRequirementsChange}
          expanded={profRequirements}
        />

        <div className={styles.actionButtons}>
          {!isFormatted ? (
            <button className={styles.formatButton} onClick={handleFormat}>
              FORMAT ESSAY
            </button>
          ) : (
            <div className={styles.exportOptions}>
              <button 
                className={styles.exportButton}
                onClick={() => handleExport('docx')}
              >
                DOWNLOAD .DOCX
              </button>
              <button 
                className={styles.exportButton}
                onClick={() => handleExport('pdf')}
              >
                DOWNLOAD .PDF
              </button>
              <button 
                className={styles.exportButton}
                onClick={() => handleExport('google')}
              >
                SEND TO GOOGLE DOCS
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.tagline}>
          <h2 className={styles.taglineText}>Never struggle with formatting again</h2>
          <p>The Edison is here to save the day.</p>
        </div>
      </footer>
    </div>
  );
} 