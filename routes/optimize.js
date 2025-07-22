const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const {RouteOptimizationClient} = require('@googlemaps/routeoptimization').v1;
const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
const { cleanText, extractText } = require('./helper');



const routeoptimizationClient = new RouteOptimizationClient();
const client = new DocumentProcessorServiceClient({
    apiEndpoint: "eu-documentai.googleapis.com", // Change default US endpoint to EU
  });


// Google Endpoint to get optimized routes

router.post("/get-optimized-routes", async (req, res) => {
  try {
      const { model } = req.body;

      // Ensure the model is provided
      if (!model) {
          return res.status(400).json({ error: "Model data is required" });
      }

      // Request to Google Optimize Tours API
      const request = {
          parent: "projects/gothic-standard-456009-g8",
          model
      };
      const response = await routeoptimizationClient.optimizeTours(request);
      res.json({  response });
  } catch (error) {
      console.error("Error fetching optimized routes:", error);
      res.status(500).json({ error: error.message });
  }
});



router.post("/get-ocr", async (req, res) => {
  try {
    // Initialize Formidable
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFileSize = 1 * 1024 * 1024; // 1MB max

    // Parse Form Data
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: "Error parsing the file" });
      if (!files.photo) return res.status(400).json({ error: "No photo provided" });

      // Read File
      const filePath = files.photo.filepath;
      const fileMimeType = files.photo.mimetype;
      if (!filePath || !fileMimeType) return res.status(400).json({ error: "Invalid file" });

      const fileBuffer = fs.readFileSync(filePath);

      // Prepare request for Google Document AI
      const request = {
        name: "projects/327107076850/locations/eu/processors/2b1b8467bc557288",
        skipHumanReview: true,
        rawDocument: {
          content: fileBuffer,
          mimeType: fileMimeType,
        },
      };

      // Process document
      const [result] = await client.processDocument(request);
      const { document } = result;
      const { text } = document;

      if (!document.pages || document.pages.length === 0) {
        return res.json({ response: "No text extracted" });
      }
      // extract the text we need inside the google processed ocr image
      const resextractText = extractText(document, text);
      // further refine the extracted text above
      let rescleanText = "";
      if (resextractText?.length > 0 ) {
        rescleanText = cleanText(resextractText);
      }

      res.json({ response: rescleanText });
    });
  } catch (error) {
    console.error("Error fetching OCR text:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;


