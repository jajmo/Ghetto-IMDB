/**
 * Set up validation for the login and register forms.
 *
 * @file login.js
 */

/*global Ghetto*/

Ghetto.addValidation('form[action="/login"]', {
    username: /\w+/,
    password: /\w+/
});

Ghetto.addValidation('form[action="/register"]', {
    username: /\w+/,
    realname: /\w+/,
    password: /\w+/
});
