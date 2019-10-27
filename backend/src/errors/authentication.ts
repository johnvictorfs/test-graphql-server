import { createError } from 'apollo-errors';

export const WrongCredentialsError = createError('WrongCredentialsError', {
  message: 'The provided credentials are invalid.'
});

export const NotAuthenticatedError = createError('NotAuthenticatedError', {
  message: 'You have to be authenticated to do that.'
});

export const DuplicateUsernameError = createError('DuplicateUsernameError', {
  message: 'Username already exists.'
});

export const DuplicateEmailError = createError('DuplicateEmailError', {
  message: 'Email already exists.'
});
