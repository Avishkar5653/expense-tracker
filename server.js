const express = require("express");
const path = require("path");
const connectDatabase = require("./database/database");
const Expense = require("./database/Expense");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/test", (req, res) => {
    res.json({
        message: "Expense Tracker API is working!"
    });
});

app.post("/api/expenses", async (req, res) => {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({
            error: "Amount, category and date are required"
        });
    }

    const expense = await Expense.create({ amount, category, description, date });

    res.json({
        message: "Expense added successfully",
        id: expense.id
    });
});

app.get("/api/expenses", async (req, res) => {
    const expenses = await Expense.find()
        .select("-_id")
        .sort({ date: -1, id: -1 })
        .lean();

    res.json(expenses);
});

app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);
    const result = Number.isSafeInteger(id)
        ? await Expense.deleteOne({ id })
        : { deletedCount: 0 };

    if (result.deletedCount === 0) {
        return res.status(404).json({
            error: "Expense not found"
        });
    }

    res.json({
        message: "Expense deleted successfully"
    });
});

// UPDATE - Edit an expense
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
        return res.status(400).json({
            error: "Amount, category and date are required"
        });
    }

    const expense = Number.isSafeInteger(id)
        ? await Expense.findOneAndUpdate(
            { id },
            { amount, category, description, date },
            { new: true, runValidators: true }
        )
        : null;

    if (!expense) {
        return res.status(404).json({
            error: "Expense not found"
        });
    }

    res.json({
        message: "Expense updated successfully"
    });
});


connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB:", error.message);
        process.exit(1);
    });
