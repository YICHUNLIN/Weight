const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const MODEL_PATH = 'file://./saved_model/model.json';
const LABEL_PATH = './saved_model/labels.json';

let model = null;
let labels = null;

async function loadModel() {
    if (model) return;
    model = await tf.loadLayersModel(MODEL_PATH);
    labels = JSON.parse(fs.readFileSync(LABEL_PATH, 'utf-8'));
}

/**
 * 辨識單個 Jimp 圖像
 * @param {Jimp} charImg - 切割下來的圖片 (任意大小)
 */
async function predict(charImg) {
    if (!model) await loadModel();

    // 1. 預處理：調整為 28x28, 黑底白字
    const size = Math.max(charImg.bitmap.width, charImg.bitmap.height);
    const square = await new Jimp(size, size, 0x00000000); // 這裡底色不重要，重點是下一行
    square.composite(charImg, (size-charImg.bitmap.width)/2, (size-charImg.bitmap.height)/2);
    
    square.resize(28, 28, Jimp.RESIZE_BEZIER);
    
    // 轉 Tensor (確保與訓練時的處理一致: 白底黑字輸入 -> 轉為黑底白字 Tensor)
    // 假設 charImg 是二值化的白底黑字
    const buffer = new Float32Array(28 * 28);
    square.scan(0, 0, 28, 28, function(x, y, idx) {
        // 取反：(255 - pixel) / 255
        // 讓筆畫(黑)變成 1.0，背景(白)變成 0.0
        buffer[y * 28 + x] = (255 - this.bitmap.data[idx]) / 255.0; 
    });

    const tensor = tf.tensor4d(buffer, [1, 28, 28, 1]);
    
    // 2. 預測
    const prediction = model.predict(tensor);
    const probs = prediction.dataSync();
    const bestIdx = prediction.argMax(1).dataSync()[0];
    
    const char = labels[bestIdx];
    const score = probs[bestIdx];
    
    tensor.dispose();
    prediction.dispose();

    return { char, score };
}

module.exports = { predict, loadModel };

// --- 測試區 (直接執行此檔可測試) ---
if (require.main === module) {
    (async () => {
        // 隨便找張圖測試
        const testFile = './dataset/1/1766910863035_757.png'; // 記得改成真實路徑
        if(fs.existsSync(testFile)) {
            const img = await Jimp.read(testFile);
            const res = await predict(img);
            console.log(`測試結果: ${res.char} (信心度: ${(res.score*100).toFixed(1)}%)`);
        } else {
            console.log("請修改測試路徑來驗證模型。");
        }
    })();
}