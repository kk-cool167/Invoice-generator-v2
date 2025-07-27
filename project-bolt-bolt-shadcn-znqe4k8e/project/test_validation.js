import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function testValidation() {
  const client = await pool.connect();
  try {
    // Test the exact query from the validation logic
    const authCheck = await client.query(`
      SELECT 
        r.ccompanycode as recipient_company,
        v.ccompanycode as vendor_company,
        r.cname as recipient_name,
        v.cname as vendor_name
      FROM public.recipientmasterdata r, public.vendormasterdata v 
      WHERE r.cid = $1 AND v.cid = $2`,
      [1, 9]
    );
    
    console.log('Validation query result:', authCheck.rows);
    console.log('Row count:', authCheck.rows.length);
    
    // Also test with string values
    const authCheckStr = await client.query(`
      SELECT 
        r.ccompanycode as recipient_company,
        v.ccompanycode as vendor_company,
        r.cname as recipient_name,
        v.cname as vendor_name
      FROM public.recipientmasterdata r, public.vendormasterdata v 
      WHERE r.cid = $1 AND v.cid = $2`,
      ['1', '9']
    );
    
    console.log('Validation query result (string):', authCheckStr.rows);
    console.log('Row count (string):', authCheckStr.rows.length);
    
  } finally {
    client.release();
    await pool.end();
  }
}
testValidation().catch(console.error);