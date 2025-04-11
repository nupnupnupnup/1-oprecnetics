const express = require('express');
const os = require('os');

const app = express();
const port = 3000;

const startTime = Date.now();

app.get('/healthybanget', (req, res) => {
  const currentTime = new Date();
  const uptime = process.uptime(); // in seconds

  res.json({
    nama: "rifqy",
    nrp: "5025231999",
    status: "UP",
    timestamp: currentTime.toISOString(),
    uptime: `${Math.floor(uptime)} seconds`
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

