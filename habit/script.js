const habitList = document.getElementById('habit-list');
const emptyState = document.getElementById('empty-state');
const addHabitBtn = document.getElementById('add-habit-btn');
const addHabitDialog = document.getElementById('add-habit-dialog');
const addHabitForm = document.getElementById('add-habit-form');
const cancelBtn = document.getElementById('cancel-btn');
const habitNameInput = document.getElementById('habit-name');

// Calendar Elements
const calendarDialog = document.getElementById('calendar-dialog');
const closeCalendarBtn = document.getElementById('close-calendar-btn');
const calendarHabitName = document.getElementById('calendar-habit-name');
const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarDays = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const statCompleted = document.getElementById('stat-completed');
const statStreak = document.getElementById('stat-streak');

// View Elements
const habitListContainer = document.getElementById('habit-list');
const habitGridContainer = document.getElementById('habit-grid');
const viewListBtn = document.getElementById('view-list-btn');
const viewGridBtn = document.getElementById('view-grid-btn');

// State
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentCalendarHabitId = null;
let currentCalendarDate = new Date(); // To track which month is showing
let currentView = localStorage.getItem('currentView') || 'list'; // 'list' or 'grid'

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

// State Management
const switchView = (view) => {
    currentView = view;
    localStorage.setItem('currentView', view);
    updateViewUI();
    renderHabits(); // Will dispatch to correct render function
};

const updateViewUI = () => {
    if (currentView === 'list') {
        habitListContainer.style.display = 'flex';
        habitGridContainer.style.display = 'none';
        viewListBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        addHabitBtn.style.display = 'flex'; // Show FAB
    } else {
        habitListContainer.style.display = 'none';
        habitGridContainer.style.display = 'flex';
        viewListBtn.classList.remove('active');
        viewGridBtn.classList.add('active');
        addHabitBtn.style.display = 'none'; // Hide FAB in grid view (to prevent covering cells) or could move it
    }
};

// Migration Logic (One-time run to update data structure if needed)
habits = habits.map(habit => {
    if (habit.hasOwnProperty('completed') && !habit.history) {
        // Old format found, migrate
        const history = {};
        if (habit.completed) {
            history[getTodayString()] = true;
        }
        return {
            id: habit.id || Date.now(),
            name: habit.name,
            history: history,
            created: getTodayString()
        };
    }
    return habit; // Already new format
});

// Date Display
const updateDateDisplay = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    document.getElementById('current-day').textContent = days[now.getDay()];
    // If in Grid view, maybe show "Month Year" instead? 
    // For simplicity, we stick to current date or update if user feedback requests it.
    document.getElementById('current-date').textContent = `${months[now.getMonth()]} ${now.getDate()}`;
};

// Render Dispatcher
const renderHabits = () => {
    if (currentView === 'list') {
        renderListView();
    } else {
        renderGridView();
    }
};

// Render List (Original)
const renderListView = () => {
    habitListContainer.innerHTML = '';

    if (habits.length === 0) {
        habitListContainer.appendChild(emptyState);
        emptyState.style.display = 'flex';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    const today = getTodayString();

    habits.forEach((habit, index) => {
        // ... (rest of card generation logic passed as is, but we need to ensure local var scope)
        // Re-implementing inner logic here to ensure it uses the 'habits' variable correctly
        const isCompletedToday = habit.history[today] === true;

        const card = document.createElement('div');
        card.className = `habit-card ${isCompletedToday ? 'completed' : ''}`;

        card.onclick = (e) => {
            if (!e.target.closest('.delete-btn') && !e.target.closest('.checkbox')) {
                openCalendar(habit.id);
            }
        };

        const content = document.createElement('div');
        content.className = 'habit-content';

        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox';
        checkbox.innerHTML = '<span class="material-symbols-rounded checkbox-icon">check</span>';
        checkbox.onclick = (e) => {
            e.stopPropagation();
            toggleHabit(index);
        };

        const name = document.createElement('span');
        name.className = 'habit-name';
        name.textContent = habit.name;

        content.appendChild(checkbox);
        content.appendChild(name);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<span class="material-symbols-rounded">delete</span>';
        deleteBtn.title = 'Delete Habit';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteHabit(index);
        };

        card.appendChild(content);
        card.appendChild(deleteBtn);

        habitListContainer.appendChild(card);
    });
};

