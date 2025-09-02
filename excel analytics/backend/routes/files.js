const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const File = require('../models/File');
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
    const fileDoc = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      sheetName,
      rows
    });
    res.json({ fileId: fileDoc._id, rowsCount: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});
router.get('/', async (req, res) => {
  const files = await File.find().select('-rows').sort({ uploadDate: -1 });
  res.json(files);
});
router.get('/:id/rows', async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ error: 'Not found' });
  res.json({ rows: file.rows });
});
router.get('/:id/analytics', async (req, res) => {
  const { column, agg = 'sum', groupBy } = req.query;
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ error: 'Not found' });
  const rows = file.rows;
  if (!column) return res.status(400).json({ error: 'column query required' });
  const toNum = v => {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };
  if (groupBy) {
    const grouped = {};
    for (const r of rows) {
      const key = r[groupBy] ?? 'Undefined';
      grouped[key] = grouped[key] || { count: 0, sum: 0, values: [] };
      const val = toNum(r[column]);
      grouped[key].count += 1;
      grouped[key].sum += val;
      grouped[key].values.push(val);
    }
    const result = Object.entries(grouped).map(([k, v]) => {
      const avg = v.sum / v.count;
      return { group: k, count: v.count, sum: v.sum, avg: avg };
    });
    return res.json(result);
  } else {
    const nums = rows.map(r => toNum(r[column]));
    const sum = nums.reduce((a,b)=>a+b,0);
    const avg = nums.length ? sum / nums.length : 0;
    const count = nums.length;
    if (agg === 'sum') return res.json({ sum, count });
    if (agg === 'avg') return res.json({ avg, count });
    return res.json({ sum, avg, count });
  }
});
router.get('/:id/download', async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(__dirname, '..', 'uploads', file.filename);
  res.download(filePath, file.originalName);
});
module.exports = router;