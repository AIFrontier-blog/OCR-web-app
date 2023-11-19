document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const imageBox = document.getElementById('image-box');
    const textBox = document.getElementById('text-box');
    const uploadButton = document.getElementById('upload-button');
    const copyTextButton = document.getElementById('copy-text-button');
    const saveTextButton = document.getElementById('save-text-button');
    const resetButton = document.getElementById('reset-button');

    // ドラッグ&ドロップイベントのデフォルトの動作を無効化
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageBox.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // ドラッグ中のハイライト表示
    ['dragenter', 'dragover'].forEach(eventName => {
        imageBox.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        imageBox.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        imageBox.classList.add('highlight');
    }

    function unhighlight() {
        imageBox.classList.remove('highlight');
    }

    // ドロップ時の処理
    imageBox.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        updateImageDisplay(file);
    }

    // 画像表示を更新
    function updateImageDisplay(file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            imageBox.innerHTML = '';
            const img = document.createElement('img');
            img.src = reader.result;
            imageBox.appendChild(img);
        };
        reader.readAsDataURL(file);
    }

    // ファイル選択時のイベントハンドラ
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            updateImageDisplay(file);
        }
    }

    // imageBoxのセットアップ
    function setupImageBox() {
        imageBox.innerHTML = '<p>画像をここにドラッグ&ドロップ<br>または<br><label for="file-input" class="button">ファイルを選択</label></p>';
        const label = imageBox.querySelector('label');
        label.addEventListener('click', () => fileInput.click());
    }

    // アップロードボタンの処理
    uploadButton.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            extractText(fileInput.files[0]);
        }
    });

    // テキストをクリップボードにコピー
    copyTextButton.addEventListener('click', () => {
        if (textBox.value.length > 0) {
            navigator.clipboard.writeText(textBox.value)
                .then(() => alert('クリップボードに保存しました'))
                .catch(err => console.error('Copy failed', err));
        }
    });

    // テキストをテキストファイルとして保存
    saveTextButton.addEventListener('click', () => {
        if (textBox.value.length > 0) {
            const fileName = prompt('保存するファイル名を入力してください:', 'extracted-text.txt');
            if (fileName) {
                const blob = new Blob([textBox.value], {type: 'text/plain'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    });

    // リセット処理
    resetButton.addEventListener('click', () => {
        resetApplication();
    });

    function resetApplication() {
        textBox.value = '';
        fileInput.value = '';
        imageBox.classList.remove('highlight', 'active');
        setupImageBox(); // imageBoxを再セットアップ
    }

    // 初期セットアップ
    setupImageBox();
    fileInput.addEventListener('change', handleFileSelect);

    // テキスト抽出処理（サーバーサイドでの処理が必要）
    // テキスト抽出処理
function extractText(file) {
    const formData = new FormData();
    formData.append('file', file);

    // フェッチAPIでバックエンドにPOSTリクエストを送信
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        textBox.value = data.text; // テキストボックスにテキストを表示
        textBox.classList.add('active'); // テキストボックスにアクティブクラスを追加
    })
    .catch(error => {
        console.error('Error:', error);
        alert('テキスト抽出中にエラーが発生しました');
    });
}

});
