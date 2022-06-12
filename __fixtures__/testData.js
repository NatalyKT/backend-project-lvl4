// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

export const getUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(3),
});

export const getStatus = () => ({
  name: faker.lorem.word(),
});