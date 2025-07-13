const db = require('../firebase');

// CREATE
const addGym = (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const { gymName, address, contact, email, password } = req.body;
    const gymLogo = req.files['gymLogo'] ? req.files['gymLogo'][0].buffer : null;
    const registrationDoc = req.files['registrationDoc'] ? req.files['registrationDoc'][0].buffer : null;
    const govtIdDoc = req.files['govtIdDoc'] ? req.files['govtIdDoc'][0].buffer : null;

    if (!gymName || !address || !contact || !email || !password || !gymLogo || !registrationDoc || !govtIdDoc) {
        return res.status(400).send("Missing required fields");
    }

    const ref = db.ref('gyms').push();
    const gymId = ref.key;

    const newGym = {
        id: gymId,
        gymLogo: gymLogo.toString('base64'),
        gymName,
        address,
        contact,
        email,
        password,
        registrationDoc: registrationDoc.toString('base64'),
        govtIdDoc: govtIdDoc.toString('base64')
    };

    ref.set(newGym)
        .then(() => res.status(201).json(newGym))
        .catch(err => res.status(500).send(err.message));
};

// READ
const getGyms = (req, res) => {
    db.ref('gyms').once('value')
        .then(snapshot => {
            const gyms = [];
            snapshot.forEach(childSnapshot => {
                gyms.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            res.json(gyms);
        })
        .catch(err => res.status(500).send(err.message));
};

// UPDATE
const updateGym = (req, res) => {
    const { id } = req.params;
    const { gymName, address, contact, email, password } = req.body;
    const gymLogo = req.files['gymLogo'] ? req.files['gymLogo'][0].buffer : undefined;
    const registrationDoc = req.files['registrationDoc'] ? req.files['registrationDoc'][0].buffer : undefined;
    const govtIdDoc = req.files['govtIdDoc'] ? req.files['govtIdDoc'][0].buffer : undefined;

    if (!id) return res.status(400).send("Missing gym ID");

    const updates = {};
    if (gymName) updates.gymName = gymName;
    if (address) updates.address = address;
    if (contact) updates.contact = contact;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (gymLogo) updates.gymLogo = gymLogo.toString('base64');
    if (registrationDoc) updates.registrationDoc = registrationDoc.toString('base64');
    if (govtIdDoc) updates.govtIdDoc = govtIdDoc.toString('base64');

    db.ref(`gyms/${id}`).update(updates)
        .then(() => res.json({ id, ...updates }))
        .catch(err => res.status(500).send(err.message));
};

// DELETE
const deleteGym = (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).send("Missing gym ID");

    db.ref(`gyms/${id}`).remove()
        .then(() => res.status(200).send("Gym deleted"))
        .catch(err => res.status(500).send(err.message));
};

// LOGIN
const loginGym = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }

    db.ref('gyms').orderByChild('email').equalTo(email).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                return res.status(401).send("Invalid email or password");
            }

            let foundGym = null;
            snapshot.forEach(childSnapshot => {
                const gym = childSnapshot.val();
                if (gym.password === password) {
                    foundGym = { id: childSnapshot.key, ...gym };
                    delete foundGym.password; // Remove password from response
                }
            });

            if (!foundGym) {
                return res.status(401).send("Invalid email or password");
            }

            res.status(200).json(foundGym);
        })
        .catch(err => res.status(500).send(err.message));
};

const checkAuth = (req, res) => {
    const { id: gymId } = req.params;
    if (!gymId) {
        return res.status(401).send("Unauthorized: No gym ID provided");
    }

    db.ref(`gyms/${gymId}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                return res.status(401).send("Unauthorized: Gym not found");
            }
            const gym = snapshot.val();
            const gymData = { id: gymId, ...gym };
            delete gymData.password; // Remove password from response
            res.status(200).json(gymData);
        })
        .catch(err => res.status(500).send(err.message));
};

module.exports = {
    addGym,
    getGyms,
    updateGym,
    deleteGym,
    loginGym,
    checkAuth
};