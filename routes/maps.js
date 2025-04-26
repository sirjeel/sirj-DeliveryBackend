const express = require('express');
const router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");

// Endpoint to get autocomplete predictions
router.post("/autocomplete", async (req, res) => {
    try {
        const { input } = req.body;
        const client = new Client({});
        const response = await client.placeAutocomplete({
            params: {
                input,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
            timeout: 1000, // Optional: Set a timeout for the request
        });

        res.json({ predictions: response.data.predictions });
    } catch (error) {
        console.error("Error fetching autocomplete predictions:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get place details
router.post("/placedetails", async (req, res) => {
    try {
        const { place_id } = req.body;
        const client = new Client({});

        // Ensure the place_id is provided
        if (!place_id) {
            return res.status(400).json({ error: "Place ID is required" });
        }

        const response = await client.placeDetails({
            params: {
                place_id,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
            timeout: 1000, // Optional: Set a timeout for the request
        });

        res.json({ details: response.data.result });
    } catch (error) {
        console.error("Error fetching autocomplete predictions:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;