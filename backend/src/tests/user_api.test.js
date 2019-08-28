import { request } from 'graphql-request';
import mongoose from 'mongoose';
import models, { connectDb } from '../models';
import server from '../server';

const port = 5000;
const host = `http://localhost:${port}`;

let testServer;

beforeAll(async () => {
  testServer = await server.start({ port }, () =>
    console.log(`Running test server at http://localhost:${port}`)
  );
  await connectDb();
});

afterAll(async () => {
  await testServer.close();
  await mongoose.connection.close();
});

const email = 'test@test.com';
const username = 'testusername';
const password = 'testpassword';

test('Create user', async done => {
  const mutation = `
    mutation {
      createUser(username: "${username}", password: "${password}", email: "${email}") {
        id
        username
        password
        email
      }
    }
  `;
  await request(host, mutation);
  done();
});

test('Created user was added', async done => {
  const users = await models.User.find({ email });
  expect(users).toHaveLength(1);
  done();
});

test('Created user has correct data', async done => {
  const user = await models.User.findOne({ email });
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
  done();
});

test('User can login', async done => {
  const mutation = `
    mutation {
      login(username: "${username}", password: "${password}")
    }
  `;
  const response = await request(host, mutation);
  expect(response.login).toBeTruthy();
  done();
});