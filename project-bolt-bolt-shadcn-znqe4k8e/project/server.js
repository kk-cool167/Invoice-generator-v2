import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/.env' });

console.log('Starting server initialization...');

const app = express();
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    // Don't log sensitive connection details
    console.error('Database connection failed. Check .env configuration.');
    process.exit(1);
  } else {
    console.log('Successfully connected to database');
    done();
  }
});

// Validation Helper Functions
async function validateUnit(unitCode, language, client) {
  const result = await client.query(
    `SELECT COUNT(*) as count FROM public.units 
     WHERE cid = $1 AND clanguage = $2`,
    [unitCode, language]
  );
  return result.rows[0].count > 0;
}

async function validateTaxCode(taxCode, companyCode, client) {
  const result = await client.query(
    `SELECT COUNT(*) as count FROM public.taxcodes 
     WHERE ccode = $1 AND ccompanycode = $2 AND cscenario = 'default'
     AND cvalidfrom <= CURRENT_DATE AND cvalidto >= CURRENT_DATE`,
    [taxCode, companyCode]
  );
  return result.rows[0].count > 0;
}

// Centralized currency management (matches frontend CurrencyManager)
const COMPANY_CURRENCY_MAP = {
  '1000': 'EUR', // Default company
  '2000': 'GBP', // UK company
  '3000': 'CHF'  // Swiss company
};

function getDefaultCurrencyForCompany(companyCode) {
  return COMPANY_CURRENCY_MAP[companyCode] || 'EUR';
}

// Exchange rate cache to avoid repeated database queries
let exchangeRatesCache = new Map();
let lastExchangeRateUpdate = 0;
const EXCHANGE_RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getExchangeRates(client) {
  const now = Date.now();
  if (now - lastExchangeRateUpdate < EXCHANGE_RATE_CACHE_DURATION && exchangeRatesCache.size > 0) {
    return exchangeRatesCache;
  }

  try {
    const result = await client.query(`
      SELECT ccurrency, crate FROM public.exchangerates
      ORDER BY ccurrency
    `);
    
    exchangeRatesCache.clear();
    exchangeRatesCache.set('EUR', 1.0); // EUR as base currency
    
    for (const row of result.rows) {
      exchangeRatesCache.set(row.ccurrency, parseFloat(row.crate));
    }
    
    lastExchangeRateUpdate = now;
    console.log('Exchange rates cached:', Object.fromEntries(exchangeRatesCache));
    return exchangeRatesCache;
  } catch (error) {
    console.error('Failed to load exchange rates:', error);
    // Return fallback rates
    exchangeRatesCache.clear();
    exchangeRatesCache.set('EUR', 1.0);
    exchangeRatesCache.set('GBP', 0.85);
    exchangeRatesCache.set('CHF', 0.95);
    return exchangeRatesCache;
  }
}

