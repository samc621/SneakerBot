const express = require('express');
const request = require('supertest');
const apiRoutes = require('../../../routes');

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

describe('testing-proxies-apis', () => {
  it('GET /proxies - success', (done) => {
    request(app)
      .get('/proxies')
      .expect(200)
      .then((response) => {
        expect(response.body.success).toBeTruthy();
        expect(response.body.message).toBe('Proxies successfully found');
        expect(response.body.data).toBeDefined();
        done();
      })
      .catch(done);
  });
});
