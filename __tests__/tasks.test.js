// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
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
      url: app.reverse('tasks#index'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#new'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('view', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#view', { id: task.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#edit', { id: task.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks#create'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const task = await models.task
      .query()
      .findOne({ name: params.name });
    expect(task).toMatchObject(params);
  });

  it('update', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });
    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('tasks#update', { id: task.id }),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const updatedTask = await models.task
      .query()
      .findById(task.id);
    expect(updatedTask).toMatchObject(params);
  });

  it('delete', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('tasks#destroy', { id: task.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const deletedTask = await models.task
      .query()
      .findById(task.id);
    expect(deletedTask).toBeUndefined();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
