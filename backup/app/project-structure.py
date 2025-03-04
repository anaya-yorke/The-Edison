#!/usr/bin/env python3
"""
The Edison: An AI-powered essay formatting tool.
Automatically formats academic papers according to MLA, APA, and Chicago style guidelines.
"""

import argparse
import logging
import os
import sys
from enum import Enum, auto
from pathlib import Path

from formatters.mla_formatter import MLAFormatter
from formatters.apa_formatter import APAFormatter
from formatters.chicago_formatter import ChicagoFormatter
from parsers.document_parser import DocumentParser
from exporters.docx_exporter import DocxExporter
from exporters.pdf_exporter import PdfExporter


class FormatStyle(Enum):
    MLA = auto()
    APA = auto()
    CHICAGO = auto()


class OutputFormat(Enum):
    DOCX = auto()
    PDF = auto()


class Edison:
    """Main class for The Edison document formatter."""
    
    def __init__(self, log_level=logging.INFO):
        """Initialize the formatter with default settings."""
        self.logger = self._setup_logger(log_level)
        
        # Initialize formatters
        self.formatters = {
            FormatStyle.MLA: MLAFormatter(),
            FormatStyle.APA: APAFormatter(),
            FormatStyle.CHICAGO: ChicagoFormatter()
        }
        
        # Initialize exporters
        self.exporters = {
            OutputFormat.DOCX: DocxExporter(),
            OutputFormat.PDF: PdfExporter()
        }
        
        self.parser = DocumentParser()
        
    def _setup_logger(self, log_level):
        """Set up logging configuration."""
        logger = logging.getLogger("Edison")
        logger.setLevel(log_level)
        
        # Create console handler and set level
        ch = logging.StreamHandler()
        ch.setLevel(log_level)
        
        # Create formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        
        # Add handler to logger
        logger.addHandler(ch)
        
        return logger
        
    def format_document(self, input_file, style, output_file, output_format=None):
        """
        Format a document according to the specified style.
        
        Args:
            input_file (str): Path to the input document
            style (str): Formatting style ("mla", "apa", or "chicago")
            output_file (str): Path for the output document
            output_format (str, optional): Output format ("docx" or "pdf").
                If not provided, inferred from output_file extension.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Starting to format document: {input_file}")
        
        # Validate input file exists
        input_path = Path(input_file)
        if not input_path.exists():
            self.logger.error(f"Input file does not exist: {input_file}")
            return False
        
        # Determine style
        try:
            format_style = self._parse_style(style)
        except ValueError as e:
            self.logger.error(str(e))
            return False
        
        # Determine output format
        try:
            out_format = self._determine_output_format(output_file, output_format)
        except ValueError as e:
            self.logger.error(str(e))
            return False
        
        # Parse the input document
        self.logger.info("Parsing input document...")
        try:
            document = self.parser.parse(input_path)
        except Exception as e:
            self.logger.error(f"Error parsing document: {str(e)}")
            return False
        
        # Apply the formatting
        self.logger.info(f"Applying {format_style.name} formatting...")
        try:
            formatter = self.formatters[format_style]
            formatted_doc = formatter.format(document)
        except Exception as e:
            self.logger.error(f"Error formatting document: {str(e)}")
            return False
        
        # Export the document
        self.logger.info(f"Exporting document as {out_format.name}...")
        try:
            exporter = self.exporters[out_format]
            exporter.export(formatted_doc, output_file)
        except Exception as e:
            self.logger.error(f"Error exporting document: {str(e)}")
            return False
        
        self.logger.info(f"Document successfully formatted and saved to: {output_file}")
        return True
    
    def _parse_style(self, style):
        """Convert style string to FormatStyle enum."""
        style_lower = style.lower()
        if style_lower == "mla":
            return FormatStyle.MLA
        elif style_lower == "apa":
            return FormatStyle.APA
        elif style_lower == "chicago":
            return FormatStyle.CHICAGO
        else:
            raise ValueError(f"Unknown formatting style: {style}. Expected 'mla', 'apa', or 'chicago'.")
    
    def _determine_output_format(self, output_file, format_str=None):
        """Determine output format from file extension or explicit format string."""
        if format_str:
            format_lower = format_str.lower()
            if format_lower == "docx":
                return OutputFormat.DOCX
            elif format_lower == "pdf":
                return OutputFormat.PDF
            else:
                raise ValueError(f"Unsupported output format: {format_str}. Expected 'docx' or 'pdf'.")
        else:
            # Infer from file extension
            ext = os.path.splitext(output_file)[1].lower()
            if ext == ".docx":
                return OutputFormat.DOCX
            elif ext == ".pdf":
                return OutputFormat.PDF
            else:
                raise ValueError(f"Cannot determine output format from extension: {ext}. Expected '.docx' or '.pdf'.")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="The Edison: AI-powered academic paper formatter.",
        epilog="Example: edison.py --input essay.txt --style mla --output formatted.docx"
    )
    
    parser.add_argument("-i", "--input", required=True, help="Path to input document")
    parser.add_argument("-s", "--style", required=True, choices=["mla", "apa", "chicago"], 
                         help="Formatting style to apply")
    parser.add_argument("-o", "--output", required=True, help="Path for output document")
    parser.add_argument("-f", "--format", choices=["docx", "pdf"], 
                         help="Output format (if not specified, determined from output file extension)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose logging")
    
    return parser.parse_args()


def main():
    """Main function to run the formatter from command line."""
    args = parse_args()
    
    log_level = logging.DEBUG if args.verbose else logging.INFO
    formatter = Edison(log_level=log_level)
    
    success = formatter.format_document(
        input_file=args.input,
        style=args.style,
        output_file=args.output,
        output_format=args.format
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
