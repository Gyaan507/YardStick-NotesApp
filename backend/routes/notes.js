const express = require('express');
const db = require('../db');
const router = express.Router();

// MIDDLEWARE to check note limit for FREE plan
async function checkNoteLimit(req, res, next) {
  const { tenantId } = req.user;
  
  try {
    const tenantRes = await db.query('SELECT plan FROM tenants WHERE id = $1', [tenantId]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }
    const plan = tenantRes.rows[0].plan;

    if (plan === 'PRO') {
      return next();
    }

    const notesRes = await db.query('SELECT COUNT(*) FROM notes WHERE tenant_id = $1', [tenantId]);
    const noteCount = parseInt(notesRes.rows[0].count, 10);

    if (noteCount >= 3) {
      return res.status(403).json({ 
        error: 'Note limit reached. Please upgrade to the Pro plan for unlimited notes.' 
      });
    }

    next();
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
}

// GET /notes - List all notes for the current tenant
router.get('/', async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Note not found or you do not have permission' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// POST /notes - Create a new note
router.post('/', checkNoteLimit, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId, tenantId } = req.user;

    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }

    const { rows } = await db.query(
      'INSERT INTO notes (title, content, user_id, tenant_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content || '', userId, tenantId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// NEW: PUT /notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const { tenantId } = req.user;

    if (!title && !content) {
      return res.status(400).json({ msg: 'Title or content is required to update' });
    }

    const { rows } = await db.query(
      `UPDATE notes 
       SET title = COALESCE($1, title), content = COALESCE($2, content) 
       WHERE id = $3 AND tenant_id = $4 RETURNING *`,
      [title, content, id, tenantId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Note not found or you do not have permission to edit' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// DELETE /notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const deleteOp = await db.query(
      'DELETE FROM notes WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (deleteOp.rowCount === 0) {
        return res.status(404).json({ msg: 'Note not found or you do not have permission' });
    }

    res.json({ msg: 'Note deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;