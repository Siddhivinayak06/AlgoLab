const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');

const app = express();

// pkg snapshot directory resolution
const outDir = path.join(__dirname, 'out');
app.use(express.static(outDir));

app.get('*', (req, res) => {
    res.sendFile(path.join(outDir, 'index.html'));
});

// Function to find an open port
const findOpenPort = (startPort) => {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findOpenPort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
};

const openBrowser = (url) => {
    const platform = process.platform;
    let command;
    if (platform === 'win32') {
        command = `start "" "${url}"`;
    } else if (platform === 'darwin') {
        command = `open "${url}"`;
    } else {
        command = `xdg-open "${url}"`;
    }
    exec(command);
};

console.log("========================================");
console.log("Starting AlgoLab Interactive Server...");
console.log("Please wait, your browser will open shortly.");
console.log("Keep this window open while using AlgoLab.");
console.log("========================================");

findOpenPort(8080).then(port => {
    app.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(`Server is running at ${url}`);
        openBrowser(url);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
    // Keep window open for error reading
    setInterval(() => {}, 1000 * 60 * 60);
});
