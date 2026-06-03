chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "GFG_FETCH_SUBMISSIONS") return;

    const csrfToken = document.cookie.split('; ')
        .find(c => c.startsWith('csrftoken='))?.split('=')[1] ?? '';

    fetch("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-CSRFToken": csrfToken,
            "Referer": "https://www.geeksforgeeks.org",
            "Origin": "https://www.geeksforgeeks.org"
        },
        body: JSON.stringify({ handle: msg.handle, requestType: "", year: "", month: "" })
    })
    .then(async res => {
        const text = await res.text();
        if (!res.ok || text.trimStart().startsWith('<')) {
            sendResponse({ success: false, error: `GFG API returned HTTP ${res.status} — ${res.ok ? "unexpected HTML response (API may have changed)" : "not authenticated or endpoint changed"}` });
            return;
        }
        try {
            sendResponse({ success: true, data: JSON.parse(text) });
        } catch {
            sendResponse({ success: false, error: `GFG API parse error — response started with: ${text.slice(0, 80)}` });
        }
    })
    .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // keep channel open for async response
});
