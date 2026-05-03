# Concepts Learned: GFG Extension Debugging

---

## 1. Chrome Extension Architecture (MV3)

A Chrome extension has three distinct contexts:

| Context | Origin | Has page cookies? |
|---|---|---|
| Service Worker (background.js) | `chrome-extension://abc123` | No |
| Content Script | Same as the page | Yes |
| Injected via executeScript | Same as the tab | Yes |

The service worker is like a standalone Node process. It has no browser tab, no DOM, no cookie jar for other domains. It runs in the background and handles messages.

---

## 2. Why `credentials: "include"` Fails from Service Worker

```js
// From service worker — DOES NOT WORK
fetch("https://practiceapi.geeksforgeeks.org/...", {
    credentials: "include"  // sends cookies for chrome-extension://... origin
                            // which is empty — no GFG cookies here
})
```

`credentials: "include"` tells the browser: send cookies associated with **the fetch's origin**. The service worker's origin is `chrome-extension://...`, not `geeksforgeeks.org`. So no GFG cookies are ever attached.

---

## 3. Why Manual `Cookie` Header Also Fails

```js
// Also fails
fetch(url, {
    headers: { "Cookie": "sessionid=abc123" }
})
```

`Cookie` is a **forbidden header**. The browser silently strips it from fetch requests as a security measure — even in extensions. You cannot manually set it.

---

## 4. The Fix: `chrome.scripting.executeScript`

Run the fetch **inside a GFG tab** where the origin is already `geeksforgeeks.org`:

```js
const tabs = await chrome.tabs.query({ url: "*://*.geeksforgeeks.org/*" });

chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: async (userHandle) => {
        // This runs INSIDE the GFG tab
        // Origin = geeksforgeeks.org
        // credentials: "include" now sends real GFG session cookies
        const res = await fetch("https://practiceapi.geeksforgeeks.org/...", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ handle: userHandle, ... })
        });
        return res.json();
    },
    args: [handle]  // must pass data via args — func is serialized, can't close over variables
});
```

**Why `args`?** The function passed to `executeScript` is serialized (converted to a string) and sent to the tab. It loses all closure context. Any external variables must be passed explicitly through `args`.

**Limitation:** Requires a GFG tab to be open. This is unavoidable — cookies live in tabs.

---

## 5. How to Debug an Unknown API (DevTools Method)

When an API has no public docs:

1. Open DevTools → Network tab
2. Navigate to the page that loads the data you want
3. Filter by the API domain
4. Click the request → **Headers tab** (see what headers the site sends)
5. Click the request → **Payload tab** (see the exact request body)
6. Click the request → **Response tab** (understand the data structure)

This is how we found:
- The body needs `{ handle, requestType, year, month }`
- The `Accept: application/json` header was required
- `requestType: ""` with empty year returns all solved problems

---

## 6. HTTP 406 Not Acceptable

Standard meaning: server can't produce a response in any format the client accepts (related to the `Accept` header).

GFG's API uses 406 non-standardly — as a generic "bad request" code meaning "missing required user details". The response body tells the real story: always read the response body, not just the status code.

---

## 7. IDOR — Insecure Direct Object Reference

```js
body: JSON.stringify({ handle: "someone_else", ... })
```

GFG's API authenticates you (checks you're logged in via session) but doesn't authorize you (doesn't check if you're allowed to access that specific handle's data). You can fetch any user's solved problems by changing the `handle` field.

This is called an **IDOR vulnerability**. GFG likely considers it acceptable since solved problems are public profile data anyway.

**Key distinction:**
- **Authentication** = proving who you are
- **Authorization** = proving you're allowed to do what you're asking

---

## 8. Slug Normalization (Data Consistency)

GFG's API returns slugs with numeric suffixes:
```
job-sequencing-problem-1587115620
merge-sort                          ← some don't have suffixes
```

DB URLs might look like:
```
https://www.geeksforgeeks.org/problems/job-sequencing-problem/0
```

Extracted slug: `job-sequencing-problem`

**The mismatch:** extension sends `"job-sequencing-problem"` (cleaned), but `extractPlatformId` on the DB URL returns `"job-sequencing-problem"` too — these match. The bug only hits problems where the DB URL itself has a suffix.

**Fix:** apply the same cleaning regex on both sides:
```js
slug.replace(/-{1,2}\d+$/, '')
// job-sequencing-problem-1587115620  →  job-sequencing-problem
// merge-sort                         →  merge-sort (no change)
```

**Rule:** whenever you compare data from two different sources, normalize both to the same format before comparing.

---

## 9. `return true` in Chrome Message Listener

```js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    doAsyncWork()
        .then(result => sendResponse(result));
    return true;  // ← this is critical
});
```

Without `return true`, Chrome assumes the response is synchronous and closes the message channel immediately. By the time `doAsyncWork()` resolves, `sendResponse` is no longer valid. `return true` keeps the channel open for an async response.

---

## 10. Bearer Token vs JWT Cookie

The rest of the app uses a JWT stored in an httpOnly cookie — sent automatically with every request by the browser.

`extSync` uses a Bearer token in the `Authorization` header instead:

```js
headers: { "Authorization": "Bearer <syncToken>" }
```

**Why?** The extension is not a browser tab. It doesn't share the cookie jar where the JWT lives. A manually stored token in `chrome.storage.local` (the syncToken) is the only thing the extension can access and send.

---

## 11. Never-Downgrade Upsert Pattern

```js
prisma.problemStatus.upsert({
    update: {
        ...(r.solved ? { status: "COMPLETED" } : {}),  // only update status if solved
        syncedAt: new Date()
    },
    create: {
        status: r.solved ? "COMPLETED" : "PENDING",
        syncedAt: new Date()
    }
})
```

If `r.solved = false`, the update object is just `{ syncedAt: new Date() }` — status is not touched. This prevents a sync from ever downgrading `COMPLETED → PENDING`. Once a problem is marked complete, it stays complete.

---

## 12. `Promise.all` for Parallel DB Writes

```js
// Sequential — slow, each waits for previous
for (const r of results) {
    await prisma.problemStatus.upsert(...)
}

// Parallel — all fire simultaneously
await Promise.all(results.map(r => prisma.problemStatus.upsert(...)))
```

`Promise.all` takes an array of promises and resolves when all of them resolve. Use it when operations are independent of each other.

---

## Questions to Answer Cold

- Why does the service worker need a GFG tab open to sync?
- Why can't you just set the `Cookie` header manually?
- Why does `executeScript` need `args` instead of closure?
- What does `return true` do in a message listener?
- What's the difference between authentication and authorization?
- What is an IDOR vulnerability?
- Why is Bearer token used in the extension instead of the JWT cookie?
- What does the never-downgrade upsert prevent?
- When would `Promise.all` be the wrong choice? (when operations depend on each other)
