from flask import Flask, request, json, jsonify

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig

import numpy as np
from scipy.special import softmax

from flask import Flask
from flask_cors import CORS


app = Flask(__name__)
app.config['CORS_HEADERS'] = '*'
CORS(app)

# print("\n\n\nBEFORE FIRST REQUEST")
LANG_DETECT_TOKENIZER = AutoTokenizer.from_pretrained("models/language-detection")
LANG_DETECTOR_MODEL = AutoModelForSequenceClassification.from_pretrained("models/language-detection")

SENTIMENT_TOKENIZER = AutoTokenizer.from_pretrained("models/sentiment-classification")
SENTIMENT_CONFIG = AutoConfig.from_pretrained("models/sentiment-classification")
SENTIMENT_MODEL = AutoModelForSequenceClassification.from_pretrained("models/sentiment-classification")
# print("\n\n\nFINISHED LOADING MODELS")


@app.route('/api/language-detection', methods=['POST'])
def detect_eng():
    tweets = json.loads(request.data)
    tweet_texts = [tweet["tweet_text"] for tweet in tweets]

    langs = []
    for text in tweet_texts:
        inputs = LANG_DETECT_TOKENIZER(text, return_tensors="pt")

        with torch.no_grad():
            logits = LANG_DETECTOR_MODEL(**inputs).logits

        predicted_class_id = logits.argmax().item()
        langs.append(LANG_DETECTOR_MODEL.config.id2label[predicted_class_id])
    
    results = jsonify([{"tweet_text": tweet_text, "is_english": True if lang=='en' else False} for lang, tweet_text in zip(langs, tweet_texts)])
    
    results.headers.add('Access-Control-Allow-Origin', 'https://twitter.com')

    return results

@app.route('/api/sentiment-score', methods=['POST'])
def sentiment_score():
    # Preprocess text (username and link placeholders)
    def preprocess(text):
        new_text = []
        for t in text.split(" "):
            t = '@user' if t.startswith('@') and len(t) > 1 else t
            t = 'http' if t.startswith('http') else t
            new_text.append(t)
        return " ".join(new_text)

    tweets = json.loads(request.data)
    tweet_texts = [tweet["tweet_text"] for tweet in tweets]
    results = []

    for tweet_text in tweet_texts:
        text = preprocess(tweet_text)

        encoded_input = SENTIMENT_TOKENIZER(text, return_tensors='pt')
        output = SENTIMENT_MODEL(**encoded_input)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)

        ranking = np.argsort(scores)
        ranking = ranking[::-1]

        results.append({
            "tweet_text": tweet_text,
            "sentiment_score": {
                "positive": float(scores[2]),
                "neutral": float(scores[1]),
                "negative": float(scores[0]),
            },
            "detected_mood": SENTIMENT_CONFIG.id2label[ranking[0]].upper()})
    
    results = jsonify(results)

    results.headers.add('Access-Control-Allow-Origin', 'https://twitter.com')

    return results

@app.route('/')
def root():
    return "Hello world"

if __name__ == '__main__':
    port = 5351  # custom port
    app.run(host='0.0.0.0', port=port)
