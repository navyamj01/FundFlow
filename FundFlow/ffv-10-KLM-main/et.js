document.addEventListener('DOMContentLoaded', () => {
    // State
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let expenseToDelete = null;

    // DOM Elements
    const expenseList = document.getElementById('expense-list');
    const addExpenseBtn = document.getElementById('add-expense');
    const expenseForm = document.getElementById('expense-form');
    const expenseFormPopup = document.getElementById('expenseFormPopup');
    const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
    const closePopupBtns = document.querySelectorAll('.close-popup');

    // Add these variables for search and filter
    const searchInput = document.getElementById('expense-search');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const categoryFilter = document.getElementById('category-filter');
    const applyFilterBtn = document.getElementById('apply-date-filter');
    const resetFilterBtn = document.getElementById('reset-filters');

    // Add these functions at the top of your file
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                              type === 'error' ? 'fa-exclamation-circle' : 
                              'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function createConfetti() {
        const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#ff6b6b', '#4834d4', '#be2edd', '#ff9f43'];
        const shapes = ['square', 'triangle', 'circle'];
        
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), (duration + delay) * 1000);
        }
    }

    // Add search and filter function
    function filterExpenses(expenses) {
        const searchTerm = searchInput.value.toLowerCase();
        const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
        const toDate = dateTo.value ? new Date(dateTo.value) : null;
        const selectedCategory = categoryFilter.value.toLowerCase();

        return expenses.filter(expense => {
            if (!expense) return false;

            // Search in name, category, and tags
            const matchesSearch = 
                (expense.name && expense.name.toLowerCase().includes(searchTerm)) ||
                (expense.category && expense.category.toLowerCase().includes(searchTerm)) ||
                (expense.tags && expense.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

            // Date filter
            const expenseDate = new Date(expense.date);
            const matchesDate = (!fromDate || expenseDate >= fromDate) &&
                              (!toDate || expenseDate <= toDate);

            // Category filter
            const matchesCategory = !selectedCategory || 
                                  expense.category.toLowerCase() === selectedCategory;

            return matchesSearch && matchesDate && matchesCategory;
        });
    }

    // Update render function to use filtered results
    function renderExpenses(filteredExpenses = null) {
        const expensesToRender = filteredExpenses || expenses;
        expenseList.innerHTML = '';
        
        if (expensesToRender.length === 0) {
            expenseList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No expenses found</p>
                </div>
            `;
            return;
        }

        expensesToRender.forEach(expense => {
            if (!expense || !expense.id) return;
            
            const formattedAmount = expense.amount ? expense.amount.toLocaleString('en-IN') : '0';
            
            const expenseEl = document.createElement('div');
            expenseEl.className = 'expense-item';
            expenseEl.innerHTML = `
                <div class="expense-info">
                    <div class="expense-header">
                        <h4>${expense.name || 'Unnamed Expense'}</h4>
                        <div class="expense-amount">₹${formattedAmount}</div>
                    </div>
                    <div class="expense-details">
                        <span class="category ${expense.category || 'other'}">${expense.category || 'Other'}</span>
                        ${expense.tags ? expense.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        <span class="date"><i class="fas fa-calendar"></i> ${new Date(expense.date || new Date()).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            expenseList.appendChild(expenseEl);
        });
    }

    // Show/Hide Popups
    function showPopup(popup) {
        popup.style.display = 'flex';
    }

    function hidePopup(popup) {
        popup.style.display = 'none';
    }

    // Event Listeners
    addExpenseBtn.addEventListener('click', () => {
        showPopup(expenseFormPopup);
    });

    closePopupBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            hidePopup(e.target.closest('.popup-overlay'));
        });
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('expense-amount').value);
        if (isNaN(amount)) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        const tagsInput = document.getElementById('expense-tags').value;
        const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        const expense = {
            id: Date.now(),
            name: document.getElementById('expense-name').value,
            amount: amount,
            date: document.getElementById('expense-date').value || new Date().toISOString().split('T')[0],
            category: document.getElementById('expense-category').value,
            tags: tags
        };

        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        renderExpenses();
        expenseForm.reset();
        hidePopup(expenseFormPopup);

        // Show success notification and celebration
        showNotification('Expense added successfully! 🎉', 'success');
        createConfetti();
    });

    expenseList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-expense')) {
            const id = Number(e.target.closest('.delete-expense').dataset.id);
            expenseToDelete = id;
            showPopup(deleteConfirmPopup);
        }
    });

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        const password = document.getElementById('delete-password').value;
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users'));

        if (!storedUser || !users) {
            alert('Please log in to delete expenses');
            return;
        }

        const userObj = users[storedUser.username];
        if (!userObj) {
            alert('User not found');
            return;
        }

        // Hash the entered password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashedPassword = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        if (hashedPassword === userObj.password) {
            expenses = expenses.filter(exp => exp && exp.id !== expenseToDelete);
            expenses = expenses.filter(Boolean);
            
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
            hidePopup(deleteConfirmPopup);
            document.getElementById('delete-password').value = '';
            expenseToDelete = null;
            
            showNotification('Expense deleted successfully', 'success');
        } else {
            showNotification('Incorrect password', 'error');
        }
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        hidePopup(deleteConfirmPopup);
        document.getElementById('delete-password').value = '';
    });

    // Add event listeners for search and filters
    searchInput.addEventListener('input', () => {
        const filteredExpenses = filterExpenses(expenses);
        renderExpenses(filteredExpenses);
    });

    applyFilterBtn.addEventListener('click', () => {
        const filteredExpenses = filterExpenses(expenses);
        renderExpenses(filteredExpenses);
        showNotification('Filters applied', 'success');
    });

    resetFilterBtn.addEventListener('click', () => {
        searchInput.value = '';
        dateFrom.value = '';
        dateTo.value = '';
        categoryFilter.value = '';
        renderExpenses(expenses);
        showNotification('Filters reset', 'success');
    });

    // Initial render
    renderExpenses();

    // Clean up existing expenses
    expenses = expenses.filter(expense => expense && expense.id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();

    // Add these functions at the beginning of your DOMContentLoaded event
    let currentChart = null;

    function initializeCharts() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        createCategoryChart(ctx);

        // Add tab switching functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (btn.dataset.chart === 'category') {
                    createCategoryChart(ctx);
                } else {
                    createTrendChart(ctx);
                }
            });
        });

        updateStats();
    }

    function createCategoryChart(ctx) {
        const categoryData = calculateCategoryData();
        
        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56',
                        '#4BC0C0', '#9966FF', '#FF9F40',
                        '#ad49e1', '#2ecc71', '#e74c3c'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ebd3f8',
                            padding: 20,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ₹${data.datasets[0].data[i]}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].borderColor,
                                    lineWidth: 2,
                                    hidden: false
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(46, 7, 63, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 15,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return ` ₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    function createTrendChart(ctx) {
        const trendData = calculateTrendData();
        
        if (currentChart) {
            currentChart.destroy();
        }

        // Sort the data by date
        const sortedEntries = Object.entries(trendData).sort((a, b) => {
            const dateA = new Date(parseMonthYear(a[0]));
            const dateB = new Date(parseMonthYear(b[0]));
            return dateA - dateB;
        });

        const labels = sortedEntries.map(entry => entry[0]);
        const values = sortedEntries.map(entry => entry[1]);

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Expenses',
                    data: values,
                    borderColor: '#ad49e1',
                    backgroundColor: 'rgba(173, 73, 225, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ad49e1',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#ad49e1',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(46, 7, 63, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 15,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ebd3f8',
                            callback: value => '₹' + value.toLocaleString('en-IN')
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ebd3f8'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Helper function to parse month year string
    function parseMonthYear(monthYear) {
        const [month, year] = monthYear.split(' ');
        const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
        return new Date(year, monthIndex, 1);
    }

    // Update the calculateTrendData function
    function calculateTrendData() {
        const monthlyData = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }
            monthlyData[monthYear] += expense.amount;
        });

        return monthlyData;
    }

    function calculateCategoryData() {
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });
        return categoryTotals;
    }

    function updateStats() {
        const categoryData = calculateCategoryData();
        
        // Total expenses
        const total = Object.values(categoryData).reduce((a, b) => a + b, 0);
        document.getElementById('totalExpenses').textContent = 
            `₹${total.toLocaleString('en-IN')}`;
        
        // Monthly average
        const months = new Set(expenses.map(e => 
            new Date(e.date).toISOString().slice(0, 7)
        )).size || 1;
        const average = total / months;
        document.getElementById('monthlyAverage').textContent = 
            `₹${average.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        
        // Top category
        const topCategory = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])[0];
        document.getElementById('topCategory').textContent = 
            topCategory ? topCategory[0] : '-';
    }

    // Initialize charts
    initializeCharts();

    // Update charts when expenses change
    const observer = new MutationObserver(() => {
        initializeCharts();
    });

    observer.observe(document.getElementById('expense-list'), {
        childList: true,
        subtree: true
    });

    // Add this function to initialize the currency converter
    function initializeCurrencyConverter() {
        const amount = document.getElementById('amount');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const convertedAmount = document.getElementById('convertedAmount');
        const exchangeRate = document.getElementById('exchangeRate');
        const swapBtn = document.getElementById('swapCurrency');

        async function convertCurrency() {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency.value}`);
            const data = await response.json();
            const rate = data.rates[toCurrency.value];
            
            const result = (amount.value * rate).toFixed(2);
            convertedAmount.textContent = `${result} ${toCurrency.value}`;
            exchangeRate.textContent = `1 ${fromCurrency.value} = ${rate.toFixed(2)} ${toCurrency.value}`;
        }

        amount.addEventListener('input', convertCurrency);
        fromCurrency.addEventListener('change', convertCurrency);
        toCurrency.addEventListener('change', convertCurrency);
        
        swapBtn.addEventListener('click', () => {
            const temp = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = temp;
            convertCurrency();
        });

        // Initial conversion
        convertCurrency();
    }

    // Add this to your DOMContentLoaded event
    initializeCurrencyConverter();
});

function validateExpenseForm() {
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;

    return name && amount && category;
}