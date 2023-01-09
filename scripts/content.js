function addLocationObserver(callback) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    // observer.observe(document.body.getElementsByClassName("css-1dbjc4n r-1jgb5lz r-1ye8kvj r-13qz1uu")[0], config);
    observer.observe(document.body, config);
}

var observed_tweet_elements = [];
var observed_tweet_compare = "";
function visibilityCallback(){
    body = document.body;
    tweets = body.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");

    // console.log("tweets.length is " + tweets.length);
    for (i=0; i<tweets.length; i++){
        // console.log("tweets["+i+"] is" + tweets[i]);
        if (tweets[i].innerHTML.includes("css-1dbjc4n r-1s2bzr4")){
            // console.log("A PROMOTION!!!");
            continue;
        }
        if (tweets[i].innerHTML.includes("mola-mood-detect")){
            // console.log("MOOD ALREADY DETECTED AT INDEX " + i +" !!");
            continue;
        }
        if (observed_tweet_compare.includes(tweets[i].innerText)){
            // console.log("Tweet " + i +" already pushed to list !!");
            continue;
        }
        observed_tweet_elements.push(tweets[i]);
        
        observed_tweet_compare += " " + tweets[i].innerText;
    }
    respondToVisibility(observed_tweet_elements, observerCallback);
    // observerCallback();
}

function respondToVisibility(elements, callback) {
    var options = {
      root: document.documentElement,
    };
  
    var observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        callback(entry.intersectionRatio > 0);
      });
    }, options);

    for (i=0; i < elements.length; i++){
        if (elements[i]) {
            observer.observe(elements[i]);
        }
    };
  }

var tweet_texts = [];
var tweet_compare = "";
var tweet_elements = [];
var tweet_elements_lens = [];

function observerCallback() {
    if (window.location.href.startsWith('https://twitter.com')) {
        console.log("--------CALLBACK");
        console.log("|");
        console.log("|");

        root = document.getElementById("react-root");
        tweets = root.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");

        for (i=0; i<tweets.length; i++){
            // console.log("tweets["+i+"] is" + tweets[i]);
            if (tweets[i].innerHTML.includes("css-1dbjc4n r-1s2bzr4")){
                // console.log("A PROMOTION!!!");
                continue;
            }
            if (tweets[i].innerHTML.includes("mola-mood-detect")){
                // console.log("MOOD ALREADY DETECTED AT INDEX " + i +" !!");
                continue;
            }
            if (tweet_compare.includes(tweets[i].innerText)){
                // console.log("Tweet " + i +" already pushed to list !!");
                continue;
            }
            // console.log("Tweet pushed to list !!");

            tweet_texts.push({"tweet_text": tweets[i].innerText});
            tweet_elements.push(tweets[i]);
            
            tweet_compare += " " + tweets[i].innerText;
            // console.log("LEVEL 1 - index pushed is:  " + i);
        }
        if (tweet_elements.length != tweet_elements_lens[tweet_elements_lens.length-1]){
            tweet_elements_lens.push(tweet_elements.length);
            // indices_strings.push(tweet_elements.join(""));
            // console.log("LEVEL 1 - tweet_elements.length is: " + tweet_elements.length);
            // console.log("LEVEL 1 - tweet_elements_lens list is: " + tweet_elements_lens.toString());
            
            detect_eng(tweet_texts, tweet_elements);
        }
    }
}


setTimeout(() => {
    console.log("Delayed for 3 second.");
    // addLocationObserver(visibilityCallback);
    body = document.body;
    tweets = body.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");
    
    respondToVisibility(tweets, observerCallback);
}, "2000");


// Detect English
function detect_eng(tweet_texts, tweet_els){
    console.log("--------Detect!!!");
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var tweets = [];
            var tweet_els_l2 = [];

            doc = eval('(' + req.responseText + ')');
            
            for (var i=0; i < doc.length; i++){
                // console.log("doc[" + j + "] is " + doc[j].tweet_text);
                // console.log("i to indices["+j+"] is: " + i + " - " + indices[j]);
                if (doc[i].is_english == true){
                    tweets.push({"tweet_text": doc[i].tweet_text});
                    tweet_els_l2.push(tweet_els[i]);
                    // console.log("LEVEL 2 - index pushed is:  " + j);
                }
            }
            console.log("tweets.length are " + tweets.length);
            // console.log("indices.length are " + indices.length);
            if (tweets.length > 0){
                // console.log("LEVEL 2 - indices list is: " + tweet_els_l2.toString());
                sentiment_classfication(tweets, tweet_els_l2);
            }
        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/language-detection`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(tweet_texts));
}

// Sentiment Classification
function sentiment_classfication(tweets, tweet_els){
    console.log("--------Sentiment classification!!!");
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            doc = eval('(' + req.responseText + ')');

            for (var i=0; i < doc.length; i++){
                // console.log("i to indices[j] is: " + i + " - " + indices[j]);
                const el = document.createElement("p");

                el.classList.add("css-4rbku5", "css-18t94o4", "css-901oao", "r-14j79pv", "r-1loqt21", "r-xoduu5",
                                "r-1q142lx", "r-1w6e6rj", "r-37j5jr", "r-a023e6", "r-16dba41", "r-9aw3ui", "r-rjixqe",
                                "r-bcqeeo", "r-3s2u2q", "r-qvutc0", "mola-mood-detect");
                
                if (doc[i].detected_mood == "NEUTRAL"){
                    // console.log("Detected Mood: 😐 NEUTRAL");
                    el.textContent = `Detected Mood: 😐`;
                }
                else if (doc[i].detected_mood == "NEGATIVE"){
                    // console.log("Detected Mood: ☹️ NEGATIVE");
                    el.textContent = `Detected Mood: ☹️`;
                }
                else if (doc[i].detected_mood == "POSITIVE"){
                    // console.log("Detected Mood: 😊 POSITIVE");
                    el.textContent = `Detected Mood: 😊`;
                }
                // console.log("time_el at " + j);
                // console.log(" ---> is " + time_el[j].innerText);

                tweet_el = tweet_els[i].getElementsByClassName("css-1dbjc4n r-18u37iz r-1wbh5a2 r-13hce6t");
                wrap_tweet_el = tweet_els[i].getElementsByClassName("css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2 r-dnmrzs r-1ny4l3l");

                if (!wrap_tweet_el[0].innerHTML.includes("mola-mood-detect")){
                    tweet_el[0].insertAdjacentElement("afterend", el);
                    tweet_el[0].insertAdjacentHTML("afterend", '<div dir="ltr" aria-hidden="true" class="css-901oao r-14j79pv r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-s1qlax r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">·</span></div>');
                    // console.log("!!!!!!!!!!!!!!!!! Inserted Mood at index !!!!!!!!!!!!!!!!!!");
                }
            }
        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/sentiment-score`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(tweets));
}