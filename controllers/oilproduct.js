

const fs = require('fs');
const formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const Oilproduct = require('../models/oilproduct'); // adjust if needed
// gothic-standard-456009-g8  .... this is mine ... "sirjdelivery"
const projectId = "gothic-standard-456009-g8"; // Get this from Google Cloud

const storage = new Storage({
  projectId
});
// ecommerceapp ....sirjbucket  
const myBucket = storage.bucket('ecommerceapp');

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
  // nasty error of frontend data incoming always coming in [] format and could not be fixed so here below array is being removed
      const product = new Oilproduct({
      name: Array.isArray(name) ? name[0] : name,
      description: Array.isArray(description) ? description[0] : description,
      price: Array.isArray(price) ? parseFloat(price[0]) : parseFloat(price),
      quantity: Array.isArray(quantity) ? parseInt(quantity[0]) : parseInt(quantity),
    });
   console.log('Parsed files:', files);

  
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (photoFile && photoFile.filepath) {
    if (photoFile.size > 1_000_000) {
    return res.status(400).json({ error: 'Image should be less than 1MB in size' });
  }

  const destinationFileName = `products/${Date.now()}_${photoFile.originalFilename}`;
  const blob = myBucket.file(destinationFileName);

  const blobStream = blob.createWriteStream({
    contentType: photoFile.mimetype,
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
  fs.createReadStream(photoFile.filepath).pipe(blobStream);
    } else {
      return res.status(400).json({ error: 'Product photo is required' });
    }
  });
};


