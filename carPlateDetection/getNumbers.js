const Jimp = require('jimp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const RAW_DIR = './raw_plates';  // 來源：放車牌原圖
const DATASET_DIR = './dataset'; // 目的：存切好的分類小圖

// 確保輸出目錄存在
if (!fs.existsSync(DATASET_DIR)) fs.mkdirSync(DATASET_DIR);

// ==========================================
// 核心影像演算法 (與先前相同，包含針對 1 的優化)
// ==========================================
function adaptiveThreshold(image, w=25, c=10) {
    const clone = image.clone();
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        let sum=0, count=0;
        for(let wy=-Math.floor(w/2); wy<=Math.floor(w/2); wy+=3)
            for(let wx=-Math.floor(w/2); wx<=Math.floor(w/2); wx+=3) {
                const nx=x+wx, ny=y+wy;
                if(nx>=0 && nx<this.bitmap.width && ny>=0 && ny<this.bitmap.height) {
                    sum += image.bitmap.data[image.getPixelIndex(nx, ny)]; count++;
                }
            }
        const val = (this.bitmap.data[idx] < (sum/count)-c) ? 255 : 0;
        clone.setPixelColor(Jimp.rgbaToInt(val,val,val,255), x, y);
    });
    return clone;
}

function morphologicalClosing(image) {
    const w = image.bitmap.width, h = image.bitmap.height;
    let temp = image.clone();
    // Dilate
    image.scan(0,0,w,h,function(x,y,idx){if(this.bitmap.data[idx]===255){
        [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{if(nx>=0&&nx<w&&ny>=0&&ny<h)temp.setPixelColor(0xFFFFFFFF,nx,ny)})}});
    let result = temp.clone();
    // Erode
    temp.scan(0,0,w,h,function(x,y,idx){if(this.bitmap.data[idx]===255){let keep=true;
        [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{if(nx<0||nx>=w||ny<0||ny>=h||temp.bitmap.data[temp.getPixelIndex(nx,ny)]===0)keep=false});
        if(!keep) result.setPixelColor(0x000000FF,x,y)}});
    return result;
}

function findComponents(image) {
    const w = image.bitmap.width, h = image.bitmap.height;
    const visited = new Uint8Array(w*h), comps = [];
    for(let y=0; y<h; y++) for(let x=0; x<w; x++) {
        const idx = y*w+x;
        if(image.bitmap.data[idx*4]===255 && !visited[idx]) {
            let q=[idx], minX=x, maxX=x, minY=y, maxY=y, area=0; visited[idx]=1;
            while(q.length){
                const curr=q.shift(), cx=curr%w, cy=Math.floor(curr/w); area++;
                if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
                [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]].forEach(([nx,ny])=>{
                    if(nx>=0&&nx<w&&ny>=0&&ny<h){let nIdx=ny*w+nx;if(!visited[nIdx]&&image.bitmap.data[nIdx*4]===255){visited[nIdx]=1;q.push(nIdx)}}});
            }
            comps.push({x:minX, y:minY, w:maxX-minX+1, h:maxY-minY+1, area, centerX:minX+(maxX-minX+1)/2, centerY:minY+(maxY-minY+1)/2});
        }
    }
    return comps;
}

function areNeighbors(c1, c2) {
    const hMax = Math.max(c1.h, c2.h);
    if (Math.abs(c1.h - c2.h)/hMax > 0.35) return false;
    if (Math.abs(c1.centerY - c2.centerY)/hMax > 0.4) return false;
    const dist = c2.x - (c1.x + c1.w);
    return (dist > -(c1.w*0.5) && dist < hMax*1.5);
}

/**
 * 辨識單一車牌字元
 * @param {string} imagePath - 圖片檔案路徑
 * @returns {Promise<string>} - 辨識出的字元
 */
