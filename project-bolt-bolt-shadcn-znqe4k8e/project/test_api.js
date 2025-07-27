// Test API call to see server error details
const testData = {
  order: {
    cponumber: "",
    cdate: "2025-07-19",
    ccompanycode: "1000",
    crecipientid: "4",
    cvendorid: "7",
    ctopid: "1"
  },
  items: [
    {
      cpoitemnumber: "01",
      cpoid: "1",
      cpoitemid: "18",
      ctype: "good",
      carticlenocustomer: "1007400909",
      carticlenovendor: "1007400909",
      cdescription: "Computer Setups",
      ctaxrate: 0.19,
      ctaxcode: "V1",
      cnetamount: 250,
      cquantity: 10,
      cunit: "KG",
      ccurrency: "EUR",
      camountupperlimit: 27.5,
      cgrexpected: 1,
      cgrpostpergr: 1
    }
  ]
};

fetch('http://localhost:3003/api/v1/purchase-orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(async response => {
  const text = await response.text();
  console.log('Response status:', response.status);
  console.log('Response text:', text);
  
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      console.log('Error details:', errorData);
    } catch (e) {
      console.log('Could not parse error JSON');
    }
  }
})
.catch(error => {
  console.error('Fetch error:', error);
});