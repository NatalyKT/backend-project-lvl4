// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let status;
  let models;
  let cookies;
  const testData = getTestData();

  beforeAll(async () => {
    // @ts-ignore
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    status = await models.status
      .query()
      .findOne({ name: testData.statuses.existing.name });
    cookies = await signIn(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#index'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#new'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses#create'),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('edit', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#edit', { id: taskStatus.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('patch', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const newStatus = testData.statuses.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('statuses#update', { id: taskStatus.id }),
      payload: {
        data: newStatus,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);

    const updatedStatus = await models.taskStatus
      .query()
      .findById(taskStatus.id);
    expect(updatedStatus).toMatchObject(newStatus);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      cookies,
      url: app.reverse('deleteStatus', { id: status.id }),
    });

    expect(response.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findById(status.id);

    expect(deletedStatus).toBeUndefined();
  });

  it('delete status linked with task', async () => {
    await models.task.query().insert({
      ...testData.tasks.existing,
      statusId: status.id,
    });

    const response = await app.inject({
      method: 'DELETE',
      cookies,
      url: app.reverse('deleteStatus', { id: status.id.toString() }),
    });

    expect(response.statusCode).toBe(302);

    const undeletedStatus = await models.status
      .query()
      .findById(status.id.toString());

    expect(undeletedStatus).not.toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
