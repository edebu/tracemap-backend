const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
const PORT = 5000;

app.get("/api/traceroute", (req, res) => {
    const target = req.query.target;
    if (!target) return res.status(400).send("Target is required");

    exec(`traceroute ${target}`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: stderr });
        }

        const lines = stdout.split("\n").slice(1); // skip header
        const hops = lines.map(line => {
            const match = line.match(/^\s*(\d+)\s+([^\s]+)\s+\(([\d.]+)\)\s+([\d.]+) ms/);
            if (match) {
                return {
                    hop: Number(match[1]),
                    host: match[2],
                    ip: match[3],
                    time: Number(match[4])
                };
            }
            return null;
        }).filter(Boolean);

        res.json(hops);
    });
});

app.get("/", (req, res) => {
    res.send("Welcome to the Tracemap API!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