async function recognizeLicenseChar(imagePath) {
    try {
        // 檢查檔案是否存在
        if (!fs.existsSync(imagePath)) {
            throw new Error(`File not found: ${imagePath}`);
        }

        const worker = await Tesseract.createWorker('eng', 1); // 建立 worker，使用英文模型

        // 設定參數 (這是提升準確率的關鍵)
        await worker.setParameters({
            // 1. 白名單：只允許大寫英文與數字 (過濾掉標點符號和小寫)
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            
            // 2. PSM 10 (Page Segmentation Mode 10)：將圖片視為「單一字元」
            // 如果不設這個，Tesseract 會試圖找句子，對於單獨的 '1' 或 'K' 辨識率極低
            tessedit_pageseg_mode: '10', 
        });

        const { data: { text, confidence } } = await worker.recognize(imagePath);
        
        await worker.terminate(); // 釋放資源

        // 清理結果 (移除換行符號)
        const cleanText = text.trim();
        
        return {
            file: path.basename(imagePath),
            char: cleanText,
            confidence: confidence // 信心度 (0-100)
        };

    } catch (error) {
        console.error(`Error processing ${imagePath}:`, error.message);
        return null;
    }
}

// ==========================================
// 自動標記與儲存邏輯
// ==========================================
async function processFile(filename) {
    // 1. 獨檔
    try {
        const original = await Jimp.read(`./${RAW_DIR}/${filename}.png`);
        const imgH = original.bitmap.height;

        // 前處理
        let binary = original.clone().greyscale().convolute([[0,-1,0],[-1,5,-1],[0,-1,0]]);
        binary = morphologicalClosing(adaptiveThreshold(binary, 25, 10));

        // 切割
        let comps = findComponents(binary);
        let candidates = comps.filter(c => {
            const aspect = c.w/c.h, hRatio = c.h/imgH;
            // 包含瘦子1特赦
            return (hRatio>0.08 && aspect>0.08 && aspect<1.5 && c.area>15) || 
                   (hRatio>0.08 && aspect>0.05 && aspect<=0.2 && c.area>10);
        }).sort((a,b)=>a.x-b.x);

        // 分組
        let groups=[], visited=new Set();
        for(let i=0;i<candidates.length;i++){
            if(visited.has(i))continue;
            let grp=[candidates[i]]; visited.add(i); let last=candidates[i];
            for(let j=i+1;j<candidates.length;j++){
                if(!visited.has(j) && areNeighbors(last, candidates[j])){
                    grp.push(candidates[j]); visited.add(j); last=candidates[j];
                }
            }
            if(grp.length>=2) groups.push(grp);
        }
        if(groups.length>0) groups.sort((a,b)=>b.length-a.length);
        const bestGroup = groups[0] || [];


        // 逐字儲存
        for (let i = 0; i < bestGroup.length; i++) {
            const comp = bestGroup[i];

            // 切下該字
            let charImg = binary.clone().crop(comp.x, comp.y, comp.w, comp.h);

            // 暴力整形 (Square Padding) & Resize 28x28
            const size = Math.max(charImg.bitmap.width, charImg.bitmap.height);
            const square = await new Jimp(size, size, 0x00000000); // 透明或黑底
            square.composite(charImg, (size-charImg.bitmap.width)/2, (size-charImg.bitmap.height)/2);
            
            // 縮放至 28x28 (AI 標準)
            square.resize(28, 28, Jimp.RESIZE_BEZIER); 
            square     // 1. 轉灰階
                .scale(3)           // 2. 放大 3 倍 (關鍵！Tesseract 對小圖辨識很差)
                .contrast(1)        // 3. 提高對比度到最大
                .threshold({ max: 160 }) // 4. 二值化：過濾掉灰色雜訊，讓字變純黑
                .invert()           // 5. 如果結果是「黑底白字」，需反轉為「白底黑字」 (視情況調整，通常車牌是白字黑底需要反轉)
                // 為了保險，我們確保最後是白底黑字。如果您的原圖是白底黑字，請註解掉 .invert()
                
                // 6. 加白邊 (Padding)：避免字體貼在圖片邊緣造成誤判
                .contain(
                    image.bitmap.width + 20, 
                    image.bitmap.height + 20, 
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
                )
                .background(0xFFFFFFFF) // 設定背景為白色
                .getBufferAsync(Jimp.MIME_PNG);
            // 存檔
            const labelDir = path.join(DATASET_DIR, filename);
            if (!fs.existsSync(labelDir)) fs.mkdirSync(labelDir);
            
            const outName = `${i}.png`;
            await square.writeAsync(path.join(labelDir, outName));

            const result = await recognizeLicenseChar(path.join(labelDir, outName));
            console.log(result)
        }
        console.log(`  -> 已儲存 ${bestGroup.length} 個字元樣本。`);

    } catch (err) {
        console.error(`  發生錯誤: ${err.message}`);
    }
}


// 執行
(async () => {
    await processFile(`ODE-9988`);
})();