
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users'); 
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use('/notes', authenticateToken, notesRoutes);
app.use('/tenants', authenticateToken, tenantRoutes);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});