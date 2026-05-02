 export function extractPlatformId( url, platformName) {
    const platform = platformName.toLowerCase();
    if(platform.includes("codeforces")){
        const m1 = url.match(/\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
        if(m1) { return `${m1[1]}/${m1[2].toUpperCase()}`;}
        const m2 = url.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if(m2) return `${m2[1]}/${m2[2].toUpperCase()}`


    }
    if(platform.includes("leetcode")) {
        const m1 = url.match(/\/problems\/([A-Za-z0-9-]+)/i);
        if(m1){ return `${m1[1].toLowerCase()}`};
    }


    if(platform.includes("gfg") || platform.includes("geeksforgeeks")) {
        const m1 = url.match(/\/problems\/([A-Za-z0-9-]+)/i);
        if(m1){ return m1[1].toLowerCase().replace(/-{1,2}\d+$/, '')};
    }
    
        return null;
 }