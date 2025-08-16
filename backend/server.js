require('dotenv').config({ path: '../.env' });
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { HfInference } = require('@huggingface/inference');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ dest: 'uploads/' });
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/generate-summary', upload.single('transcript'), async (req, res) => {
  try {
    const transcriptPath = req.file.path;
    const transcript = fs.readFileSync(transcriptPath, 'utf-8').trim();
    const prompt = req.body.prompt || 'Summarize the key points.';
    if (!transcript) {
      return res.json({ summary: 'No content to summarize' });
    }
    const summary = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: `${transcript}\n\n${prompt}`,
      parameters: { max_length: 100, min_length: 30 },
    });
    fs.unlinkSync(transcriptPath);
    res.json({ summary: summary.summary_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const { summary, recipients } = req.body;
    if (!summary || !recipients) {
      return res.status(400).json({ error: 'Summary and recipients are required' });
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
    });
    await transporter.sendMail({
      from: 'pilla.jagadeeswar123@gmail.com', // Ensure this is SendGrid-verified
      to: recipients.split(',').map(email => email.trim()),
      subject: 'Meeting Summary',
      text: summary
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));