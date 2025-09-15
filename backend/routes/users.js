const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { z } = require('zod');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admins only.' });
  }
  next();
};

// --- Signup Route ---
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  companyName: z.string().min(2, 'Company name is required'),
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, companyName } = signupSchema.parse(req.body);
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    const tenantRes = await db.query(
      "INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id;",
      [companyName, finalSlug]
    );
    const newTenantId = tenantRes.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserResult = await db.query(
      'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id, role',
      [email, hashedPassword, 'ADMIN', newTenantId]
    );
    const newUser = newUserResult.rows[0];
    const tokenPayload = {
      userId: newUser.id,
      tenantId: newTenantId,
      role: newUser.role,
      tenantName: companyName,
      tenantSlug: finalSlug,
       tenantPlan: 'FREE',
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Invite User Endpoint ---
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

router.post('/invite', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { email, role } = inviteSchema.parse(req.body);
    const inviterTenantId = req.user.tenantId;
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const { rows } = await db.query(
      'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, hashedPassword, role, inviterTenantId]
    );
    res.status(201).json({ message: 'User invited successfully!', user: rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data provided.', details: error.errors });
    }
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;