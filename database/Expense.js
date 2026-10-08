const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence: { type: Number, default: 0 }
}, { versionKey: false });

const Counter = mongoose.models.ExpenseCounter
    || mongoose.model("ExpenseCounter", counterSchema, "counters");

const expenseSchema = new mongoose.Schema({
    // Keep the numeric API ID expected by the existing browser code.
    id: { type: Number, unique: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: String, required: true }
}, {
    versionKey: false,
    collection: "expenses"
});

expenseSchema.pre("save", async function () {
    if (!this.isNew || this.id != null) return;

    const counter = await Counter.findOneAndUpdate(
        { _id: "expense" },
        { $inc: { sequence: 1 } },
        { upsert: true, new: true }
    );
    this.id = counter.sequence;
});

module.exports = mongoose.models.Expense
    || mongoose.model("Expense", expenseSchema);
