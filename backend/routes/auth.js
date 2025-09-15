const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { z } = require('zod');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await db.query(
      `SELECT u.*, t.name as tenant_name, t.slug as tenant_slug 
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user) { return res.status(401).json({ error: 'Invalid email or password' }); }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ error: 'Invalid email or password' }); }
    
    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      tenantName: user.tenant_name,
      tenantSlug: user.tenant_slug,
      tenantPlan: user.tenant_plan,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token });
    
  } catch (error) {
    if (error instanceof z.ZodError) { return res.status(400).json({ error: 'Invalid request body', details: error.errors }); }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;