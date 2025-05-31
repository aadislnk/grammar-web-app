from flask import Flask, request, jsonify
import language_tool_python
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from frontend (during development)

tool = language_tool_python.LanguageTool('en-US')

@app.route('/check', methods=['POST'])
def check_grammar():
    data = request.get_json()
    sentence = data.get('text', '')
    
    # Run grammar check
    matches = tool.check(sentence)
    corrected = language_tool_python.utils.correct(sentence, matches)

    # Extract grammar issues
    issues = [match.message for match in matches]

    # Get unique words (ignore short words and punctuation)
    words = [word.strip('.,!?') for word in sentence.split() if len(word) > 2]
    unique_words = list(set(word.lower() for word in words))[:5]  # limit to 5

    definitions = []

    # Fetch definitions from dictionary API
    for word in unique_words:
        try:
            response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
            if response.status_code == 200:
                result = response.json()
                definition = result[0]['meanings'][0]['definitions'][0]['definition']
                definitions.append({'word': word, 'definition': definition})
        except Exception as e:
            continue

    return jsonify({
        'corrected': corrected,
        'issues': issues,
        'meanings': definitions
    })

if __name__ == '__main__':
    app.run(debug=True)
