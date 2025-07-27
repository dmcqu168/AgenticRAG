import os
import sys
from pathlib import Path
from app.services.document_processor import DocumentProcessor
import asyncio
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_pdf_ocr(pdf_path):
    """Test OCR functionality on a PDF file"""
    try:
        processor = DocumentProcessor()
        text = await processor._process_pdf(Path(pdf_path))
        
        print("=" * 80)
        print(f"Extracted text from {pdf_path}:")
        print("-" * 80)
        print(text[:2000] + "..." if len(text) > 2000 else text)  # Print first 2000 chars
        print("=" * 80)
        
        # Save the extracted text to a file for review
        output_path = f"{os.path.splitext(pdf_path)[0]}_extracted.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        logger.info(f"Extracted text saved to: {output_path}")
        
        return text
    except Exception as e:
        logger.error(f"Error processing {pdf_path}: {str(e)}", exc_info=True)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        sys.exit(1)
    
    asyncio.run(test_pdf_ocr(pdf_path))
