# ai/document_analyzer.py
"""AI-powered document analysis for The Edison."""

import re
import numpy as np
import spacy
from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class DocumentAnalyzer:
    """
    AI-powered document analyzer that extracts structure, metadata, and citations.
    Uses NLP and machine learning techniques to understand document components.
    """
    
    def __init__(self):
        """Initialize the document analyzer with NLP models."""
        try:
            # Load NLP models
            self.nlp = spacy.load("en_core_web_md")
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Load transformers models
            self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
            self.model = AutoModel.from_pretrained("distilbert-base-uncased")
            
            logger.info("AI models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading AI models: {e}")
            # Fallback to basic processing if models fail to load
            self.nlp = None
            self.sentence_model = None
            self.tokenizer = None
            self.model = None
    
    def analyze(self, text):
        """
        Analyze document text to extract structure and metadata.
        
        Args:
            text (str): The document text
            
        Returns:
            dict: Document analysis including metadata, structure, and citations
        """
        # Initialize analysis result
        analysis = {
            'metadata': {},
            'structure': [],
            'citations': [],
            'sections': []
        }
        
        # Extract metadata
        analysis['metadata'] = self._extract_metadata(text)
        
        # Identify document structure
        analysis['structure'] = self._identify_structure(text)
        
        # Extract citations
        analysis['citations'] = self._extract_citations(text)
        
        # Identify sections
        analysis['sections'] = self._identify_sections(text)
        
        return analysis
    
    def _extract_metadata(self, text):
        """
        Extract metadata like title, author, date, etc. using NLP.
        
        Args:
            text (str): The document text
            
        Returns:
            dict: Extracted metadata
        """
        metadata = {
            'title': '',
            'author': '',
            'date': '',
            'course': '',
            'institution': ''
        }
        
        # Use NLP if available
        if self.nlp:
            doc = self.nlp(text[:5000])  # Process first 5000 chars for efficiency
            
            # Look for title-like sentences at the beginning
            for sent in list(doc.sents)[:5]:
                if len(sent.text.strip()) < 100 and sent.text.strip().istitle():
                    metadata['title'] = sent.text.strip()
                    break
            
            # Extract author names using NER
            person_names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
            if person_names:
                metadata['author'] = person_names[0]  # Assume first person is author
            
            # Extract dates
            dates = [ent.text for ent in doc.ents if ent.label_ == "DATE"]
            if dates:
                metadata['date'] = dates[0]
        else:
            # Fallback to regex patterns
            title_match = re.search(r'^(.+?)(?:\n|$)', text.strip())
            if title_match:
                metadata['title'] = title_match.group(1).strip()
        
        return metadata
    
    def _identify_structure(self, text):
        """
        Identify the document structure using ML techniques.
        
        Args:
            text (str): The document text
            
        Returns:
            list: Document structure elements
        """
        structure = []
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        if self.sentence_model:
            # Encode paragraphs to get embeddings
            embeddings = self.sentence_model.encode(paragraphs[:100])  # Limit to first 100 paragraphs
            
            # Cluster paragraphs to identify different types (e.g., headings, body, etc.)
            n_clusters = min(5, len(paragraphs))
            if n_clusters > 1:
                kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                clusters = kmeans.fit_predict(embeddings)
                
                # Analyze clusters to determine paragraph types
                for i, (para, cluster) in enumerate(zip(paragraphs[:100], clusters)):
                    if len(para) < 100 and para.isupper():
                        element_type = 'heading'
                    elif i == 0 and len(para) < 200:
                        element_type = 'abstract'
                    elif "references" in para.lower() or "bibliography" in para.lower():
                        element_type = 'bibliography'
                    else:
                        element_type = 'paragraph'
                    
                    structure.append({
                        'type': element_type,
                        'content': para,
                        'position': i
                    })
        else:
            # Fallback to basic heuristics
            for i, para in enumerate(paragraphs):
                if len(para) < 100 and para.isupper():
                    element_type = 'heading'
                elif i == 0 and len(para) < 200:
                    element_type = 'abstract'
                elif "references" in para.lower() or "bibliography" in para.lower():
                    element_type = 'bibliography'
                else:
                    element_type = 'paragraph'
                
                structure.append({
                    'type': element_type,
                    'content': para,
                    'position': i
                })
        
        return structure
    
    def _extract_citations(self, text):
        """
        Extract citations from text using NLP and regex patterns.
        
        Args:
            text (str): The document text
            
        Returns:
            list: Extracted citations
        """
        citations = []
        
        # Regex patterns for common citation formats
        patterns = [
            # APA format: (Author, Year)
            r'\(([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\set\sal\.?)?[\s,]+(\d{4})\)',
            # MLA format: (Author Page)
            r'\(([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)[\s,]+(\d+(?:-\d+)?)\)',
            # Chicago format: Footnote numbers
            r'(?<!\d)(\d+)(?!\d)[\.,]',
            # Bibliography entry pattern
            r'^([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*),\s+([A-Za-z]+)\.(.+?)(?:\.\s|\n|\r)'
        ]
        
        # Collect all citation matches
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.MULTILINE)
            for match in matches:
                citation_text = match.group(0)
                start_pos = match.start()
                end_pos = match.end()
                
                # Get surrounding context
                context_start = max(0, start_pos - 50)
                context_end = min(len(text), end_pos + 50)
                context = text[context_start:context_end]
                
                citations.append({
                    'text': citation_text,
                    'position': start_pos,
                    'context': context,
                    'groups': match.groups()
                })
        
        # Use NLP if available to improve citation detection
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "PERSON" and re.search(r'\d{4}', ent.sent.text):
                    # Potential citation with author name and year
                    if not any(c['text'] == ent.text for c in citations):
                        citations.append({
                            'text': ent.text,
                            'position': ent.start_char,
                            'context': ent.sent.text,
                            'groups': (ent.text,)
                        })
        
        return citations
    
    def _identify_sections(self, text):
        """
        Identify document sections using NLP and heuristics.
        
        Args:
            text (str): The document text
            
        Returns:
            list: Identified sections
        """
        sections = []
        
        # Split text by potential section headers
        # Look for lines that appear to be headings
        heading_pattern = r'(?:^|\n)([A-Z][A-Za-z\s:]{2,50})(?:\n|\r)'
        potential_headings = re.finditer(heading_pattern, text)
        
        last_pos = 0
        for match in potential_headings:
            heading_text = match.group(1).strip()
            heading_pos = match.start()
            
            # Skip if this heading is too close to the last one
            if heading_pos - last_pos < 100 and sections:
                continue
            
            # Add section
            sections.append({
                'heading': heading_text,
                'position': heading_pos,
                'level': 1  # Default section level
            })
            
            last_pos = heading_pos
        
        # Use NLP model for more advanced section detection if available
        if self.sentence_model and len(sections) == 0:
            # Split into paragraphs and find potential headings
            paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
            
            for i, para in enumerate(paragraphs):
                if i > 0 and len(para) < 100 and not para.endswith('.'):
                    # Potential heading
                    sections.append({
                        'heading': para,
                        'position': text.find(para),
                        'level': 1
                    })
        
        return sections


