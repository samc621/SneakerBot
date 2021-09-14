const express = require('express');
const supertest = require('supertest');
const mockDb = require('mock-knex');
const apiRoutes = require('../../../api/Addresses');
const db = require('../../../config/knex');

const testAddress = {
  type: 'billing',
  first_name: 'testFirstName',
  last_name: 'testLastName',
  address_line_1: 'testAddressLine1',
  address_line_2: 'testAddressLine2',
  city: 'testCity',
  state: 'testState',
  postal_code: 'testPostalCode',
  country: 'testCountry',
  email_address: 'test@email.com',
  phone_number: '0123456789'
};

const testAddressCreated = {
  id: 1,
  ...testAddress,
  created_at: '2021-01-01T17:29:51.957Z',
  updated_at: '2021-01-01T17:29:51.957Z',
  is_deleted: false
};

let request;
let tracker;

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

beforeEach(() => {
  mockDb.mock(db);
  jest.resetAllMocks();
  tracker = mockDb.getTracker();
  tracker.install();
});

afterEach(() => {
  mockDb.unmock(db);
  tracker.uninstall();
});

beforeAll(() => {
  request = supertest(app);
});

describe('GET /addresses', () => {
  it('should find multiple addresses', async () => {
    const testAddresses = [
      testAddressCreated,
      {
        ...testAddressCreated,
        id: 2
      },
      {
        ...testAddressCreated,
        id: 3
      }
    ];

    tracker.on('query', (query) => {
      query.response(testAddresses);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses successfully found');
    expect(response.body.data).toEqual(testAddresses);
  });

  it('should find a single address', async () => {
    const testAddresses = [testAddressCreated];

    tracker.on('query', (query) => {
      query.response(testAddresses);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses successfully found');
    expect(response.body.data).toEqual(testAddresses);
  });

  it('should find no addresses', async () => {
    const testAddresses = [];

    tracker.on('query', (query) => {
      query.response(testAddresses);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses not found');
    expect(response.body.data).toEqual(testAddresses);
  });
});

describe('GET /addresses/:id', () => {
  it('should findOne single address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve(testAddressCreated));
    });

    const response = await request.get('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully found');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should not findOne address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve());
    });

    const response = await request.get('/2');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address not found');
    expect(response.body.data).toBeUndefined();
  });
});

describe('POST /addresses', () => {
  it('should create an address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testAddressCreated]));
    });

    const response = await request.post('/').send(testAddress);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully created');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should create no address when db insert fails', async () => {
    const testAddressWithError = {
      ...testAddress,
      first_name: 'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters'
        + 'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters'
    };
    tracker.on('query', (query) => {
      query.response(Promise.reject(new Error('DB insert failure')));
    });

    const response = await request.post('/').send(testAddressWithError);

    expect(response.status).toBe(500);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('DB insert failure');
    expect(response.body.data).toEqual({});
  });

  it('should create no address when validation fails', async () => {
    const testAddressWithError = {
      ...testAddress,
      email_address: 'test@failing-email.address'
    };
    tracker.on('query', (query) => {
      query.response(Promise.reject(new Error('Email validation failure')));
    });

    const response = await request.post('/').send(testAddressWithError);

    expect(response.status).toBe(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Validation Failed');
    expect(response.body.data.body[0].message).toEqual('"email_address" must be a valid email');
  });
});

describe('PATCH /addresses:id', () => {
  it('should update known address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testAddressCreated]));
    });

    const response = await request.patch('/1').send(testAddress);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully updated');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should not update unknown address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([]));
    });

    const response = await request.patch('/1').send(testAddress);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address not updated');
    expect(response.body.data).toBeUndefined();
  });
});

describe('DELETE /addresses:id', () => {
  it('should delete known address', async () => {
    const testAddressDeleted = {
      ...testAddressCreated,
      is_deleted: true
    };
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testAddressDeleted]));
    });

    const response = await request.delete('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully deleted');
    expect(response.body.data).toEqual(testAddressDeleted);
  });

  it('should not delete unknown address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([]));
    });

    const response = await request.delete('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address not deleted');
    expect(response.body.data).toBeUndefined();
  });
});
