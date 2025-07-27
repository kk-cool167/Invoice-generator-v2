import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DemoERP',
  password: '123()aBc',
  port: 5432,
});

async function checkBankData() {
  const client = await pool.connect();
  try {
    console.log('=== BANKDATA TABLE ===');
    const bankData = await client.query('SELECT * FROM public.bankdata');
    console.log('Bank data count:', bankData.rows.length);
    console.log('Bank data:', bankData.rows);
    
    console.log('\n=== RELVENDORBANK TABLE ===');
    const relData = await client.query('SELECT * FROM public.relvendorbank');
    console.log('Rel table count:', relData.rows.length);
    console.log('Rel data:', relData.rows);
    
    console.log('\n=== VENDOR DATA ===');
    const vendorData = await client.query('SELECT cid, cvendorid, cname FROM public.vendormasterdata LIMIT 3');
    console.log('Vendors:', vendorData.rows);
    
    console.log('\n=== FINAL JOIN TEST (wie Server.js) ===');
    const finalTest = await client.query(`
      SELECT 
        v.cname,
        v.cid as vendor_cid,
        v.cvendorid as vendor_vendorid,
        rb.cvendorid as rel_vendorid,
        rb.cbankid,
        b.cname as bank_name,
        b.ciban,
        b.cbic
      FROM public.vendormasterdata v
      LEFT JOIN public.relvendorbank rb ON rb.cvendorid = v.cid 
      LEFT JOIN public.bankdata b ON b.cid = rb.cbankid
      WHERE v.cid IN ('1', '2', '3')
      ORDER BY v.cname
    `);
    console.log('Final join result:', finalTest.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkBankData().catch(console.error);