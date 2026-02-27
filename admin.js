/* =============================================
   ADMIN.JS — Admin Panel Logic (PSUTOffices)
   ============================================= */

(function () {
    'use strict';

    // ============ LOGIN GATE ============
    const loginOverlay = document.getElementById('loginOverlay');
    const adminContent = document.getElementById('adminContent');
    const loginUserInput = document.getElementById('loginUser');
    const loginPassInput = document.getElementById('loginPass');
    const loginError = document.getElementById('loginError');
    const btnLogin = document.getElementById('btnLogin');

    // Check session
    if (sessionStorage.getItem('psut_admin_auth') === 'true') {
        showAdmin();
    }

    btnLogin.addEventListener('click', handleLogin);
    loginPassInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    loginUserInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginPassInput.focus();
    });

    function handleLogin() {
        const user = loginUserInput.value.trim();
        const pass = loginPassInput.value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem('psut_admin_auth', 'true');
            showAdmin();
        } else {
            loginError.style.display = 'block';
            loginPassInput.value = '';
            loginPassInput.focus();
        }
    }

    function showAdmin() {
        loginOverlay.style.display = 'none';
        adminContent.style.display = '';
        initAdmin();
    }

    // ============ ADMIN CRUD ============

    let faculty;
    let editingId = null;
    let adminInitialised = false;

    function initAdmin() {
        if (adminInitialised) return;
        adminInitialised = true;

        faculty = getFaculty();

        const tableBody = document.getElementById('tableBody');
        const tableCount = document.getElementById('tableCount');
        const formTitle = document.getElementById('formTitle');
        const btnSave = document.getElementById('btnSave');
        const btnCancel = document.getElementById('btnCancel');
        const toastContainer = document.getElementById('toastContainer');

        const fields = {
            name: document.getElementById('fName'),
            title: document.getElementById('fTitle'),
            department: document.getElementById('fDepartment'),
            school: document.getElementById('fSchool'),
            office: document.getElementById('fOffice'),
            floor: document.getElementById('fFloor'),
            building: document.getElementById('fBuilding'),
            email: document.getElementById('fEmail'),
            hours: document.getElementById('fHours'),
        };

        renderTable();

        // --- Gun.js Real-time Listener (Admin Sync) ---
        if (gun) {
            gun.get(DATA_KEY).on((data) => {
                if (data && data.list) {
                    try {
                        faculty = JSON.parse(data.list);
                        renderTable();
                    } catch (e) { console.error("Gun data parse error", e); }
                }
            });
        }

        btnSave.addEventListener('click', handleSave);
        btnCancel.addEventListener('click', cancelEdit);

        function renderTable() {
            tableCount.textContent = `${faculty.length} entries`;
            tableBody.innerHTML = faculty.map(f => `
                <tr>
                    <td class="faculty-name-cell">${esc(f.name)}</td>
                    <td>${esc(f.department || '—')}</td>
                    <td><span class="school-badge ${f.school.toLowerCase().replace(/\s+/g, '-')}">${esc(f.school)}</span></td>
                    <td>${esc(f.office)}</td>
                    <td>${f.floor}</td>
                    <td>${esc(f.email)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" onclick="editFaculty(${f.id})" title="Edit">✏️</button>
                            <button class="btn-icon delete" onclick="deleteFaculty(${f.id})" title="Delete">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function handleSave() {
            const data = {
                name: fields.name.value.trim(),
                title: fields.title.value.trim(),
                department: fields.department.value.trim(),
                school: fields.school.value,
                office: fields.office.value.trim(),
                floor: parseInt(fields.floor.value, 10) || 1,
                building: fields.building.value.trim(),
                email: fields.email.value.trim(),
                officeHours: fields.hours.value.trim(),
            };

            if (!data.name || !data.school || !data.office || !data.email) {
                showToast('Please fill in Name, School, Office, and Email.', 'error');
                return;
            }

            if (editingId !== null) {
                faculty = faculty.map(f => f.id === editingId ? { ...f, ...data } : f);
                showToast(`${data.name} updated successfully!`, 'success');
            } else {
                data.id = getNextId(faculty);
                faculty.push(data);
                showToast(`${data.name} added successfully!`, 'success');
            }

            saveFaculty(faculty);
            renderTable();
            cancelEdit();
        }

        window.editFaculty = function (id) {
            const f = faculty.find(x => x.id === id);
            if (!f) return;

            editingId = id;
            formTitle.textContent = 'Edit Faculty';
            btnSave.innerHTML = '💾 Update';
            btnCancel.style.display = '';

            fields.name.value = f.name || '';
            fields.title.value = f.title || '';
            fields.department.value = f.department || '';
            fields.school.value = f.school || '';
            fields.office.value = f.office || '';
            fields.floor.value = f.floor || '';
            fields.building.value = f.building || '';
            fields.email.value = f.email || '';
            fields.hours.value = f.officeHours || '';

            document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        window.deleteFaculty = function (id) {
            const f = faculty.find(x => x.id === id);
            if (!f) return;
            if (!confirm(`Delete ${f.name}? This cannot be undone.`)) return;

            faculty = faculty.filter(x => x.id !== id);
            saveFaculty(faculty);
            renderTable();
            showToast(`${f.name} removed.`, 'success');

            if (editingId === id) cancelEdit();
        };

        function cancelEdit() {
            editingId = null;
            formTitle.textContent = 'Add Faculty';
            btnSave.innerHTML = '💾 Save';
            btnCancel.style.display = 'none';
            Object.values(fields).forEach(el => el.value = '');
        }

        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function esc(str) {
            const d = document.createElement('div');
            d.textContent = str || '';
            return d.innerHTML;
        }
    }

})();
