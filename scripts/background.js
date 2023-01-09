function injectedFunction() {
    document.body.style.backgroundColor = 'orange';
    console.log("ALO ALO");
  }
  
chrome.action.onClicked.addListener((tab) => {
    console.log("ALO ALO");
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injectedFunction
    });
});