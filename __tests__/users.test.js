// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
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
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users#index'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users#new'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users#create'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user
      .query()
      .findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('edit', async () => {
    const cookie = await signIn(app, testData.users.existing);
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users#edit', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const cookie = await signIn(app, testData.users.existing);
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const params = testData.users.new;
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('users#update', { id: user.id }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const updatedUser = await models.user
      .query()
      .findById(user.id);
    expect(updatedUser).toMatchObject(expected);
  });
  it('delete', async () => {
    const cookie = await signIn(app, testData.users.deleted);

    const user = await models.user
      .query()
      .findOne({ email: testData.users.deleted.email });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('users#destroy', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const deletedUser = await models.user.query().findById(user.id);

    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
