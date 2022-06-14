// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    // @ts-ignore
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
    await knex.migrate.latest();
  });

  beforeEach(async () => {
    await prepareData(app);
    cookie = await signIn(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#index'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#new'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#edit', { id: taskStatus.id }),
      cookies: cookie,
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
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('patch', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('statuses#update', { id: taskStatus.id }),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const updatedStatus = await models.taskStatus
      .query()
      .findById(taskStatus.id);
    expect(updatedStatus).toMatchObject(params);
  });

  it('delete', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('statuses#destroy', { id: taskStatus.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const deletedStatus = await models.taskStatus
      .query()
      .findById(taskStatus.id);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
