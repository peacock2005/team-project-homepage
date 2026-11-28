export const sdk = "https://www.gstatic.com/firebasejs/13.4.0/";
let guestSession;

export function getGuestSession() {
    guestSession ??= connectGuest().catch(error => {
        guestSession = undefined;
        throw error;
    });
    return guestSession;
}

async function connectGuest() {
    const { firebaseConfig } = await import("./config.js");
    const [{ getApps, initializeApp }, { getAuth, signInAnonymously }] = await Promise.all([
        import(sdk + "firebase-app.js"),
        import(sdk + "firebase-auth.js"),
    ]);
    const name = "frame-check-groups";
    const app = getApps().find(candidate => candidate.name === name)
        ?? initializeApp(firebaseConfig, name);
    const auth = getAuth(app);
    await auth.authStateReady();
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
    return { app, user };
}
