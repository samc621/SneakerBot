import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { createTracker, MockClient } from 'knex-mock-client';
import db from '../../../db/index.js';

jest.mock('../../../db', () => {
  // eslint-disable-next-line global-require
  const knex = require('knex');
  return knex({ client: MockClient });
});

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

let tracker;
let app;
const urlAddresses = '/v1/addresses';

beforeAll(async () => {
  const router = (await import('../../../routes')).default;

  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/v1', router);

  tracker = createTracker(db);
});

beforeEach(() => {
  tracker.on.select('* from "proxies"').responseOnce([]);
});

afterEach(() => {
  tracker.reset();
});

afterAll(() => {
  jest.unmock('../../../db');
  jest.resetModules();
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
    tracker.on.select('* from "addresses"').response(testAddresses);

    const response = await request(app).get(urlAddresses);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses successfully found');
    expect(response.body.data).toEqual(testAddresses);
  });

  it('should find a single address', async () => {
    const testAddresses = [testAddressCreated];
    tracker.on.select('* from "addresses"').response(testAddresses);

    const response = await request(app).get(urlAddresses);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses successfully found');
    expect(response.body.data).toEqual(testAddresses);
  });

  it('should find no addresses', async () => {
    const testAddresses = [];
    tracker.on.select('* from "addresses"').response(testAddresses);

    const response = await request(app).get(urlAddresses);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Addresses not found');
    expect(response.body.data).toEqual(testAddresses);
  });
});

describe('GET /addresses/:id', () => {
  it('should findOne single address', async () => {
    tracker.on.select('* from "addresses"').response(testAddressCreated);

    const response = await request(app).get(`${urlAddresses}/1`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully found');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should not findOne address', async () => {
    tracker.on.select('* from "addresses"').response(undefined);

    const response = await request(app).get(`${urlAddresses}/2`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address not found');
    expect(response.body.data).toBeUndefined();
  });
});

describe('POST /addresses', () => {
  it('should create an address', async () => {
    tracker.on.insert('into "addresses"').response([testAddressCreated]);

    const response = await request(app).post(urlAddresses).send(testAddress);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully created');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should create no address when db insert fails', async () => {
    const testAddressWithError = {
      ...testAddress,
      first_name:
        'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters' +
        'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters'
    };
    tracker.on.insert('into "addresses"').simulateError(new Error('DB insert failure'));

    const response = await request(app).post(urlAddresses).send(testAddressWithError);

    expect(response.status).toBe(500);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toContain('DB insert failure');
    expect(response.body.data).toEqual({});
  });

  it('should create no address when validation fails', async () => {
    const testAddressWithError = {
      ...testAddress,
      email_address: 'test@failing-email.address'
    };
    tracker.on.select('* from "addresses"').simulateError(new Error('Email validation failure'));

    const response = await request(app).post(urlAddresses).send(testAddressWithError);

    expect(response.status).toBe(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Validation Failed');
    expect(response.body.data.body[0].message).toEqual('"email_address" must be a valid email');
  });
});

describe('PATCH /addresses:id', () => {
  it('should update known address', async () => {
    tracker.on.update('"addresses"').response([testAddressCreated]);

    const response = await request(app).patch(`${urlAddresses}/1`).send(testAddress);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully updated');
    expect(response.body.data).toEqual(testAddressCreated);
  });

  it('should not update unknown address', async () => {
    tracker.on.update('"addresses"').response([]);

    const response = await request(app).patch(`${urlAddresses}/1`).send(testAddress);

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
    tracker.on.update('"addresses"').response([testAddressDeleted]);

    const response = await request(app).delete(`${urlAddresses}/1`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address successfully deleted');
    expect(response.body.data).toEqual(testAddressDeleted);
  });

  it('should not delete unknown address', async () => {
    tracker.on.update('"addresses"').response([]);

    const response = await request(app).delete(`${urlAddresses}/1`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Address not deleted');
    expect(response.body.data).toBeUndefined();
  });
});
