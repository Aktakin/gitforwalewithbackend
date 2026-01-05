/**
 * Create CV and Merge with Transcript
 * Creates a professional CV based on job description and merges with transcript
 */

const fs = require('fs');
const path = require('path');

// Check if pdf-lib is installed
let PDFDocument, rgb;
try {
  const pdfLib = require('pdf-lib');
  PDFDocument = pdfLib.PDFDocument;
  rgb = pdfLib.rgb;
} catch (error) {
  console.error('❌ Error: pdf-lib is not installed.');
  console.log('\n📦 Please install pdf-lib first:');
  console.log('   npm install pdf-lib');
  process.exit(1);
}

// CV Content based on job description
const cvContent = {
  name: 'Akintunde',
  title: 'Jr. Process Designer / Engineer',
  contact: {
    email: 'your.email@example.com', // Update this
    phone: 'Your Phone Number', // Update this
    location: 'Oakville, ON / Willing to Relocate'
  },
  objective: `Motivated engineering professional seeking a Jr. Process Designer/Engineer position to contribute to innovative process equipment design and qualification in the bio-pharmaceutical, personal care, and food industries. Eager to work in a creative engineering environment with international exposure and cross-functional collaboration.`,
  
  skills: [
    'Process Design & Development',
    'Process Flow Diagrams (PFDs)',
    'Piping & Instrumentation Diagrams (P&IDs)',
    'Equipment Sizing & Specification',
    'Process Integration',
    'GMP Compliance',
    'Commissioning, Qualification & Validation (CQV)',
    'Factory Acceptance Testing (FAT)',
    'Cross-functional Team Collaboration',
    'Project Management & Coordination',
    'Technical Documentation',
    'User Requirement Specifications (URS)',
    'Process Alternatives Evaluation',
    'Equipment Layout & Plot Plans'
  ],
  
  experience: [
    {
      title: 'Engineering Intern / Junior Engineer',
      company: 'Engineering Firm',
      period: '202X - Present',
      responsibilities: [
        'Assisted in developing process design packages for pharmaceutical equipment',
        'Created and updated Process Flow Diagrams (PFDs) and P&IDs',
        'Participated in equipment sizing and specification development',
        'Supported CQV protocol development and execution',
        'Collaborated with cross-functional teams on integrated process design',
        'Contributed to design basis development and process alternatives evaluation'
      ]
    }
  ],
  
  education: {
    degree: "Bachelor's Degree in Engineering",
    institution: 'Your University', // Update this
    year: 'Graduation Year', // Update this
    relevantCourses: [
      'Process Design & Control',
      'Chemical Engineering Principles',
      'Pharmaceutical Manufacturing',
      'Process Safety & Validation',
      'Instrumentation & Control Systems'
    ]
  },
  
  certifications: [
    'Engineering in Training (EIT) - If applicable',
    'GMP Training - If applicable'
  ],
  
  additionalInfo: [
    'Willing to travel internationally (up to 50%) for FATs and CQV activities',
    'Strong technical writing and communication skills',
    'Proficient in engineering software and design tools',
    'Detail-oriented with focus on GMP compliance',
    'Self-directed and able to work independently with minimal oversight'
  ]
};

// Helper function to wrap text
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