function convertCurrency(amount, fromCurrency, toCurrency, exchangeRates) {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = exchangeRates.get(fromCurrency) || 1.0;
  const toRate = exchangeRates.get(toCurrency) || 1.0;
  
  // Convert to EUR first, then to target currency
  const eurAmount = amount / fromRate;
  const convertedAmount = eurAmount * toRate;
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

// API Routes
app.get('/api/v1/articles', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        cid,
        cmaterialnumber,
        cdescription,
        ctype,
        ctaxcode,
        ctaxrate,
        cunit,
        cnetamount,
        ccurrency
      FROM public.materials
      ORDER BY cdescription;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Add POST endpoint for creating a material (article)
app.post('/api/v1/articles', async (req, res) => {
  const client = await pool.connect();
  try {
    const { cmaterialnumber, cdescription, ctaxcode, ctaxrate, cunit, cnetamount, ccurrency, ctype, ccompanycode } = req.body;
    
    // Validation
    if (cunit && !(await validateUnit(cunit, 'de', client))) {
      return res.status(400).json({
        error: 'Invalid unit code',
        details: `Unit '${cunit}' does not exist`
      });
    }

    if (ctaxcode && !(await validateTaxCode(ctaxcode, ccompanycode || '1000', client))) {
      return res.status(400).json({
        error: 'Invalid tax code',
        details: `Tax code '${ctaxcode}' does not exist or is not valid for company ${ccompanycode || '1000'}`
      });
    }
    
    // Set currency based on company code
    let currency = ccurrency;
    if (!currency) {
      const companyCode = ccompanycode || '1000';
      currency = getDefaultCurrencyForCompany(companyCode);
    }

    // Get tax rate from database based on tax code and company code
    let finalTaxRate = ctaxrate; // Use provided tax rate if available
    if (ctaxcode && !finalTaxRate) {
      const taxRateQuery = await client.query(`
        SELECT crate FROM public.taxcodes 
        WHERE ccode = $1 AND (ccompanycode = $2 OR ccompanycode IS NULL)
        ORDER BY ccompanycode DESC LIMIT 1
      `, [ctaxcode, ccompanycode || '1000']);
      
      if (taxRateQuery.rows.length > 0) {
        finalTaxRate = taxRateQuery.rows[0].crate;
        console.log(`Auto-fetched tax rate for ${ctaxcode}: ${finalTaxRate}`);
      } else {
        // Fallback: default tax rate based on company
        const companyCode = ccompanycode || '1000';
        finalTaxRate = companyCode === '2000' ? 0.20 : 0.19; // UK: 20%, DE/CH: 19%
        console.log(`Using fallback tax rate for company ${companyCode}: ${finalTaxRate}`);
      }
    }

    // Get the next available cid for materials
    const maxMaterialCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.materials
    `);
    const nextMaterialCid = maxMaterialCidResult.rows[0].next_id;

    const result = await client.query(
      `INSERT INTO public.materials (
        cid, cmaterialnumber, cdescription, ctaxcode, ctaxrate, 
        cunit, cnetamount, ccurrency, ctype
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nextMaterialCid, cmaterialnumber, cdescription, ctaxcode, finalTaxRate, cunit, cnetamount, currency, ctype]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/v1/articles/:id - Update existing article
app.put('/api/v1/articles/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    // Only update provided fields
    if (updateData.ctype !== undefined) {
      updateFields.push(`ctype = $${valueIndex++}`);
      values.push(updateData.ctype);
    }
    if (updateData.ccurrency !== undefined) {
      updateFields.push(`ccurrency = $${valueIndex++}`);
      values.push(updateData.ccurrency);
    }
    if (updateData.cdescription !== undefined) {
      updateFields.push(`cdescription = $${valueIndex++}`);
      values.push(updateData.cdescription);
    }
    if (updateData.cunit !== undefined) {
      updateFields.push(`cunit = $${valueIndex++}`);
      values.push(updateData.cunit);
    }
    if (updateData.cnetamount !== undefined) {
      updateFields.push(`cnetamount = $${valueIndex++}`);
      values.push(updateData.cnetamount);
    }
    if (updateData.ctaxrate !== undefined) {
      updateFields.push(`ctaxrate = $${valueIndex++}`);
      values.push(updateData.ctaxrate);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const query = `
      UPDATE public.materials 
      SET ${updateFields.join(', ')} 
      WHERE cid = $${valueIndex} 
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get('/api/v1/vendors', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        v.cid,
        v.ccompanycode,
        v.cname,
        v.cstreet,
        v.czip,
        v.ccity,
        v.ccountry,
        v.cpozip,
        v.cvatnumber,
        v.cfon,
        v.curl,
        b.cname as bank_name,
        b.ciban,
        b.cbic
      FROM public.vendormasterdata v
      LEFT JOIN public.relvendorbank rb ON rb.cvendorid = v.cid 
      LEFT JOIN public.bankdata b ON b.cid = rb.cbankid 
      ORDER BY v.cname;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Add POST endpoint for creating a vendor
app.post('/api/v1/vendors', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      ccompanycode,
      cname,
      cstreet,
      czip,
      ccity,
      ccountry,
      cpozip,
      cvatnumber,
      cfon,
      curl,
      bank_name,
      ciban,
      cbic
    } = req.body;
    
    await client.query('BEGIN');

    // Get the next available cid for vendormasterdata
    const maxVendorCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.vendormasterdata
    `);
    const nextVendorCid = maxVendorCidResult.rows[0].next_id;

    // Get the next available cvendorid for vendormasterdata (as string)
    const maxVendorIdResult = await client.query(`
      SELECT COALESCE(MAX(CAST(cvendorid AS INTEGER)), 0) + 1 as next_vendor_id 
      FROM public.vendormasterdata 
      WHERE cvendorid ~ '^[0-9]+$'
    `);
    const nextVendorId = maxVendorIdResult.rows[0].next_vendor_id.toString();

    // Insert vendor into vendormasterdata (with all database fields)
    const vendorResult = await client.query(
      `INSERT INTO public.vendormasterdata 
        (cid, cvendorid, ccompanycode, cname, cname2, cstreet, czip, ccity, ccountry, ccountryoforigin, cpozip, cpobox, cvatnumber, ctaxnumber, cfon, cfax, cemail, curl, ctopid, conetime, calwayswithpo, calwayswithoutpo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING cid`,
      [nextVendorCid, nextVendorId, ccompanycode, cname, null, cstreet, czip, ccity, ccountry, null, cpozip, null, cvatnumber, null, cfon, null, null, curl, 1, 0, 0, 0]
    );
    const vendorId = vendorResult.rows[0].cid;

    // Get the next available cid for bankdata
    const maxBankCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.bankdata
    `);
    const nextBankCid = maxBankCidResult.rows[0].next_id;

    // Get the next available cbankid for bankdata
    const maxBankIdResult = await client.query(`
      SELECT COALESCE(MAX(CAST(cbankid AS INTEGER)), 0) + 1 as next_bank_id 
      FROM public.bankdata 
      WHERE cbankid ~ '^[0-9]+$'
    `);
    const nextBankId = maxBankIdResult.rows[0].next_bank_id.toString();

    // Insert bank data and set up relation
    const bankResult = await client.query(
      `INSERT INTO public.bankdata 
         (cid, cbankid, cname, ciban, cbic)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING cid`,
      [nextBankCid, nextBankId, bank_name, ciban, cbic]
    );
    const bankId = bankResult.rows[0].cid;
    await client.query(
      `INSERT INTO public.relvendorbank (cvendorid, cbankid)
       VALUES ($1, $2)`,
      [nextVendorId, bankId]
    );
    
    await client.query('COMMIT');
    res.status(201).json({ ...req.body, cid: vendorId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating vendor:', error);
    
    // 返回更详细的错误信息
    const errorResponse = {
      error: error.message,
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint
    };
    
    res.status(500).json(errorResponse);
  } finally {
    client.release();
  }
});

app.get('/api/v1/recipients', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        cid,
        crecipientid,
        ccompanycode,
        cname,
        cstreet,
        czip,
        ccity,
        ccountry,
        cfon,
        cemail,
        cvatnumber
      FROM public.recipientmasterdata
      ORDER BY cname;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Add POST endpoint for creating a recipient
app.post('/api/v1/recipients', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      ccompanycode,
      cname,
      cstreet,
      czip,
      ccity,
      ccountry,
      cfon, // Telefon
      cemail, // Email
      cvatnumber, // VAT Nummer direkt in Master Tabelle
      vatNumbers = [], // Array für zusätzliche VAT Nummern in separater Tabelle: [{cvatnumber: "DE123456789"}]
      authorizedVendors = [] // Optional: Array of vendor IDs
    } = req.body;
    
    // Get the next available cid for recipientmasterdata
    const maxRecipientCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.recipientmasterdata
    `);
    const nextRecipientCid = maxRecipientCidResult.rows[0].next_id;
    
    // Auto-generate crecipientid based on company code and cid
    const crecipientid = `${ccompanycode}${nextRecipientCid.toString().padStart(3, '0')}`;
    
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO public.recipientmasterdata
        (cid, crecipientid, ccompanycode, cname, cname2, cstreet, czip, ccity, ccountry, cpozip, cpobox, cfon, cfax, cemail, curl, cvatnumber, ctaxnumber, cmatchcodepos, cmatchcodeneg, ccompanyformanchor, ccompanyformform)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING cid`,
      [nextRecipientCid, crecipientid, ccompanycode, cname, null, cstreet, czip, ccity, ccountry, null, null, cfon, null, cemail, null, cvatnumber, null, null, null, null, null]
    );
    
    const recipientCid = result.rows[0].cid;
    
    // Add additional VAT numbers if provided (recipientvatnumbers table)
    for (const vat of vatNumbers) {
      if (vat.cvatnumber) {
        await client.query(
          `INSERT INTO public.recipientvatnumbers (crecipientid, cvatnumber)
           VALUES ($1, $2)
           ON CONFLICT (crecipientid, cvatnumber) DO NOTHING`,
          [crecipientid, vat.cvatnumber]
        );
      }
    }
    
    // Add vendor relationships if provided
    const addedVendors = [];
    for (const vendorId of authorizedVendors) {
      // Validate vendor exists and get cvendorid
      const vendorCheck = await client.query(
        `SELECT cname, cvendorid FROM public.vendormasterdata WHERE cid = $1`,
        [vendorId]
      );
      
      if (vendorCheck.rows.length > 0) {
        await client.query(
          `INSERT INTO public.relrecipientvendor (crecipientid, cvendorid)
           VALUES ($1, $2)
           ON CONFLICT (crecipientid, cvendorid) DO NOTHING`,
          [crecipientid, vendorCheck.rows[0].cvendorid]
        );
        
        addedVendors.push({
          vendorId: vendorId,
          vendorCode: vendorCheck.rows[0].cvendorid,
          vendorName: vendorCheck.rows[0].cname
        });
      }
    }

    await client.query('COMMIT');
    
    res.status(201).json({ 
      ...req.body, 
      cid: recipientCid,
      authorizedVendors: addedVendors
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating recipient:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Recipient-Vendor Relationship Endpoints

// GET authorized vendors for a recipient
app.get('/api/v1/recipients/:recipientId/vendors', async (req, res) => {
  const client = await pool.connect();
  try {
    const { recipientId } = req.params;
    
    const result = await client.query(`
      SELECT 
        v.cid,
        v.cvendorid,
        v.cname,
        v.ccompanycode,
        v.ccountry
      FROM public.relrecipientvendor rv
      JOIN public.vendormasterdata v ON rv.cvendorid = v.cvendorid
      WHERE rv.crecipientid = $1
      ORDER BY v.cname;
    `, [recipientId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipient vendors:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// POST - Add vendor authorization to recipient
app.post('/api/v1/recipients/:recipientId/vendors', async (req, res) => {
  const client = await pool.connect();
  try {
    const { recipientId } = req.params;
    const { vendorIds } = req.body; // Array of vendor IDs
    
    if (!vendorIds || !Array.isArray(vendorIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'vendorIds must be an array of vendor IDs'
      });
    }

    await client.query('BEGIN');

    // Remove existing relationships
    await client.query(
      `DELETE FROM public.relrecipientvendor WHERE crecipientid = $1`,
      [recipientId]
    );

    // Add new relationships
    const addedVendors = [];
    for (const vendorId of vendorIds) {
      // Check if vendor exists
      const vendorCheck = await client.query(
        `SELECT cid, cvendorid, cname FROM public.vendormasterdata WHERE cid = $1`,
        [vendorId]
      );

      if (vendorCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Vendor not found',
          details: `Vendor with ID ${vendorId} does not exist`
        });
      }

      // Insert relationship
      await client.query(
        `INSERT INTO public.relrecipientvendor (crecipientid, cvendorid)
         VALUES ($1, $2)
         ON CONFLICT (crecipientid, cvendorid) DO NOTHING`,
        [recipientId, vendorCheck.rows[0].cvendorid]
      );

      addedVendors.push({
        vendorId: vendorId,
        vendorCode: vendorCheck.rows[0].cvendorid,
        vendorName: vendorCheck.rows[0].cname
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      recipientId: recipientId,
      authorizedVendors: addedVendors
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error managing recipient-vendor relationships:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/purchase-orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { order, items } = req.body;
    console.log('Received order data:', JSON.stringify(order, null, 2));
    console.log('Received items data:', JSON.stringify(items, null, 2));
    
    // Validate required fields and convert to numbers
    console.log('Raw values before parsing:', { 
      crecipientid: order.crecipientid, 
      cvendorid: order.cvendorid,
      types: {
        recipientType: typeof order.crecipientid,
        vendorType: typeof order.cvendorid
      }
    });
    
    const recipientId = parseInt(order.crecipientid);
    const vendorId = parseInt(order.cvendorid);
    const topId = parseInt(order.ctopid || '1');
    
    console.log('Parsed values:', { recipientId, vendorId, topId });
    console.log('IsNaN checks:', { 
      recipientIsNaN: isNaN(recipientId), 
      vendorIsNaN: isNaN(vendorId) 
    });
    
    if (isNaN(recipientId) || isNaN(vendorId)) {
      return res.status(400).json({ 
        error: 'Invalid recipient or vendor ID', 
        details: { 
          crecipientid: order.crecipientid, 
          cvendorid: order.cvendorid,
          recipientId_parsed: recipientId,
          vendorId_parsed: vendorId
        }
      });
    }
    
    console.log('Parsed IDs:', { recipientId, vendorId, topId });
    
    // Start transaction
    await client.query('BEGIN');
    
    // VALIDATE: Check if recipient and vendor exist (cross-company allowed based on existing PO data)
    const authCheck = await client.query(`
      SELECT 
        r.ccompanycode as recipient_company,
        v.ccompanycode as vendor_company,
        r.cname as recipient_name,
        v.cname as vendor_name
      FROM public.recipientmasterdata r, public.vendormasterdata v 
      WHERE r.cid = $1 AND v.cid = $2`,
      [recipientId, vendorId]
    );
    
    if (authCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'Invalid recipient-vendor combination',
        details: `Recipient ${order.crecipientid} or vendor ${order.cvendorid} not found`
      });
    }
    
    // Determine company code based on recipient ID (much more logical approach)
    const recipientResult = await client.query(
      `SELECT ccompanycode FROM public.recipientmasterdata WHERE cid = $1`,
      [parseInt(order.crecipientid)]
    );
    
    let companyCode = order.ccompanycode; // Fallback to form input
    let exchangeRate = 1;
    
    if (recipientResult.rows.length > 0) {
      companyCode = recipientResult.rows[0].ccompanycode;
      console.log(`Company code set from recipient ID ${order.crecipientid}: ${companyCode}`);
    } else {
      console.log(`No recipient found with ID ${order.crecipientid}, using form company code: ${companyCode}`);
    }

    // Get target currency and exchange rates
    let targetCurrency = getDefaultCurrencyForCompany(companyCode);
    const exchangeRates = await getExchangeRates(client);
    
    console.log(`Target currency for company ${companyCode}: ${targetCurrency}`);

    // Update items with currency conversion if needed
    const updatedItems = items.map(item => {
      const originalCurrency = item.ccurrency || 'EUR';
      let convertedAmount = item.cnetamount;
      
      // Convert amount if currencies differ
      if (originalCurrency !== targetCurrency) {
        convertedAmount = convertCurrency(item.cnetamount, originalCurrency, targetCurrency, exchangeRates);
        console.log(`Converted ${item.cnetamount} ${originalCurrency} to ${convertedAmount} ${targetCurrency}`);
      }
      
      return {
        ...item,
        ccurrency: targetCurrency,
        cnetamount: convertedAmount
      };
    });

    // Generate or validate PO number
    let finalPoNumber = order.cponumber;
    
    // If no PO number provided, generate one based on max existing PO number for company
    if (!finalPoNumber || finalPoNumber.trim() === '') {
      const maxPoResult = await client.query(
        `SELECT COALESCE(MAX(CAST(cponumber AS BIGINT)), 0) + 1 as next_po_number 
         FROM public.pos 
         WHERE ccompanycode = $1 AND cponumber ~ '^[0-9]+$'`,
        [companyCode]
      );
      
      const nextPoNumber = maxPoResult.rows[0].next_po_number;
      finalPoNumber = nextPoNumber.toString().padStart(10, '0');
      console.log(`Generated new PO number: ${finalPoNumber} for company ${companyCode}`);
    }
    
    // Check if PO number already exists and generate a unique one if needed
    let poNumberExists = true;
    let attempts = 0;
    
    while (poNumberExists && attempts < 10) {
      const checkResult = await client.query(
        `SELECT COUNT(*) as count FROM public.pos WHERE cponumber = $1 AND ccompanycode = $2`,
        [finalPoNumber, companyCode]
      );
      
      if (checkResult.rows[0].count == 0) {
        poNumberExists = false;
      } else {
        // Generate new PO number by incrementing
        const baseNumber = parseInt(finalPoNumber, 10) + 1;
        finalPoNumber = baseNumber.toString().padStart(10, '0');
        attempts++;
        console.log(`PO number exists, trying: ${finalPoNumber}`);
      }
    }
    
    if (attempts >= 10) {
      throw new Error('Could not generate unique PO number after 10 attempts');
    }
    
    console.log(`Final PO number: ${finalPoNumber}`);

    // Get the next available cid for pos
    const maxPoCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.pos
    `);
    const nextPoCid = maxPoCidResult.rows[0].next_id;

    // Validate nextPoCid before insertion
    const parsedNextPoCid = parseInt(nextPoCid);
    if (isNaN(parsedNextPoCid)) {
      throw new Error(`Invalid nextPoCid: ${nextPoCid}`);
    }
    
    console.log('About to insert PO with values:', {
      cid: parsedNextPoCid,
      cponumber: finalPoNumber,
      cdate: order.cdate,
      ccompanycode: companyCode,
      crecipientid: recipientId,
      cvendorid: vendorId,
      ctopid: topId
    });
    
    // Insert PO with updated company code and unique PO number
    const poResult = await client.query(
      `INSERT INTO public.pos (cid, cponumber, cdate, ccompanycode, crecipientid, cvendorid, ctopid)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING cid`,
      [
        parsedNextPoCid, 
        finalPoNumber, 
        order.cdate, 
        companyCode, 
        recipientId, 
        vendorId, 
        topId
      ]
    );

    const poId = poResult.rows[0].cid;

    // Get the next available cid for poitems
    const maxPoItemCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.poitems
    `);
    let nextPoItemCid = maxPoItemCidResult.rows[0].next_id;

    // Insert PO items with updated currency and generated cid values
    const insertedItems = [];
    for (const item of updatedItems) {
      // Validate unit and tax code for each item
      if (item.cunit && !(await validateUnit(item.cunit, 'de', client))) {
        throw new Error(`Invalid unit code: ${item.cunit} for item ${item.cpoitemnumber}`);
      }

      if (item.ctaxcode && !(await validateTaxCode(item.ctaxcode, companyCode, client))) {
        throw new Error(`Invalid tax code: ${item.ctaxcode} for item ${item.cpoitemnumber}`);
      }

      const itemResult = await client.query(
        `INSERT INTO public.poitems (
          cid, cpoitemnumber, cpoid, ctype, carticlenocustomer, carticlenovendor,
          cdescription, ctaxrate, ctaxcode, cnetamount, camountupperlimit, cquantity, cunit, ccurrency,
          cgrexpected, cgrpostpergr
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING cid`,
        [
          parseInt(nextPoItemCid) || 1, item.cpoitemnumber, parseInt(poId) || 1, item.ctype, item.carticlenocustomer,
          item.carticlenovendor, item.cdescription, 
          parseFloat(item.ctaxrate) || 0, item.ctaxcode,
          parseFloat(item.cnetamount) || 0, parseFloat(item.camountupperlimit) || 0, 
          parseFloat(item.cquantity) || 0, item.cunit, item.ccurrency,
          parseInt(item.cgrexpected) || 1, parseInt(item.cgrpostpergr) || 1
        ]
      );
      
      insertedItems.push({
        ...item,
        cid: itemResult.rows[0].cid,
        cpoid: poId
      });
      
      nextPoItemCid++; // Increment for next item
    }

    await client.query('COMMIT');

    // 返回完整的order和items数据，符合客户端期望的格式
    const createdOrder = {
      cid: poId,
      cponumber: finalPoNumber, // Use the actual unique PO number
      cdate: order.cdate,
      ccompanycode: companyCode,
      crecipientid: recipientId,
      cvendorid: vendorId,
      ctopid: topId
    };

    res.json({
      order: createdOrder,
      items: insertedItems
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('=== PURCHASE ORDER ERROR ===');
    console.error('Error creating purchase order:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ 
      error: 'Failed to create purchase order',
      details: error.message,
      code: error.code 
    });
  } finally {
    client.release();
  }
});

app.post('/api/v1/delivery-notes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { note, items } = req.body;
    console.log('Received note data:', JSON.stringify(note, null, 2));
    console.log('Received items data:', JSON.stringify(items, null, 2));
    
    // Validate delivery date - allow reasonable future dates (up to 7 days)
    const deliveryDate = new Date(note.cdate);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setDate(today.getDate() + 7); // Allow up to 7 days in the future
    
    // Lieferdatum darf nicht zu weit in der Zukunft liegen
    if (deliveryDate > maxFutureDate) {
      return res.status(400).json({ 
        error: 'Delivery date cannot be more than 7 days in the future',
        details: `Delivery date ${note.cdate} is too far in the future. Maximum allowed: ${maxFutureDate.toISOString().split('T')[0]}` 
      });
    }
    
    // Check if delivery date is too far in the past (more than 30 days)
    // Lieferdatum darf nicht zu weit in der Vergangenheit liegen
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (deliveryDate < thirtyDaysAgo) {
      return res.status(400).json({ 
        error: 'Delivery date cannot be more than 30 days in the past',
        details: `Delivery date ${note.cdate} is more than 30 days ago` 
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Find the maximum cid value in the deliverynotes table
    const maxNoteCidResult = await client.query(`
      SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.deliverynotes
    `);
    const nextNoteCid = maxNoteCidResult.rows[0].next_id;
    console.log('Next Delivery Note CID:', nextNoteCid);
    
    // Verwende die interne Lieferscheinnummer wie vom Client gesendet
    let dnNumber = note.cdnnumber;
    
    // Überprüfe, ob die exakte interne Lieferscheinnummer bereits existiert
    const dnCheckResult = await client.query(`
      SELECT COUNT(*) as count FROM public.deliverynotes
      WHERE cdnnumber = $1
    `, [dnNumber]);
    
    // Wenn die Lieferscheinnummer existiert, eine neue generieren mit Zeitstempel
    if (dnCheckResult.rows[0].count > 0) {
      const timestamp = Date.now();
      console.log(`Warning: DN number ${dnNumber} already exists, adding timestamp: ${timestamp}`);
      dnNumber = `${dnNumber}-${timestamp}`;
    }
    
    // Finde den höchsten numerischen Wert für die externe Lieferscheinnummer (L2BRL-Format)
    const maxExtDnNumberResult = await client.query(`
      SELECT REGEXP_MATCHES(cdnnumberexternal, 'L2BRL([0-9]+)') as number_match
      FROM public.deliverynotes
      WHERE cdnnumberexternal LIKE 'L2BRL%'
      ORDER BY CAST(REGEXP_REPLACE(cdnnumberexternal, '[^0-9]', '', 'g') AS INTEGER) DESC
      LIMIT 1
    `);
    
    // Bestimme die nächste externe Lieferscheinnummer
    let cdnnumberexternal;
    if (maxExtDnNumberResult.rows.length > 0 && maxExtDnNumberResult.rows[0].number_match) {
      // Extrahiere den numerischen Teil und inkrementiere ihn
      const lastNumber = parseInt(maxExtDnNumberResult.rows[0].number_match[0], 10);
      const nextNumber = lastNumber + 1;
      cdnnumberexternal = `L2BRL${String(nextNumber).padStart(4, '0')}`;
      console.log(`Using next external DN number: ${cdnnumberexternal} (incremented from: ${lastNumber})`);
    } else {
      // Falls keine vorhandene Nummer gefunden wurde, beginne mit L2BRL0001
      cdnnumberexternal = 'L2BRL0001';
      console.log(`No existing external DN numbers found, starting with: ${cdnnumberexternal}`);
    }
    
    // Insert delivery note into database
    const noteResult = await client.query(
      `INSERT INTO public.deliverynotes
        (cid, cdnnumber, cdnnumberexternal, ctype, cdate)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING cid`,
      [nextNoteCid, dnNumber, cdnnumberexternal, note.ctype, note.cdate]
    );
    
    const dnId = noteResult.rows[0].cid;
    
    // Insert each delivery note item into database
    const insertedItems = [];
    for (const item of items) {
      // Get the correct cpoitemid from the poitems table based on the material ID and purchase order
      let poItemId = null;
      if (item.materialId && item.cpoid) {
        console.log(`Looking for PO item with materialId: ${item.materialId} in PO ${item.cpoid}`);
        
        // Since cpoitemid in poitems is often null, let's try different matching strategies
        // First try: match by carticlenocustomer or carticlenovendor with materialId
        const poItemResult = await client.query(`
          SELECT cid FROM public.poitems 
          WHERE cpoid = $1 AND (
            carticlenocustomer = $2 OR 
            carticlenovendor = $2
          )
          ORDER BY cid DESC
          LIMIT 1
        `, [item.cpoid, item.materialId]);
        
        if (poItemResult.rows.length > 0) {
          poItemId = poItemResult.rows[0].cid;
          console.log(`Found matching PO item CID: ${poItemId} for material ${item.materialId} in PO ${item.cpoid}`);
        } else {
          console.warn(`No exact match found for material ${item.materialId} in PO ${item.cpoid}`);
          
          // Fallback: Get the materials table to match by material number
          const materialResult = await client.query(`
            SELECT cmaterialnumber FROM public.materials 
            WHERE cid = $1
          `, [item.materialId]);
          
          if (materialResult.rows.length > 0) {
            const materialNumber = materialResult.rows[0].cmaterialnumber;
            console.log(`Trying to match by material number: ${materialNumber}`);
            
            const materialMatchResult = await client.query(`
              SELECT cid FROM public.poitems 
              WHERE cpoid = $1 AND (
                carticlenocustomer = $2 OR 
                carticlenovendor = $2
              )
              ORDER BY cid DESC
              LIMIT 1
            `, [item.cpoid, materialNumber]);
            
            if (materialMatchResult.rows.length > 0) {
              poItemId = materialMatchResult.rows[0].cid;
              console.log(`Found PO item by material number CID: ${poItemId}`);
            }
          }
          
          // Final fallback: just use the first item from this PO
          if (!poItemId) {
            console.warn(`Using fallback - first item from PO ${item.cpoid}`);
            const fallbackResult = await client.query(`
              SELECT cid FROM public.poitems 
              WHERE cpoid = $1
              ORDER BY cid ASC
              LIMIT 1
            `, [item.cpoid]);
            
            if (fallbackResult.rows.length > 0) {
              poItemId = fallbackResult.rows[0].cid;
              console.log(`Using fallback PO item CID: ${poItemId} for PO ${item.cpoid}`);
            }
          }
        }
      }
      
      // If we still don't have a poItemId, this is an error
      if (!poItemId) {
        throw new Error(`Cannot find corresponding PO item for delivery note item. Material ID: ${item.materialId}, PO ID: ${item.cpoid}`);
      }
      
      // Find the maximum cid value in the deliverynoteitems table
      const maxItemCidResult = await client.query(`
        SELECT COALESCE(MAX(cid::bigint), 0) + 1 as next_id FROM public.deliverynoteitems
      `);
      const nextItemCid = maxItemCidResult.rows[0].next_id;
      console.log('Next Delivery Note Item CID:', nextItemCid);
      
      const itemResult = await client.query(
        `INSERT INTO public.deliverynoteitems
          (cid, cdnitemnumber, cdnid, cpoid, cpoitemid, cnetamount, cquantity, cunit, ctotalamount, ccurrency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING cid`,
        [
          nextItemCid, item.cdnitemnumber, dnId, item.cpoid, poItemId,
          item.cnetamount, item.cquantity, item.cunit, item.ctotalamount, item.ccurrency
        ]
      );
      
      insertedItems.push({
      ...item,
        cid: itemResult.rows[0].cid,
        cdnid: dnId,
        cpoitemid: poItemId
      });
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Successfully created Delivery Note with ID:', dnId);
    
    // Return success message
    res.status(201).json({
      note: { ...note, cid: dnId, cdnnumber: dnNumber, cdnnumberexternal: cdnnumberexternal },
      items: insertedItems
    });
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    
    console.error('Error creating delivery note:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log the data that tried to be saved (if available)
    if (req.body) {
      console.error('Failed note data:', JSON.stringify(req.body.note || {}, null, 2));
      console.error('Failed items data:', JSON.stringify(req.body.items || [], null, 2));
    }
    
    res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information' 
    });
  } finally {
    client.release();
  }
});

// Endpoint zum Überprüfen der Datenbanktabellen
app.get('/api/v1/database-info', async (req, res) => {
  const client = await pool.connect();
  try {
    // Informationen zur pos-Tabelle abrufen
    const posSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pos'
      ORDER BY ordinal_position;
    `);

    // Informationen zur poitems-Tabelle abrufen
    const poitemsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'poitems'
      ORDER BY ordinal_position;
    `);

    res.json({
      pos: posSchema.rows,
      poitems: poitemsSchema.rows
    });
  } catch (error) {
    console.error('Error fetching database info:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint für Taxcodes
app.get('/api/v1/taxcodes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { companyCode } = req.query;
    
    let query = `
      SELECT 
        cid,
        ccompanycode,
        ccountry,
        ccode,
        crate,
        cdescription
      FROM public.taxcodes
      WHERE cvalidfrom <= CURRENT_DATE AND cvalidto >= CURRENT_DATE AND cscenario = 'default'
    `;
    
    const params = [];
    
    // Filter by company code if provided
    if (companyCode) {
      query += ` AND ccompanycode = $1`;
      params.push(companyCode);
    }
    
    query += ` ORDER BY ccountry, ccode`;
    
    console.log('Tax codes query:', query, 'params:', params);
    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching taxcodes:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint für Exchange Rates
app.get('/api/v1/exchangerates', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        ccurrency,
        crate
      FROM public.exchangerates
      ORDER BY ccurrency;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint für Units (mit Mehrsprachigkeit)
app.get('/api/v1/units', async (req, res) => {
  const client = await pool.connect();
  try {
    // Set proper content type
    res.set('Content-Type', 'application/json');
    
    const language = req.query.lang || 'de'; // Default: deutsch
    console.log(`Fetching units for language: ${language}`);
    
    // Check if units table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'units'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.error('Units table does not exist');
      return res.status(500).json({ 
        error: 'Units table not found',
        details: 'The public.units table does not exist in the database'
      });
    }
    
    const result = await client.query(`
      SELECT 
        cid,
        cabbreviation,
        cdescription
      FROM public.units
      WHERE clanguage = $1
      ORDER BY cid;
    `, [language]);
    
    console.log(`Found ${result.rows.length} units for language ${language}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching units:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: 'Database query failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// POST endpoint für neue Units
app.post('/api/v1/units', async (req, res) => {
  const client = await pool.connect();
  try {
    const { cid, clanguage, cabbreviation, cdescription } = req.body;
    
    // Validierung
    if (!cid || !clanguage || !cabbreviation) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'cid, clanguage, and cabbreviation are required'
      });
    }

    // Prüfen ob bereits existiert
    const existsResult = await client.query(
      `SELECT COUNT(*) as count FROM public.units WHERE cid = $1 AND clanguage = $2`,
      [cid, clanguage]
    );

    if (existsResult.rows[0].count > 0) {
      return res.status(409).json({
        error: 'Unit already exists',
        details: `Unit '${cid}' already exists for language '${clanguage}'`
      });
    }

    const result = await client.query(
      `INSERT INTO public.units (cid, clanguage, cabbreviation, cdescription)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cid, clanguage, cabbreviation, cdescription]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint zum Überprüfen der gespeicherten Daten
app.get('/api/v1/saved-data', async (req, res) => {
  const client = await pool.connect();
  try {
    // Purchase Orders abrufen - nach Datum sortiert, neueste zuerst
    const posResult = await client.query(`
      SELECT * FROM public.pos
      ORDER BY cid DESC
      LIMIT 10;
    `);

    // Purchase Order Items abrufen
    const poitemsResult = await client.query(`
      SELECT * FROM public.poitems
      ORDER BY cid DESC
      LIMIT 10;
    `);

    // Delivery Notes abrufen - nach Datum sortiert, neueste zuerst
    const deliveryNotesResult = await client.query(`
      SELECT * FROM public.deliverynotes
      ORDER BY cid DESC
      LIMIT 10;
    `);

    // Delivery Note Items abrufen
    const deliveryNoteItemsResult = await client.query(`
      SELECT * FROM public.deliverynoteitems
      ORDER BY cid DESC
      LIMIT 10;
    `);

    // Letzte Bestellnummer ermitteln
    let lastPONumber = "4500000000";
    if (posResult.rows.length > 0) {
      // Extrahiere numerischen Teil der Bestellnummer (z.B. "4500000001" aus "4500000001-1")
      const match = posResult.rows[0].cponumber.match(/^(\d+)/);
      if (match && match[1]) {
        lastPONumber = match[1];
      } else {
        lastPONumber = posResult.rows[0].cponumber;
      }
    }

    // Letzte Lieferscheinnummer ermitteln
    let lastDNNumber = "L2BRL0000";
    if (deliveryNotesResult.rows.length > 0) {
      lastDNNumber = deliveryNotesResult.rows[0].cdnnumberexternal || "L2BRL0000";
    }

    res.json({
      purchaseOrders: posResult.rows,
      purchaseOrderItems: poitemsResult.rows,
      deliveryNotes: deliveryNotesResult.rows,
      deliveryNoteItems: deliveryNoteItemsResult.rows,
      lastPONumber,
      lastDNNumber
    });
  } catch (error) {
    console.error('Error fetching saved data:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Datenbank-Schema überprüfen
  const client = await pool.connect();
  try {
    console.log('Checking database schema...');
    
    // pos Tabelle überprüfen
    const posSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pos'
      ORDER BY ordinal_position;
    `);
    console.log('POS Table Schema:', JSON.stringify(posSchema.rows, null, 2));
    
    // poitems Tabelle überprüfen
    const poitemsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'poitems'
      ORDER BY ordinal_position;
    `);
    console.log('POITEMS Table Schema:', JSON.stringify(poitemsSchema.rows, null, 2));
    
    // Delivery Notes Tabelle überprüfen
    const deliveryNotesSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'deliverynotes'
      ORDER BY ordinal_position;
    `);
    console.log('DELIVERYNOTES Table Schema:', JSON.stringify(deliveryNotesSchema.rows, null, 2));
    
    // Delivery Note Items Tabelle überprüfen
    const deliveryNoteItemsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'deliverynoteitems'
      ORDER BY ordinal_position;
    `);
    console.log('DELIVERYNOTEITEMS Table Schema:', JSON.stringify(deliveryNoteItemsSchema.rows, null, 2));
    
  } catch (error) {
    console.error('Error checking database schema:', error);
  } finally {
    client.release();
  }
}).on('error', (err) => {
  console.error('Error starting server:', err.stack);
  process.exit(1);
});