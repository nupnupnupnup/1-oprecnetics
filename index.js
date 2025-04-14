const express = require('express');
const os = require('os');

const app = express();
const port = 3000;

const startTime = Date.now();

app.get('/health', (req, res) => {
  const currentTime = new Date();
  const uptime = process.uptime(); 

  res.json({
    nama: "M. Rifqy",
    nrp: "5025231106",
    status: "UP",
    timestamp: currentTime.toISOString(),
    uptime: `${Math.floor(uptime)} seconds`
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

