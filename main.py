from flask import Flask, request, json, jsonify

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
import numpy as np
from scipy.special import softmax


app = Flask(__name__)
app.config['CORS_HEADERS'] = '*'

@app.before_first_request
def load_models():
    global LANG_DETECTOR_MODEL, LANG_DETECT_TOKENIZER
    LANG_DETECT_TOKENIZER = AutoTokenizer.from_pretrained("eleldar/language-detection")
    LANG_DETECTOR_MODEL = AutoModelForSequenceClassification.from_pretrained("eleldar/language-detection")

    global SENTIMENT_TOKENIZER, SENTIMENT_CONFIG, SENTIMENT_MODEL
    SENTIMENT_TOKENIZER = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
    SENTIMENT_CONFIG = AutoConfig.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
    SENTIMENT_MODEL = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
        

@app.route('/api/language-detection', methods=['POST'])
def detect_eng():
    global LANG_DETECTOR_MODEL, LANG_DETECT_TOKENIZER

    tweet = json.loads(request.data)
    tweet_text = tweet["tweet_text"]

    inputs = LANG_DETECT_TOKENIZER(tweet_text, return_tensors="pt")

    with torch.no_grad():
        logits = LANG_DETECTOR_MODEL(**inputs).logits

    predicted_class_id = logits.argmax().item()
    lang = LANG_DETECTOR_MODEL.config.id2label[predicted_class_id]

    return jsonify({"tweet_text": tweet_text, "is_english": True if lang=='en' else False})

@app.route('/api/sentiment-score', methods=['POST'])
def sentiment_score():
    global SENTIMENT_TOKENIZER, SENTIMENT_CONFIG, SENTIMENT_MODEL
    # Preprocess text (username and link placeholders)
    def preprocess(text):
        new_text = []
        for t in text.split(" "):
            t = '@user' if t.startswith('@') and len(t) > 1 else t
            t = 'http' if t.startswith('http') else t
            new_text.append(t)
        return " ".join(new_text)

    tweet = json.loads(request.data)
    tweet_text = tweet["tweet_text"]
    text = preprocess(tweet_text)

    encoded_input = SENTIMENT_TOKENIZER(text, return_tensors='pt')
    output = SENTIMENT_MODEL(**encoded_input)
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)

    ranking = np.argsort(scores)
    ranking = ranking[::-1]

    result = jsonify({
        "tweet_text": tweet_text,
        "sentiment_score": {
            "positive": float(scores[2]),
            "neutral": float(scores[1]),
            "negative": float(scores[0]),
        },
        "detected_mood": SENTIMENT_CONFIG.id2label[ranking[0]].upper()})
    
    return result


if __name__ == '__main__':
    port = 5351  # custom port
    app.run(host='0.0.0.0', port=port)
