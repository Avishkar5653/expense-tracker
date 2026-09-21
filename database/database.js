const Database = require("better-sqlite3");

const db = new Database("expenses.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL
    )
`);

console.log("Database connected and table ready.");

module.exports = db;
