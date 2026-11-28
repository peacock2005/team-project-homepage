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
