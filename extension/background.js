chrome.runtime.onMessage((msg, sender, sendResponse) => {
    if (msg.type === "SYNC_LEETCODE") {
        syncLeetCode()
                .then(result => sendResponse({success: true, ...result}))
                .catch(err => sendResponse({success: false, error: err.message}));
        return true;

    }

    if(msg.type === "SYNC_GFG") {
        syncGFG()
                .then((result) => ({success: true, ...result}))
                .catch((err) => {success: true, err.message});
            return true;
    }
})


const syncLeetCode= () => {
    const {backendUrl, syncToken} = await chrome.storage.local.get(["backendUrl", "syncToken"]);
    const sessionCookie = await chrome.cookies.get({ url: "https://leetcode.com", name: "LEETCODE_SESSION"});
    const csrfCookie = await chrome.cookies.get({url:"https://leetcode.com", name: "csrftoken"});
    if(!sessionCookie) throw new Error("Not logged into Leetcode")
    const query = `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip filters: $filters) {
            questions: data { titleSlug status }
        }
    }`;
    const variables = { categorySlug: "", skip: 0, limit: 3000, filters: { status: "AC" } };

}