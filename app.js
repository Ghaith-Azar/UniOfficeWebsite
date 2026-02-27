/* =============================================
   APP.JS — Public Directory Logic (PSUTOffices)
   ============================================= */

(function () {
    'use strict';

    // State
    let faculty = getFaculty();
    let activeSchool = 'all';
    let activeFloor = 'all';
    let searchQuery = '';
    let viewMode = 'cards'; // 'cards' or 'table'

    // DOM
    const grid = document.getElementById('cardsGrid');
    const publicTableWrap = document.getElementById('publicTableWrap');
    const publicTableBody = document.getElementById('publicTableBody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const schoolFilters = document.getElementById('schoolFilters');
    const floorFilters = document.getElementById('floorFilters');
    const resultsCount = document.getElementById('resultsCount');
    const viewToggle = document.getElementById('viewToggle');

    // ---- Initialise ----
    init();

    function init() {
        buildFilterPills();
        renderView();

        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderView();
        });

        // View toggle
        viewToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;
            viewMode = btn.dataset.view;
            viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderView();
        });
    }

    // ---- Build dynamic filter pills ----
    function buildFilterPills() {
        const schools = [...new Set(faculty.map(f => f.school))].sort();
        schools.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'pill';
            btn.dataset.school = s;
            btn.textContent = s;
            schoolFilters.appendChild(btn);
        });

        const floors = [...new Set(faculty.map(f => f.floor))].sort((a, b) => a - b);
        floors.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'pill';
            btn.dataset.floor = f;
            btn.textContent = `Floor ${f}`;
            floorFilters.appendChild(btn);
        });

        schoolFilters.addEventListener('click', (e) => {
            if (!e.target.classList.contains('pill')) return;
            activeSchool = e.target.dataset.school;
            setActivePill(schoolFilters, e.target);
            renderView();
        });

        floorFilters.addEventListener('click', (e) => {
            if (!e.target.classList.contains('pill')) return;
            activeFloor = e.target.dataset.floor;
            setActivePill(floorFilters, e.target);
            renderView();
        });
    }

    function setActivePill(container, active) {
        container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        active.classList.add('active');
    }

    // ---- Filter ----
    function getFiltered() {
        return faculty.filter(f => {
            const matchSchool = activeSchool === 'all' || f.school === activeSchool;
            const matchFloor = activeFloor === 'all' || String(f.floor) === String(activeFloor);
            const matchSearch = !searchQuery ||
                f.name.toLowerCase().includes(searchQuery) ||
                f.email.toLowerCase().includes(searchQuery) ||
                f.office.toLowerCase().includes(searchQuery) ||
                f.title.toLowerCase().includes(searchQuery) ||
                f.school.toLowerCase().includes(searchQuery) ||
                (f.department && f.department.toLowerCase().includes(searchQuery));
            return matchSchool && matchFloor && matchSearch;
        });
    }

    // ---- Render (dispatches to cards or table) ----
    function renderView() {
        const filtered = getFiltered();

        if (filtered.length === 0) {
            grid.style.display = 'none';
            publicTableWrap.style.display = 'none';
            emptyState.style.display = 'block';
            resultsCount.textContent = 'No results found';
            return;
        }

        emptyState.style.display = 'none';
        resultsCount.textContent = filtered.length === faculty.length
            ? `Showing all ${faculty.length} faculty members`
            : `Showing ${filtered.length} of ${faculty.length} faculty members`;

        if (viewMode === 'cards') {
            grid.style.display = '';
            publicTableWrap.style.display = 'none';
            grid.innerHTML = filtered.map((f, i) => createCard(f, i)).join('');
        } else {
            grid.style.display = 'none';
            publicTableWrap.style.display = '';
            publicTableBody.innerHTML = filtered.map(f => createTableRow(f)).join('');
        }
    }

    // ---- Card ----
    function createCard(f, index) {
        const schoolSlug = f.school.toLowerCase().replace(/\s+/g, '-');
        const initials = f.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
            .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        return `
        <article class="faculty-card" style="animation-delay:${index * .06}s">
            <div class="card-header">
                <div class="card-avatar school-${schoolSlug}">${initials}</div>
                <div>
                    <div class="card-name">${esc(f.name)}</div>
                    <div class="card-title">${esc(f.title)}</div>
                </div>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <div class="detail-icon">🏫</div>
                    <div>
                        <div class="detail-label">School</div>
                        <span class="school-badge ${schoolSlug}">${esc(f.school)}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">📚</div>
                    <div>
                        <div class="detail-label">Department</div>
                        <div class="detail-value">${esc(f.department || '—')}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">🚪</div>
                    <div>
                        <div class="detail-label">Office</div>
                        <div class="detail-value">${esc(f.office)} · ${esc(f.building)}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">📍</div>
                    <div>
                        <div class="detail-label">Floor</div>
                        <div class="detail-value">Floor ${f.floor}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">✉️</div>
                    <div>
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${esc(f.email)}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon">🕐</div>
                    <div>
                        <div class="detail-label">Office Hours</div>
                        <div class="detail-value">${esc(f.officeHours)}</div>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // ---- Table row ----
    function createTableRow(f) {
        const schoolSlug = f.school.toLowerCase().replace(/\s+/g, '-');
        return `
        <tr>
            <td class="faculty-name-cell">${esc(f.name)}</td>
            <td>${esc(f.department || '—')}</td>
            <td><span class="school-badge ${schoolSlug}">${esc(f.school)}</span></td>
            <td>${esc(f.office)}</td>
            <td>${f.floor}</td>
            <td>${esc(f.building)}</td>
            <td>${esc(f.email)}</td>
            <td>${esc(f.officeHours)}</td>
        </tr>`;
    }

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

})();
