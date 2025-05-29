const fs = require('fs');
const formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const Oilproduct = require('../models/oilproduct');
// gothic-standard-456009-g8 /bucket name/ > ecommerceapp  
//.... this is mine ...id>> "sirjdelivery" storage.bucket('sirjbucket');
const projectId = "ecommerceweb-459909";
const storage = new Storage({ projectId });
const myBucket = storage.bucket('sirjbucketb');
const { parseForm } = require('../helpers/utility');

exports.create = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true }); // allow multiple files
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    const { name, description, price, sku, category } = fields;
    if (!name || !description || !price || !sku || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = new Oilproduct({
      name: Array.isArray(name) ? name[0] : name,
      description: Array.isArray(description) ? description[0] : description,
      price: Array.isArray(price) ? parseFloat(price[0]) : parseFloat(price),
      sku: Array.isArray(sku) ? sku[0] : sku,
      category: Array.isArray(category) ? category[0] : category,
      photos: [] // initialize empty array
    });

    const photoFiles = Array.isArray(files.photos) ? files.photos : [files.photos];

    const uploadPromises = photoFiles.map((photoFile) => {
      return new Promise((resolve, reject) => {
        if (!photoFile || !photoFile.filepath) {
          return reject(new Error('Invalid photo file'));
        }

        if (photoFile.size > 1000000) {
          return reject(new Error('Each image must be under 1MB'));
        }

        const destinationFileName = `products/${Date.now()}_${photoFile.originalFilename}`;
        const blob = myBucket.file(destinationFileName);
        const blobStream = blob.createWriteStream({
          contentType: photoFile.mimetype,
        });

        blobStream.on('error', (uploadErr) => {
          console.error('GCS upload error:', uploadErr.message);
          reject(uploadErr);
        });

        blobStream.on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${myBucket.name}/${destinationFileName}`;
          product.photos.push(publicUrl);
          resolve();
        });

        fs.createReadStream(photoFile.filepath).pipe(blobStream);
      });
    });

    try {
      await Promise.all(uploadPromises);
      await product.save();
        // ✅ Return only a success confirmation
      return res.status(200).json({ success: true, message: "Product added successfully." });
    } catch (error) {
      console.error('Upload or save error:', error.message);
      return res.status(500).json({ error: error.message || 'Something went wrong during upload.' });
    }
  });
};

exports.list = async (req, res) => {
    try {
        let order = req.query.order || 'asc';
        let sortBy = req.query.sortBy || '_id';        
        let limit = req.query.limit ? parseInt(req.query.limit) : 6;
        let skip = req.query.skip ? parseInt(req.query.skip) : 0;

        const totalResults = await Oilproduct.countDocuments(); // Total count
        const products = await Oilproduct.find()
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit);

        res.json({
            totalResults,
            products,
        });
    } catch (err) {
        res.status(400).json({
            error: 'Products not found',
        });
    }
};


// below is non nested put or update object func for nested one refer to route.js
exports.updateActive = async (req, res) => {
  try {
    const { productId, status } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required." });
    }

    if (typeof status !== "boolean") {
      return res.status(400).json({ error: "status must be a boolean." });
    }

    const updated = await Oilproduct.findByIdAndUpdate(
      productId,
      { active: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product active status updated successfully.",
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .json({ error: errorHandler(err) || "Internal Server Error" });
  }
};



// Controller: Update product
exports.update = async (req, res) => {
  const productId = req.query.productId;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  let product;
  try {
    product = await Oilproduct.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching product from DB' });
  }

  // Step 1: Delete old images from GCS
  try {
    const photos = Array.isArray(product.photos) ? product.photos : [];
    if (photos.length > 0) {
    const deletedImages = await deleteGCSFiles(photos);
    const allDeleted = deletedImages.every(item => item.status === 'success');
    if (!allDeleted) {
      return res.status(400).json({ error: 'Failed to delete all images from GCS' });
    }

    if (allDeleted) {
      product.photos = [];
    } else {
      // partially clean mongodb image files whom deletion were successful in cloud storage bucket
      deletedImages.forEach((item) => {
        if (item.status === "success") {
          const combineUrl = `https://storage.googleapis.com/${myBucket}/${item.filePath}`;
          const index = product.photos.findIndex(item => item === combineUrl);
          if (index === -1) return;
           product.photos.splice(index, 1);
        }
      })
    }
   }
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting old images from GCS' });
  }

  // Step 2: Parse form data
  let fields, files;
  try {
    ({ fields, files } = await parseForm(req));
  } catch (err) {
    return res.status(400).json({ error: 'Error parsing form data' });
  }

  const { name, description, price, sku, category } = fields;
  if (!name || !description || !price || !sku || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Step 3: Update product fields
  // Step 3: Update product fields
  product.name = Array.isArray(name) ? name[0] : name;
  product.description = Array.isArray(description) ? description[0] : description;
  product.price = Array.isArray(price) ? parseFloat(price[0]) : parseFloat(price);
  product.sku = Array.isArray(sku) ? sku[0] : sku;
  product.category = Array.isArray(category) ? category[0] : category;

  // Step 4: Upload new photos (if any)
   const photoFiles = Array.isArray(files.photos) ? files.photos : [files.photos];

  const uploadPromises = photoFiles.map((photoFile) => {
    return new Promise((resolve, reject) => {
      if (!photoFile || !photoFile.filepath) {
        return reject(new Error('Invalid photo file'));
      }

      if (photoFile.size > 1_000_000) {
        return reject(new Error('Each image must be under 1MB'));
      }

      const destinationFileName = `products/${Date.now()}_${photoFile.originalFilename}`;
      const blob = myBucket.file(destinationFileName);
      const blobStream = blob.createWriteStream({ contentType: photoFile.mimetype });

      blobStream.on('error', (uploadErr) => reject(uploadErr));

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${myBucket.name}/${destinationFileName}`;
        product.photos.push(publicUrl);
        resolve();
      });

      fs.createReadStream(photoFile.filepath).pipe(blobStream);
    });
  });
  try {
    await Promise.all(uploadPromises);
    await product.save();
    return res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Upload or save error:', error.message);
    return res.status(500).json({ error: error.message || 'Error during upload or DB save' });
  }
};


exports.remove = async (req, res) => {
    const productId = req.query.productId;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

    let product;
  try {
    product = await Oilproduct.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching product from DB' });
  }

   // Step 1: Delete old images from GCS
  try {
    const photos = Array.isArray(product.photos) ? product.photos : [];
    if (photos.length > 0) {
    const deletedImages = await deleteGCSFiles(photos);
    const allDeleted = deletedImages.every(item => item.status === 'success');
    if (!allDeleted) {
      return res.status(400).json({ error: 'Failed to delete all images from GCS' });
    }

    if (allDeleted) {
      product.photos = [];
    } 
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting old images from GCS' });
  }

  try {
    await product.deleteOne();
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ error: error.message || 'Error during delete file' });
  }
};

 

// Utility: Delete files from GCS
async function deleteGCSFiles(publicUrls) {
  const filePaths = publicUrls.map(url =>
    url.replace(`https://storage.googleapis.com/${myBucket.name}/`, '')
  );

  const deletePromises = filePaths.map(async (filePath) => {
    try {
      await myBucket.file(filePath).delete();
      console.log(`✅ Deleted: ${filePath}`);
      return { filePath, status: 'success' };
    } catch (err) {
      console.error(`❌ Failed to delete: ${filePath}`, err);
      return { filePath, status: 'error', error: err.message };
    }
  });

  return Promise.all(deletePromises);
}



exports.listBySearch = async (req, res) => {
  try {
    const encodedData = req.query.data;
    const decodedData = decodeURIComponent(encodedData);
    const searchQuery = JSON.parse(decodedData);

    let order = searchQuery.order || 'desc';
    let sortBy = searchQuery.sortBy || '_id';
    let limit = searchQuery.limit ? parseInt(searchQuery.limit) : 100;
    let skip = parseInt(searchQuery.skip || 0);

    let findArgs = {};

    for (let key in searchQuery.filters) {
      const filterValues = searchQuery.filters[key];

      if (Array.isArray(filterValues) && filterValues.length > 0) {
        if (key === 'price') {
          findArgs.price = {
            $gte: filterValues[0],
            $lte: filterValues[1],
          };
        } else {
          // This works for single string fields like `category`
          findArgs[key] = { $in: filterValues };
        }
      }
    }

    console.log("Query filters:", findArgs);

    const totalResults = await Oilproduct.countDocuments(findArgs);
    const products = await Oilproduct.find(findArgs)
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit);

    res.json({ totalResults, products });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

 


exports.listSearch = async (req, res) => {
    try {
        const encodedData = req.query.data;
        const decodedData = decodeURIComponent(encodedData);
        const searchData = JSON.parse(decodedData);
        const query = {};
        if (searchData.search) {
            query.name = { $regex: searchData.search, $options: 'i' };
            const products = await Oilproduct.find(query);
            return res.status(200).json({ success: true, results: products });
        }
    } catch (err) {
        console.error('search error:', error);
      return res.status(500).json({ error: error.message || 'Error during delete file' });
    }
};