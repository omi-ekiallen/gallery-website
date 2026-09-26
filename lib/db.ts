import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { User, Project, MediaItem, Order, GallerySession } from './types';
import { slugify, uniqueSlug, RESERVED_HANDLES } from './slug';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'gallery.db');
  const db = new DatabaseSync(dbPath);

  // Enable foreign keys and WAL mode for better concurrency
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      business_name TEXT,
      handle TEXT UNIQUE,
      tier TEXT NOT NULL DEFAULT 'free',
      storage_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      cover_media_id TEXT,
      passcode TEXT,
      price_ngn INTEGER NOT NULL DEFAULT 0,
      is_paywall_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_name TEXT NOT NULL,
      amount_ngn INTEGER NOT NULL,
      paystack_reference TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      unlocked_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_sessions (
      token TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      client_email TEXT,
      passcode_verified INTEGER NOT NULL DEFAULT 0,
      unlocked_downloads INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL
    );
  `);

  migrate(db);

  dbInstance = db;
  return db;
}

/**
 * Schema changes applied to databases created by earlier versions. Each step is
 * written so that running it twice is harmless.
 */
function migrate(db: DatabaseSync) {
  const userColumns = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  if (!userColumns.some((c) => c.name === 'handle')) {
    db.exec('ALTER TABLE users ADD COLUMN handle TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle ON users(handle)');
  }

  // Accounts created before handles existed get one from their studio name.
  const unhandled = db
    .prepare('SELECT id, name, business_name FROM users WHERE handle IS NULL OR handle = ?')
    .all('') as { id: string; name: string; business_name: string }[];

  for (const row of unhandled) {
    const taken = (candidate: string) =>
      RESERVED_HANDLES.has(candidate) ||
      !!db.prepare('SELECT id FROM users WHERE LOWER(handle) = LOWER(?)').get(candidate);

    const handle = uniqueSlug(slugify(row.business_name || row.name) || 'studio', taken);
    db.prepare('UPDATE users SET handle = ? WHERE id = ?').run(handle, row.id);
  }

  // Gallery slugs used to be unique across the whole platform. Now that a link
  // reads /<studio>/gallery/<slug>, they only need to be unique per studio.
  const projectsSql = (
    db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'").get() as
      | { sql: string }
      | undefined
  )?.sql;

  if (projectsSql && projectsSql.includes('slug TEXT UNIQUE NOT NULL')) {
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec(`
      CREATE TABLE projects_migrated (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        cover_media_id TEXT,
        passcode TEXT,
        price_ngn INTEGER NOT NULL DEFAULT 0,
        is_paywall_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO projects_migrated SELECT id, user_id, title, slug, description, cover_media_id, passcode, price_ngn, is_paywall_active, created_at FROM projects;
      DROP TABLE projects;
      ALTER TABLE projects_migrated RENAME TO projects;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_user_slug ON projects(user_id, slug);
    `);
    db.exec('PRAGMA foreign_keys = ON;');
  } else {
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_user_slug ON projects(user_id, slug)');
  }
}

// User repository helpers
export const userRepo = {
  findById(id: string): User | undefined {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row as User | undefined;
  },

  findByEmail(email: string): User | undefined {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    return row as User | undefined;
  },

  findByHandle(handle: string): User | undefined {
    const db = getDb();
    return db
      .prepare('SELECT * FROM users WHERE LOWER(handle) = LOWER(?)')
      .get(handle) as User | undefined;
  },

  handleTaken(handle: string, exceptUserId?: string): boolean {
    const db = getDb();
    const row = db
      .prepare('SELECT id FROM users WHERE LOWER(handle) = LOWER(?)')
      .get(handle) as { id: string } | undefined;
    return !!row && row.id !== exceptUserId;
  },

  updateHandle(userId: string, handle: string) {
    const db = getDb();
    db.prepare('UPDATE users SET handle = ? WHERE id = ?').run(handle, userId);
  },

  create(user: Omit<User, 'storage_used' | 'created_at'>): User {
    const db = getDb();
    const now = new Date().toISOString();
    const fullUser: User = {
      ...user,
      storage_used: 0,
      created_at: now,
    };
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, business_name, handle, tier, storage_used, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fullUser.id,
      fullUser.email,
      fullUser.password_hash,
      fullUser.name,
      fullUser.business_name || '',
      fullUser.handle,
      fullUser.tier,
      fullUser.storage_used,
      fullUser.created_at
    );
    return fullUser;
  },

  updateTier(userId: string, tier: string) {
    const db = getDb();
    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, userId);
  },

  updateStorage(userId: string, storageUsed: number) {
    const db = getDb();
    db.prepare('UPDATE users SET storage_used = ? WHERE id = ?').run(storageUsed, userId);
  },

  recalculateStorage(userId: string): number {
    const db = getDb();
    const result = db.prepare(`
      SELECT COALESCE(SUM(m.size_bytes), 0) as total
      FROM media m
      JOIN projects p ON m.project_id = p.id
      WHERE p.user_id = ?
    `).get(userId) as { total: number };

    const total = Number(result?.total || 0);
    this.updateStorage(userId, total);
    return total;
  },
};

// Project repository helpers
export const projectRepo = {
  findById(id: string): Project | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  },

  /** Resolves a public gallery link: /<studio handle>/gallery/<slug>. */
  findByHandleAndSlug(handle: string, slug: string): Project | undefined {
    const db = getDb();
    return db
      .prepare(
        `SELECT p.* FROM projects p
         JOIN users u ON u.id = p.user_id
         WHERE LOWER(u.handle) = LOWER(?) AND LOWER(p.slug) = LOWER(?)`
      )
      .get(handle, slug) as Project | undefined;
  },

  slugTaken(userId: string, slug: string, exceptProjectId?: string): boolean {
    const db = getDb();
    const row = db
      .prepare('SELECT id FROM projects WHERE user_id = ? AND LOWER(slug) = LOWER(?)')
      .get(userId, slug) as { id: string } | undefined;
    return !!row && row.id !== exceptProjectId;
  },

  listByUserId(userId: string): (Project & { media_count: number; total_size: number; cover_filename: string | null })[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT p.*,
        COUNT(m.id) as media_count,
        COALESCE(SUM(m.size_bytes), 0) as total_size,
        COALESCE(
          (SELECT filename FROM media WHERE id = p.cover_media_id),
          (SELECT filename FROM media WHERE project_id = p.id AND mime_type LIKE 'image/%' ORDER BY sort_order, created_at LIMIT 1)
        ) as cover_filename
      FROM projects p
      LEFT JOIN media m ON p.id = m.project_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all(userId);
    return rows as unknown as (Project & { media_count: number; total_size: number; cover_filename: string | null })[];
  },

  create(project: Omit<Project, 'created_at'>): Project {
    const db = getDb();
    const now = new Date().toISOString();
    const fullProject: Project = { ...project, created_at: now };
    db.prepare(`
      INSERT INTO projects (id, user_id, title, slug, description, cover_media_id, passcode, price_ngn, is_paywall_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fullProject.id,
      fullProject.user_id,
      fullProject.title,
      fullProject.slug,
      fullProject.description || '',
      fullProject.cover_media_id,
      fullProject.passcode,
      fullProject.price_ngn,
      fullProject.is_paywall_active,
      fullProject.created_at
    );
    return fullProject;
  },

  update(id: string, updates: Partial<Project>) {
    const db = getDb();
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  },

  delete(id: string) {
    const db = getDb();
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  },
};

