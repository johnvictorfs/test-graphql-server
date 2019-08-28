import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { GET_USERS } from "../../userQueries";

const UserList = () => {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <h3>Loading...</h3>;
  if (error) return <h3>Error trying to fetch users ({error.message})</h3>;

  return (
    <div>
      <ul>
        {data.users.map(user => (
          <li key={user.id}>
            {user.username} ({user.id})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
