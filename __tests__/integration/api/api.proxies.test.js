const express = require('express');
const supertest = require('supertest');
const mockDb = require('mock-knex');
const apiRoutes = require('../../../api/Proxies');
const db = require('../../../config/knex');

const testProxy = {
  ip_address: '12.34.56.78',
  port: 80,
  protocol: 'http',
  username: 'testUsername',
  password: 'testPassword'
};

const testProxyCreated = {
  id: 1,
  ...testProxy,
  has_been_used: false,
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

describe('GET /proxies', () => {
  it('should find multiple proxies', async () => {
    const testProxies = [
      testProxyCreated,
      {
        ...testProxyCreated,
        id: 2
      },
      {
        ...testProxyCreated,
        id: 3
      }
    ];

    tracker.on('query', (query) => {
      query.response(testProxies);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxies successfully found');
    expect(response.body.data).toEqual(testProxies);
  });

  it('should find a single proxy', async () => {
    const testProxies = [testProxyCreated];

    tracker.on('query', (query) => {
      query.response(testProxies);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxies successfully found');
    expect(response.body.data).toEqual(testProxies);
  });

  it('should find no proxies', async () => {
    const testProxies = [];

    tracker.on('query', (query) => {
      query.response(testProxies);
    });

    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxies not found');
    expect(response.body.data).toEqual(testProxies);
  });
});

describe('GET /proxies/:id', () => {
  it('should findOne single proxy', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve(testProxyCreated));
    });

    const response = await request.get('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy successfully found');
    expect(response.body.data).toEqual(testProxyCreated);
  });

  it('should not findOne proxy', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve());
    });

    const response = await request.get('/2');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy not found');
    expect(response.body.data).toBeUndefined();
  });
});

describe('POST /proxies', () => {
  it('should create an proxy', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testProxyCreated]));
    });

    const response = await request.post('/').send(testProxy);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy successfully created');
    expect(response.body.data).toEqual(testProxyCreated);
  });

  it('should create no proxy when db insert fails', async () => {
    const testProxyWithError = {
      ...testProxy,
      ip_address: 'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters'
        + 'testWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacterstestWithTooManyCharacters'
    };
    tracker.on('query', (query) => {
      query.response(Promise.reject(new Error('DB insert failure')));
    });

    const response = await request.post('/').send(testProxyWithError);

    expect(response.status).toBe(500);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('DB insert failure');
    expect(response.body.data).toEqual({});
  });

  it('should create no proxy when validation fails', async () => {
    const testProxyWithError = {
      ...testProxy,
      ip_address: null
    };
    tracker.on('query', (query) => {
      query.response(Promise.reject(new Error('Validation failure')));
    });

    const response = await request.post('/').send(testProxyWithError);

    expect(response.status).toBe(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Validation Failed');
    expect(response.body.data.body[0].message).toEqual('"ip_address" must be a string');
  });
});

describe('PATCH /proxies:id', () => {
  it('should update known address', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testProxyCreated]));
    });

    const response = await request.patch('/1').send(testProxy);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy successfully updated');
    expect(response.body.data).toEqual(testProxyCreated);
  });

  it('should not update unknown proxy', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([]));
    });

    const response = await request.patch('/1').send(testProxy);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy not updated');
    expect(response.body.data).toBeUndefined();
  });
});

describe('DELETE /proxies:id', () => {
  it('should delete known proxy', async () => {
    const testProxyDeleted = {
      ...testProxyCreated,
      is_deleted: true
    };
    tracker.on('query', (query) => {
      query.response(Promise.resolve([testProxyDeleted]));
    });

    const response = await request.delete('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy successfully deleted');
    expect(response.body.data).toEqual(testProxyDeleted);
  });

  it('should not delete unknown proxy', async () => {
    tracker.on('query', (query) => {
      query.response(Promise.resolve([]));
    });

    const response = await request.delete('/1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Proxy not deleted');
    expect(response.body.data).toBeUndefined();
  });
});
