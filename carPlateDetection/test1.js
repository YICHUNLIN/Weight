const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

/**
 * 圖像預處理：放大、二值化、加邊框
 * @param {string} image 原始圖片路徑
 * @returns {Promise<Buffer>} 處理後的圖片 Buffer
 */
async function preprocessImage(image) {

    return image
        .greyscale()        // 1. 轉灰階
        .scale(3)           // 2. 放大 3 倍 (關鍵！Tesseract 對小圖辨識很差)
        .contrast(1)        // 3. 提高對比度到最大
        .threshold({ max: 125 }) // 4. 二值化：過濾掉灰色雜訊，讓字變純黑
        .invert()           // 5. 如果結果是「黑底白字」，需反轉為「白底黑字」 (視情況調整，通常車牌是白字黑底需要反轉)
        // 為了保險，我們確保最後是白底黑字。如果您的原圖是白底黑字，請註解掉 .invert()
        
        // 6. 加白邊 (Padding)：避免字體貼在圖片邊緣造成誤判
        .contain(
            image.bitmap.width + 50, 
            image.bitmap.height + 50, 
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
        )
        .background(0xFFFFFFFF) // 設定背景為白色
        //.getBufferAsync(Jimp.MIME_PNG); // 轉回 Buffer 給 Tesseract 用
}

/**
 * 執行辨識
 */
async function recognizeEnhanced(processedBuffer) {
    // // // 1. 預處理
    // const processedBuffer = await preprocessImage(img);

    // 2. 建立 Worker
    const worker = await Tesseract.createWorker('eng');
    
    // 3. 設定嚴格參數
    await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // 只准出現在這清單內的字
        tessedit_pageseg_mode: '10', // 單字模式
    });

    // 4. 辨識
    const { data: { text, confidence } } = await worker.recognize(processedBuffer);
    await worker.terminate();

    return {
        char: text.trim(),
        confidence: confidence
    };
}



// ==========================================
// 核心影像演算法 (與先前相同，包含針對 1 的優化)
// ==========================================


function adaptiveThreshold(image, windowSize = 25, constantC = 10) { /* ...同前一版... */ 
    const width = image.bitmap.width; const height = image.bitmap.height; const clone = image.clone();
    image.scan(0, 0, width, height, function(x, y, idx) {
        let sum = 0, count = 0; const half = Math.floor(windowSize / 2);
        for (let wy = -half; wy <= half; wy += 3) { for (let wx = -half; wx <= half; wx += 3) {
            const nx = x + wx, ny = y + wy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) { sum += image.bitmap.data[image.getPixelIndex(nx, ny)]; count++; }
        }}
        const mean = count > 0 ? sum / count : 0;
        const binary = (this.bitmap.data[idx] < mean - constantC) ? 255 : 0;
        const outIdx = clone.getPixelIndex(x, y);
        clone.bitmap.data[outIdx] = binary; clone.bitmap.data[outIdx + 1] = binary; clone.bitmap.data[outIdx + 2] = binary; clone.bitmap.data[outIdx + 3] = 255;
    });
    return clone;
}
function dilate(image) { 
    const w = image.bitmap.width, h = image.bitmap.height, clone = image.clone();
    image.scan(0,0,w,h,function(x,y,idx){ if(this.bitmap.data[idx]===255){ [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{ if(nx>=0 && nx<w && ny>=0 && ny<h) clone.setPixelColor(0xFFFFFFFF, nx, ny); }); }}); return clone;
}
function erode(image) {
    const w = image.bitmap.width, h = image.bitmap.height, clone = image.clone();
    image.scan(0,0,w,h,function(x,y,idx){ if(this.bitmap.data[idx]===255){ let keep=true; [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{ if(nx<0||nx>=w||ny<0||ny>=h||image.bitmap.data[image.getPixelIndex(nx,ny)]===0) keep=false; }); if(!keep) clone.setPixelColor(0x000000FF, x, y); }}); return clone;
}
function morphologicalClosing(image) { let temp = dilate(image); return erode(temp); }

/**
 * 中值濾波 (Median Filter) - 去除雜訊的神器
 * 原理：取 3x3 區域內的中位數。能有效去除孤立的亮點 (如螺絲孔) 或暗點，同時保留邊緣。
 */
function medianFilter(image) {
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const clone = image.clone();
    
    // 掃描每個像素 (忽略邊緣 1px)
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = image.getPixelIndex(x, y);
            const neighbors = [];

            // 取 3x3 區域的像素值 (只取紅色通道 R 即可，因為是灰階)
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const nIdx = image.getPixelIndex(x + kx, y + ky);
                    neighbors.push(image.bitmap.data[nIdx]);
                }
            }

            // 排序找中位數
            neighbors.sort((a, b) => a - b);
            const median = neighbors[4]; // 9個數字的中間那個 (第5個)

            // 填回去
            const outIdx = clone.getPixelIndex(x, y);
            clone.bitmap.data[outIdx] = median;     // R
            clone.bitmap.data[outIdx + 1] = median; // G
            clone.bitmap.data[outIdx + 2] = median; // B
            // Alpha 維持原樣或設為 255
            clone.bitmap.data[outIdx + 3] = 255;
        }
    }
    return clone;
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




// ==========================================
// 自動標記與儲存邏輯
// ==========================================
async function processFile(filename) {
    // 1. 獨檔
    try {
        const original = await Jimp.read(`./raw_plates/${filename}.png`);
        const imgH = original.bitmap.height;

        // 前處理
        let binary = original.clone().greyscale().convolute([[0,-1,0],[-1,5,-1],[0,-1,0]]);
        binary = morphologicalClosing(adaptiveThreshold(binary, 25, 8));
        binary = dilate(binary);
        
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
        for (let i = 0; i < bestGroup.length; i++) {
            const comp = bestGroup[i];
            let charImg = binary.clone().crop(comp.x, comp.y, comp.w, comp.h);
            const labelDir = path.join('./dataset', filename);
            if (!fs.existsSync(labelDir)) fs.mkdirSync(labelDir);
            const outName = `${i}.png`;

            // // 1. 預處理
            const img = await preprocessImage(charImg);
            const imgr = await img.getBufferAsync(Jimp.MIME_PNG)
            await img.writeAsync(path.join(labelDir, outName));
            const result = await recognizeEnhanced(imgr)
            console.log(result)
        }

    } catch (err) {
        console.error(`  發生錯誤: ${err.message}`);
    }
}


// 執行
(async () => {
    await processFile(`KEK-8899`);
})();