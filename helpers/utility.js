
const formidable = require('formidable');

// Utility: Parse form with Promisified Formidable

exports.parseForm = (req) => {
  const form = new formidable.IncomingForm({ multiples: true });
  form.keepExtensions = true;
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}