async function createCV() {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = currentPage.getSize();
  
  let yPosition = height - 50;
  const margin = 50;
  const sectionSpacing = 15;
  const minY = 50; // Minimum Y position before new page
  
  // Load fonts
  const helveticaFont = await pdfDoc.embedFont('Helvetica');
  const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
  
  // Helper function to add text with wrapping and page breaks
  function addText(text, x, y, size, font, color = rgb(0, 0, 0), maxWidth = width - 2 * margin) {
    const lines = wrapText(text, maxWidth, font, size);
    let currentY = y;
    
    for (const line of lines) {
      if (currentY < minY) {
        // Add new page
        currentPage = pdfDoc.addPage([612, 792]);
        currentY = height - 50;
      }
      currentPage.drawText(line, { x, y: currentY, size, font, color });
      currentY -= size + 2;
    }
    
    return currentY;
  }
  
  // Helper function to check and add new page if needed
  function checkPageBreak(requiredSpace) {
    if (yPosition - requiredSpace < minY) {
      currentPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }
  }
  
  // Header
  yPosition = addText(cvContent.name.toUpperCase(), margin, yPosition, 24, helveticaBoldFont, rgb(0, 0, 0.8));
  yPosition = addText(cvContent.title, margin, yPosition - 5, 14, helveticaFont, rgb(0.3, 0.3, 0.3));
  yPosition -= 10;
  
  // Contact Information
  yPosition = addText('CONTACT INFORMATION', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
  yPosition = addText(`Email: ${cvContent.contact.email}`, margin, yPosition - 5, 10, helveticaFont);
  yPosition = addText(`Phone: ${cvContent.contact.phone}`, margin, yPosition - 5, 10, helveticaFont);
  yPosition = addText(`Location: ${cvContent.contact.location}`, margin, yPosition - 5, 10, helveticaFont);
  yPosition -= sectionSpacing;
  
  // Professional Objective
  yPosition = addText('PROFESSIONAL OBJECTIVE', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
  yPosition = addText(cvContent.objective, margin, yPosition - 5, 10, helveticaFont, rgb(0, 0, 0), width - 2 * margin) - 5;
  yPosition -= sectionSpacing;
  
  // Education
  yPosition = addText('EDUCATION', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
  yPosition = addText(`${cvContent.education.degree}`, margin, yPosition - 5, 11, helveticaBoldFont);
  yPosition = addText(`${cvContent.education.institution}`, margin, yPosition - 5, 10, helveticaFont);
  yPosition = addText(`Expected Graduation: ${cvContent.education.year}`, margin, yPosition - 5, 10, helveticaFont, rgb(0.5, 0.5, 0.5));
  yPosition -= 5;
  yPosition = addText('Relevant Coursework:', margin, yPosition - 5, 10, helveticaFont);
  cvContent.education.relevantCourses.forEach(course => {
    yPosition = addText(`• ${course}`, margin + 10, yPosition - 4, 9, helveticaFont);
  });
  yPosition -= sectionSpacing;
  
  // Skills
  checkPageBreak(100);
  yPosition = addText('TECHNICAL SKILLS & COMPETENCIES', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
  const skillsPerLine = 2;
  const skillsWidth = (width - 2 * margin - 10) / skillsPerLine;
  let currentX = margin;
  let skillsY = yPosition - 5;
  
  cvContent.skills.forEach((skill, index) => {
    if (skillsY < minY) {
      currentPage = pdfDoc.addPage([612, 792]);
      skillsY = height - 50;
      currentX = margin;
    }
    if (index > 0 && index % skillsPerLine === 0) {
      currentX = margin;
      skillsY -= 15;
    }
    currentPage.drawText(`• ${skill}`, { x: currentX, y: skillsY, size: 9, font: helveticaFont });
    currentX += skillsWidth;
  });
  yPosition = skillsY - sectionSpacing;
  
  // Experience
  yPosition = addText('PROFESSIONAL EXPERIENCE', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
  cvContent.experience.forEach(exp => {
    yPosition = addText(`${exp.title}`, margin, yPosition - 5, 11, helveticaBoldFont);
    yPosition = addText(`${exp.company} | ${exp.period}`, margin, yPosition - 5, 10, helveticaFont, rgb(0.5, 0.5, 0.5));
    exp.responsibilities.forEach(resp => {
      yPosition = addText(`• ${resp}`, margin + 10, yPosition - 4, 9, helveticaFont, rgb(0, 0, 0), width - 2 * margin - 10) - 2;
    });
    yPosition -= 5;
  });
  yPosition -= sectionSpacing;
  
  // Additional Information
  if (yPosition > 100) {
    yPosition = addText('ADDITIONAL INFORMATION', margin, yPosition - sectionSpacing, 12, helveticaBoldFont, rgb(0, 0, 0.8));
    cvContent.additionalInfo.forEach(info => {
      yPosition = addText(`• ${info}`, margin + 10, yPosition - 4, 9, helveticaFont, rgb(0, 0, 0), width - 2 * margin - 10) - 2;
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function mergeWithTranscript(cvBytes, transcriptPath, outputPath) {
  try {
    if (!fs.existsSync(transcriptPath)) {
      throw new Error(`Transcript file not found: ${transcriptPath}`);
    }

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
async function main() {
  const args = process.argv.slice(2);
  const transcriptPath = args[0] || 'Akintunde transcript.pdf';
  const outputPath = args[1] || 'Akintunde_CV_and_Transcript.pdf';
  
  try {
    console.log('📝 Creating CV based on job description...');
    const cvBytes = await createCV();
    
    // Save CV separately first
    fs.writeFileSync('Akintunde_CV.pdf', cvBytes);
    console.log('✅ CV created: Akintunde_CV.pdf\n');
    
    console.log('🔄 Merging CV with transcript...');
    await mergeWithTranscript(cvBytes, transcriptPath, outputPath);
    
    console.log('\n🎉 Application package ready!');
    console.log(`📄 CV: Akintunde_CV.pdf`);
    console.log(`📄 Merged Document: ${outputPath}`);
    console.log('\n⚠️  Please review and update:');
    console.log('   - Contact information (email, phone)');
    console.log('   - Education details (university, graduation year)');
    console.log('   - Work experience');
    console.log('   - Any additional relevant information');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('not found')) {
      console.log('\n💡 Make sure the transcript file is in the current directory or provide the full path:');
      console.log(`   node create-cv-and-merge.js "C:/path/to/Akintunde transcript.pdf"`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createCV, mergeWithTranscript };

