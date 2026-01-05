# Job Application - CV Creation & Merge Guide

## Position: Jr. Process Designer / Engineer

This guide will help you create a tailored CV and merge it with your transcript.

## Quick Start

### Step 1: Install Required Package
```bash
npm install pdf-lib
```

### Step 2: Place Your Transcript
Make sure your transcript file is named **"Akintunde transcript.pdf"** and is in the project root directory.

Or place it anywhere and provide the full path when running the script.

### Step 3: Run the Script
```bash
node create-cv-and-merge.js
```

Or with custom paths:
```bash
node create-cv-and-merge.js "C:/Users/aktak/Downloads/Akintunde transcript.pdf" "output.pdf"
```

### Step 4: Review and Customize
The script will create:
- `Akintunde_CV.pdf` - Your CV (review and update)
- `Akintunde_CV_and_Transcript.pdf` - Merged document ready for submission

## What to Update in the CV

After the CV is created, you'll need to update:

1. **Contact Information:**
   - Email address
   - Phone number
   - Location (if different)

2. **Education:**
   - University name
   - Graduation year
   - Relevant coursework (add/remove as needed)

3. **Experience:**
   - Add your actual work experience
   - Internships, co-ops, or projects
   - Tailor responsibilities to match job requirements

4. **Skills:**
   - Add any additional technical skills
   - Software proficiency (AutoCAD, Aspen Plus, etc.)
   - Any certifications

5. **Additional Information:**
   - Professional memberships
   - Publications
   - Awards or honors

## Job Requirements Summary

The CV is tailored to match these key requirements:

### Key Responsibilities:
- Design Basis Development
- Process Alternatives Evaluations
- User Requirement Specifications (URS)
- Process Flow Diagrams (PFDs)
- Process Piping and Instrumentation Diagrams (P&IDs)
- Process Integration of Unit Operations
- Equipment Plot Plans and Layout Drawings
- Equipment Sizing and Specification
- Commissioning & Qualification Protocol Development and Execution

### Required Skills:
- Strong interpersonal skills
- Team collaboration
- Cross-functional project coordination
- Ability to prioritize multiple tasks
- Self-directed and resourceful
- Excellent written and verbal communication
- Fast-paced multi-tasking environment

### Education:
- Bachelor's degree in engineering

### Location:
- Primary: Oakville, ON office
- Travel: Up to 50% for FATs and CQV activities

## Tips for Customization

1. **Highlight Relevant Experience:**
   - Any process design work
   - Pharmaceutical or biotech experience
   - GMP compliance knowledge
   - Validation or qualification experience

2. **Emphasize Technical Skills:**
   - Process design software
   - CAD tools
   - Simulation software
   - Documentation tools

3. **Show Willingness to Travel:**
   - Mention any international experience
   - Highlight flexibility

4. **Demonstrate Teamwork:**
   - Group projects
   - Collaborative work experience
   - Cross-functional involvement

## Manual Editing Option

If you prefer to edit the CV manually:

1. The script creates `Akintunde_CV.pdf`
2. You can use a PDF editor to update information
3. Then use the merge script separately:
   ```bash
   node merge-pdfs.js "Akintunde_CV.pdf" "Akintunde transcript.pdf" "final.pdf"
   ```

## Troubleshooting

### Error: "pdf-lib is not installed"
```bash
npm install pdf-lib
```

### Error: "Transcript file not found"
- Check the file name matches exactly: "Akintunde transcript.pdf"
- Or provide the full path: `"C:/path/to/Akintunde transcript.pdf"`

### CV looks incomplete
- The CV is a template - you need to add your actual experience
- Edit the `cvContent` object in `create-cv-and-merge.js` to customize

## Final Checklist

Before submitting:
- [ ] CV updated with your actual information
- [ ] Contact details are correct
- [ ] Education details match your transcript
- [ ] Experience is relevant and detailed
- [ ] Skills match job requirements
- [ ] Transcript is included and merged correctly
- [ ] PDF opens correctly and all pages are visible
- [ ] File size is reasonable (< 5MB recommended)

Good luck with your application! 🎉