# ai/format_optimizer.py
"""AI-powered format optimization with mathematical precision."""

import numpy as np
import sympy as sp
from sympy import symbols, solve, Eq
import logging

logger = logging.getLogger(__name__)

class FormatOptimizer:
    """
    Optimizes document formatting with mathematical precision.
    Ensures exact measurements and proper alignment for different output formats.
    """
    
    # Standard page dimensions in points (1/72 inch)
    LETTER_WIDTH = 612  # 8.5 inches
    LETTER_HEIGHT = 792  # 11 inches
    A4_WIDTH = 595.276  # 210 mm
    A4_HEIGHT = 841.89  # 297 mm
    
    # Conversion factors
    INCH_TO_POINT = 72
    MM_TO_POINT = 2.83465
    POINT_TO_PIXEL = 1.33333  # At 96 DPI
    
    def __init__(self):
        """Initialize the format optimizer."""
        self.page_width = self.LETTER_WIDTH
        self.page_height = self.LETTER_HEIGHT
        self.margins = {
            'top': 72,      # 1 inch
            'right': 72,    # 1 inch
            'bottom': 72,   # 1 inch
            'left': 72      # 1 inch
        }
        
        # Calculate content area
        self._calculate_content_area()
    
    def set_page_size(self, width, height, unit='point'):
        """
        Set custom page size with specific units.
        
        Args:
            width (float): Page width
            height (float): Page height
            unit (str): Unit of measurement ('point', 'inch', 'mm', 'pixel')
        """
        # Convert to points
        if unit == 'inch':
            width *= self.INCH_TO_POINT
            height *= self.INCH_TO_POINT
        elif unit == 'mm':
            width *= self.MM_TO_POINT
            height *= self.MM_TO_POINT
        elif unit == 'pixel':
            width /= self.POINT_TO_PIXEL
            height /= self.POINT_TO_PIXEL
        
        self.page_width = width
        self.page_height = height
        
        # Recalculate content area
        self._calculate_content_area()
        
        logger.info(f"Page size set to {width}x{height} points")
    
    def set_margins(self, top=None, right=None, bottom=None, left=None, unit='point'):
        """
        Set custom margins with mathematical precision.
        
        Args:
            top (float): Top margin
            right (float): Right margin
            bottom (float): Bottom margin
            left (float): Left margin
            unit (str): Unit of measurement ('point', 'inch', 'mm', 'pixel')
        """
        # Convert to points
        convert = lambda val, unit: {
            'inch': lambda x: x * self.INCH_TO_POINT,
            'mm': lambda x: x * self.MM_TO_POINT,
            'pixel': lambda x: x / self.POINT_TO_PIXEL,
            'point': lambda x: x
        }[unit](val) if val is not None else None
        
        # Update margins, keeping current values for any None parameters
        if top is not None:
            self.margins['top'] = convert(top, unit)
        if right is not None:
            self.margins['right'] = convert(right, unit)
        if bottom is not None:
            self.margins['bottom'] = convert(bottom, unit)
        if left is not None:
            self.margins['left'] = convert(left, unit)
        
        # Recalculate content area
        self._calculate_content_area()
        
        logger.info(f"Margins set to: top={self.margins['top']}, right={self.margins['right']}, " +
                   f"bottom={self.margins['bottom']}, left={self.margins['left']} points")
    
    def _calculate_content_area(self):
        """Calculate the content area dimensions based on page size and margins."""
        self.content_width = self.page_width - (self.margins['left'] + self.margins['right'])
        self.content_height = self.page_height - (self.margins['top'] + self.margins['bottom'])
        
        # Calculate line spacing and characters per line
        self.default_font_size = 12  # points
        self.default_line_height = self.default_font_size * 2  # double spacing
        
        # Approximate characters per line (based on average character width)
        avg_char_width = self.default_font_size * 0.6  # rough approximation
        self.chars_per_line = int(self.content_width / avg_char_width)
        
        # Calculate lines per page
        self.lines_per_page = int(self.content_height / self.default_line_height)
    
    def calculate_optimal_margins(self, target_line_length=66):
        """
        Calculate optimal margins to achieve target line length.
        
        Args:
            target_line_length (int): Target number of characters per line
            
        Returns:
            dict: Calculated margins
        """
        # Use mathematical formula to determine margins
        avg_char_width = self.default_font_size * 0.6
        content_width_needed = target_line_length * avg_char_width
        
        # Calculate left/right margins
        margin_space = self.page_width - content_width_needed
        left_right_margin = margin_space / 2
        
        # Use symbolic math to ensure exact measurements
        x = symbols('x')
        eq = Eq(self.page_width - 2*x, content_width_needed)
        solution = float(solve(eq, x)[0])
        
        # Update margins
        self.set_margins(left=solution, right=solution)
        
        return self.margins
    
    def calculate_line_breaks(self, text, font_size=None):
        """
        Calculate optimal line breaks for the given text.
        
        Args:
            text (str): Text to analyze
            font_size (float): Font size in points
            
        Returns:
            list: List of line break positions
        """
        if font_size is None:
            font_size = self.default_font_size
        
        # Recalculate characters per line for given font size
        avg_char_width = font_size * 0.6
        chars_per_line = int(self.content_width / avg_char_width)
        
        # Calculate line breaks
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            # Check if adding this word exceeds the line length
            if current_length + len(word) + (1 if current_length > 0 else 0) > chars_per_line:
                # Add current line to lines
                lines.append(' '.join(current_line))
                # Start a new line with this word
                current_line = [word]
                current_length = len(word)
            else:
                # Add word to current line
                current_line.append(word)
                # Update current line length (add 1 for the space)
                current_length += len(word) + (1 if current_length > 0 else 0)
        
        # Add the last line if it's not empty
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def calculate_pagination(self, line_count):
        """
        Calculate pagination for the document.
        
        Args:
            line_count (int): Total number of lines in the document
            
        Returns:
            int: Number of pages needed
        """
        return int(np.ceil(line_count / self.lines_per_page))
    
    def optimize_heading_placement(self, headings_positions, text_length):
        """
        Optimize heading placement to avoid awkward page breaks.
        
        Args:
            headings_positions (list): List of heading positions (line numbers)
            text_length (int): Total number of lines
            
        Returns:
            list: Optimized heading positions with page numbers
        """
        page_breaks = [i * self.lines_per_page for i in range(1, self.calculate_pagination(text_length))]
        
        optimized_positions = []
        for heading_pos in headings_positions:
            # Calculate page number
            page_num = heading_pos // self.lines_per_page + 1
            
            # Check if heading is close to page break
            for break_pos in page_breaks:
                if 0 < heading_pos - break_pos < 3:
                    # Too close to top of page, move to previous page
                    heading_pos = break_pos - 1
                    page_num = heading_pos // self.lines_per_page + 1
                    break
            
            optimized_positions.append({
                'position': heading_pos,
                'page': page_num
            })
        
        return optimized_positions


