const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'time_log.txt');
const INTERVAL_MS = 5 * 60 * 1000;

function logTime() {
    const now = new Date();
    const logEntry = `[${now.toLocaleString()}] - Le tracker est actif.\n`;
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Erreur', err);
        }
    });
}

logTime();
setInterval(logTime, INTERVAL_MS);
