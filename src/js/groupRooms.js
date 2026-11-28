import { getGuestSession, sdk } from "./groupAuth.js";

export async function createRoom(code) {
    const [{ app, user }, { doc, getFirestore, serverTimestamp, setDoc }] = await Promise.all([
        getGuestSession(),
        import(sdk + "firebase-firestore.js"),
    ]);
    const room = doc(getFirestore(app), "rooms", code);
    await setDoc(room, {
        hostUid: user.uid,
        createdAt: serverTimestamp(),
    });
}

export async function joinRoom(code) {
    const [{ app, user }, { doc, getFirestore, runTransaction, serverTimestamp }] = await Promise.all([
        getGuestSession(),
        import(sdk + "firebase-firestore.js"),
    ]);
    const database = getFirestore(app);
    const member = doc(database, "rooms", code, "members", user.uid);
    await runTransaction(database, async transaction => {
        const existing = await transaction.get(member);
        if (!existing.exists()) {
            transaction.set(member, { joinedAt: serverTimestamp() });
        }
    });
}
