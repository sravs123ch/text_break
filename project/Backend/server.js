const express = require('express');
const multer = require('multer');
const { libre } = require('libreoffice-convert');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// Endpoint to handle file upload and conversion
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Validate file type
    if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Please upload a .doc or .docx file.' });
    }

    // Convert to HTML using libreoffice-convert
    const inputBuffer = await fs.readFile(filePath);
    const outputPath = path.join('uploads', `${req.file.filename}.html`);

    libre.convert(inputBuffer, '.html', undefined, async (err, htmlBuffer) => {
      if (err) {
        await fs.unlink(filePath);
        return res.status(500).json({ error: 'Failed to convert file to HTML.' });
      }

      // Save HTML temporarily to file
      await fs.writeFile(outputPath, htmlBuffer);
      const htmlContent = await fs.readFile(outputPath, 'utf-8');

      // Clean up temporary files
      await fs.unlink(filePath);
      await fs.unlink(outputPath);

      // Send HTML to frontend
      res.json({ html: htmlContent });
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Server error during file processing.' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));