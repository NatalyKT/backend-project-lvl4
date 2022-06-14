// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs
  .readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8')
  .trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

const getTestData = () => getFixtureData('testData.json');

const prepareData = async (app) => {
  const { knex } = app.objection;

  // получаем данные из фикстур и заполняем БД
  await knex('users').insert(getFixtureData('users.json'));
  await knex('labels').insert(getFixtureData('labels.json'));
  await knex('statuses').insert(getFixtureData('statuses.json'));
  await knex('tasks').insert(getFixtureData('tasks.json'));
  await knex('tasks_labels').insert(getFixtureData('tasksLabels.json'));
};

const signIn = async (app, data) => {
  const responseSignIn = await app.inject({
    method: 'POST',
    url: app.reverse('session#create'),
    payload: {
      data,
    },
  });

  const [sessionCookie] = responseSignIn.cookies;
  const { name, value } = sessionCookie;
  return { [name]: value };
};

export { getTestData, prepareData, signIn };
