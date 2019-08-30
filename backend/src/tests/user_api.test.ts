import { GraphQLClient } from 'graphql-request';
import { GraphQLServer } from 'graphql-yoga';
import mongoose from 'mongoose';

import models, { connectDb } from '../models';
import server from '../server';

const port = 5000;
const endpoint = `http://localhost:${port}`;

let testServer: any;
let client: GraphQLClient;

beforeAll(async () => {
  /**
   * Start Test GraphQL Server and Mongoose Connection (with a test in-memory Mongo Database)
   */
  testServer = await server.start({ port }, () => console.log(`Running test server at ${endpoint}`));
  await connectDb();
  client = new GraphQLClient(endpoint);
});

afterAll(async () => {
  /**
   * Close GraphQL Server and Mongoose connections
   */
  await testServer.close();
  await mongoose.connection.close();
});

beforeEach(async () => {
  /**
   * Clear any headers that could affect test results because of previous tests that changed them
   */
  client.setHeaders({});
});

const email = 'test@test.com';
const username = 'testusername';
const password = 'testpassword';

test('Create user', async done => {
  const mutation = `
    mutation {
      createUser(username: "${username}", password: "${password}", email: "${email}") {
        username
        password
        email
      }
    }
  `;
  const response = await client.request(mutation);
  expect(response.createUser.username).toBe(username);
  expect(response.createUser.email).toBe(email);
  expect(response.createUser.password).not.toBe(password);
  done();
});

test('Created user was added to database', async done => {
  const users = await models.User.find({ username });
  expect(users).toHaveLength(1);
  done();
});

test('Created user has correct data in database', async done => {
  const user = await models.User.findOne({ username });
  expect(user.email).toEqual(email);
  expect(user.username).toEqual(username);
  expect(user.password).not.toEqual(password); // Password is encrypted
  done();
});

test('Created user has correct data in API', async done => {
  const user = await models.User.findOne({ username });

  const query = `
    query {
      user(id: "${user.id}") {
        id
        email
        username
        password
      }
    }
  `;

  const response = await client.request(query);

  expect(response.user.id).toBe(user._id.toString());
  expect(response.user.email).toBe(user.email);
  expect(response.user.username).toBe(user.username);
  expect(response.user.password).toBe(user.password);
  done();
});

test('User can login with correct credentials', async done => {
  const mutation = `
    mutation {
      login(username: "${username}", password: "${password}")
    }
  `;
  const response = await client.request(mutation);
  expect(response.login).not.toBeNull();
  done();
});

test('Authenticated User can edit its own details', async done => {
  const loginMutation = `
    mutation {
      login(username: "${username}", password: "${password}")
    }
  `;
  const loginResponse = await client.request(loginMutation);
  const token = loginResponse.login;

  const editedEmail = email + '-edited';

  const userUpdateMutation = `
    mutation updateUser($email: String!) {
      updateSelfUser(email: $email)
    }
  `;

  client.setHeader('Authorization', token);

  const updateResponse = await client.request(userUpdateMutation, { email: editedEmail });

  expect(updateResponse.updateSelfUser).toBe('true');

  const userUpdated = await models.User.findOne({ username });
  expect(userUpdated.email).toBe(editedEmail);

  // Update User back to original state
  await client.request(userUpdateMutation, { email });

  const userReversed = await models.User.findOne({ username });
  expect(userReversed.email).toBe(email);

  done();
});

test('User can\'t login with incorrect credentials', async done => {
  const mutation = `
    mutation {
      login(username: "${username}", password: "blablabla")
    }
  `;
  const response = await client.request(mutation);
  expect(response.login).toBeNull();
  done();
});

test('Unauthenticated User can\'t edit its own details', async done => {
  const mutation = `
    mutation {
      updateSelfUser(username: "some-random-username")
    }
  `;

  const response = await client.request(mutation);
  expect(response.updateSelfUser).toBe('false');
  done();
});
