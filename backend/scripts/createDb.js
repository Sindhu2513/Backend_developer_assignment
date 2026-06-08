const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  // Parse out the target database and point to the default 'postgres' database
  const lastSlashIndex = dbUrl.lastIndexOf('/');
  const baseUri = dbUrl.substring(0, lastSlashIndex);
  const postgresDbUrl = `${baseUri}/postgres`;

  console.log('Connecting to default postgres database...');
  const client = new Client({
    connectionString: postgresDbUrl
  });

  try {
    await client.connect();
    
    // Check if the database already exists
    const checkRes = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'primetrade_db'"
    );
    
    if (checkRes.rows.length === 0) {
      console.log("Database 'primetrade_db' not found. Spawning database...");
      // CREATE DATABASE cannot run in a transaction, pg client handles this perfectly
      await client.query('CREATE DATABASE primetrade_db;');
      console.log("Database 'primetrade_db' created successfully!");
    } else {
      console.log("Database 'primetrade_db' already exists.");
    }
  } catch (error) {
    console.error('Error during database check/creation:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
