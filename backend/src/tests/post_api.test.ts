import { GraphQLClient } from 'graphql-request';
import mongoose from 'mongoose';

import models, { connectDb } from '../models';
import server from '../server';

const port = 5001;
const endpoint = `http://localhost:${port}`;

let testServer: any; // https://github.com/prisma/graphql-yoga/issues/379
let client: GraphQLClient;

const email = 'test@test.com';
const username = 'testusername';
const password = 'testpassword';

const title = 'Test Title';
const description = 'Test Description';
const content = 'Test Content';

beforeAll(async () => {
  /**
   * Start Test GraphQL Server and Mongoose Connection (with a test in-memory Mongo Database)
   *
   * Create test account to be used
   */
  await connectDb();
  testServer = await server.start({ port }, () => console.log(`Running test server at ${endpoint}`));
  client = new GraphQLClient(endpoint);

  const mutation = `
    mutation {
      createUser(username: "${username}", password: "${password}", email: "${email}") {
        username
        password
        email
      }
    }
  `;
  await client.request(mutation);
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

describe('Post', () => {
  test('can be created by authenticated user', async done => {
    const loginMutation = `
      mutation {
        login(username: "${username}", password: "${password}")
      }
    `;
    const loginResponse = await client.request(loginMutation);
    client.setHeader('Authorization', loginResponse.login);

    const createPostMutation = `
      mutation {
        createPost(title: "${title}", description: "${description}", content: "${content}") {
          title
          description
          content
          author {
            username
          }
        }
      }
    `;

    const response = await client.request(createPostMutation);
    expect(response.createPost).toMatchObject({
      title,
      description,
      content,
      author: {
        username
      }
    });

    done();
  });

  test('has correct data in api', async done => {
    const query = `
      query {
        posts {
          title
          description
          content
          author {
            username
          }
        }
      }
    `;

    const response = await client.request(query);
    expect(response.posts).toHaveLength(1);
    expect(response.posts[0]).toMatchObject({
      title,
      description,
      content,
      author: {
        username
      }
    });

    done();
  });

  test('was added to database', async done => {
    const posts = await models.Post.find({ title, description, content });
    expect(posts).toHaveLength(1);

    done();
  });

  test('has correct data in database', async done => {
    const post = await models.Post.findOne({ title, description, content });
    expect({
      title: post.title,
      description: post.description,
      content: post.content,
    }).toMatchObject({
      title,
      description,
      content
    });

    done();
  });

  test('can\'t be created by unauthenticated user', async done => {
    const createPostMutation = `
      mutation {
        createPost(title: "${title}", description: "${description}", content: "${content}") {
          title
          description
          content
          author {
            username
          }
        }
      }
    `;

    const response = await client.request(createPostMutation);
    expect(response.createPost).toBeNull();

    done();
  });

  test('data appear on users API', async done => {
    const query = `
      query {
        users {
          username
          posts {
            title
            description
            content
            author {
              username
            }
          }
        }
      }
    `;
    const response = await client.request(query);

    expect(response.users).toHaveLength(1);
    expect(response.users[0]).toMatchObject({
      username,
      posts: [
        {
          title,
          description,
          content,
          author: {
            username
          }
        }
      ]
    });
    done();
  });
});
