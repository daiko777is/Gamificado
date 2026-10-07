/* Repository — única capa que toca el archivo JSON (nuestra "BD" simple).
 * Patrón Repository de backend-patterns: el resto del código no sabe
 * que persistimos en disco. Mañana se cambia por Postgres sin tocar services. */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

function ensure() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], students: [] }, null, 2));
  }
}
function load() { ensure(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function save(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function collection(name) {
  return {
    all: () => load()[name],
    find: (fn) => load()[name].find(fn),
    insert: (row) => { const db = load(); db[name].push(row); save(db); return row; },
    update: (id, patch) => {
      const db = load();
      const i = db[name].findIndex((r) => String(r.id) === String(id));
      if (i === -1) return null;
      db[name][i] = Object.assign({}, db[name][i], patch);
      save(db); return db[name][i];
    },
    remove: (id) => {
      const db = load(); const before = db[name].length;
      db[name] = db[name].filter((r) => String(r.id) !== String(id));
      save(db); return db[name].length !== before;
    }
  };
}
module.exports = { users: () => collection('users'), students: () => collection('students') };
