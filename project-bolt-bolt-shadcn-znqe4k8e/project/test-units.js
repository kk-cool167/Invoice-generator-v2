// Test script to verify units fetching works as expected
const fetch = require('node-fetch');

async function testUnitsAPI() {
  try {
    console.log('Testing units API...');
    
    // Test English units
    console.log('\n1. Testing English units (lang=en):');
    const responseEn = await fetch('http://localhost:3003/api/v1/units?lang=en');
    console.log('Status:', responseEn.status, responseEn.statusText);
    console.log('Content-Type:', responseEn.headers.get('content-type'));
    
    if (responseEn.ok) {
      const dataEn = await responseEn.json();
      console.log('Success! Found', dataEn.length, 'English units');
      console.log('Sample units:', dataEn.slice(0, 3));
    } else {
      const errorText = await responseEn.text();
      console.log('Error response:', errorText);
    }
    
    // Test German units  
    console.log('\n2. Testing German units (lang=de):');
    const responseDe = await fetch('http://localhost:3003/api/v1/units?lang=de');
    console.log('Status:', responseDe.status, responseDe.statusText);
    console.log('Content-Type:', responseDe.headers.get('content-type'));
    
    if (responseDe.ok) {
      const dataDe = await responseDe.json();
      console.log('Success! Found', dataDe.length, 'German units');
      console.log('Sample units:', dataDe.slice(0, 3));
    } else {
      const errorText = await responseDe.text();
      console.log('Error response:', errorText);
    }
    
    // Test invalid language (should fallback to 'de')
    console.log('\n3. Testing fallback with invalid language:');
    const responseInvalid = await fetch('http://localhost:3003/api/v1/units?lang=invalid');
    console.log('Status:', responseInvalid.status, responseInvalid.statusText);
    
    if (responseInvalid.ok) {
      const dataInvalid = await responseInvalid.json();
      console.log('Fallback works! Found', dataInvalid.length, 'units');
    }
    
    console.log('\n✅ Units API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUnitsAPI();