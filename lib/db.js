/**
 * lib/db.js — TiDB Serverless Connection Pool
 * Reuses connection pool across Vercel serverless function invocations.
 */
const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host:     process.env.TIDB_HOST,
            port:     parseInt(process.env.TIDB_PORT || '4000'),
            user:     process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            },
            connectionLimit:    10,
            waitForConnections: true,
            queueLimit:         0,
            enableKeepAlive:    true,
            keepAliveInitialDelay: 0
        });
    }
    return pool;
}

/**
 * Execute a query with optional params.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<Array>} rows
 */
async function query(sql, params = []) {
    const conn = getPool();
    const [rows] = await conn.execute(sql, params);
    return rows;
}

/**
 * Execute a query and return first row or null.
 */
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

module.exports = { query, queryOne, getPool };
