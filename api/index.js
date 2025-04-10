const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const axios = require("axios"); // Add axios for HTTP requests
const { isIPv4 } = require("is-ip")

const app = express();
app.get("/api/traceroute", async (req, res) => {
    const target = req.query.target;
    if (!target) return res.status(400).send("Target is required");

    try {
        const response = await axios.post(
            process.env.API_URL, 
            { url: target },
            {
                headers: {
                    "x-api-key": process.env.API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        // Parse the response to extract IP addresses
        const parsedData = response.data.data.map(item => {
            const host = item.host;
            let ip = host;

            // Check if host contains parentheses
            const match = host.match(/\((\d{1,3}(?:\.\d{1,3}){3})\)/);
            if (match) {
                ip = match[1]; // Extract IP from parentheses
            }

            // Validate IP address
            if (!isIPv4(ip)) {
                return null; // Return null for invalid IPs
            }

            return { 
                hop: Number(item.hop),
                host, 
                ip,
                time: Number(item.avg) 
            };
        }).filter(item => item !== null); // Filter out null values

        res.json(parsedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("Welcome to the Tracemap API!");
});

module.exports = app;