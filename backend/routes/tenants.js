const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware to check if user is an Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Only admins can perform this action.' });
    }
    next();
};

// POST /tenants/:slug/upgrade
router.post('/:slug/upgrade', isAdmin, async (req, res) => {
    try {
        const { slug } = req.params;
        // Security check: ensure the admin belongs to the tenant they are trying to upgrade
        const tenantRes = await db.query('SELECT id FROM tenants WHERE slug = $1', [slug]);
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        if (tenantRes.rows[0].id !== req.user.tenantId) {
            return res.status(403).json({ error: 'Forbidden: You cannot upgrade another tenant.' });
        }

        const { rows } = await db.query(
            "UPDATE tenants SET plan = 'PRO' WHERE slug = $1 RETURNING *",
            [slug]
        );

        res.json({ message: 'Upgrade successful!', tenant: rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;