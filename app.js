// feedbackfusion/app.js
// Express with Node.js for full stack form handling using external HTML and saving to submission.json

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

const dataPath = path.join(__dirname, 'public', 'frontend', 'submission.json');
const submissions = [];

// Load existing data if available
if (fs.existsSync(dataPath)) {
  const fileData = fs.readFileSync(dataPath);
  submissions.push(...JSON.parse(fileData));
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Serve the static HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, college, role, tech, summary, rating } = req.body;

  // Server-side validation
  if (!name || !college || !role || !tech || !summary || !rating) {
    return res.send('<h2 style="color:red; text-align:center">All fields are required! <a href="/">Go back</a></h2>');
  }

  if (summary.length > 300) {
    return res.send('<h2 style="color:red; text-align:center">Summary too long! <a href="/">Go back</a></h2>');
  }

  const submission = {
    name,
    college,
    role,
    tech: Array.isArray(tech) ? tech : [tech],
    summary,
    rating
  };

  submissions.push(submission);
  fs.writeFileSync(dataPath, JSON.stringify(submissions, null, 2));

  res.send('<h2 style="color:green; text-align:center">Submission Successful! <a href="/">Submit another</a></h2>');
});

// Optional route to see all submissions
app.get('/submissions', (req, res) => {
 const filePath = path.join(__dirname, 'public', 'frontend', 'submission.json');
  let fileData = [];

  try {
    // Read the latest file contents each time this route is hit
    const rawData = fs.readFileSync(filePath, 'utf8');
    fileData = JSON.parse(rawData);
  } catch (err) {
    console.error("Error reading or parsing submission.json:", err);
    return res.send('<h2>Error reading submissions. Try again later.</h2>');
  }

  let html = '<h1 style="text-align:center">All Submissions</h1>';
  fileData.forEach((s, i) => {
    html += `<div style="margin: 1rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px">
      <strong>${i + 1}. ${s.name}</strong> from <em>${s.college}</em> did a <b>${s.role}</b> internship.<br>
      Tech: ${s.tech.join(', ')}<br>
      Summary: ${s.summary}<br>
      Rating: ${s.rating}/5
    </div>`;
  });

  res.send(html);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
