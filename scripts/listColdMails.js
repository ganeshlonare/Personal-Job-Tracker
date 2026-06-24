const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function readEnv(envPath) {
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const env = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
    return env;
  } catch (e) {
    return {};
  }
}

(async () => {
  const repoRoot = path.resolve(__dirname, '..');
  const env = readEnv(path.join(repoRoot, '.env.local'));
  const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/jobos';

  console.log('Using MONGODB_URI=', MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI, { connectTimeoutMS: 10000 });
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const colName = 'coldmails';
    const col = db.collection(colName);
    const docs = await col.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    console.log(`Found ${docs.length} documents in '${colName}':`);
    for (const d of docs) {
      console.log(JSON.stringify(d, null, 2));
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting or querying MongoDB:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
