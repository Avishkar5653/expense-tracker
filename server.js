const express = require("express");
const path = require("path");
const db = require("./database/database");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/test", (req, res) => {
    res.json({
        message: "Expense Tracker API is working!"
    });
});

app.post("/api/expenses", (req, res) => {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({
            error: "Amount, category and date are required"
        });
    }

    const statement = db.prepare(`
        INSERT INTO expenses
        (amount, category, description, date)
        VALUES (?, ?, ?, ?)
    `);

    const result = statement.run(
        amount,
        category,
        description,
        date
    );

    res.json({
        message: "Expense added successfully",
        id: result.lastInsertRowid
    });
});

app.get("/api/expenses", (req, res) => {
    const expenses = db.prepare(`
        SELECT * FROM expenses
        ORDER BY date DESC, id DESC
    `).all();

    res.json(expenses);
});

app.delete("/api/expenses/:id", (req, res) => {
    const { id } = req.params;

    const result = db.prepare(`
        DELETE FROM expenses
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Expense not found"
        });
    }

    res.json({
        message: "Expense deleted successfully"
    });
});

// UPDATE - Edit an expense
app.put("/api/expenses/:id", (req, res) => {
    const { id } = req.params;

    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({
            error: "Amount, category and date are required"
        });
    }

    const statement = db.prepare(`
        UPDATE expenses
        SET
            amount = ?,
            category = ?,
            description = ?,
            date = ?
        WHERE id = ?
    `);

    const result = statement.run(
        amount,
        category,
        description,
        date,
        id
    );

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Expense not found"
        });
    }

    res.json({
        message: "Expense updated successfully"
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
