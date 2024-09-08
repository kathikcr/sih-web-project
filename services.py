from flask import Flask, request, jsonify
from googletrans import Translator

app = Flask(__name__)
translator = Translator()

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text')
    target_lang = data.get('target_lang')
    translation = translator.translate(text, dest=target_lang)
    return jsonify({'translatedText': translation.text})

if __name__ == '__main__':
    app.run(debug=True)
    