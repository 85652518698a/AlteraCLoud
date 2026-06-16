import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Whitelist of admins for verification
const ADMIN_EMAILS = [
  "anujmhatre125@gmail.com",
  "nehapatil0045@gmail.com",
  "anujmhatre345@gmail.com",
  "mhatre.anuj0855.csmu.ac.in"
];

function isAdmin(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// In-Memory fallback database with disk persistence inside database.json
const DB_PATH = path.resolve(process.cwd(), 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure database and uploads directory exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  storage_path: string;
  section: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  is_deployed: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  action: 'upload' | 'delete' | 'rename' | 'deploy' | 'undeploy' | 'edit_meta';
  file_id: string | null;
  file_name: string;
  performed_by: string;
  details: any;
  created_at: string;
}

interface DatabaseSchema {
  files: FileRecord[];
  audit_logs: AuditLog[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database, resetting...', err);
  }
  return { files: [], audit_logs: [] };
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique name to prevent collisions but display clean original_name inside metadata
    const uniqueId = Math.random().toString(36).substring(2, 11);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${uniqueId}-${sanitizedOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB Limit
  }
});

// Express body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Endpoints ---

// Get Files (admins see everything; users see only deployed)
app.get('/api/files', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  const db = loadDatabase();
  
  if (isAdmin(userEmail)) {
    // Sort descending by created_at
    const sorted = [...db.files].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(sorted);
  } else {
    // Filter only deployed
    const deployed = db.files.filter(f => f.is_deployed);
    const sorted = [...deployed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(sorted);
  }
});

// Single File download or preview path
app.get('/api/files/download/:id', (req, res) => {
  const fileId = req.params.id;
  const db = loadDatabase();
  const record = db.files.find(f => f.id === fileId);

  if (!record) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = path.resolve(UPLOADS_DIR, record.storage_path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Physical file not found on server storage' });
  }

  // Set appropriate headers and stream
  res.setHeader('Content-Type', record.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(record.name)}"`);
  
  fs.createReadStream(filePath).pipe(res);
});

// Upload File (Admin Only)
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  const userName = req.headers['x-user-name'] as string || 'Admin';

  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const { section, is_deployed, custom_name } = req.body;
  if (!section) {
    return res.status(400).json({ error: 'Section selection is required' });
  }

  const isDeployedBool = is_deployed === 'true';
  const db = loadDatabase();

  const fileExt = req.file.originalname.split('.').pop()?.toLowerCase() || '';
  const finalName = custom_name ? `${custom_name}.${fileExt}` : req.file.originalname;

  const newRecord: FileRecord = {
    id: 'f_' + Math.random().toString(36).substring(2, 11),
    name: finalName,
    original_name: req.file.originalname,
    storage_path: req.file.filename,
    section: section,
    file_type: fileExt,
    mime_type: req.file.mimetype,
    size_bytes: req.file.size,
    is_deployed: isDeployedBool,
    uploaded_by: userEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.files.push(newRecord);

  // Write audit log
  const newAudit: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    action: 'upload',
    file_id: newRecord.id,
    file_name: newRecord.name,
    performed_by: userEmail,
    details: {
      section: newRecord.section,
      size_bytes: newRecord.size_bytes,
      is_deployed: newRecord.is_deployed,
      admin_name: userName
    },
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(newAudit);

  saveDatabase(db);
  res.status(201).json(newRecord);
});

// Rename File (Admin Only)
app.post('/api/files/rename', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  
  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const { id, newName } = req.body;
  if (!id || !newName) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const db = loadDatabase();
  const fileIndex = db.files.findIndex(f => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const oldName = db.files[fileIndex].name;
  db.files[fileIndex].name = newName;
  db.files[fileIndex].updated_at = new Date().toISOString();

  // Audit
  const newAudit: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    action: 'rename',
    file_id: id,
    file_name: newName,
    performed_by: userEmail,
    details: { old_name: oldName, new_name: newName },
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(newAudit);

  saveDatabase(db);
  res.json(db.files[fileIndex]);
});

// Change Meta (Admin Only)
app.post('/api/files/edit-meta', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  
  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const { id, section, is_deployed } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing file id' });
  }

  const db = loadDatabase();
  const fileIndex = db.files.findIndex(f => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const oldRecord = { ...db.files[fileIndex] };

  if (section) db.files[fileIndex].section = section;
  if (typeof is_deployed === 'boolean') db.files[fileIndex].is_deployed = is_deployed;
  db.files[fileIndex].updated_at = new Date().toISOString();

  // Audit
  const newAudit: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    action: 'edit_meta',
    file_id: id,
    file_name: db.files[fileIndex].name,
    performed_by: userEmail,
    details: {
      old_section: oldRecord.section,
      new_section: db.files[fileIndex].section,
      old_deployed: oldRecord.is_deployed,
      new_deployed: db.files[fileIndex].is_deployed
    },
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(newAudit);

  saveDatabase(db);
  res.json(db.files[fileIndex]);
});

// Toggle Deploy (Admin Only)
app.post('/api/files/toggle-deploy', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  
  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing file id' });
  }

  const db = loadDatabase();
  const fileIndex = db.files.findIndex(f => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const nowDeployed = !db.files[fileIndex].is_deployed;
  db.files[fileIndex].is_deployed = nowDeployed;
  db.files[fileIndex].updated_at = new Date().toISOString();

  // Audit
  const newAudit: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    action: nowDeployed ? 'deploy' : 'undeploy',
    file_id: id,
    file_name: db.files[fileIndex].name,
    performed_by: userEmail,
    details: { is_deployed: nowDeployed },
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(newAudit);

  saveDatabase(db);
  res.json(db.files[fileIndex]);
});

// Delete File (Admin Only)
app.post('/api/files/delete', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
  
  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing file id' });
  }

  const db = loadDatabase();
  const fileIndex = db.files.findIndex(f => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const record = db.files[fileIndex];
  const filePath = path.resolve(UPLOADS_DIR, record.storage_path);

  // Physically delete the file if it exists on disk
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting physical file', err);
  }

  // Remove from database list
  db.files.splice(fileIndex, 1);

  // Audit
  const newAudit: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 11),
    action: 'delete',
    file_id: null,
    file_name: record.name,
    performed_by: userEmail,
    details: { section: record.section, size_bytes: record.size_bytes },
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(newAudit);

  saveDatabase(db);
  res.json({ success: true, message: 'File deleted successfully' });
});

// Get Audit Logs (Admin Only)
app.get('/api/audit-logs', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();

  if (!isAdmin(userEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const db = loadDatabase();
  // Sort descending by created_at
  const sorted = [...db.audit_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(sorted);
});

// --- Vite Service / Static File Serving Setup ---

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  
  // Use Vite middlewares
  app.use(vite.middlewares);

  // Render entry page
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Serve production built files
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ALTERA CLOUD SERVER] Running on port ${PORT}`);
});
