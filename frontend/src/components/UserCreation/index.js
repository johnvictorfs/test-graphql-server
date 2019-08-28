import React, {useState} from 'react'
import {useMutation} from '@apollo/react-hooks';
import { CREATE_USER } from '../../userQueries';

const UserCreation = () => {
  const defaultCredentials = {username: '', password: '', email: ''};
  const [credentials, setCredentials] = useState(defaultCredentials);
  const [createUser, {data}] = useMutation(CREATE_USER);

  const submitUser = () => {
    createUser({variables: credentials});
    setCredentials(defaultCredentials);
  }

  return (
    <div>
      {JSON.stringify(credentials)}
      <br />
      Username
      <input type="text" value={credentials.username} onChange={({target: {value}}) => setCredentials({...credentials, username: value})}/>
      Password
      <input type="text" value={credentials.password} onChange={({target: {value}}) => setCredentials({...credentials, password: value})}/>
      Email
      <input type="text" value={credentials.email} onChange={({target: {value}}) => setCredentials({...credentials, email: value})}/>
      <br />
      <button onClick={submitUser}>Create User</button>
    </div>
  )
}

export default UserCreation
