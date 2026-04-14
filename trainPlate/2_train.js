const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const DATASET_DIR = './dataset';
const MODEL_DIR = './saved_model';

// 定義標籤
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM_CLASSES = CHARS.length;

async function loadDataset() {
    const images = []; // 暫存每個圖片的數據
    const labels = [];
    
    const labelDirs = fs.readdirSync(DATASET_DIR);
    console.log("正在載入訓練圖片...");

    for (const label of labelDirs) {
        const dirPath = path.join(DATASET_DIR, label);
        if (!fs.statSync(dirPath).isDirectory()) continue;
        
        const labelIndex = CHARS.indexOf(label);
        if (labelIndex === -1) continue;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));
        for (const f of files) {
            const imgPath = path.join(dirPath, f);
            const img = await Jimp.read(imgPath);
            
            // 轉成 Float32Array (28x28)
            const buffer = new Float32Array(28 * 28);
            img.scan(0, 0, 28, 28, function(x, y, idx) {
                // 正規化 0-1 (輸入是白底黑字或黑底白字皆可，只要統一即可)
                // 這裡假設輸入是黑底白字(255為筆畫)，或者反轉後的效果
                // 取紅色通道
                buffer[y * 28 + x] = (255 - this.bitmap.data[idx]) / 255.0;
            });
            images.push(buffer);
            labels.push(labelIndex);
        }
    }
    
    if (images.length === 0) throw new Error("dataset 資料夾是空的！");
    
    console.log(`載入完成，共有 ${images.length} 張樣本。正在處理資料格式...`);

    // 打亂資料 (Shuffle)
    const indices = tf.util.createShuffledIndices(images.length);
    const shuffledLabels = [];
    
    // --- 【關鍵修正開始】 ---
    // 我們不能直接把 [Float32Array, Float32Array] 丟給 tensor4d
    // 必須把所有圖片合併成一個超級大的 Float32Array
    
    const totalSize = images.length * 28 * 28;
    const bigBuffer = new Float32Array(totalSize);

    for (let i = 0; i < images.length; i++) {
        const originalIndex = indices[i];
        
        // 1. 填入打亂後的 Label
        shuffledLabels.push(labels[originalIndex]);
        
        // 2. 填入打亂後的 Image Data 到大 Buffer 中
        // images[originalIndex] 是一個 784 (28*28) 長度的陣列
        // 我們把它塞到 bigBuffer 的正確位置
        bigBuffer.set(images[originalIndex], i * 28 * 28);
    }
    
    // 現在 bigBuffer 是一個巨大的扁平陣列，可以直接丟給 tensor4d
    // 形狀是 [圖片數量, 28, 28, 1]
    const xs = tf.tensor4d(bigBuffer, [images.length, 28, 28, 1]);
    const ys = tf.oneHot(tf.tensor1d(shuffledLabels, 'int32'), NUM_CLASSES);
    
    // --- 【關鍵修正結束】 ---

    return { xs, ys };
}

function createModel() {
    const model = tf.sequential();
    
    model.add(tf.layers.conv2d({ inputShape: [28, 28, 1], filters: 32, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 })); 
    model.add(tf.layers.dense({ units: NUM_CLASSES, activation: 'softmax' })); 

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    return model;
}

(async () => {
    try {
        const { xs, ys } = await loadDataset();
        console.log(`資料處理完成。開始訓練...`);

        const model = createModel();
        
        await model.fit(xs, ys, {
            epochs: 15, 
            batchSize: 32,
            validationSplit: 0.15, 
            callbacks: {
                onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch+1}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`)
            }
        });

        if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR);
        await model.save(`file://${MODEL_DIR}`);
        fs.writeFileSync(path.join(MODEL_DIR, 'labels.json'), JSON.stringify(CHARS));
        
        console.log(`模型訓練完成並儲存至 ${MODEL_DIR}`);
    } catch (e) {
        console.error(e);
    }
})();