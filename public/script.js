const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalElement = document.getElementById("total");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const filterDate = document.getElementById("filterDate");
const clearFiltersButton = document.getElementById("clearFilters");

const dashboardTotal = document.getElementById("dashboardTotal");
const todayTotal = document.getElementById("todayTotal");
const monthTotal = document.getElementById("monthTotal");
const expenseCount = document.getElementById("expenseCount");
const categorySummary = document.getElementById("categorySummary");

let editingExpenseId = null;
let allExpenses = [];

let expenseChart = null;



// ========================================
// LOAD EXPENSES
// ========================================

async function loadExpenses() {

    const response = await fetch("/api/expenses");

    allExpenses = await response.json();

    displayExpenses(allExpenses);

    updateDashboard();
}


// ========================================
// DISPLAY EXPENSES
// ========================================

function displayExpenses(expenses) {

    expenseList.innerHTML = "";

    let total = 0;


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <p>No expenses found.</p>
        `;

        totalElement.textContent = "0";

        return;
    }


    expenses.forEach((expense) => {

        total += Number(expense.amount);

        const div = document.createElement("div");

        div.innerHTML = `
            <strong>₹${expense.amount}</strong>
            - ${expense.category}

            <p>${expense.description || ""}</p>

            <small>${expense.date}</small>

            <br>

            <button onclick="editExpense(${expense.id})">
                Edit
            </button>

            <button onclick="deleteExpense(${expense.id})">
                Delete
            </button>

            <hr>
        `;

        expenseList.appendChild(div);
    });


    totalElement.textContent = total;
}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    let total = 0;
    let todayTotalAmount = 0;
    let monthTotalAmount = 0;

    const categoryTotals = {};


    const now = new Date();

    const today = now.toISOString().split("T")[0];

    const currentMonth =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0");


    allExpenses.forEach((expense) => {

        const amount = Number(expense.amount);

        total += amount;


        // Today's expenses

        if (expense.date === today) {

            todayTotalAmount += amount;

        }


        // This month's expenses

        if (expense.date.startsWith(currentMonth)) {

            monthTotalAmount += amount;

        }


        // Category totals

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }

        categoryTotals[expense.category] += amount;

    });


    dashboardTotal.textContent = total;

    todayTotal.textContent = todayTotalAmount;

    monthTotal.textContent = monthTotalAmount;

    expenseCount.textContent = allExpenses.length;


    // Category summary

    categorySummary.innerHTML = "";


    Object.keys(categoryTotals).forEach((category) => {

        const div = document.createElement("div");

        div.className = "category-row";

        div.innerHTML = `
            <strong>${category}</strong>
            <span>₹${categoryTotals[category]}</span>
        `;

        categorySummary.appendChild(div);

    });


    if (Object.keys(categoryTotals).length === 0) {

        categorySummary.innerHTML =
            "<p>No expenses yet.</p>";

    }

    updateChart(categoryTotals);

}

function updateChart(categoryTotals) {

    const canvas = document.getElementById("expenseChart");

    const categories = Object.keys(categoryTotals);

    const amounts = Object.values(categoryTotals);


    if (expenseChart !== null) {

        expenseChart.destroy();

    }


    if (categories.length === 0) {

        return;

    }


    expenseChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: categories,

            datasets: [
                {
                    label: "Expenses",

                    data: amounts,

                    backgroundColor: [
                        "#2563eb",
                        "#16a34a",
                        "#f59e0b",
                        "#dc2626",
                        "#9333ea",
                        "#0891b2"
                    ],

                    borderWidth: 1
                }
            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    });
}



// ========================================
// FILTER EXPENSES
// ========================================

function filterExpenses() {

    const searchText =
        searchInput.value.toLowerCase();

    const selectedCategory =
        filterCategory.value;

    const selectedDate =
        filterDate.value;


    const filteredExpenses = allExpenses.filter(
        (expense) => {

            const description =
                (expense.description || "")
                    .toLowerCase();


            const matchesSearch =
                description.includes(searchText);


            const matchesCategory =
                selectedCategory === "" ||
                expense.category === selectedCategory;


            const matchesDate =
                selectedDate === "" ||
                expense.date === selectedDate;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesDate
            );
        }
    );


    displayExpenses(filteredExpenses);
}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    filterExpenses
);


// ========================================
// CATEGORY FILTER
// ========================================

filterCategory.addEventListener(
    "change",
    filterExpenses
);


// ========================================
// DATE FILTER
// ========================================

filterDate.addEventListener(
    "change",
    filterExpenses
);


// ========================================
// CLEAR FILTERS
// ========================================

clearFiltersButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        filterCategory.value = "";

        filterDate.value = "";

        displayExpenses(allExpenses);
    }
);


// ========================================
// CREATE / UPDATE
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const expense = {

            amount:
                document.getElementById("amount").value,

            category:
                document.getElementById("category").value,

            description:
                document.getElementById("description").value,

            date:
                document.getElementById("date").value

        };


        // UPDATE

        if (editingExpenseId !== null) {

            const response = await fetch(
                `/api/expenses/${editingExpenseId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(expense)
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                alert(
                    "Expense updated successfully!"
                );

                editingExpenseId = null;

                form.reset();

                document.querySelector(
                    "#expenseForm button[type='submit']"
                ).textContent = "Add Expense";

                loadExpenses();

            } else {

                alert(data.error);

            }

            return;
        }


        // CREATE

        const response = await fetch(
            "/api/expenses",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(expense)
            }
        );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                "Expense added successfully!"
            );

            form.reset();

            loadExpenses();

        } else {

            alert(data.error);

        }

    }
);


// ========================================
// EDIT
// ========================================

async function editExpense(id) {

    const expense =
        allExpenses.find(
            (item) => item.id === id
        );


    if (!expense) {

        alert("Expense not found!");

        return;
    }


    editingExpenseId = id;


    document.getElementById("amount").value =
        expense.amount;

    document.getElementById("category").value =
        expense.category;

    document.getElementById("description").value =
        expense.description || "";

    document.getElementById("date").value =
        expense.date;


    document.querySelector(
        "#expenseForm button[type='submit']"
    ).textContent = "Update Expense";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// DELETE
// ========================================

async function deleteExpense(id) {

    const response = await fetch(
        `/api/expenses/${id}`,
        {
            method: "DELETE"
        }
    );


    const data =
        await response.json();


    if (response.ok) {

        alert(
            "Expense deleted successfully!"
        );

        loadExpenses();

    } else {

        alert(data.error);

    }
}


// ========================================
// INITIAL LOAD
// ========================================

loadExpenses();
