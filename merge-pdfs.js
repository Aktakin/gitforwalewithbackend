/**
 * PDF Merger Script
 * Merges CV/Resume with Transcript into a single PDF
 * 
 * Usage:
 *   node merge-pdfs.js <cv-path> <transcript-path> <output-path>
 * 
 * Example:
 *   node merge-pdfs.js "C:/Users/aktak/Downloads/cv.pdf" "C:/Users/aktak/Downloads/Akintunde transcript.pdf" "merged-application.pdf"
 */

const fs = require('fs');
const path = require('path');

// Check if pdf-lib is installed
let PDFDocument;
try {
  PDFDocument = require('pdf-lib').PDFDocument;
} catch (error) {
  console.error('❌ Error: pdf-lib is not installed.');
  console.log('\n📦 Installing pdf-lib...');
  console.log('Please run: npm install pdf-lib');
  process.exit(1);
}

async function mergePDFs(cvPath, transcriptPath, outputPath) {
  try {
    // Validate input files exist
    if (!fs.existsSync(cvPath)) {
      throw new Error(`CV file not found: ${cvPath}`);
    }
    if (!fs.existsSync(transcriptPath)) {
      throw new Error(`Transcript file not found: ${transcriptPath}`);
    }

    console.log('📄 Reading CV...');
    const cvBytes = fs.readFileSync(cvPath);
    
    console.log('📄 Reading Transcript...');
    const transcriptBytes = fs.readFileSync(transcriptPath);

    console.log('🔄 Creating merged PDF...');
    const mergedPdf = await PDFDocument.create();

    // Add CV pages
    console.log('   Adding CV pages...');
    const cvPdf = await PDFDocument.load(cvBytes);
    const cvPages = await mergedPdf.copyPages(cvPdf, cvPdf.getPageIndices());
    cvPages.forEach((page) => mergedPdf.addPage(page));

    // Add Transcript pages
    console.log('   Adding Transcript pages...');
    const transcriptPdf = await PDFDocument.load(transcriptBytes);
    const transcriptPages = await mergedPdf.copyPages(transcriptPdf, transcriptPdf.getPageIndices());
    transcriptPages.forEach((page) => mergedPdf.addPage(page));

    // Save merged PDF
    console.log('💾 Saving merged PDF...');
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    console.log(`\n✅ Success! Merged PDF saved to: ${outputPath}`);
    console.log(`📊 Total pages: ${mergedPdf.getPageCount()}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Error merging PDFs:', error.message);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('📋 PDF Merger - Merge CV and Transcript');
    console.log('\nUsage:');
    console.log('  node merge-pdfs.js <cv-path> <transcript-path> [output-path]');
    console.log('\nExample:');
    console.log('  node merge-pdfs.js "cv.pdf" "Akintunde transcript.pdf" "merged-application.pdf"');
    console.log('\nOr with full paths:');
    console.log('  node merge-pdfs.js "C:/Users/aktak/Downloads/cv.pdf" "C:/Users/aktak/Downloads/Akintunde transcript.pdf"');
    process.exit(1);
  }

  const cvPath = args[0];
  const transcriptPath = args[1];
  const outputPath = args[2] || 'merged-application.pdf';

  mergePDFs(cvPath, transcriptPath, outputPath)
    .then(() => {
      console.log('\n🎉 Ready to submit!');
    })
    .catch((error) => {
      console.error('\n❌ Failed to merge PDFs:', error.message);
      process.exit(1);
    });
}

module.exports = { mergePDFs };



