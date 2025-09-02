const mongoose = require('mongoose');
const FileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  uploadDate: { type: Date, default: Date.now },
  sheetName: String,
  rows: { type: Array, default: [] },
  stats: { type: Object, default: {} }
});
module.exports = mongoose.model('File', FileSchema);