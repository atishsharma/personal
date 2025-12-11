const dashboardContainer = document.getElementById('dashboard-container');
const addHabitBtn = document.getElementById('add-habit-btn');
const addHabitDialog = document.getElementById('add-habit-dialog');
const addHabitForm = document.getElementById('add-habit-form');
const cancelBtn = document.getElementById('cancel-btn');
const habitNameInput = document.getElementById('habit-name');
const habitCategoryInput = document.getElementById('habit-category');

const currentMonthDisplay = document.getElementById('current-month-display');

// Calendar Dialog (We keep this for detailed view if needed, or remove if dashboard is enough)
const calendarDialog = document.getElementById('calendar-dialog');

// State
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Helper: Get Date String YYYY-MM-DD
const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayString = () => {
    return getDateString(new Date());
};

// Migration Logic
habits = habits.map(habit => {
    if (!habit.category) {
        return { ...habit, category: 'Other' }; // Default category
    }
    return habit;
});

// Render Dashboard
const renderDashboard = () => {
    dashboardContainer.innerHTML = '';

    // Group by Category
    const groupedHabits = habits.reduce((acc, habit) => {
        const cat = habit.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(habit);
        return acc;
    }, {});

    // Sort categories logic (Fixed order or alphabetical)
    const categoryOrder = ['Morning Routine', 'Afternoon Routine', 'Evening Routine', 'Health & Fitness', 'Productivity', 'Mindfulness', 'Other'];
    const keys = Object.keys(groupedHabits).sort((a, b) => {
        return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    // Update Header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

    // Render Groups
    keys.forEach(category => {
        const groupEl = document.createElement('div');
        groupEl.className = 'category-group';

        const headerEl = document.createElement('div');
        headerEl.className = 'category-header';
        headerEl.innerHTML = `<span class="material-symbols-rounded">folder</span> ${category}`;
        groupEl.appendChild(headerEl);

        // Render Habits within Category
        groupedHabits[category].forEach(habit => {
            const rowEl = document.createElement('div');
            rowEl.className = 'habit-row';

            // 1. Name Column
            const nameCol = document.createElement('div');
            nameCol.className = 'habit-name-col';
            nameCol.innerHTML = `
                <span>${habit.name}</span>
            `;
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn'; // Re-use styling if possible or adjust
            deleteBtn.style.border = 'none';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.color = '#777';
            deleteBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px">delete</span>';
            deleteBtn.onclick = () => deleteHabit(habit.id);
            nameCol.appendChild(deleteBtn);

            // 2. Calendar Grid Scroll Area
            const scrollArea = document.createElement('div');
            scrollArea.className = 'calendar-scroll-area';

            const track = document.createElement('div');
            track.className = 'calendar-track';

            let completedDays = 0;

            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                const dateStr = getDateString(date);

                const checkbox = document.createElement('div');
                checkbox.className = 'day-checkbox';
                if (d === today) checkbox.classList.add('today');

                if (habit.history[dateStr]) {
                    checkbox.classList.add('completed');
                    completedDays++;
                }

                // Interaction
                if (date <= now) {
                    checkbox.onclick = () => toggleHabitDate(habit.id, dateStr);
                } else {
                    checkbox.style.opacity = '0.3';
                    checkbox.style.cursor = 'default';
                }

                // Optional: Show day number inside
                checkbox.textContent = d;

                track.appendChild(checkbox);
            }

            // Auto-scroll to today
            // We can do this after append, using scrollLeft
            // Simple logic: (today - 3) * (32px + 6px gap)
            setTimeout(() => {
                const dayWidth = 38; // 32 + 6
                scrollArea.scrollLeft = (today - 4) * dayWidth;
            }, 0);

            scrollArea.appendChild(track);

            // 3. Stats Column (Progress)
            const progress = Math.round((completedDays / daysInMonth) * 100);

            const statsCol = document.createElement('div');
            statsCol.className = 'stats-col';
            statsCol.innerHTML = `
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${completedDays}/${daysInMonth} days (${progress}%)</span>
            `;

            rowEl.appendChild(nameCol);
            rowEl.appendChild(scrollArea);
            rowEl.appendChild(statsCol);

            groupEl.appendChild(rowEl);
        });

        dashboardContainer.appendChild(groupEl);
    });
};

// Actions
const addHabit = (name, category) => {
    habits.push({
        id: Date.now(),
        name: name,
        category: category,
        history: {},
        created: getTodayString()
    });
    saveAndRender();
};

const deleteHabit = (id) => {
    if (confirm('Delete this habit?')) {
        habits = habits.filter(h => h.id !== id);
        saveAndRender();
    }
};

const toggleHabitDate = (habitId, dateStr) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.history[dateStr]) {
        delete habit.history[dateStr];
    } else {
        habit.history[dateStr] = true;
    }

    saveAndRender();
};

const saveAndRender = () => {
    localStorage.setItem('habits', JSON.stringify(habits));
    renderDashboard();
};

// Event Listeners
addHabitBtn.addEventListener('click', () => {
    addHabitDialog.showModal();
});

cancelBtn.addEventListener('click', () => {
    addHabitDialog.close();
});

addHabitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    const category = habitCategoryInput.value;
    if (name) {
        addHabit(name, category);
        habitNameInput.value = '';
        addHabitDialog.close();
    }
});

// Init
if (habits.length > 0) saveAndRender(); // Saves migrated data (adds categories)
else renderDashboard();
