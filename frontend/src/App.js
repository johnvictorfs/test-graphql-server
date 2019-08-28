import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";

import client from "./api";
import UserList from "./components/UserList";
import UserCreation from "./components/UserCreation";
const App = () => {
  return (
    <ApolloProvider client={client}>
      <UserList />
      <UserCreation />
    </ApolloProvider>
  );
};

export default App;
