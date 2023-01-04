from flask import Flask, request, json, jsonify

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


app = Flask(__name__)
app.config['CORS_HEADERS'] = '*'

@app.before_first_request
def load_models():
    global LANG_DETECTOR_MODEL, LANG_DETECT_TOKENIZER

    LANG_DETECT_TOKENIZER = AutoTokenizer.from_pretrained("eleldar/language-detection")
    LANG_DETECTOR_MODEL = AutoModelForSequenceClassification.from_pretrained("eleldar/language-detection")
    

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
    
    return 


if __name__ == '__main__':
    port = 5351  # custom port
    app.run(host='0.0.0.0', port=port)
