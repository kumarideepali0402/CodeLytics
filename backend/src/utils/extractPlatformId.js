 export function extractPlatformId( url, platformName) {
    const platform = platformName.toLowerCase();
    if(platform.includes("codeforces")){
        const m1 = url.match(/\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
        if(m1) { return `${m1[1]}/${m1[2].toUpperCase()}`;}
        const m2 = url.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if(m2) return `${m2[1]}/${m2[2].toUpperCase()}`


        return null;
    }

 }