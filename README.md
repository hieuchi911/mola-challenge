# mola-challenge

Models used taken from Huggingface:
- Sentiment classification: [Twitter-roBERTa-base for Sentiment Analysis](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest)
- Language Detection: [A fine-tuned version of xlm-roberta-base on the Language Identification dataset](https://huggingface.co/eleldar/language-detection)

Drawbacks:
- Extension takes some time (sometimes takes 5 secs, sometimes 2 secs) to load the Detected Mood
- Extension can hardly reach tweets further down of the page, hence cannot load the prediction
- As we scroll down, Twitter page tends to remove the added Detected Mood elements, so when we scroll back up, they are not there anymore
