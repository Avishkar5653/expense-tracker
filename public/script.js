let expenses = [];
let chart;


// Load expenses
async function loadExpenses() {
    try {
        const response = await fetch("/api/expenses");
        expenses = await response.json();

        displayExpenses(expenses);
        updateDashboard(expenses);
        updateCategorySummary(expenses);
        updateChart(expenses);

    } catch (error) {
        console.log("Error loading expenses:", error);
    }
}


// Display expenses
function displayExpenses(data) {

    const expenseList = document.getElementById("expenseList");

    expenseList.innerHTML = "";

    if (data.length === 0) {
        expenseList.innerHTML = "<p class='empty-message'>No expenses found.</p>";
        return;
    }

    data.forEach(function(expense) {

        const item = document.createElement("div");

        item.className = "expense-item";

        const info = document.createElement("div");
        info.className = "expense-info";

        const top = document.createElement("div");
        top.className = "expense-top";

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = "₹" + Number(expense.amount).toFixed(2);

        const category = document.createElement("span");
        category.className = "expense-category";
        category.textContent = expense.category;

        top.appendChild(amount);
        top.appendChild(category);

        const description = document.createElement("div");
        description.className = "expense-description";
        description.textContent = expense.description || "No description";

        const date = document.createElement("div");
        date.className = "expense-date";
        date.textContent = expense.date;

        info.appendChild(top);
        info.appendChild(description);
        info.appendChild(date);


        const actions = document.createElement("div");
        actions.className = "expense-actions";


        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.onclick = function() {
            editExpense(expense._id);
        };


        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            deleteExpense(expense._id);
        };


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        item.appendChild(info);
        item.appendChild(actions);

        expenseList.appendChild(item);
    });
}


// Add or update expense
document.getElementById("expenseForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;

    const form = document.getElementById("expenseForm");

    const expenseId = form.dataset.editingId;


    const expenseData = {
        amount: Number(amount),
        category: category,
        description: description,
        date: date
    };


    try {

        let response;


        if (expenseId) {

            response = await fetch("/api/expenses/" + expenseId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
            });

        } else {

            response = await fetch("/api/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
            });
        }


        if (!response.ok) {
            throw new Error("Failed to save expense");
        }


        document.getElementById("expenseForm").reset();

        delete form.dataset.editingId;


        const submitButton = document.querySelector(
            "#expenseForm button[type='submit']"
        );

        if (submitButton) {
            submitButton.textContent = "Add Expense";
        }


        loadExpenses();


    } catch (error) {

        console.log("Error saving expense:", error);

        alert("Unable to save expense.");

    }

});


// Edit expense
function editExpense(id) {

    const expense = expenses.find(function(item) {
        return item._id === id;
    });


    if (!expense) {
        return;
    }


    document.getElementById("amount").value = expense.amount;

    document.getElementById("category").value = expense.category;

    document.getElementById("description").value =
        expense.description || "";

    document.getElementById("date").value = expense.date;


    document.getElementById("expenseForm").dataset.editingId = id;


    const submitButton = document.querySelector(
        "#expenseForm button[type='submit']"
    );


    if (submitButton) {
        submitButton.textContent = "Update Expense";
    }


    window.scrollTo(0, 0);
}


// Delete expense
async function deleteExpense(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            "/api/expenses/" + id,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete expense");
        }


        loadExpenses();


    } catch (error) {

        console.log("Error deleting expense:", error);

        alert("Unable to delete expense.");

    }
}


// Update dashboard
function updateDashboard(data) {

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;


    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];


    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();


    data.forEach(function(expense) {

        const amount = Number(expense.amount);

        total = total + amount;


        if (expense.date === todayString) {
            todayTotal = todayTotal + amount;
        }


        const expenseDate = new Date(expense.date);


        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {
            monthTotal = monthTotal + amount;
        }

    });


    document.getElementById("dashboardTotal").textContent =
        "₹" + total.toFixed(2);


    document.getElementById("todayTotal").textContent =
        "₹" + todayTotal.toFixed(2);


    document.getElementById("monthTotal").textContent =
        "₹" + monthTotal.toFixed(2);


    document.getElementById("expenseCount").textContent =
        data.length;
}


// Category summary
function updateCategorySummary(data) {

    const categorySummary =
        document.getElementById("categorySummary");


    const categories = {};


    data.forEach(function(expense) {

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }


        categories[expense.category] =
            categories[expense.category] +
            Number(expense.amount);

    });


    categorySummary.innerHTML = "";


    for (const category in categories) {

        const item = document.createElement("div");

        item.className = "summary-item";


        const name = document.createElement("span");

        name.textContent = category;


        const amount = document.createElement("strong");

        amount.textContent =
            "₹" + categories[category].toFixed(2);


        item.appendChild(name);
        item.appendChild(amount);

        categorySummary.appendChild(item);
    }
}


// Update chart
function updateChart(data) {

    const categoryTotals = {};


    data.forEach(function(expense) {

        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }


        categoryTotals[expense.category] =
            categoryTotals[expense.category] +
            Number(expense.amount);

    });


    const labels = Object.keys(categoryTotals);

    const values = Object.values(categoryTotals);


    const canvas =
        document.getElementById("expenseChart");


    if (!canvas) {
        return;
    }


    if (chart) {
        chart.destroy();
    }


    chart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{
                data: values,

                backgroundColor: [
                    "#2563eb",
                    "#059669",
                    "#7c3aed",
                    "#ea580c",
                    "#dc2626",
                    "#0891b2"
                ]
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }

    });
}


// Apply filters
function applyFilters() {

    const searchText =
        document.getElementById("search").value.toLowerCase();


    const category =
        document.getElementById("filterCategory").value;


    const date =
        document.getElementById("filterDate").value;


    const filtered = expenses.filter(function(expense) {

        const description =
            expense.description || "";


        const matchesSearch =
            expense.category.toLowerCase().includes(searchText) ||
            description.toLowerCase().includes(searchText);


        const matchesCategory =
            category === "" ||
            expense.category === category;


        const matchesDate =
            date === "" ||
            expense.date === date;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesDate
        );

    });


    displayExpenses(filtered);
}


// Search
document.getElementById("search").addEventListener(
    "input",
    applyFilters
);


// Category filter
document.getElementById("filterCategory").addEventListener(
    "change",
    applyFilters
);


// Date filter
document.getElementById("filterDate").addEventListener(
    "change",
    applyFilters
);


// Clear filters
document.getElementById("clearFilters").addEventListener(
    "click",
    function() {

        document.getElementById("search").value = "";

        document.getElementById("filterCategory").value = "";

        document.getElementById("filterDate").value = "";

        displayExpenses(expenses);

    }
);


// Start application
loadExpenses();