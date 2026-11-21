import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { login, requireAuth } from './auth.js';
import { getConfig, saveConfig, getUploadsDir, initStore } from './store.js';
import { LAYOUTS, defaultConfig } from './defaultConfig.js';

initStore();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(getUploadsDir()));

function makeUploader(prefix) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, getUploadsDir()),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${prefix}-${uuidv4()}${ext}`);
      },
    }),
    limits: { fileSize: 12 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images allowed'));
      }
      return cb(null, true);
    },
  });
}

const uploadBackground = makeUploader('bg');
const uploadLogo = makeUploader('logo');

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mustang-api' });
});

app.get('/api/layouts', (_req, res) => {
  res.json({ layouts: LAYOUTS });
});

app.get('/api/config', (_req, res) => {
  res.json(getConfig());
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  const result = login(password);
  if (!result) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  return res.json(result);
});

app.put('/api/config', requireAuth, (req, res) => {
  const body = req.body || {};
  const current = getConfig();

  const fuels = Array.isArray(body.fuels)
    ? body.fuels.map((f, i) => ({
        id: String(f.id || `fuel-${i}`),
        name: String(f.name ?? '').slice(0, 32),
        price: String(f.price ?? '').slice(0, 16),
        unit: String(f.unit ?? 'руб').slice(0, 16),
        icon: f.icon === 'flame' ? 'flame' : 'pump',
      }))
    : current.fuels;

  const layoutIds = LAYOUTS.map((l) => l.id);
  const layout = layoutIds.includes(body.layout) ? body.layout : current.layout;

  const next = {
    ...current,
    title: body.title != null ? String(body.title).slice(0, 80) : current.title,
    brand: body.brand != null ? String(body.brand).slice(0, 40) : current.brand,
    layout,
    backgroundUrl:
      body.backgroundUrl !== undefined
        ? String(body.backgroundUrl || '')
        : current.backgroundUrl,
    logoUrl:
      body.logoUrl !== undefined ? String(body.logoUrl || '') : current.logoUrl || '',
    fuels,
  };

  res.json(saveConfig(next));
});

app.post('/api/upload/background', requireAuth, uploadBackground.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  const backgroundUrl = `/uploads/${req.file.filename}`;
  const current = getConfig();
  const saved = saveConfig({ ...current, backgroundUrl });
  return res.json(saved);
});

app.post('/api/upload/logo', requireAuth, uploadLogo.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  const logoUrl = `/uploads/${req.file.filename}`;
  const current = getConfig();
  const saved = saveConfig({ ...current, logoUrl });
  return res.json(saved);
});

app.post('/api/config/reset', requireAuth, (_req, res) => {
  const reset = {
    ...defaultConfig,
    updatedAt: new Date().toISOString(),
  };
  res.json(saveConfig(reset));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mustang API on :${PORT}`);
});
