import { gql } from "apollo-boost";

export const GET_USERS = gql`
  query {
    users {
      id
      username
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $password: String!, $email: String!) {
    createUser(username: $username, password: $password, email: $email) {
      username
    }
  }
`;
