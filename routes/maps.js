const express = require('express');
const router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");

// Endpoint to get autocomplete predictions
router.post("/maps/autocomplete", async (req, res) => {
    try {
        const { input, location, radius, components } = req.body;
        const client = new Client({});

        const response = await client.placeAutocomplete({
            params: {
                input,
                key: process.env.GOOGLE_MAPS_API_KEY,
                location,
                radius,
                components,
            },
            timeout: 1000,
        });

        const minimalPredictions = response.data.predictions.map(p => ({
            place_id: p.place_id,
            description: p.description
        }));

        res.json({ predictions: minimalPredictions });
    } catch (error) {
        console.error("Error fetching autocomplete predictions:", error);
        res.status(500).json({ error: error.message });
    }
});



// Endpoint to get place details
router.post("/maps/placedetails", async (req, res) => {
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