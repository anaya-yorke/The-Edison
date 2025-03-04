#!/usr/bin/env python3
"""
The Edison: An AI-powered essay formatting tool.
Command Line Interface
"""

import os
import sys
import logging
import argparse
import json
import time
from pathlib import Path

from termcolor import colored
from tqdm import tqdm

from edison import Edison, FormatStyle, OutputFormat
from ai.document_analyzer import DocumentAnalyzer
from ai.format_optimizer import FormatOptimizer
from ai.citation_processor import CitationProcessor


def setup_logger():
    """Set up logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("edison.log"),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger("Edison-CLI")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description=colored("The Edison: AI-powered academic paper formatter.", "cyan", attrs=["bold"]),
        epilog=colored("Example: edison-cli.py --input essay.txt --style mla --output formatted.docx", "green")
    )
    
    parser.add_argument("-i", "--input", required=True, help="Path to input document")
    parser.add_argument("-s", "--style", required=True, choices=["mla", "apa", "chicago"], 
                        help="Formatting style to apply")
    parser.add_argument("-o", "--output", required=True, help="Path for output document")
    parser.add_argument("-f", "--format", choices=["docx", "pdf", "gdoc"], 
                        help="Output format (docx, pdf, or Google Doc)")
    parser.add_argument("-m", "--metadata", help="Path to JSON file with document metadata")
    parser.add_argument("-p", "--precision", action="store_true", 
                        help="Enable mathematical precision mode")
    parser.add_argument("-a", "--analyze", action="store_true", 
                        help="Analyze document before formatting")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose logging")
    parser.add_argument("--google-credentials", help="Path to Google API credentials file")
    
    return parser.parse_args()


def load_metadata(file_path):
    """
    Load document metadata from JSON file.
    
    Args:
        file_path (str): Path to JSON metadata file
        
    Returns:
        dict: Document metadata
    """
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading metadata: {e}")
        return {}


def analyze_document(file_path):
    """
    Analyze document structure, style, and citations.
    
    Args:
        file_path (str): Path to document
        
    Returns:
        dict: Analysis results
    """
    logger.info("Analyzing document...")
    
    try:
        # Read document text
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Create analyzer instances
        doc_analyzer = DocumentAnalyzer()
        citation_processor = CitationProcessor()
        
        # Analyze document
        structure_analysis = doc_analyzer.analyze(text)
        citation_analysis = citation_processor.extract_citations(text)
        
        # Combine results
        analysis = {
            'structure': structure_analysis,
            'citations': citation_analysis,
            'metadata': structure_analysis['metadata']
        }
        
        # Print summary
        print(colored("\nDocument Analysis Summary:", "cyan", attrs=["bold"]))
        print(f"Title: {analysis['metadata'].get('title', 'Unknown')}")
        print(f"Author: {analysis['metadata'].get('author', 'Unknown')}")
        print(f"Detected Citation Style: {citation_analysis.get('dominant_style', 'Unknown')}")
        print(f"Citations Found: {sum(citation_analysis['style_counts'].values())}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        return None


def setup_optimization(enable_precision, metadata=None):
    """
    Set up format optimization with mathematical precision.
    
    Args:
        enable_precision (bool): Whether to enable precision mode
        metadata (dict): Document metadata
        
    Returns:
        FormatOptimizer: Configured optimizer
    """
    optimizer = FormatOptimizer()
    
    if enable_precision:
        # Set default document format (letter size)
        optimizer.set_page_size(optimizer.LETTER_WIDTH, optimizer.LETTER_HEIGHT)
        
        # Set default margins (1 inch)
        optimizer.set_margins(72, 72, 72, 72)
        
        # Calculate optimal margins for readability
        optimizer.calculate_optimal_margins()
        
        logger.info("Mathematical precision mode enabled")
        print(colored("\nMathematical Precision Mode Enabled", "green"))
        print(f"Content width: {optimizer.content_width:.2f} points")
        print(f"Characters per line: ~{optimizer.chars_per_line}")
        print(f"Lines per page: ~{optimizer.lines_per_page}")
    
    return optimizer


def main():
    """Main function for CLI."""
    # Set up logging
    global logger
    logger = setup_logger()
    
    # Parse arguments
    args = parse_args()
    
    # Set log level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Display header
    print(colored("\n╔════════════════════════════════════════╗", "cyan"))
    print(colored("║         THE EDISON - AI FORMATTER        ║", "cyan", attrs=["bold"]))
    print(colored("║      MLA • APA • CHICAGO FORMATTING      ║", "cyan"))
    print(colored("╚════════════════════════════════════════╝\n", "cyan"))
    
    # Validate input file
    input_path = Path(args.input)
    if not input_path.exists():
        logger.error(f"Input file does not exist: {args.input}")
        print(colored(f"Error: Input file does not exist: {args.input}", "red"))
        return 1
    
    # Load metadata if provided
    metadata = {}
    if args.metadata:
        metadata = load_metadata(args.metadata)
    
    # Analyze document if requested
    if args.analyze:
        analysis = analyze_document(args.input)
        if analysis:
            # Update metadata with detected values if not provided explicitly
            for key, value in analysis['metadata'].items():
                if key not in metadata or not metadata[key]:
                    metadata[key] = value
    
    # Set up optimization
    optimizer = setup_optimization(args.precision, metadata)
    
    # Initialize the formatter
    log_level = logging.DEBUG if args.verbose else logging.INFO
    formatter = Edison(log_level=log_level)
    
    # Display formatting information
    print(colored(f"\nFormatting document: {args.input}", "yellow"))
    print(colored(f"Style: {args.style.upper()}", "yellow"))
    print(colored(f"Output: {args.output}", "yellow"))
    
    # Show progress bar
    with tqdm(total=6, desc="Formatting", unit="step") as progress:
        # Step 1: Parse document
        progress.set_description("Parsing document")
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
        
        # Step 2: Apply formatting rules
        progress.set_description(f"Applying {args.style.upper()} style")
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
        
        # Step 3: Process citations
        progress.set_description("Processing citations")
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
        
        # Step 4: Optimize layout
        progress.set_description("Optimizing layout")
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
        
        # Step 5: Generate document
        progress.set_description("Generating document")
        
        # Format the document
        success = formatter.format_document(
            input_file=args.input,
            style=args.style,
            output_file=args.output,
            output_format=args.format,
            metadata=metadata,
            optimizer=optimizer if args.precision else None
        )
        
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
        
        # Step 6: Finalize
        progress.set_description("Finalizing")
        time.sleep(0.5)  # Simulate processing time
        progress.update(1)
    
    if success:
        print(colored("\n✓ Document successfully formatted!", "green", attrs=["bold"]))
        print(colored(f"Output saved to: {args.output}", "green"))
        return 0
    else:
        print(colored("\n✗ Error formatting document", "red", attrs=["bold"]))
        print(colored("Check the log file for details: edison.log", "red"))
        return 1


if __name__ == "__main__":
    sys.exit(main())