# ai/citation_processor.py
"""AI-powered citation processing and formatting."""

import re
import nltk
from nltk.tokenize import sent_tokenize
import logging

logger = logging.getLogger(__name__)

# Try to download NLTK data if not present
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class CitationProcessor:
    """
    Processes and formats citations using AI techniques.
    Identifies citation patterns and converts between different styles.
    """
    
    def __init__(self):
        """Initialize the citation processor."""
        self.citation_patterns = {
            'mla': {
                'in_text': r'\(([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\s+and\s+[A-Z][a-z]+)?(?:\s+et\s+al\.?)?\s+(\d+)(?:-\d+)?\)',
                'parenthetical': r'\(([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\s+and\s+[A-Z][a-z]+)?(?:\s+et\s+al\.?)?\s+(\d+)(?:-\d+)?\)'
            },
            'apa': {
                'in_text': r'([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\s+and\s+[A-Z][a-z]+)?(?:\s+et\s+al\.?)?\s+\((\d{4})(?:,\s+p\.?\s+\d+(?:-\d+)?)?\)',
                'parenthetical': r'\(([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\s+and\s+[A-Z][a-z]+)?(?:\s+et\s+al\.?)?,\s+(\d{4})(?:,\s+p\.?\s+\d+(?:-\d+)?)?\)'
            },
            'chicago': {
                'in_text': r'([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)(?:\s+and\s+[A-Z][a-z]+)?(?:\s+et\s+al\.?)?\s+\((\d{4})(?:,\s+\d+(?:-\d+)?)?\)',
                'footnote': r'(?<!\d)(\d+)\.?\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*),\s+[^,]+,\s+(\d+)(?:-\d+)?'
            }
        }
    
    def extract_citations(self, text):
        """
        Extract citations from the text and identify their style.
        
        Args:
            text (str): Document text
            
        Returns:
            dict: Dictionary with citation style and extracted citations
        """
        # Tokenize text into sentences
        sentences = sent_tokenize(text)
        
        # Initialize counters for each style
        style_counts = {
            'mla': 0,
            'apa': 0,
            'chicago': 0
        }
        
        # Initialize citation storage
        citations = {
            'mla': [],
            'apa': [],
            'chicago': []
        }
        
        # Check each sentence for citations
        for sentence in sentences:
            for style in self.citation_patterns:
                for type_name, pattern in self.citation_patterns[style].items():
                    matches = re.finditer(pattern, sentence)
                    for match in matches:
                        style_counts[style] += 1
                        
                        citation = {
                            'text': match.group(0),
                            'type': type_name,
                            'sentence': sentence,
                            'groups': match.groups()
                        }
                        
                        citations[style].append(citation)
        
        # Determine dominant citation style
        dominant_style = max(style_counts, key=style_counts.get)
        if style_counts[dominant_style] == 0:
            dominant_style = None
        
        return {
            'dominant_style': dominant_style,
            'citations': citations,
            'style_counts': style_counts
        }
    
    def convert_citation(self, citation, from_style, to_style):
        """
        Convert a citation from one style to another.
        
        Args:
            citation (dict): Citation information
            from_style (str): Original citation style
            to_style (str): Target citation style
            
        Returns:
            str: Converted citation text
        """
        # Extract author and year/page information
        if from_style == 'mla':
            author = citation['groups'][0]
            page = citation['groups'][1]
            # For MLA, we need to infer the year
            year = "n.d."  # Default if we can't determine
        elif from_style == 'apa':
            author = citation['groups'][0]
            year = citation['groups'][1]
            # Page number might be in the text
            page_match = re.search(r'p\.?\s+(\d+(?:-\d+)?)', citation['text'])
            page = page_match.group(1) if page_match else None
        elif from_style == 'chicago':
            if citation['type'] == 'in_text':
                author = citation['groups'][0]
                year = citation['groups'][1]
                page_match = re.search(r'(\d+(?:-\d+)?)', citation['text'])
                page = page_match.group(1) if page_match else None
            else:  # footnote
                footnote_num = citation['groups'][0]
                author = citation['groups'][1]
                page = citation['groups'][2]
                year = "n.d."  # Default if we can't determine
        
        # Convert to target style
        if to_style == 'mla':
            if page:
                return f"({author} {page})"
            else:
                return f"({author})"
        elif to_style == 'apa':
            if page:
                return f"({author}, {year}, p. {page})"
            else:
                return f"({author}, {year})"
        elif to_style == 'chicago':
            if citation['type'] == 'in_text':
                if page:
                    return f"{author} ({year}, {page})"
                else:
                    return f"{author} ({year})"
            else:  # footnote - more complex, need consecutive numbering
                # This would require context of all citations
                return f"[Citation converted to Chicago footnote]"
        
        # Fallback if conversion not implemented
        return citation['text']
    
    def format_bibliography_entry(self, entry, style):
        """
        Format a bibliography entry according to the specified style.
        
        Args:
            entry (dict): Bibliography entry information
            style (str): Target citation style
            
        Returns:
            str: Formatted bibliography entry
        """
        # Extract common fields with defaults
        author = entry.get('author', 'Unknown Author')
        title = entry.get('title', 'Untitled')
        year = entry.get('year', 'n.d.')
        publisher = entry.get('publisher', '')
        location = entry.get('location', '')
        journal = entry.get('journal', '')
        volume = entry.get('volume', '')
        issue = entry.get('issue', '')
        pages = entry.get('pages', '')
        url = entry.get('url', '')
        
        # Format based on style
        if style == 'mla':
            if 'journal' in entry:  # Journal article
                return f"{author}. \"{title}.\" {journal}, vol. {volume}, no. {issue}, {year}, pp. {pages}."
            elif 'url' in entry:  # Website
                return f"{author}. \"{title}.\" {publisher}, {year}, {url}."
            else:  # Book
                return f"{author}. {title}. {location}: {publisher}, {year}."
        
        elif style == 'apa':
            if 'journal' in entry:  # Journal article
                return f"{author}. ({year}). {title}. {journal}, {volume}({issue}), {pages}."
            elif 'url' in entry:  # Website
                return f"{author}. ({year}). {title}. {publisher}. {url}"
            else:  # Book
                return f"{author}. ({year}). {title}. {publisher}."
        
        elif style == 'chicago':
            if 'journal' in entry:  # Journal article
                return f"{author}. \"{title}.\" {journal} {volume}, no. {issue} ({year}): {pages}."
            elif 'url' in entry:  # Website
                return f"{author}. \"{title}.\" {publisher}, {year}. {url}."
            else:  # Book
                return f"{author}. {title}. {location}: {publisher}, {year}."
        
        # Fallback for unknown style
        return f"{author}. {title}. {year}."
    
    def identify_bibliography(self, text):
        """
        Identify and parse bibliography section.
        
        Args:
            text (str): Document text
            
        Returns:
            list: Parsed bibliography entries
        """
        # Look for bibliography section
        bib_titles = [
            "Works Cited", "References", "Bibliography", "Literature Cited", "Sources"
        ]
        
        bib_section = None
        
        # Try to find the bibliography section
        for title in bib_titles:
            match = re.search(rf"(?:^|\n)\s*{title}\s*(?:\n|$)(.*?)(?:$|\n\s*(?:[A-Z][a-zA-Z\s]+:|\[))", 
                             text, re.DOTALL)
            if match:
                bib_section = match.group(1).strip()
                break
        
        if not bib_section:
            # Try another approach - look for a section at the end with typical citation patterns
            paragraphs = text.split('\n\n')
            if len(paragraphs) > 3:
                last_paras = '\n\n'.join(paragraphs[-3:])
                if re.search(r'(?:^|\n)([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*),\s+[A-Z]', last_paras):
                    bib_section = last_paras
        
        if not bib_section:
            return []
        
        # Split into individual entries
        entries_raw = re.split(r'\n(?=[A-Z])', bib_section)
        entries = []
        
        for entry_text in entries_raw:
            entry_text = entry_text.strip()
            if not entry_text:
                continue
                
            # Attempt to parse entry
            entry = {}
            
            # Try to extract author
            author_match = re.match(r'^([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)', entry_text)
            if author_match:
                entry['author'] = author_match.group(1)
            
            # Try to extract year
            year_match = re.search(r'(\d{4})', entry_text)
            if year_match:
                entry['year'] = year_match.group(1)
            
            # Try to extract title - look for quoted text or text between author and year
            title_match = re.search(r'"([^"]+)"', entry_text)
            if title_match:
                entry['title'] = title_match.group(1)
            elif author_match and year_match:
                author_end = author_match.end()
                year_start = year_match.start()
                if year_start > author_end:
                    potential_title = entry_text[author_end:year_start].strip()
                    if potential_title:
                        entry['title'] = potential_title.strip('., ')
            
            # Store the raw text as well
            entry['raw'] = entry_text
            
            entries.append(entry)
        
        return entries
