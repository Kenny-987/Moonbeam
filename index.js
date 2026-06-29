require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/get-gallery', async (req, res) => {
  const response = await fetch('https://api.imagekit.io/v1/files', {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ':').toString('base64')
    }
  });
  const files = await response.json();
  res.json(files); // full objects, not just URLs
});

app.listen(3000);