// Render Grid
const renderGridView = () => {
    habitGridContainer.innerHTML = '';

    // Header Row (Days)
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-header';

    // Empty cell for habit names
    const emptyHeaderCell = document.createElement('div');
    emptyHeaderCell.className = 'grid-header-cell sticky-corner';
    headerRow.appendChild(emptyHeaderCell);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = `grid-header-cell ${d === today ? 'today' : ''}`;
        cell.textContent = d;
        headerRow.appendChild(cell);
    }
    habitGridContainer.appendChild(headerRow);

    // Rows (Habits)
    habits.forEach((habit) => {
        const row = document.createElement('div');
        row.className = 'grid-row';

        // Sticky Name
        const name = document.createElement('div');
        name.className = 'grid-habit-name';
        name.textContent = habit.name;
        name.onclick = () => openCalendar(habit.id); // Also open calendar on name click
        name.style.cursor = 'pointer';
        row.appendChild(name);

        // Cells
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = getDateString(date);

            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            if (habit.history[dateStr]) {
                cell.classList.add('completed');
            } else if (dateStr < getTodayString()) {
                cell.classList.add('missed');
            } else if (dateStr > getTodayString()) {
                cell.classList.add('future');
            }

            // Click to toggle specific date
            if (dateStr <= getTodayString()) {
                cell.onclick = () => {
                    toggleHabitDate(habit.id, dateStr);
                };
            }

            row.appendChild(cell);
        }

        habitGridContainer.appendChild(row);
    });
};

// Actions
const addHabit = (name) => {
    habits.push({
        id: Date.now(),
        name: name,
        history: {},
        created: getTodayString()
    });
    saveAndRender();
};

const toggleHabit = (index) => {
    const today = getTodayString();
    const habit = habits[index];

    if (habit.history[today]) {
        delete habit.history[today];
    } else {
        habit.history[today] = true;
    }

    saveAndRender();

    // If calendar is open for this habit, refresh it
    if (currentCalendarHabitId === habit.id && calendarDialog.open) {
        renderCalendar(habit.id, currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    }
};

const deleteHabit = (index) => {
    if (confirm('Delete this habit?')) {
        const idToCheck = habits[index].id;
        habits.splice(index, 1);
        saveAndRender();
        if (currentCalendarHabitId === idToCheck) {
            calendarDialog.close();
        }
    }
};

const saveAndRender = () => {
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
};

// Calendar Logic
const openCalendar = (habitId) => {
    currentCalendarHabitId = habitId;
    currentCalendarDate = new Date(); // Reset to today
    renderCalendar(habitId, currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    calendarDialog.showModal();
};

const renderCalendar = (habitId, year, month) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    calendarHabitName.textContent = habit.name;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    calendarDays.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = getTodayString();

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarDays.appendChild(emptyCell);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        // Using local time via getDateString helper that is timezone aware
        const dateStr = getDateString(date);

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = d;

        // Check status
        if (habit.history[dateStr]) {
            cell.classList.add('completed');
        } else if (dateStr < todayStr) {
            cell.classList.add('missed');
        } else if (dateStr > todayStr) {
            cell.classList.add('future');
        }

        if (dateStr === todayStr) {
            cell.classList.add('today');
        }

        calendarDays.appendChild(cell);
    }

    // Stats
    const historyDates = Object.keys(habit.history).sort();
    const completedCount = historyDates.length;
    statCompleted.textContent = completedCount;

    // Calculate Streak (Current Streak)
    let streak = 0;
    // We check backwards from today (or yesterday if today is not done)
    // Actually, simple logic: is today done? if yes start from today. if no, is yesterday done? if yes start from yesterday.
    // else streak is 0.

    let checkDate = new Date();
    // Reset time part
    checkDate.setHours(0, 0, 0, 0);

    // If today is not done, check if yesterday was done to decide if streak is alive but not incremented today, 
    // OR if streak is broken. 
    // Common logic: Streak includes today if done. If today not done, streak is yesterday's streak.
    // If yesterday not done, streak is 0.

    let checkDateStr = getDateString(checkDate);
    if (!habit.history[checkDateStr]) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkDateStr = getDateString(checkDate);
    }

    if (habit.history[checkDateStr]) {
        while (habit.history[checkDateStr]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = getDateString(checkDate);
        }
    }

    statStreak.textContent = streak;
};

// Generic Date Toggle (for Grid)
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
    if (name) {
        addHabit(name);
        habitNameInput.value = '';
        addHabitDialog.close();
    }
});

closeCalendarBtn.addEventListener('click', () => {
    calendarDialog.close();
});

prevMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarHabitId, currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
});

nextMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarHabitId, currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
});

viewListBtn.addEventListener('click', () => switchView('list'));
viewGridBtn.addEventListener('click', () => switchView('grid'));

// Init
updateDateDisplay();
updateViewUI();
// Fix migration if array was empty but saved as []
if (habits.length > 0) saveAndRender(); // Saves migrated data
else renderHabits();
