const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'ahmadite5',
  database: process.env.DB_NAME || 'test',
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
