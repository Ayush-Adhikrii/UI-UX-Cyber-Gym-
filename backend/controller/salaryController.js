const db = require('../firebase');

const addOrUpdateSalary = (req, res) => {
    const { staffId, date, paidAmount } = req.body;


    if (!staffId || !date || !paidAmount) {
        return res.status(400).send('Missing required fields: staffId, date, or paidAmount');
    }

    // Validate date format (yyyy-mm)
    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).send('Invalid date format. Use yyyy-mm');
    }

    // Fetch existing salary data
    db.ref(`salaries/${staffId}/${date}`).once('value')
        .then((snapshot) => {
            let currentPaidAmount = 0;
            if (snapshot.exists()) {
                currentPaidAmount = snapshot.val().paidAmount || 0;
            }
            const newPaidAmount = currentPaidAmount + parseFloat(paidAmount);

            const salaryData = {
                staffId,
                date,
                paidAmount: newPaidAmount,
            };

            return db.ref(`salaries/${staffId}/${date}`).set(salaryData)
                .then(() => ({
                    staffId,
                    date,
                    paidAmount: newPaidAmount,
                }));
        })
        .then((responseData) => res.status(201).json(responseData))
        .catch((err) => {
            console.error('Error in addOrUpdateSalary:', err);
            res.status(500).send(err.message);
        });
};

const getSalaryByStaffIdAndDate = (req, res) => {
    const { staffId, year, month } = req.params;

    if (!staffId || !year || !month) {
        return res.status(400).send('Missing required parameters: staffId, year, or month');
    }

    const date = `${year}-${String(month).padStart(2, '0')}`;
    db.ref(`salaries/${staffId}/${date}`).once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                return res.status(200).json({ paidAmount: 0 }); // Default to 0 if no data
            }
            res.json(snapshot.val());
        })
        .catch((err) => res.status(500).send(err.message));
};

const getAllSalaries = (req, res) => {
    db.ref('salaries').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                return res.status(200).json([]); // Return empty array if no data
            }
            const salaries = [];
            snapshot.forEach((childSnapshot) => {
                const staffId = childSnapshot.key;
                childSnapshot.forEach((dateSnapshot) => {
                    salaries.push({
                        staffId,
                        date: dateSnapshot.key,
                        ...dateSnapshot.val(),
                    });
                });
            });
            res.status(200).json(salaries);
        })
        .catch((err) => res.status(500).send(err.message));
};

module.exports = {
    addOrUpdateSalary,
    getSalaryByStaffIdAndDate,
    getAllSalaries,
};