// Media repository helpers
export const mediaRepo = {
  findById(id: string): MediaItem | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM media WHERE id = ?').get(id) as MediaItem | undefined;
  },

  listByProjectId(projectId: string): MediaItem[] {
    const db = getDb();
    return db.prepare('SELECT * FROM media WHERE project_id = ? ORDER BY sort_order ASC, created_at DESC').all(projectId) as unknown as MediaItem[];
  },

  create(media: Omit<MediaItem, 'created_at'>): MediaItem {
    const db = getDb();
    const now = new Date().toISOString();
    const fullMedia: MediaItem = { ...media, created_at: now };
    db.prepare(`
      INSERT INTO media (id, project_id, filename, original_name, mime_type, size_bytes, width, height, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fullMedia.id,
      fullMedia.project_id,
      fullMedia.filename,
      fullMedia.original_name,
      fullMedia.mime_type,
      fullMedia.size_bytes,
      fullMedia.width,
      fullMedia.height,
      fullMedia.sort_order,
      fullMedia.created_at
    );
    return fullMedia;
  },

  delete(id: string) {
    const db = getDb();
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
  },
};

// Order repository helpers
export const orderRepo = {
  findById(id: string): Order | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
  },

  findByReference(reference: string): Order | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM orders WHERE paystack_reference = ?').get(reference) as Order | undefined;
  },

  listByUserId(userId: string): (Order & { project_title: string; project_slug: string })[] {
    const db = getDb();
    return db.prepare(`
      SELECT o.*, p.title as project_title, p.slug as project_slug
      FROM orders o
      JOIN projects p ON o.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY o.created_at DESC
    `).all(userId) as unknown as (Order & { project_title: string; project_slug: string })[];
  },

  hasCompletedOrder(projectId: string, clientEmail?: string): boolean {
    const db = getDb();
    if (!clientEmail) {
      // Check if any order was completed or if an unlocked session exists
      const row = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE project_id = ? AND status = 'success'`).get(projectId) as { count: number };
      return (row?.count || 0) > 0;
    }
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE project_id = ? AND LOWER(client_email) = LOWER(?) AND status = 'success'
    `).get(projectId, clientEmail) as { count: number };
    return (row?.count || 0) > 0;
  },

  create(order: Omit<Order, 'created_at'>): Order {
    const db = getDb();
    const now = new Date().toISOString();
    const fullOrder: Order = { ...order, created_at: now };
    db.prepare(`
      INSERT INTO orders (id, project_id, client_email, client_name, amount_ngn, paystack_reference, status, unlocked_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fullOrder.id,
      fullOrder.project_id,
      fullOrder.client_email,
      fullOrder.client_name,
      fullOrder.amount_ngn,
      fullOrder.paystack_reference,
      fullOrder.status,
      fullOrder.unlocked_at,
      fullOrder.created_at
    );
    return fullOrder;
  },

  markSuccess(reference: string) {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE orders
      SET status = 'success', unlocked_at = ?
      WHERE paystack_reference = ?
    `).run(now, reference);
  },
};

// Gallery session repository helpers (for passcode & unlocked state)
export const sessionRepo = {
  find(token: string): GallerySession | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM gallery_sessions WHERE token = ?').get(token) as GallerySession | undefined;
  },

  save(session: GallerySession) {
    const db = getDb();
    db.prepare(`
      INSERT INTO gallery_sessions (token, project_id, client_email, passcode_verified, unlocked_downloads, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET
        passcode_verified = excluded.passcode_verified,
        unlocked_downloads = excluded.unlocked_downloads,
        client_email = excluded.client_email,
        expires_at = excluded.expires_at
    `).run(
      session.token,
      session.project_id,
      session.client_email,
      session.passcode_verified,
      session.unlocked_downloads,
      session.expires_at
    );
  },

  delete(token: string) {
    const db = getDb();
    db.prepare('DELETE FROM gallery_sessions WHERE token = ?').run(token);
  },
};

/** Resolves an old /gallery/<slug> link to its studio, for redirects. */
export function findLegacyGalleryBySlug(
  slug: string
): { handle: string; slug: string } | undefined {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.handle as handle, p.slug as slug
       FROM projects p JOIN users u ON u.id = p.user_id
       WHERE LOWER(p.slug) = LOWER(?)
       ORDER BY p.created_at ASC
       LIMIT 1`
    )
    .get(slug) as { handle: string; slug: string } | undefined;
}
