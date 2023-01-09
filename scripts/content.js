function addLocationObserver(callback) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback)

    // Start observing the target node for configured mutations
    observer.observe(document.body, config)
}

function observerCallback() {
    if (window.location.href.startsWith('https://twitter.com')) {
        root = document.getElementById("react-root");

        tweets = root.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");

        var tweet_texts = [];

        for (i=0; i<tweets.length; i++){
            console.log("tweets[i].textContent is" + tweets[i].textContent);
            if (tweets[i].innerHTML.includes("css-1dbjc4n r-1s2bzr4")){
                console.log("A PROMOTION!!!");
                continue;
            }
            tweet_texts.push({"tweet_text": tweets[i].innerText});
        }
        detect_eng(tweet_texts);
    }
}

addLocationObserver(observerCallback);
observerCallback();

// Detect English
function detect_eng(tweet_texts){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var tweets = []
            var indices = []
            doc = eval('(' + req.responseText + ')');
            for (i=0; i < doc.length; i++){
                if (doc[i].is_english == true){
                    tweets.push({"tweet_text": doc[i].tweet_text});
                    indices.push(i);
                    console.log("index pushed is:  " + i);
                }
            }
            console.log("tweets.length are " + tweets.length);
            console.log("indices.length are " + indices.length);
            sentiment_classfication(tweets, indices);
        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/language-detection`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(tweet_texts));
}

// Sentiment Classification
function sentiment_classfication(tweets, indices){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            doc = eval('(' + req.responseText + ')');
            j = 0;
            time_el = document.getElementsByClassName("css-1dbjc4n r-18u37iz r-1wbh5a2 r-13hce6t")
            for (i=0; i < time_el.length; i++){
                // console.log("i to indices[j] is: " + i + " - " + indices[j]);
                if (i != indices[j]){
                    continue;
                }
                const el = document.createElement("p");
                const span = document.createElement("span");

                el.classList.add("css-4rbku5", "css-18t94o4", "css-901oao", "r-14j79pv", "r-1loqt21", "r-xoduu5",
                                "r-1q142lx", "r-1w6e6rj", "r-37j5jr", "r-a023e6", "r-16dba41", "r-9aw3ui", "r-rjixqe",
                                "r-bcqeeo", "r-3s2u2q", "r-qvutc0");
                
                if (doc[j].detected_mood == "NEUTRAL"){
                    console.log("Detected Mood: 😐 NEUTRAL");
                    el.textContent = `Detected Mood: 😐`;
                }
                else if (doc[j].detected_mood == "NEGATIVE"){
                    console.log("Detected Mood: ☹️ NEGATIVE");
                    el.textContent = `Detected Mood: ☹️`;
                }
                else if (doc[j].detected_mood == "POSITIVE"){
                    console.log("Detected Mood: 😊 POSITIVE");
                    el.textContent = `Detected Mood: 😊`;
                }
                console.log("time_el at " + j);
                console.log(" ---> is " + time_el[j].innerText);

                time_el[j].insertAdjacentElement("afterend", el);
                time_el[j].insertAdjacentHTML("afterend", '<div dir="ltr" aria-hidden="true" class="css-901oao r-14j79pv r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-s1qlax r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">·</span></div>');
                j += 1;
            }
        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/sentiment-score`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(tweets));
}