from flask import Flask, render_template, request, jsonify
from PIL import Image
import pytesseract
import io

pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        image = Image.open(io.BytesIO(file.read()))
        # 複数の言語でOCRを行うには、言語コードを+で繋げる
        text = pytesseract.image_to_string(image, lang='eng+jpn')  # 英語と日本語を指定
        return jsonify({'text': text})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
