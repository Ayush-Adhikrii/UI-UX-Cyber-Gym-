const db = require('../firebase'); // Your firebase.js with firebase-admin
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // For password hashing (install with `npm install bcrypt`)
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use env variable or fallback
        pass: process.env.EMAIL_PASS      // Use env variable or fallback
    },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpStore = new Map();


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

const getUserProfile = async (req, res) => {
    try {
        const uid = req.user.uid; // Get user ID from authenticated token
        const userRef = db.ref(`users/${uid}`);
        const snapshot = await userRef.once("value");
        const userData = snapshot.val();

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return user data (excluding sensitive fields like password)
        res.status(200).json({
            gymName: userData.gymName || "",
            address: userData.address || "",
            contact: userData.contact || "",
            email: userData.email || "",
            gymLogo: userData.gymLogo || "", // URL or path to stored image
            registrationDoc: userData.registrationDoc || "",
            govtIdDoc: userData.govtIdDoc || "",
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile", details: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const userRef = db.ref(`users/${uid}`);

        const {
            gymName,
            address,
            contact,
            email,
            password, // Handle password update separately if needed
        } = req.body;

        const gymLogo = req.files?.gymLogo ? req.files.gymLogo[0] : null;
        const registrationDoc = req.files?.registrationDoc ? req.files.registrationDoc[0] : null;
        const govtIdDoc = req.files?.govtIdDoc ? req.files.govtIdDoc[0] : null;

        // Validate inputs (basic checks)
        if (!gymName && !address && !contact && !email && !gymLogo && !registrationDoc && !govtIdDoc && !password) {
            return res.status(400).json({ error: "No updates provided" });
        }

        const updates = {};
        if (gymName) updates.gymName = gymName;
        if (address) updates.address = address;
        if (contact) updates.contact = contact;
        if (email) updates.email = email;

        // Handle file uploads (example using Firebase Storage)
        const storage = admin.storage();
        const bucket = storage.bucket();

        if (gymLogo) {
            const gymLogoPath = `gymLogos/${uid}/${Date.now()}_${gymLogo.originalname}`;
            await bucket.file(gymLogoPath).save(gymLogo.buffer);
            const [gymLogoUrl] = await bucket.file(gymLogoPath).getSignedUrl({ action: 'read', expires: '03-09-2025' });
            updates.gymLogo = gymLogoUrl;
        }

        if (registrationDoc) {
            const regDocPath = `registrationDocs/${uid}/${Date.now()}_${registrationDoc.originalname}`;
            await bucket.file(regDocPath).save(registrationDoc.buffer);
            const [regDocUrl] = await bucket.file(regDocPath).getSignedUrl({ action: 'read', expires: '03-09-2025' });
            updates.registrationDoc = regDocUrl;
        }

        if (govtIdDoc) {
            const govtIdPath = `govtIds/${uid}/${Date.now()}_${govtIdDoc.originalname}`;
            await bucket.file(govtIdPath).save(govtIdDoc.buffer);
            const [govtIdUrl] = await bucket.file(govtIdPath).getSignedUrl({ action: 'read', expires: '03-09-2025' });
            updates.govtIdDoc = govtIdUrl;
        }

        // Handle password update (requires secure hashing, e.g., bcrypt)
        if (password) {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updates.password = hashedPassword;
        }

        await userRef.update(updates);
        res.status(200).json({ message: "Profile updated successfully", data: updates });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Failed to update user profile", details: error.message });
    }
};
// UPDATE

const updatePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).send("Email and new password are required");
    }

    try {
        const gymsRef = db.ref('gyms');
        const snapshot = await get(gymsRef);
        if (snapshot.exists()) {
            const gyms = snapshot.val();
            const gym = Object.values(gyms).find(g => g.email === email);
            if (gym) {
                const gymRef = db.ref(`gyms/${gym.id}`);
                await update(gymRef, { password: newPassword });
                return res.status(200).json({ message: 'Password updated successfully' });
            } else {
                return res.status(404).send("No account found with this email");
            }
        }
        return res.status(404).send("No gyms found");
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).send(error.message);
    }
};
const sendOtp = async (req, res) => {
    transporter.verify(err => {
        if (err) console.error("❌ Mailer error:", err);
        else console.log("📧 Mailer ready");
    });

    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        console.log('Attempting to send OTP to:', email); // Debug log
        const gymsRef = db.ref('gyms');
        const snapshot = await gymsRef.once('value');
        if (!snapshot.exists()) {
            console.log('No gyms found in database');
            return res.status(404).send('No gyms found');
        }

        const gyms = snapshot.val();
        const gym = Object.values(gyms).find(g => g.email === email);

        if (!gym) {
            console.log('No gym found with email:', email);
            return res.status(404).send('No gym found with this email');
        }

        const otp = generateOtp();
        otpStore.set(email, otp); // Store OTP with email
        console.log('Generated OTP:', otp); // Debug log

        const mailOptions = {
            from: 'cybergym98@gmail.com',
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
        };

        // Verify transporter before sending
        // await new Promise((resolve, reject) => {
        // transporter.verify((error, success) => {
        //     if (error) {
        //         console.error('Transporter verification failed:', error);
        //         reject(error);
        //     } else {
        //         console.log('Transporter verified successfully');
        //         resolve(success);
        //     }
        // });
        // });

        // const mailOptions = {
        //     from: process.env.EMAIL_USER || 'your-email@gmail.com',
        //     to: email,
        //     subject: 'Your OTP for Password Reset',
        //     text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
        // };

        console.log('Sending email with options:', mailOptions); // Debug log
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email, 'Message ID:', info.messageId); // Debug log
        res.status(200).json({ message: 'OTP sent successfully', messageId: info.messageId });
    } catch (error) {
        console.error('OTP send error details:', error); // Detailed error log
        if (error.code === 'EAUTH') {
            console.error('Authentication failed: Please check your Gmail credentials or use an App Password if 2FA is enabled.');
        } else if (error.code === 'ESOCKET') {
            console.error('Connection error: Ensure your server can reach Gmail SMTP servers.');
        }
        res.status(500).send('Failed to send OTP');
    }
};

// Forgot Password - Update Password
const forgotPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).send('Email, OTP, and new password are required');
    }

    try {
        const storedOtp = otpStore.get(email);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).send('Invalid or expired OTP');
        }

        const gymsRef = db.ref('gyms');
        const snapshot = await gymsRef.once('value');
        if (snapshot.exists()) {
            const gyms = snapshot.val();
            const gym = Object.values(gyms).find(g => g.email === email);

            if (!gym) {
                return res.status(404).send('No gym found with this email');
            }

            const hashedPassword = newPassword;
            const gymRef = db.ref(`gyms/${gym.id}`);
            await gymRef.update({ password: hashedPassword });

            // Clear OTP after successful use
            otpStore.delete(email);
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(404).send('No gyms found');
        }
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send('Failed to update password');
    }
};

module.exports = {
    addGym,
    getGyms,
    updateGym,
    deleteGym,
    loginGym,
    checkAuth,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    sendOtp,
    forgotPassword
};