document.addEventListener("DOMContentLoaded", async () => {
    const { backendUrl, syncToken, gfgHandle } = await chrome.storage.local.get(["backendUrl", "syncToken", "gfgHandle"]);
    if (backendUrl && syncToken && gfgHandle) {
        document.getElementById("main").style.display = "block";
        document.getElementById("setup").style.display = "none";
    } else {
        document.getElementById("main").style.display = "none";
        document.getElementById("setup").style.display = "block";
    }
});

document.getElementById("save-btn").addEventListener("click", async () => {
    const backendUrl = document.getElementById("backendUrl").value.trim();
    const syncToken = document.getElementById("syncToken").value.trim();
    const gfgHandle = document.getElementById("gfgHandle").value.trim();
    if (!backendUrl || !syncToken) return;
    await chrome.storage.local.set({ backendUrl, syncToken, gfgHandle });
    document.getElementById("main").style.display = "block";
    document.getElementById("setup").style.display = "none";
});

function setStatus(html, type) {
    const el = document.getElementById("status");
    el.innerHTML = html;
    el.className = "status " + (type || "");
}

function setSyncing(isSyncing) {
    document.getElementById("LCSync").disabled = isSyncing;
    document.getElementById("GFGSync").disabled = isSyncing;
}

document.getElementById("LCSync").addEventListener("click", async () => {
    setStatus('<span class="spinner"></span>Syncing LeetCode…', "syncing");
    setSyncing(true);
    chrome.runtime.sendMessage({ type: "SYNC_LEETCODE" }, (response) => {
        setSyncing(false);
        if (response.success) setStatus(`✓ Synced ${response.count} LeetCode problems`, "success");
        else setStatus(`✗ ${response.error}`, "error");
    });
});

document.getElementById("GFGSync").addEventListener("click", async () => {
    setStatus('<span class="spinner"></span>Syncing GeeksForGeeks…', "syncing");
    setSyncing(true);
    chrome.runtime.sendMessage({ type: "SYNC_GFG" }, (response) => {
        setSyncing(false);
        if (response.success) setStatus(`✓ Synced ${response.count} GFG problems`, "success");
        else setStatus(`✗ ${response.error}`, "error");
    });
});

document.getElementById("reset").addEventListener("click", async () => {
    await chrome.storage.local.clear();
    document.getElementById("main").style.display = "none";
    document.getElementById("setup").style.display = "block";
});
