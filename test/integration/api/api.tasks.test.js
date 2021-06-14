const express = require('express');
const request = require('supertest');
const apiRoutes = require('../../../routes');

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

describe('testing-tasks-apis', () => {
  it('GET /tasks - success', (done) => {
    request(app)
      .get('/tasks')
      .expect(200)
      .then((response) => {
        expect(response.body.success).toBeTruthy();
        expect(response.body.message).toBe('Tasks successfully found');
        expect(response.body.data).toBeDefined();
        done();
      })
      .catch(done);
  });
});
