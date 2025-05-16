const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')
      .then(res => {
        console.log("Database connected:", res.rows);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('Error executing test query', err.stack);
      });
  })
  .catch(err => {
    console.error('Could not connect to Postgres', err.stack);
  });


module.exports = pool;
