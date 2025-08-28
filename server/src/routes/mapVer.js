const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const mapRouter = express.Router();


// 读取地图
mapRouter.get('/:mapId', (req, res) => {
  const file = path.join(__dirname, '../maps', `${req.params.mapId}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ message: 'Map not found' });
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  res.json(json);
});

// 模拟保存进度（内存版；上线改成 DB）
const progress = new Map(); // key: userId(or session), val: { mapId, position }
mapRouter.post('/progress', (req, res) => {
  const { userId = 'demo', mapId, position } = req.body;
  progress.set(userId, { mapId, position, updatedAt: Date.now() });
  res.json({ ok: true });
});

mapRouter.get('/progress', (req, res) => {
  const { userId = 'demo' } = req.query;
  res.json(progress.get(userId) || null);
});

module.exports = mapRouter;