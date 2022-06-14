// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let label;
  let models;
  let cookies;
  const testData = getTestData();

  beforeAll(async () => {
    // @ts-ignore
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    models = app.objection.models;
    knex = app.objection.knex;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });
    cookies = await signIn(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels#index'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels#new'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const newLabel = testData.labels.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels#create'),
      payload: {
        data: newLabel,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const createdLabel = await models.label
      .query()
      .findOne({ name: newLabel.name });
    expect(createdLabel).toMatchObject(newLabel);
  });

  it('edit', async () => {
    const newLabel = testData.labels.new;

    const response = await app.inject({
      method: 'PATCH',
      cookies,
      url: `/labels/${label.id}`,
      payload: {
        data: newLabel,
      },
    });

    expect(response.statusCode).toBe(302);

    const updateLabel = await models.label.query().findById(label.id);

    expect(updateLabel).toMatchObject(newLabel);
  });

  it('patch', async () => {
    const newLabel = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const params = testData.labels.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('labels#update', { id: newLabel.id }),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const updatedLabel = await models.label.query().findById(newLabel.id);
    expect(updatedLabel).toMatchObject(params);
  });

  it('delete', async () => {
    const newLabel = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('labels#destroy', { id: newLabel.id }),
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const deletedLabel = await models.label.query().findById(newLabel.id);
    expect(deletedLabel).toBeUndefined();
  });

  it('delete label linked with task', async () => {
    const task = await models.task.query().insert(testData.tasks.existing);
    await task.$relatedQuery('labels').relate(label);

    const response = await app.inject({
      method: 'DELETE',
      cookies,
      url: app.reverse('deleteLabel', { id: label.id.toString() }),
    });

    expect(response.statusCode).toBe(302);

    const undeletedLabel = await models.label.query().findById(label.id);

    expect(undeletedLabel).not.toBeUndefined();
  });

  afterEach(async () => {
    await knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
