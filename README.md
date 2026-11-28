# New start

## Firebase guest sign-in

Enable the Anonymous sign-in provider in Firebase Authentication. Copy the
Firebase web app configuration into `src/js/config.js` and export the object as
`firebaseConfig` (change `const firebaseConfig` to `export const firebaseConfig`).
Git ignores this local file. Use only the Firebase web app configuration here.

Run the site over HTTP, open **Online groups**, and select **Connect as guest**.
The room controls below are still previews.
