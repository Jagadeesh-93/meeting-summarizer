const uploadForm = document.getElementById('uploadForm');
const summarySection = document.getElementById('summarySection');
const summaryTextarea = document.getElementById('summary');
const shareBtn = document.getElementById('shareBtn');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('transcript', document.getElementById('transcript').files[0]);
  formData.append('prompt', document.getElementById('prompt').value);

  try {
    const response = await fetch('https://meeting-summarizer-8kjq.onrender.com/generate-summary', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.summary) {
      summaryTextarea.value = data.summary;
      summarySection.style.display = 'block';
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
});

shareBtn.addEventListener('click', async () => {
  const summary = summaryTextarea.value;
  const recipients = document.getElementById('recipients').value;

  try {
    const response = await fetch('https://meeting-summarizer-8kjq.onrender.com/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, recipients })
    });
    const data = await response.json();
    if (data.success) {
      alert('Email sent successfully!');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
});