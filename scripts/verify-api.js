/**
 * scripts/verify-api.js
 * Verifies live queries against TiDB through lib/db.js
 */
const { query } = require('../lib/db');

async function test() {
    console.log('Testing query on TiDB via lib/db connection pool...');
    const rates = await query('SELECT * FROM commission_rates ORDER BY rate DESC');
    console.log('✓ Fetched active commission rates from live TiDB:');
    console.table(rates);
    
    const tables = await query('SHOW TABLES');
    console.log('✓ Verified live tables in TiDB `technexus` database:');
    console.table(tables);
    
    process.exit(0);
}

test().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
