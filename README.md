# New start

## Firebase guest sign-in

Enable the Anonymous sign-in provider in Firebase Authentication. Copy the
Firebase web app configuration into `src/js/config.js` and export the object as
`firebaseConfig` (change `const firebaseConfig` to `export const firebaseConfig`).
Git ignores this local file. Use only the Firebase web app configuration here.

Run the site over HTTP and open **Online groups** to preview an invitation. The preview needs no account. When shared rooms are connected, creating or joining a room will start a Firebase guest session automatically.
