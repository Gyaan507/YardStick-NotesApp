const { Client } = require('pg');
const { hash } = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to the database for seeding!');

    // Clear existing data to prevent duplicates
    await client.query('DELETE FROM users;');
    await client.query('DELETE FROM tenants;');
    console.log('Cleared existing data.');

    // --- Create Tenants ---
    const acmeRes = await client.query(
      "INSERT INTO tenants (name, slug, plan) VALUES ('Acme Inc.', 'acme', 'FREE') RETURNING id;"
    );
    const acmeId = acmeRes.rows[0].id;
    console.log(`Created tenant: Acme Inc. with ID: ${acmeId}`);

    const globexRes = await client.query(
      "INSERT INTO tenants (name, slug, plan) VALUES ('Globex Corporation', 'globex', 'FREE') RETURNING id;"
    );
    const globexId = globexRes.rows[0].id;
    console.log(`Created tenant: Globex Corp. with ID: ${globexId}`);

    // --- Create Users ---
    const hashedPassword = await hash('password', 10);
    console.log('Password hashed.');

    const users = [
      { email: 'admin@acme.test', role: 'ADMIN', tenantId: acmeId },
      { email: 'user@acme.test', role: 'MEMBER', tenantId: acmeId },
      { email: 'admin@globex.test', role: 'ADMIN', tenantId: globexId },
      { email: 'user@globex.test', role: 'MEMBER', tenantId: globexId },
    ];

    for (const user of users) {
      await client.query(
        'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4)',
        [user.email, hashedPassword, user.role, user.tenantId]
      );
      console.log(`Created user: ${user.email}`);
    }

  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    await client.end();
    console.log('Seeding finished. Connection closed.');
  }
}

seedDatabase();