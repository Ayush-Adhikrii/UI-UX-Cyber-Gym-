const db = require('../firebase');

const createMembership = async (req, res) => {
    const { clientId, startDate, endDate, paymentAmount } = req.body;
    if (!clientId || !startDate || !paymentAmount) {
        return res.status(400).send("Missing required fields: clientId, startDate, paymentAmount");
    }

    // Sanitize version by replacing '.' with '_' and removing 'Z'
    const rawVersion = new Date().toISOString();
    const version = rawVersion.replace(/\./g, '_').replace('Z', ''); // e.g., 2025-07-10T16:26:09_665
    const membershipData = {
        clientId,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        paymentAmount: parseFloat(paymentAmount),
        status: "active",
        createdAt: new Date().toISOString(),
    };

    try {
        await db.ref(`memberships/${clientId}/${version}`).set(membershipData);
        await db.ref(`paymentHistory/${clientId}/${version}`).set({
            membershipVersion: version,
            amount: parseFloat(paymentAmount),
            paymentDate: new Date().toISOString(),
            status: "paid",
        });
        res.status(201).send("Membership created");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateMembership = async (req, res) => {
    const { clientId, startDate, endDate, paymentAmount } = req.body;
    if (!clientId || !startDate || !paymentAmount) {
        return res.status(400).send("Missing required fields: clientId, startDate, paymentAmount");
    }

    try {
        // Fetch the latest active membership
        const snapshot = await db.ref(`memberships/${clientId}`).orderByChild("endDate").equalTo(null).once('value');
        const latestMembership = snapshot.val();

        if (!latestMembership) {
            return res.status(404).send("No active membership found");
        }

        const oldVersion = Object.keys(latestMembership)[0];
        const oldData = latestMembership[oldVersion];

        // Update the old version to mark as expired
        const newStartDate = new Date(startDate).toISOString();
        await db.ref(`memberships/${clientId}/${oldVersion}`).update({
            endDate: new Date(newStartDate).setDate(new Date(newStartDate).getDate() - 1),
            status: "expired",
        });

        // Sanitize new version
        const newVersion = new Date().toISOString().replace(/\./g, '_').replace('Z', '');
        const newMembershipData = {
            clientId,
            startDate: newStartDate,
            endDate: endDate ? new Date(endDate).toISOString() : null,
            paymentAmount: parseFloat(paymentAmount),
            status: "active",
            createdAt: new Date().toISOString(),
        };
        await db.ref(`memberships/${clientId}/${newVersion}`).set(newMembershipData);

        // Log new payment if amount changed
        if (parseFloat(paymentAmount) !== oldData.paymentAmount) {
            await db.ref(`paymentHistory/${clientId}/${newVersion}`).set({
                membershipVersion: newVersion,
                amount: parseFloat(paymentAmount),
                paymentDate: new Date().toISOString(),
                status: "paid",
            });
        }

        res.status(200).send("Membership updated");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getCurrentMembership = async (req, res) => {
    console.log("current member");
    const { clientId } = req.params;
    if (!clientId) {
        return res.status(400).send("Missing required field: clientId");
    }

    try {
        const snapshot = await db.ref(`memberships/${clientId}`).orderByChild("endDate").equalTo(null).once('value');
        const currentMembership = snapshot.val();

        if (!currentMembership) {
            return res.status(404).send("No active membership found");
        }

        const version = Object.keys(currentMembership)[0];
        res.status(200).json(currentMembership[version]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getMembershipHistory = async (req, res) => {
    const { clientId } = req.params;
    if (!clientId) {
        return res.status(400).send("Missing required field: clientId");
    }

    try {
        const snapshot = await db.ref(`memberships/${clientId}`).once('value');
        const history = snapshot.val() || {};
        res.status(200).json(Object.values(history));
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    createMembership,
    updateMembership,
    getCurrentMembership,
    getMembershipHistory,
};