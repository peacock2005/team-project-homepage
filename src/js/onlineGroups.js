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
    const status = section.querySelector("[role=status]:not([data-guest-status])");
    const guestButton = section.querySelector("[data-guest-session]");
    const guestStatus = section.querySelector("[data-guest-status]");

    guestButton.addEventListener("click", async () => {
        guestButton.disabled = true;
        guestStatus.textContent = "Connecting to Firebase…";
        try {
            const { getGuestUser } = await import("./groupAuth.js");
            await getGuestUser();
            guestStatus.textContent = "Guest session connected.";
        } catch (error) {
            guestStatus.textContent = error.code === "auth/operation-not-allowed"
                ? "Guest sign-in is not enabled in Firebase."
                : "Could not connect as a guest. Check Firebase setup and try again.";
            guestButton.disabled = false;
        }
    });

    function showRoomPreview(code, isHost) {
        heading.textContent = `Room preview · ${code}`;
        details.textContent = isHost
            ? "This preview link opens the join screen. Online participation will be available after Firebase is connected."
            : "This code is ready to use once online participation is enabled.";
        inviteLabel.hidden = !isHost;
        inviteField.value = isHost ? makeInviteLink(window.location.href, code) : "";
        status.textContent = "";
        room.hidden = false;
        heading.focus();
    }

    section.querySelector("[data-create-room]").addEventListener("click", () => {
        showRoomPreview(generateRoomCode(), true);
    });

    joinForm.addEventListener("submit", event => {
        event.preventDefault();
        const code = normalizeRoomCode(codeInput.value);
        if (!code) {
            status.textContent = "Enter the eight-character code from your invitation.";
            codeInput.focus();
            return;
        }
        codeInput.value = code;
        showRoomPreview(code, false);
    });

    const inviteCode = new URLSearchParams(window.location.search).get("room");
    if (inviteCode !== null) {
        section.open = true;
        const code = normalizeRoomCode(inviteCode);
        if (code) {
            codeInput.value = code;
            showRoomPreview(code, false);
        } else {
            status.textContent = "This invitation contains an invalid room code.";
        }
    }
}

if (typeof document !== "undefined") {
    setupOnlineGroups(document.querySelector(".online-groups"));
}
