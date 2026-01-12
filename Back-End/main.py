from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import base64
import requests
import os

app = Flask(__name__)

CORS(app, resources={r"/process_image": {"origins": "*"}}, supports_credentials=True)

api_key = os.getenv("OPENAI_API_KEY", "")

@app.route('/process_image', methods=['POST', 'OPTIONS'])
@cross_origin()
def process_image():
    if not api_key:
        return jsonify({'error': 'OpenAI API key is disabled. To run this endpoint, set the OPENAI_API_KEY environment variable or add your key to Back-End/main.py.'}), 401

    image_file = request.files.get('image')
    if image_file is None:
        return jsonify({'error': 'No image file provided'}), 400

    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Think up of hints that can lead to the answer in this image. Compile a step-by-step list that leads to the answer but only give me a small part of it, around 2-4 steps. The steps of the small part should be substantial enough as to include what data structure or algorithm to use to solve the problem. Start your response with Hint: and no lists, just in sentences."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    if response.status_code == 200:
        response_data = response.json()
        try:
            content = response_data['choices'][0]['message']['content']
            return jsonify({'content': content})
        except KeyError as e:
            return jsonify({'error': 'Failed to extract content', 'details': str(e)}), 500
    else:
        return jsonify({'error': 'Failed to process image', 'status_code': response.status_code}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
