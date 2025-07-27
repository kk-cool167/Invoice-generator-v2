export const mockVendors = [
  {
    cid: '1',
    cvendorid: 'V001',
    ccompanycode: 'CC001',
    cname: 'Musterfirma GmbH',
    cstreet: 'Musterstraße 1',
    czip: '12345',
    ccity: 'Berlin',
    ccountry: 'Deutschland',
    cpozip: '12345',
    cvatnumber: 'DE123456789',
    cfon: '+49 30 123456',
    curl: 'www.musterfirma.de',
    bank_name: 'Musterbank',
    ciban: 'DE89370400440532013000',
    cbic: 'DEUTDEBBXXX'
  },
  {
    cid: '2',
    cvendorid: 'V002',
    ccompanycode: 'CC002',
    cname: 'Test AG',
    cstreet: 'Teststraße 2',
    czip: '54321',
    ccity: 'München',
    ccountry: 'Deutschland',
    cpozip: '54321',
    cvatnumber: 'DE987654321',
    cfon: '+49 89 654321',
    curl: 'www.test-ag.de',
    bank_name: 'Testbank',
    ciban: 'DE89370400440532013001',
    cbic: 'TESTDEBBXXX'
  }
];

export const mockRecipients = [
  {
    cid: '1',
    crecipientid: '1000',
    ccompanycode: '1000',
    cname: 'SER Solutions Deutschland GmbH',
    cstreet: 'Joseph-Schumpeter-Allee 19',
    czip: '53227',
    ccity: 'Bonn',
    ccountry: 'DE'
  },
  {
    cid: '2',
    crecipientid: '2000',
    ccompanycode: '2000',
    cname: 'SER Solutions United Kingdom Ltd.',
    cstreet: '20 Primrose Street',
    czip: 'EC2A 2EW',
    ccity: 'London',
    ccountry: 'GB'
  },
  {
    cid: '3',
    crecipientid: '3000',
    ccompanycode: '3000',
    cname: 'SER Solutions International GmbH',
    cstreet: 'Brauerstrasse 4',
    czip: 'CH-8004',
    ccity: 'Zürich',
    ccountry: 'CH'
  }
];

export const mockMaterials = [
  {
    cid: '1',
    carticlenovendor: 'M001',
    cdescription: 'Premium Motoröl',
    ctype: 'good',
    ctaxcode: 'V1',
    ctaxrate: 19,
    cunit: 'Liter',
    cnetamount: 29.99,
    ccurrency: 'EUR'
  },
  {
    cid: '2',
    carticlenovendor: 'M002',
    cdescription: 'Luftfilter',
    ctype: 'good',
    ctaxcode: 'V1',
    ctaxrate: 19,
    cunit: 'Stück',
    cnetamount: 15.99,
    ccurrency: 'EUR'
  },
  {
    cid: '3',
    carticlenovendor: 'M003',
    cdescription: 'Bremsflüssigkeit',
    ctype: 'good',
    ctaxcode: 'V2',
    ctaxrate: 7,
    cunit: 'Liter',
    cnetamount: 9.99,
    ccurrency: 'EUR'
  }
];