// Everyday Clone Logic - Summary Row & Mobile Scroll

document.addEventListener('DOMContentLoaded', () => {
    // State
    let habits = JSON.parse(localStorage.getItem('everyday_habits')) || [];

    // Calendar State
    let viewDate = new Date();
    viewDate.setDate(1); // Start of current month

    // DOM Elements
    const datesScrollArea = document.getElementById('dates-scroll-area');
    const habitsGrid = document.getElementById('habits-grid');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const addModal = document.getElementById('add-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const saveHabitBtn = document.getElementById('save-habit-btn');
    const habitNameInput = document.getElementById('habit-name');
    const colorPicker = document.getElementById('color-picker');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Android 16 Material You Colors (Pastel/Vibrant Mix)
    const COLORS = [
        '#FFB4AB', '#E6C05C', '#82DB66', '#68DCBF',
        '#7ECAFF', '#C2Eeb0', '#F2B8B5', '#D7C0FF',
        '#CBC3E8', '#E8DEF8', '#F3E2F4', '#C1C1CB'
    ];
    let selectedColor = COLORS[0];

    function init() {
        renderColorPicker();
        renderBoard();
        setupEventListeners();
        handleMobileScroll();
    }

    function renderColorPicker() {
        colorPicker.innerHTML = '';
        COLORS.forEach(color => {
            const btn = document.createElement('div');
            btn.className = `color-option ${color === selectedColor ? 'selected' : ''}`;
            btn.style.backgroundColor = color;
            btn.addEventListener('click', () => {
                selectedColor = color;
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
            colorPicker.appendChild(btn);
        });
    }

    function renderBoard() {
        // Update Month Label
        const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        currentMonthDisplay.textContent = monthName;

        renderDates();
        renderHabitsSmart();
        renderSummaryRow();
    }

    function getMonthDates() {
        const dates = [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(year, month, i));
        }
        return dates;
    }

    function renderDates() {
        datesScrollArea.innerHTML = '';
        const dates = getMonthDates();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        dates.forEach(date => {
            const isToday = date.getTime() === today.getTime();
            const el = document.createElement('div');
            el.className = `date-col ${isToday ? 'today' : ''}`;
            el.setAttribute('data-date', date.toISOString().split('T')[0]); // For finding specific date col

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dayNum = date.getDate();

            el.innerHTML = `
                <div class="date-row-day">${dayName}</div>
                <div class="date-row-num">${dayNum}</div>
            `;
            datesScrollArea.appendChild(el);
        });
    }

    // --- Stats Logic ---
    function calculateStats(habit) {
        if (!habit.history) return { current: 0, longest: 0, total: 0 };

        const historyKeys = Object.keys(habit.history).sort();
        const total = historyKeys.length;

        if (total === 0) return { current: 0, longest: 0, total: 0 };

        const diffDays = (d1Str, d2Str) => {
            const d1 = new Date(d1Str);
            const d2 = new Date(d2Str);
            return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        };

        let longest = 0;
        let currentRun = 0;
        let prevDate = null;

        for (const dateStr of historyKeys) {
            if (!prevDate) {
                currentRun = 1;
            } else {
                const diff = diffDays(prevDate, dateStr);
                if (diff === 1) {
                    currentRun++;
                } else {
                    currentRun = 1;
                }
            }
            if (currentRun > longest) longest = currentRun;
            prevDate = dateStr;
        }

        let currentStreak = 0;
        let d = new Date();
        d.setHours(0, 0, 0, 0);
        const toKey = (d) => d.toISOString().split('T')[0];

        if (!habit.history[toKey(d)]) {
            d.setDate(d.getDate() - 1);
            if (!habit.history[toKey(d)]) {
                currentStreak = 0;
            } else {
                while (habit.history[toKey(d)]) {
                    currentStreak++;
                    d.setDate(d.getDate() - 1);
                }
            }
        } else {
            while (habit.history[toKey(d)]) {
                currentStreak++;
                d.setDate(d.getDate() - 1);
            }
        }

        return { current: currentStreak, longest, total };
    }

    function renderHabitsSmart() {
        habitsGrid.innerHTML = '';
        const dates = getMonthDates();

        habits.forEach(habit => {
            const row = document.createElement('div');
            row.className = 'habit-row';

            const sidebar = document.createElement('div');
            sidebar.className = 'habit-sidebar';
            sidebar.innerHTML = `<span class="habit-name">${habit.name}</span>`;
            row.appendChild(sidebar);

            const daysContainer = document.createElement('div');
            daysContainer.className = 'habit-days';

            dates.forEach(date => {
                const dateKey = date.toISOString().split('T')[0];
                const isCompleted = habit.history && habit.history[dateKey];

                const cell = document.createElement('div');
                cell.className = `grid-cell ${isCompleted ? 'completed' : ''}`;
                cell.setAttribute('data-title', habit.name);

                if (isCompleted) {
                    cell.style.backgroundColor = habit.color;
                }

                cell.innerHTML = `<span class="material-symbols-rounded">check</span>`;

                cell.addEventListener('click', () => {
                    if (!habit.history) habit.history = {};
                    if (habit.history[dateKey]) delete habit.history[dateKey];
                    else habit.history[dateKey] = true;
                    saveData();
                    // Re-render everything to update total row and stats
                    renderBoard();
                });

                daysContainer.appendChild(cell);
            });

            row.appendChild(daysContainer);

            // 3-Column Stats with Colored Bubbles
            const stats = calculateStats(habit);
            const statsContainer = document.createElement('div');
            statsContainer.className = 'stats-container';

            // Helper for circle style
            const getBubbleStyle = (val) => {
                if (val > 0) {
                    return `background-color: ${habit.color};`;
                }
                return '';
            };
            const getBubbleClass = (val) => val > 0 ? 'stat-val has-bg' : 'stat-val';

            statsContainer.innerHTML = `
                <div class="stat-box" title="Current Streak">
                    <span class="${getBubbleClass(stats.current)}" style="${getBubbleStyle(stats.current)}">${stats.current}</span>
                    <span class="stat-type">Curr</span>
                </div>
                <div class="stat-box" title="Longest Streak">
                    <span class="${getBubbleClass(stats.longest)}" style="${getBubbleStyle(stats.longest)}">${stats.longest}</span>
                    <span class="stat-type">Long</span>
                </div>
                <div class="stat-box" title="Total Days">
                    <span class="${getBubbleClass(stats.total)}" style="${getBubbleStyle(stats.total)}">${stats.total}</span>
                    <span class="stat-type">Total</span>
                </div>
            `;

            row.appendChild(statsContainer);

            habitsGrid.appendChild(row);
        });
    }

    function renderSummaryRow() {
        const row = document.createElement('div');
        row.className = 'summary-row';

        const sidebar = document.createElement('div');
        sidebar.className = 'summary-sidebar';
        sidebar.textContent = 'TOTAL';
        row.appendChild(sidebar);

        const daysContainer = document.createElement('div');
        daysContainer.className = 'summary-days';

        const dates = getMonthDates();

        dates.forEach(date => {
            const dateKey = date.toISOString().split('T')[0];
            // Calculate total for this day
            let count = 0;
            habits.forEach(h => {
                if (h.history && h.history[dateKey]) count++;
            });

            const cell = document.createElement('div');
            cell.className = 'summary-cell';
            cell.textContent = count > 0 ? count : '';
            if (count > 0) {
                // Determine opacity based on count? 
                // Or just bold. Current css is opacity 0.7
                cell.style.opacity = Math.min(0.4 + (count * 0.1), 1);
            }
            daysContainer.appendChild(cell);
        });

        row.appendChild(daysContainer);
        // Add empty spacer for stats column in summary row?
        // Stats container is fixed width 180px + sticky.
        // We probably need a filler div to match the layout
        const spacer = document.createElement('div');
        spacer.className = 'stats-container'; // Reuse class for width but no borders/bg maybe
        spacer.style.background = 'transparent';
        spacer.style.border = 'none';
        spacer.style.boxShadow = 'none';
        row.appendChild(spacer);

        habitsGrid.appendChild(row);
    }

    function handleMobileScroll() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            setTimeout(() => {
                const todayEl = document.querySelector('.date-col.today');
                if (todayEl) {
                    // User request: "start from todays date and i scroll to get to streak column"
                    // Meaning align Left to Today
                    const scrollLeft = todayEl.offsetLeft - (datesScrollArea.clientWidth / 2) + (todayEl.clientWidth / 2);
                    // Or simpler: todayEl.offsetLeft - 160 (sidebar width) if we want it flush left?
                    // Let's center it for now, it's safer.
                    // Actually, "start from today" -> Today is the first visible column?
                    // Then scrollLeft = todayEl.offsetLeft - sidebarWidth? No, date-col is inside dates-scroll-area which starts after sidebar.
                    // datesScrollArea starts 'x' pixels from left.
                    // The 'offsetLeft' is relative to offsetParent. 
                    // Let's try centering first.

                    datesScrollArea.scrollLeft = todayEl.offsetLeft - 16;
                    habitsGrid.scrollLeft = datesScrollArea.scrollLeft;
                }
            }, 100);
        }
    }

    function saveData() {
        localStorage.setItem('everyday_habits', JSON.stringify(habits));
    }

    function createHabit() {
        const name = habitNameInput.value.trim();
        if (!name) return;

        const newHabit = {
            id: Date.now().toString(),
            name: name,
            color: selectedColor,
            history: {}
        };

        habits.push(newHabit);
        saveData();
        renderBoard(); // Full re-render
        closeModal();
        habitNameInput.value = '';
    }

    function openModal() {
        addModal.classList.add('open');
        habitNameInput.focus();
    }
    function closeModal() {
        addModal.classList.remove('open');
    }

    function setupEventListeners() {
        datesScrollArea.addEventListener('scroll', () => {
            habitsGrid.scrollLeft = datesScrollArea.scrollLeft;
        });

        habitsGrid.addEventListener('scroll', () => {
            if (datesScrollArea.scrollLeft !== habitsGrid.scrollLeft) {
                datesScrollArea.scrollLeft = habitsGrid.scrollLeft;
            }
        });

        // Navigation
        prevMonthBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() - 1);
            renderBoard();
        });

        nextMonthBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() + 1);
            renderBoard();
        });

        addHabitBtn.addEventListener('click', openModal);
        closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
        addModal.addEventListener('click', (e) => { if (e.target === addModal) closeModal(); });
        saveHabitBtn.addEventListener('click', createHabit);
        habitNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') createHabit(); });
    }

    init();
});
