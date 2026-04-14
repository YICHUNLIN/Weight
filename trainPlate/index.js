const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const DATASET_DIR = './dataset';
const MODEL_DIR = './saved_model';

// 定義標籤對應 (這決定了 AI 輸出的順序)
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM_CLASSES = CHARS.length;

// 1. 載入資料
async function loadData() {
    const images = [];
    const labels = [];

    const dirs = fs.readdirSync(DATASET_DIR);
    console.log("正在載入圖片資料...");

    for (const label of dirs) {
        const labelPath = path.join(DATASET_DIR, label);
        if (!fs.statSync(labelPath).isDirectory()) continue;

        // 取得該標籤的 Index (例如 'A' -> 10)
        const labelIndex = CHARS.indexOf(label);
        if (labelIndex === -1) continue;

        const files = fs.readdirSync(labelPath);
        for (const file of files) {
            if (!file.endsWith('.png')) continue;
            
            const imgPath = path.join(labelPath, file);
            const image = await Jimp.read(imgPath);
            
            // 轉為 Tensor (28x28, 1 channel)
            const buffer = new Float32Array(28 * 28);
            image.scan(0, 0, 28, 28, function(x, y, idx) {
                // 取紅色通道即可 (因為是黑白)
                // 正規化到 0-1 之間
                buffer[y * 28 + x] = this.bitmap.data[idx] / 255.0; 
            });
            
            images.push(buffer);
            labels.push(labelIndex);
        }
    }

    if (images.length === 0) throw new Error("找不到任何訓練資料！");

    // 轉換為 TF Tensor
    const xs = tf.tensor4d(images, [images.length, 28, 28, 1]); // Input
    const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), NUM_CLASSES); // Output

    console.log(`資料載入完成: ${images.length} 張圖片`);
    return { xs, ys };
}

// 2. 建立 CNN 模型
function createModel() {
    const model = tf.sequential();

    // 第一層卷積
    model.add(tf.layers.conv2d({
        inputShape: [28, 28, 1],
        filters: 16,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // 第二層卷積
    model.add(tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // 攤平與全連接層
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    
    // 輸出層 (Softmax 機率)
    model.add(tf.layers.dense({ units: NUM_CLASSES, activation: 'softmax' }));

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

// 主流程
(async () => {
    try {
        const { xs, ys } = await loadData();
        const model = createModel();

        console.log("開始訓練...");
        await model.fit(xs, ys, {
            epochs: 20, // 訓練 20 輪
            batchSize: 32,
            shuffle: true,
            validationSplit: 0.1, // 拿 10% 資料來驗證
            callbacks: {
                onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch+1}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`)
            }
        });

        console.log("訓練完成，儲存模型...");
        if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR);
        await model.save(`file://${MODEL_DIR}`);
        
        // 順便存一份 Label Map 供辨識用
        fs.writeFileSync(path.join(MODEL_DIR, 'labels.json'), JSON.stringify(CHARS));
        console.log(`模型已儲存至 ${MODEL_DIR}`);

    } catch (err) {
        console.error(err);
    }
})();