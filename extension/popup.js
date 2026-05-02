document.addEventListener("DOMContentLoaded", async()=>{
    const {backendUrl, syncToken, gfgHandle} = await chrome.storage.local.get(["backendUrl","syncToken","gfgHandle"]);
    if(backendUrl && syncToken && gfgHandle){
        document.getElementById('main').style.display = 'block';
        document.getElementById('setup').style.display = 'none';
    }
    else {
        document.getElementById('main').style.display = 'none';
        document.getElementById('setup').style.display = 'block';

    }

})

document.getElementById("save-btn").addEventListener("click", async()=>{
    const backendUrl = document.getElementById("backendUrl").value.trim();
    const syncToken = document.getElementById("syncToken").value.trim();
    const gfgHandle = document.getElementById("gfgHandle").value.trim();

    await chrome.storage.local.set({backendUrl, syncToken, gfgHandle});
    document.getElementById('main').style.display = 'block';
    document.getElementById('setup').style.display = 'none';

})

document.getElementById("LCSync").addEventListener("click", async() => {
    document.getElementById("status").textContent = "Syncing Leetcode...";
      chrome.runtime.sendMessage({type: "SYNC_LEETCODE"}, (response) => {
        if(response.success) {
             document.getElementById("status").textContent = `Synced ${response.count} problems!`;


        }
        else{
             document.getElementById("status").textContent = `Error : ${response.error}!`;

        }
    });
   
})

document.getElementById("GFGSync").addEventListener("click", async()=>{
        document.getElementById("status").textContent = "Syncing GFG...";
         chrome.runtime.sendMessage({type: 'SYNC_GFG'}, (response)=> {
            if(response.success)  document.getElementById("status").textContent =`Synced ${response.count} problems!`
            else document.getElementById("status").textContent =`Error: ${response.error}!`
        })
})

document.getElementById("reset").addEventListener("click", async() => {
    await chrome.storage.local.clear();
     document.getElementById('main').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
})