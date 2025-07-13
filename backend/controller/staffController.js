const db = require('../firebase');

// Add Staff
const addStaff = (req, res) => {
  const { name, gender, email, phoneNumber, post, emergencyContact, relation, image, salary, govId } = req.body;

  if (!name || !gender || !email || !phoneNumber || !post || !emergencyContact || !relation || !image || !salary || !govId) {
    return res.status(400).send('Missing required fields');
  }

  const ref = db.ref('staff').push();
  const staffId = ref.key;

  const newStaff = {
    id: staffId,
    name,
    gender,
    email,
    phoneNumber,
    post,
    emergencyContact,
    relation,
    image, // Expecting base64 or URL
    salary: parseFloat(salary), // Ensure salary is a number
    govId, // Expecting base64 or URL
  };

  ref.set(newStaff)
    .then(() => res.status(201).json(newStaff))
    .catch((err) => res.status(500).send(err.message));
};

// Get All Staff
const getStaff = (req, res) => {
  db.ref('staff').once('value')
    .then((snapshot) => {
      const staff = [];
      snapshot.forEach((childSnapshot) => {
        staff.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      res.json(staff);
    })
    .catch((err) => res.status(500).send(err.message));
};

// Get Absent Staff For Today
const getAbsentStaffForToday = async (req, res) => {
  console.log('here');

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  try {
    // Get all staff
    const staffSnap = await db.ref('staff').once('value');
    const staffList = [];
    staffSnap.forEach((child) => {
      const staff = child.val();
      staffList.push({ id: child.key, ...staff });
    });

    // Get all attendance
    const attendanceSnap = await db.ref('attendance/staff').once('value');
    const attendanceData = attendanceSnap.val() || {};

    // Collect present staff IDs
    const presentIds = new Set();
    Object.entries(attendanceData).forEach(([staffId, dates]) => {
      if (dates && dates[currentDate]) {
        presentIds.add(staffId);
      }
    });

    // Debugging logs
    console.log('Total Staff:', staffList.length);
    console.log('Present IDs:', [...presentIds]);

    // Filter absent staff
    const absentStaff = staffList.filter((staff) => !presentIds.has(staff.id));
    console.log('Absent Staff:', absentStaff.map((s) => s.name));

    res.json(absentStaff);
  } catch (err) {
    console.error('Error in getAbsentStaffForToday:', err);
    res.status(500).send(err.message);
  }
};

// Get Single Staff By ID
const getStaffById = (req, res) => {
  const { id } = req.params;

  db.ref(`staff/${id}`).once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        return res.status(404).send('Staff not found');
      }
      res.json({ id, ...snapshot.val() });
    })
    .catch((err) => res.status(500).send(err.message));
};

// Update Staff
const updateStaff = (req, res) => {
  const { id } = req.params;
  const { name, gender, email, phoneNumber, post, emergencyContact, relation, image, salary, govId } = req.body;

  if (!id) return res.status(400).send('Missing staff ID');

  const updates = {};
  if (name) updates.name = name;
  if (gender) updates.gender = gender;
  if (email) updates.email = email;
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (post) updates.post = post;
  if (relation) updates.relation = relation;
  if (emergencyContact) updates.emergencyContact = emergencyContact;
  if (image) updates.image = image; // Expecting base64 or URL
  if (salary) updates.salary = parseFloat(salary);
  if (govId) updates.govId = govId; // Expecting base64 or URL

  db.ref(`staff/${id}`).update(updates)
    .then(() => res.json({ id, ...updates }))
    .catch((err) => res.status(500).send(err.message));
};

// Delete Staff
const deleteStaff = (req, res) => {
  const { id } = req.params;
  console.log(id);

  db.ref(`staff/${id}`).remove()
    .then(() => res.status(200).send(`Staff ${id} deleted successfully`))
    .catch((err) => res.status(500).send(err.message));
};

// Mark Staff Attendance
const markStaffAttendance = (req, res) => {
  console.log('attendance');
  const { staffId } = req.body;

  if (!staffId) {
    return res.status(400).send('Missing required field: staffId');
  }

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  db.ref(`attendance/staff/${staffId}/${currentDate}`).set(true)
    .then(() => res.status(200).send('Attendance marked'))
    .catch((err) => res.status(500).send(err.message));
};

// Get All Staff Attendance
const getAllStaffAttendance = (req, res) => {
  db.ref('attendance/staff').once('value')
    .then((snapshot) => {
      const attendance = snapshot.val() || {};
      res.json(attendance);
    })
    .catch((err) => res.status(500).send(err.message));
};

// Get Attendance By Staff ID
const getStaffAttendanceById = (req, res) => {
  const { staffId } = req.params;

  db.ref(`attendance/staff/${staffId}`).once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        return res.status(404).send('No attendance record found for this staff');
      }
      res.json(snapshot.val());
    })
    .catch((err) => res.status(500).send(err.message));
};

module.exports = {
  addStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  markStaffAttendance,
  getAllStaffAttendance,
  getStaffAttendanceById,
  getAbsentStaffForToday,
};