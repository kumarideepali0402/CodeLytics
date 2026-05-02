chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "SYNC_LEETCODE") {
        syncLeetCode()
                .then(result => sendResponse({success: true, ...result}))
                .catch(err => sendResponse({success: false, error: err.message}));
        return true;

    }

    if(msg.type === "SYNC_GFG") {
        syncGFG()
                .then((result) => sendResponse({success: true, ...result}))
                .catch((err) => sendResponse({success: false, error: err.message}));
            return true;
    }
})


const syncLeetCode= async() => {
    const {backendUrl, syncToken} = await chrome.storage.local.get(["backendUrl", "syncToken"]);
    const sessionCookie = await chrome.cookies.get({ url: "https://leetcode.com", name: "LEETCODE_SESSION"});
    const csrfCookie = await chrome.cookies.get({url:"https://leetcode.com", name: "csrftoken"});
    if(!sessionCookie) throw new Error("Not logged into Leetcode")

    const authRes = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Cookie": `LEETCODE_SESSION=${sessionCookie.value}; csrftoken=${csrfCookie.value ?? ""}`,
            "x-csrftoken" : csrfCookie?.value?? "",
            "Referer": "https://leetcode.com"
        },
        body: JSON.stringify({
            query: `query globalData {
            userStatus {
                isSignedIn
                username

            }}`
        })
    });
    const authData = await authRes.json();
    if (!authData.data.userStatus.isSignedIn) {
        throw new Error("Not logged into Leetcode")
    }
    const res = await fetch("https://leetcode.com/api/problems/all/", {
        method:"GET",
        headers: {
            "Cookie": `LEETCODE_SESSION=${sessionCookie.value}; csrftoken=${csrfCookie.value ?? ""}`,
            "Referer": "https://leetcode.com"
        }


    })
    const data = await res.json();

    const solvedIds = data.stat_status_pairs
    .filter(p => p.status === 'ac')
    .map(p=> p.stat.question__title_slug);

    await fetch(`${backendUrl}/api/student/ext-sync`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Authorization" : `Bearer ${syncToken}`
        },
        body: JSON.stringify({platform:'leetcode', solvedIds})

    });

    return { count: solvedIds.length };


   
}

const syncGFG = async() => {
    const {backendUrl, syncToken, gfgHandle} = await chrome.storage.local.get(["backendUrl", "syncToken", "gfgHandle"]);
    if (!gfgHandle) throw new Error("GFG username not set — reset extension settings and add your GFG handle");

    const tabs = await chrome.tabs.query({ url: "*://*.geeksforgeeks.org/*" });
    if (tabs.length === 0) throw new Error("Please open a GeeksForGeeks tab first");

    const handle = gfgHandle;
    const [{ result: data }] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: async (userHandle) => {
            const csrfToken = document.cookie.split('; ')
                .find(c => c.startsWith('csrftoken='))?.split('=')[1] ?? '';
            const res = await fetch("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRFToken": csrfToken,
                    "Referer": "https://www.geeksforgeeks.org",
                    "Origin": "https://www.geeksforgeeks.org"
                },
                body: JSON.stringify({
                    handle: userHandle,
                    requestType: "",
                    year: "",
                    month: ""
                })
            });
            return { status: res.status, json: await res.json() };
        },
        args: [handle]
    });

    console.log("[GFG debug]", JSON.stringify(data));

    const json = data.json;
    if (!json.result || json.status !== "success") throw new Error(json.message ?? "GFG API error");
    const result = json.result;

    const solvedIds = []
   
    const solvedIdsObj = Object.values(result);
    for(const difficulty of solvedIdsObj) {
        for(const problem of Object.values(difficulty)) {
            solvedIds.push(problem.slug.replace(/-{1,2}\d+$/, ''))

        }
    }

    const backendRes = await fetch(`${backendUrl}/api/student/ext-sync`,{
        method: "POST",
        headers:{
            "Content-type" : "application/json",
            "Authorization": `Bearer ${syncToken}`
        },
        body: JSON.stringify({platform:"geeksforgeeks", solvedIds})
    })

    if (!backendRes.ok) {
        const err = await backendRes.json();
        throw new Error(err.msg ?? "Backend sync failed");
    }

    return { count: solvedIds.length }

}