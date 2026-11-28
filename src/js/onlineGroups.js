const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const roomCodePattern = /^[A-HJ-NP-Z2-9]{8}$/;

export function normalizeRoomCode(value) {
    const code = value.trim().toUpperCase();
    return roomCodePattern.test(code) ? code : null;
}

export function makeInviteLink(pageUrl, code) {
    const url = new URL(pageUrl);
    url.search = "";
    url.hash = "";
    url.searchParams.set("room", code);
    return url.href;
}

function generateRoomCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

export function setupOnlineGroups(section) {
    const joinForm = section.querySelector("form");
    const codeInput = joinForm.elements.roomCode;
    const room = section.querySelector(".online-groups_room");
    const heading = room.querySelector("h3");
    const details = room.querySelector("p");
    const inviteField = room.querySelector("input");
    const inviteLabel = room.querySelector("label");
    const status = section.querySelector("[role=status]");
    const preferences = room.querySelector(".online-groups_preferences");
    const preferenceStatus = preferences.querySelector("[role=status]");
    const saveButton = preferences.querySelector('button[type="submit"]');
    const choiceFields = preferences.querySelectorAll('input[type="checkbox"]');
    let activeRoom;
    let preferencesReady = false;

    preferences.addEventListener("submit", async event => {
        event.preventDefault();
        if (!preferencesReady || saveButton.disabled) return;
        const code = activeRoom;
        const data = new FormData(preferences);
        saveButton.disabled = true;
        preferenceStatus.textContent = "Saving choices…";
        try {
            const { saveRoomPreferences } = await import("./groupRooms.js");
            await saveRoomPreferences(code, {
                avoidedTriggers: data.getAll("trigger"),
                genres: data.getAll("genre"),
            });
            if (activeRoom === code) preferenceStatus.textContent = "Your choices are saved.";
        } catch {
            if (activeRoom === code) preferenceStatus.textContent = "Could not save your choices. Try again.";
        } finally {
            if (activeRoom === code) saveButton.disabled = !preferencesReady;
        }
    });

    async function showRoom(code, isHost) {
        preferences.reset();
        preferencesReady = false;
        saveButton.disabled = true;
        for (const field of choiceFields) field.disabled = true;
        activeRoom = code;
        preferenceStatus.textContent = "Loading your choices…";
        heading.textContent = isHost ? `Room created · ${code}` : `Room joined · ${code}`;
        details.textContent = isHost
            ? "Share the invite link for one-click joining, or share the room code."
            : "You joined using a guest session.";
        inviteLabel.hidden = !isHost;
        inviteField.value = isHost ? makeInviteLink(window.location.href, code) : "";
        status.textContent = "";
        room.hidden = false;
        heading.focus();

        try {
            const { loadRoomPreferences } = await import("./groupRooms.js");
            const saved = await loadRoomPreferences(code);
            const selected = {
                trigger: new Set(saved?.avoidedTriggers),
                genre: new Set(saved?.genres),
            };
            for (const field of choiceFields) {
                field.checked = selected[field.name].has(field.value);
                field.disabled = false;
            }
            preferencesReady = true;
            saveButton.disabled = false;
            preferenceStatus.textContent = saved ? "Your saved choices were restored." : "";
        } catch {
            preferenceStatus.textContent = "Could not load your choices. Reopen the invite to try again.";
        }
    }

    const createButton = section.querySelector("[data-create-room]");
    const joinButton = joinForm.querySelector('button[type="submit"]');
    createButton.addEventListener("click", async () => {
        createButton.disabled = true;
        joinButton.disabled = true;
        room.hidden = true;
        status.textContent = "Creating room…";
        try {
            const code = generateRoomCode();
            const { createRoom } = await import("./groupRooms.js");
            await createRoom(code);
            await showRoom(code, true);
        } catch {
            status.textContent = "Could not create the room. Check your connection and try again.";
        } finally {
            createButton.disabled = false;
            joinButton.disabled = false;
        }
    });

    let joining = false;

    async function join(code) {
        if (joining || createButton.disabled) return;
        joining = true;
        codeInput.value = code;
        createButton.disabled = true;
        joinButton.disabled = true;
        room.hidden = true;
        status.textContent = "Joining room…";
        try {
            const { joinRoom } = await import("./groupRooms.js");
            await joinRoom(code);
            await showRoom(code, false);
        } catch {
            status.textContent = "Could not join this room. Check the invitation and try again.";
        } finally {
            joining = false;
            createButton.disabled = false;
            joinButton.disabled = false;
        }
    }

    joinForm.addEventListener("submit", event => {
        event.preventDefault();
        const code = normalizeRoomCode(codeInput.value);
        if (!code) {
            status.textContent = "Enter the eight-character code from your invitation.";
            codeInput.focus();
            return;
        }
        void join(code);
    });

    const inviteCode = new URLSearchParams(window.location.search).get("room");
    if (inviteCode !== null) {
        section.open = true;
        const code = normalizeRoomCode(inviteCode);
        if (code) {
            void join(code);
        } else {
            status.textContent = "This invitation contains an invalid room code.";
        }
    }
}

if (typeof document !== "undefined") {
    setupOnlineGroups(document.querySelector(".online-groups"));
}
