tweets = document.getElementsByClassName("css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0");

var tweet_texts = [];
var req = new XMLHttpRequest();

for (i=0; i<tweets.length; i++){
    tweet_texts.concat(tweet_texts, {"tweet_text": tweets[i]});
}

// Detect English
function detect_eng(tweet_texts){
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var tweets = []
            var indices = []
            doc = eval('(' + req.responseText + ')'); 
            // lat = doc.loc.split(",")[0];
            // lng = doc.loc.split(",")[1];
            // yelpSearch(lat, lng, false);
            for (i=0; i < doc.length; i++){
                if (doc[i].is_english == true){
                    tweets.concat({"tweet_text": doc[i].tweet_text});
                    indices.concat(indices, [i]);
                }
            }
            sentiment_classfication(tweets, indices);

        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/language-detection`, true);
    req.send(JSON.stringify(tweet_texts));
}

// Sentiment Classification
function sentiment_classfication(tweets, indices){
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            doc = eval('(' + req.responseText + ')');
            j = 0;
            time_el = document.getElementsByClassName("css-4rbku5 css-18t94o4 css-901oao r-1bwzh9t r-1loqt21 r-xoduu5 r-1q142lx r-1w6e6rj r-37j5jr r-a023e6 r-16dba41 r-9aw3ui r-rjixqe r-bcqeeo r-3s2u2q r-qvutc0")
            for (i=0; i < time_el.length; i++){
                if (i != indices[j]){
                    continue;
                }
                const el = document.createElement("p");
                el.classlist.add("css-4rbku5", "css-18t94o4", "css-901oao", "r-1bwzh9t", "r-1loqt21",
                                "r-xoduu5", "r-1q142lx", "r-1w6e6rj", "r-37j5jr", "r-a023e6", "r-16dba41",
                                "r-9aw3ui", "r-rjixqe", "r-bcqeeo", "r-3s2u2q", "r-qvutc0");
                if (doc[j].detected_mood == "NEUTRAL"){
                    el.textContent = `Detected Mood: 😐`;
                }
                else if (doc[j].detected_mood == "NEGATIVE"){
                    el.textContent = `Detected Mood: ☹️`;
                }
                else if (doc[j].detected_mood == "POSITIVE"){
                    el.textContent = `Detected Mood: 😊`;
                }
                time_el[j].insertAdjacentElement("afterend", el);
                j += 1;
            }
        }
    };
    req.open("POST", `https://mola-challenge-vlvvyhv4ua-uw.a.run.app/api/sentiment-score`, true);
    req.send(JSON.stringify(tweets));
}