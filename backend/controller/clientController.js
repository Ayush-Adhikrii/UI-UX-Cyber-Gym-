const db = require('../firebase');

const addClient = (req, res) => {
  const { name, gender, email, phoneNumber, address, emergencyContact, image, relation } = req.body;

  if (!name || !gender || !email || !phoneNumber || !address || !emergencyContact || !image || !relation) {
    return res.status(400).send("Missing required fields");
  }

  const ref = db.ref('clients').push();
  const clientId = ref.key;

  const newClient = {
    id: clientId,
    name,
    gender,
    email,
    phoneNumber,
    address,
    emergencyContact,
    image,
    relation
  };

  ref.set(newClient)
    .then(() => res.status(201).json(newClient))
    .catch(err => res.status(500).send(err.message));
};

const getClients = async (req, res) => {
  try {
    const snapshot = await db.ref('clients').once('value');
    const clients = [];
    const promises = [];

    snapshot.forEach(childSnapshot => {
      const client = { id: childSnapshot.key, ...childSnapshot.val() };
      clients.push(client);

      // Queue a promise to fetch the latest membership for this client
      const membershipPromise = db.ref(`memberships/${client.id}`)
        .orderByChild("endDate")
        .equalTo(null)
        .once('value')
        .then(membershipSnapshot => {
          if (membershipSnapshot.exists()) {
            const latestMembership = membershipSnapshot.val();
            const version = Object.keys(latestMembership)[0];
            client.membershipExpiry = latestMembership[version].endDate || null;
          } else {
            // If no active membership, check for the latest expired one with future endDate
            return db.ref(`memberships/${client.id}`)
              .orderByChild("endDate")
              .limitToLast(1)
              .once('value')
              .then(historySnapshot => {
                if (historySnapshot.exists()) {
                  const memberships = historySnapshot.val();
                  const version = Object.keys(memberships)[0];
                  const endDate = memberships[version].endDate;
                  client.membershipExpiry = endDate && new Date(endDate) > new Date()
                    ? new Date(endDate).toISOString().split('T')[0]
                    : null;
                } else {
                  client.membershipExpiry = null;
                }
              });
          }
        });
      promises.push(membershipPromise);
    });

    // Wait for all membership queries to complete
    await Promise.all(promises);
    res.json(clients);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getAbsentClientsForToday = async (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  try {
    // Fetch all clients
    const clientsSnapshot = await db.ref('clients').once('value');
    const allClients = [];
    clientsSnapshot.forEach(child => {
      allClients.push({ id: child.key, ...child.val() });
    });

    // Fetch today's attendance for clients
    const attendanceSnapshot = await db.ref(`attendance/clients`).once('value');
    const attendanceData = attendanceSnapshot.val() || {};

    const presentIds = new Set();
    for (const clientId in attendanceData) {
      if (attendanceData[clientId][currentDate]) {
        presentIds.add(clientId);
      }
    }

    // Filter clients who are not present
    const absentClients = allClients.filter(client => !presentIds.has(client.id));

    res.json(absentClients);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const updateClient = (req, res) => {
  const { id } = req.params;
  const { name, gender, email, phoneNumber, address, emergencyContact, image, relation } = req.body;

  if (!id) return res.status(400).send("Missing client ID");

  const updates = {};
  if (name) updates.name = name;
  if (gender) updates.gender = gender;
  if (email) updates.email = email;
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (address) updates.address = address;
  if (emergencyContact) updates.emergencyContact = emergencyContact;
  if (image) updates.image = image;
  if (relation) updates.relation = relation;

  db.ref(`clients/${id}`).update(updates)
    .then(() => res.json({ id, ...updates }))
    .catch(err => res.status(500).send(err.message));
};

const markAttendance = (req, res) => {
  console.log("attendance");
  const { clientId } = req.body;
  console.log(clientId);

  if (!clientId) {
    return res.status(400).send("Missing required field: clientId");
  }

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  db.ref(`attendance/clients/${clientId}/${currentDate}`).set(true)
    .then(() => res.status(200).send("Attendance marked"))
    .catch(err => res.status(500).send(err.message));
};

const deleteClient = (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send("Missing client ID");

  db.ref(`clients/${id}`).remove()
    .then(() => res.status(200).send("Client deleted"))
    .catch(err => res.status(500).send(err.message));
};



const getDailyAttendance = async (req, res) => {
  console.log('Query:', req.query);
  const { startDate } = req.query;

  if (!startDate) {
    return res.status(400).send("Missing required field: startDate");
  }

  // Validate and parse startDate (expecting YYYY-MM-DD)
  const start = new Date(startDate);
  if (isNaN(start)) {
    return res.status(400).send("Invalid date format. Use YYYY-MM-DD");
  }

  const dateLabels = [];
  const attendanceCounts = {};

  // Collect 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD
    dateLabels.push(key);
    attendanceCounts[key] = 0;
  }

  try {
    const snapshot = await db.ref("attendance/clients").once("value");
    const data = snapshot.val() || {};

    // Count attendance for each date
    for (const clientId in data) {
      const clientAttendance = data[clientId];
      for (const date in clientAttendance) {
        if (dateLabels.includes(date)) {
          attendanceCounts[date] = (attendanceCounts[date] || 0) + 1;
        }
      }
    }

    const result = dateLabels.map(date => ({
      date,
      count: attendanceCounts[date] || 0,
    }));

    console.log("Attendance result:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching daily attendance:", err);
    res.status(500).send("Failed to fetch attendance data");
  }
};



function formatShortDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function formatShortDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

const getAllAttendance = async (req, res) => {
  try {
    const snapshot = await db.ref("attendance/clients").once("value");
    const attendanceData = snapshot.val() || {};
    res.status(200).json(attendanceData);
  } catch (err) {
    console.error("Error fetching all attendance:", err);
    res.status(500).send("Failed to fetch attendance data");
  }
};


const getClientVisitFrequency = async (req, res) => {
  const { month } = req.query; // e.g. "2025-06"

  try {
    // Validate month format
    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(month)) {
      return res.status(400).json({ error: "Invalid month format. Use yyyy-MM" });
    }

    const [year, monthNumStr] = month.split("-");
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(monthNumStr, 10);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0); // Last day of month
    const daysInMonth = endDate.getDate();

    // Initialize counters for each day of week (0=Sun, 1=Mon, ..., 6=Sat)
    const visitsPerDayOfWeek = Array(7).fill(0);
    const countDaysPerDayOfWeek = Array(7).fill(0);

    // Count how many times each weekday appears in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(yearNum, monthNum - 1, day);
      countDaysPerDayOfWeek[dt.getDay()]++;
    }

    // Fetch attendance data from your db
    const attendanceSnapshot = await db.ref("attendance").once("value");
    const attendanceData = attendanceSnapshot.val() || {};

    if (!attendanceData.clients) {
      return res.status(404).json({ error: "No client attendance data found" });
    }

    // For each client and each visit date, sum visits by day of week if in this month
    for (const clientId in attendanceData.clients) {
      const clientVisits = attendanceData.clients[clientId];
      for (const visitDate in clientVisits) {
        if (clientVisits[visitDate] === true) {
          const visitDt = new Date(visitDate);
          if (
            visitDt.getFullYear() === yearNum &&
            visitDt.getMonth() + 1 === monthNum
          ) {
            const dayOfWeek = visitDt.getDay();
            visitsPerDayOfWeek[dayOfWeek]++;
          }
        }
      }
    }

    // Calculate average visits per weekday
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const averages = weekdays.map((dayName, idx) => {
      const countDays = countDaysPerDayOfWeek[idx];
      const totalVisits = visitsPerDayOfWeek[idx];
      const avg = countDays > 0 ? totalVisits / countDays : 0;
      return { day: dayName, average: Math.round(avg) };
    });

    return res.status(200).json(averages);
  } catch (error) {
    console.error("Error in getAverageVisitsByWeekday:", error);
    return res.status(500).json({ error: "Failed to fetch average visits", details: error.message });
  }
};





module.exports = {
  addClient,
  getClients,
  updateClient,
  markAttendance,
  deleteClient,
  getAbsentClientsForToday,
  getDailyAttendance,
  getAllAttendance,
  getClientVisitFrequency
};