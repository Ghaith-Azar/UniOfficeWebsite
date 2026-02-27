/* =============================================
   DATA — PSUTOffices Faculty Directory
   Integrated with Gun.js for Zero-Config Real-time Sync
   ============================================= */

// Gun.js initialization (using public relay peers)
const gun = typeof Gun !== 'undefined' ? Gun([
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
    'https://gun-eu.herokuapp.com/gun'
]) : null;

// Unique "Secret Key" for your data - change this to something unique if you want a private instance
const DATA_KEY = 'psut_offices_shared_data_v1';

const DEFAULT_FACULTY = [
    {
        id: 1,
        name: "Dr. Sarah Mitchell",
        title: "Professor",
        department: "Mechanical Engineering",
        school: "Engineering",
        office: "ENG-204",
        floor: 2,
        building: "Engineering Hall",
        email: "s.mitchell@psut.edu.jo",
        officeHours: "Mon & Wed 10:00–12:00"
    },
    {
        id: 2,
        name: "Dr. James Chen",
        title: "Associate Professor",
        department: "Computer Science",
        school: "Information Technology",
        office: "IT-312",
        floor: 3,
        building: "Tech Center",
        email: "j.chen@psut.edu.jo",
        officeHours: "Tue & Thu 14:00–16:00"
    },
    {
        id: 3,
        name: "Prof. Linda Okafor",
        title: "Professor",
        department: "Finance",
        school: "Business",
        office: "BUS-105",
        floor: 1,
        building: "Commerce Building",
        email: "l.okafor@psut.edu.jo",
        officeHours: "Wed 09:00–11:00"
    },
    {
        id: 4,
        name: "Dr. Ahmed Al-Rashid",
        title: "Senior Lecturer",
        department: "Electrical Engineering",
        school: "Engineering",
        office: "ENG-418",
        floor: 4,
        building: "Engineering Hall",
        email: "a.alrashid@psut.edu.jo",
        officeHours: "Mon & Fri 13:00–15:00"
    },
    {
        id: 5,
        name: "Dr. Emily Rosenberg",
        title: "Assistant Professor",
        department: "Data Science",
        school: "Information Technology",
        office: "IT-210",
        floor: 2,
        building: "Tech Center",
        email: "e.rosenberg@psut.edu.jo",
        officeHours: "Tue 10:00–12:00, Thu 14:00–15:00"
    },
    {
        id: 6,
        name: "Prof. Michael Torres",
        title: "Professor",
        department: "Marketing",
        school: "Business",
        office: "BUS-302",
        floor: 3,
        building: "Commerce Building",
        email: "m.torres@psut.edu.jo",
        officeHours: "Mon & Wed 11:00–13:00"
    },
    {
        id: 7,
        name: "Dr. Priya Sharma",
        title: "Lecturer",
        department: "Civil Engineering",
        school: "Engineering",
        office: "ENG-115",
        floor: 1,
        building: "Engineering Hall",
        email: "p.sharma@psut.edu.jo",
        officeHours: "Thu 09:00–11:00"
    },
    {
        id: 8,
        name: "Dr. Robert Nakamura",
        title: "Professor",
        department: "Cybersecurity",
        school: "Information Technology",
        office: "IT-405",
        floor: 4,
        building: "Tech Center",
        email: "r.nakamura@psut.edu.jo",
        officeHours: "Mon 14:00–16:00, Wed 10:00–11:00"
    },
    {
        id: 9,
        name: "Prof. Diana Kowalski",
        title: "Associate Professor",
        department: "Accounting",
        school: "Business",
        office: "BUS-210",
        floor: 2,
        building: "Commerce Building",
        email: "d.kowalski@psut.edu.jo",
        officeHours: "Tue & Thu 09:00–11:00"
    },
    {
        id: 10,
        name: "Dr. Hassan Youssef",
        title: "Senior Lecturer",
        department: "Software Engineering",
        school: "Information Technology",
        office: "IT-118",
        floor: 1,
        building: "Tech Center",
        email: "h.youssef@psut.edu.jo",
        officeHours: "Fri 10:00–14:00"
    },
    {
        id: 11,
        name: "Prof. Catherine Dubois",
        title: "Professor",
        department: "Physics",
        school: "Sciences",
        office: "SCI-301",
        floor: 3,
        building: "Science Complex",
        email: "c.dubois@psut.edu.jo",
        officeHours: "Mon & Wed 09:00–10:30"
    },
    {
        id: 12,
        name: "Dr. William Park",
        title: "Associate Professor",
        department: "Mathematics",
        school: "Sciences",
        office: "SCI-205",
        floor: 2,
        building: "Science Complex",
        email: "w.park@psut.edu.jo",
        officeHours: "Tue 13:00–15:00, Thu 10:00–11:30"
    },
    {
        id: 13,
        name: "Dr. Olivia Bennett",
        title: "Lecturer",
        department: "Graphic Design",
        school: "Arts",
        office: "ART-102",
        floor: 1,
        building: "Arts Pavilion",
        email: "o.bennett@psut.edu.jo",
        officeHours: "Wed & Fri 11:00–13:00"
    },
    {
        id: 14,
        name: "Prof. David Washington",
        title: "Professor",
        department: "Creative Writing",
        school: "Arts",
        office: "ART-308",
        floor: 3,
        building: "Arts Pavilion",
        email: "d.washington@psut.edu.jo",
        officeHours: "Mon 15:00–17:00"
    },
    {
        id: 15,
        name: "Dr. Angela Kim",
        title: "Assistant Professor",
        department: "Computer Engineering",
        school: "Engineering",
        office: "ENG-310",
        floor: 3,
        building: "Engineering Hall",
        email: "a.kim@psut.edu.jo",
        officeHours: "Tue & Thu 10:00–12:00"
    }
];

// ---- Data access helpers ----

// Function to fetch faculty once (initial load)
function getFaculty() {
    const stored = localStorage.getItem('psutoffices_faculty');
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { /* fall through */ }
    }
    return [...DEFAULT_FACULTY];
}

// Function to save faculty to Gun.js & localStorage
function saveFaculty(data) {
    // Update local storage for immediate cache
    localStorage.setItem('psutoffices_faculty', JSON.stringify(data));

    // Update Gun.js Shared Graph
    if (gun) {
        // We stringify the list to store it as a single node for simplicity, 
        // as Gun prefers atomic updates for smaller apps
        gun.get(DATA_KEY).put({ list: JSON.stringify(data) });
    }
}

function getNextId(data) {
    return data.length ? Math.max(...data.map(f => f.id)) + 1 : 1;
}

// Seed Gun.js if it's empty
function seedDatabase() {
    if (gun) {
        gun.get(DATA_KEY).once(data => {
            if (!data || !data.list) {
                console.log("Seeding Gun.js with default records...");
                saveFaculty(DEFAULT_FACULTY);
            }
        });
    }
}

// Attempt to seed on load
seedDatabase();

// ---- Admin credentials ----
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'psut2026';
