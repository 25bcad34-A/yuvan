import os
import sqlite3

# Project root (parent of backend/)
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
SQLITE_PATH = os.path.join(_PROJECT_ROOT, "portfolio.db")

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_use_pg = bool(DATABASE_URL)


def _conn_sqlite():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _conn_pg():
    import psycopg2
    import psycopg2.extras

    return psycopg2.connect(DATABASE_URL)


def get_connection():
    if _use_pg:
        return _conn_pg()
    return _conn_sqlite()


def init_database():
    if _use_pg:
        _init_pg()
    else:
        _init_sqlite()
    print("Database initialized.")


def _init_sqlite():
    conn = _conn_sqlite()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS stats (
            key TEXT PRIMARY KEY,
            value INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    cur.execute("INSERT OR IGNORE INTO stats (key, value) VALUES ('visitors', 0)")
    conn.commit()
    conn.close()


def _init_pg():
    conn = _conn_pg()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS stats (
            key TEXT PRIMARY KEY,
            value INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    cur.execute(
        """
        INSERT INTO stats (key, value)
        VALUES ('visitors', 0)
        ON CONFLICT (key) DO NOTHING
        """
    )
    conn.commit()
    conn.close()


def add_contact(name, email, message):
    try:
        conn = get_connection()
        cur = conn.cursor()
        if _use_pg:
            cur.execute(
                "INSERT INTO contacts (name, email, message) VALUES (%s, %s, %s)",
                (name, email, message),
            )
        else:
            cur.execute(
                "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
                (name, email, message),
            )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding contact: {e}")
        return False


def get_all_contacts():
    conn = get_connection()
    cur = conn.cursor()
    if _use_pg:
        import psycopg2.extras

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    cur.execute("SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_visitor_count():
    conn = get_connection()
    cur = conn.cursor()
    if _use_pg:
        cur.execute("SELECT value FROM stats WHERE key = 'visitors'")
    else:
        cur.execute("SELECT value FROM stats WHERE key = 'visitors'")
    row = cur.fetchone()
    conn.close()
    if not row:
        return 0
    return int(row[0])


def increment_visitor_count():
    conn = get_connection()
    cur = conn.cursor()
    if _use_pg:
        cur.execute(
            "UPDATE stats SET value = value + 1 WHERE key = 'visitors' RETURNING value"
        )
        row = cur.fetchone()
        conn.commit()
        n = int(row[0]) if row else get_visitor_count()
    else:
        cur.execute(
            "UPDATE stats SET value = value + 1 WHERE key = 'visitors'"
        )
        conn.commit()
        cur.execute("SELECT value FROM stats WHERE key = 'visitors'")
        n = int(cur.fetchone()[0])
    conn.close()
    return n


if __name__ == "__main__":
    init_database()
