/*

const fs = require('fs');
const formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const Oilproduct = require('../models/oilproduct'); // adjust if needed

const storage = new Storage();
const myBucket = storage.bucket('sirjbucket');

exports.create = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: false });
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    const { name, description, price, quantity } = fields;
    if (!name || !description || !price || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = new Oilproduct({
      name,
      description,
      price,
      quantity,
    });

    // Handle photo upload to GCS
    if (files.photo && files.photo.filepath) {
      if (files.photo.size > 1_000_000) {
        return res.status(400).json({ error: 'Image should be less than 1MB in size' });
      }

      const destinationFileName = `products/${Date.now()}_${files.photo.originalFilename}`;
      const blob = myBucket.file(destinationFileName);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: files.photo.mimetype,
        public: true,
      });

      blobStream.on('error', (uploadErr) => {
        console.error('GCS upload error:', uploadErr.message);
        return res.status(500).json({ error: 'Upload failed. Please try again.' });
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${myBucket.name}/${destinationFileName}`;
        product.photo = publicUrl;

        try {
          await product.save();
          return res.json(product);
        } catch (saveErr) {
          console.error('MongoDB save error:', saveErr.message);
          return res.status(400).json({ error: 'Product could not be saved' });
        }
      });

      // Pipe file to GCS
      fs.createReadStream(files.photo.filepath).pipe(blobStream);
    } else {
      return res.status(400).json({ error: 'Product photo is required' });
    }
  });
};


*/