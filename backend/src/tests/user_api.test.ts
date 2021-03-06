import { GraphQLClient } from 'graphql-request';
import { formatError } from 'apollo-errors';
import mongoose from 'mongoose';

import models, { connectDb } from '../models';
import server from '../server';
import { NotAuthenticatedError, WrongCredentialsError } from '../errors';

const port = 5000;
const endpoint = `http://localhost:${port}`;

let testServer: any; // https://github.com/prisma/graphql-yoga/issues/379
let client: GraphQLClient;

beforeAll(async () => {
  /**
   * Start Test GraphQL Server and Mongoose Connection (with a test in-memory Mongo Database)
   */
  await connectDb();
  testServer = await server.start({ port, formatError }, () => console.log(`Running test server at ${endpoint}`));
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

describe('User', () => {
  test('can create account', async done => {
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

  test('cant\'t use already existing username', async done => {
    const mutation = `
      mutation {
        createUser(username: "${username}", password: "${password + 'different'}", email: "${email + 'different'}") {
          username
          password
          email
        }
      }
    `;
    try {
      await client.request(mutation);
    } catch (error) {
      expect(error.response.errors[0].code).toEqual(11000);
      expect(error.response.errors[0].name).toEqual('MongoError');
    }

    done();
  });

  test('cant\'t use already existing email', async done => {
    const mutation = `
      mutation {
        createUser(username: "${username + 'different'}", password: "${password + 'different'}", email: "${email}") {
          username
          password
          email
        }
      }
    `;
    try {
      await client.request(mutation);
    } catch (error) {
      console.log(Object.keys(error.response.errors[0]));
      console.log(error.response.errors[0]);
      // { message: 'E11000 duplicate key error dup key: { : "test@test.com" }',
      // locations: [ { line: 3, column: 9 } ],
      // path: [ 'createUser' ] }
      expect(error.response.errors[0].code).toEqual(11000);
      expect(error.response.errors[0].name).toEqual('MongoError');
    }

    done();
  });

  test('was added to database', async done => {
    const users = await models.User.find({ username });
    expect(users).toHaveLength(1);
    done();
  });

  test('has correct data in database', async done => {
    const user = await models.User.findOne({ username });
    expect(user.email).toEqual(email);
    expect(user.username).toEqual(username);
    expect(user.password).not.toEqual(password); // Password is encrypted
    done();
  });

  test('has correct data in API', async done => {
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

  test('can login with correct credentials', async done => {
    const mutation = `
      mutation {
        login(username: "${username}", password: "${password}")
      }
    `;
    const response = await client.request(mutation);
    expect(response.login).not.toBeNull();
    done();
  });

  test('can edit its own details when authenticated', async done => {
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
        editUserSelf(email: $email) {
          username
          email
        }
      }
    `;

    client.setHeader('Authorization', token);

    const updateResponse = await client.request(userUpdateMutation, { email: editedEmail });

    expect(updateResponse.editUserSelf).toMatchObject({
      username,
      email: editedEmail
    });

    const userUpdated = await models.User.findOne({ username });
    expect(userUpdated.email).toBe(editedEmail);

    // Update User back to original state
    await client.request(userUpdateMutation, { email });

    const userReversed = await models.User.findOne({ username });
    expect(userReversed.email).toBe(email);

    done();
  });

  test('can\'t login with incorrect credentials', async done => {
    const mutation = `
      mutation {
        login(username: "${username}", password: "blablabla")
      }
    `;
    // const response = await client.request(mutation);
    try {
      await client.request(mutation);
    } catch (error) {
      expect(error.response.errors[0].name).toEqual('WrongCredentialsError');
    }

    done();
  });

  test('can\'t edit its own details when unauthenticated', async done => {
    const mutation = `
      mutation {
        editUserSelf(username: "some-random-username") {
          username
          email
        }
      }
    `;
    try {
      await client.request(mutation);
    } catch (error) {
      expect(error.response.errors[0].name).toEqual('NotAuthenticatedError');
    }

    done();
  });
});
