// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels#index'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels#new'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels#edit', { id: label.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels#create'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const label = await models.label
      .query()
      .findOne({ name: params.name });
    expect(label).toMatchObject(params);
  });

  it('patch', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const params = testData.labels.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('labels#update', { id: label.id }),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const updatedLabel = await models.label
      .query()
      .findById(label.id);
    expect(updatedLabel).toMatchObject(params);
  });

  it('delete', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('labels#destroy', { id: label.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const deletedLabel = await models.label
      .query()
      .findById(label.id);
    expect(deletedLabel).toBeUndefined();
  });

  afterEach(async () => {
    await knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
