# New start

## Firebase guest sign-in

Enable the Anonymous sign-in provider in Firebase Authentication. Copy the
Firebase web app configuration into `src/js/config.js` and export the object as
`firebaseConfig` (change `const firebaseConfig` to `export const firebaseConfig`).
Git ignores this local file. Use only the Firebase web app configuration here.

Create a Standard Cloud Firestore database and publish the rules in
`firestore.rules` before testing room creation. Run the site over HTTP and select
**Online groups → Create room**. Firebase starts a guest session automatically.
An invitation appears after Firestore confirms creation. Opening its link joins
the room automatically. You can also enter a room code from the homepage.
For invitations across devices, open Frame Check on a shared hosted URL before
creating the room. Links made on localhost only work on that device.
