const Jimp = require('jimp');
const Tesseract = require('tesseract.js');
const fs = require('fs');

// ==========================================
// Part 1: 電腦視覺演算法 (無變動，省略重複部分)
// ==========================================
// (請保留 adaptiveThreshold, dilate, erode, morphologicalClosing, findConnectedComponents, drawRect 函式，這些不需要改)

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
function dilate(image) { /* ...同前一版... */ 
    const w = image.bitmap.width, h = image.bitmap.height, clone = image.clone();
    image.scan(0,0,w,h,function(x,y,idx){ if(this.bitmap.data[idx]===255){ [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{ if(nx>=0 && nx<w && ny>=0 && ny<h) clone.setPixelColor(0xFFFFFFFF, nx, ny); }); }}); return clone;
}
function erode(image) { /* ...同前一版... */ 
    const w = image.bitmap.width, h = image.bitmap.height, clone = image.clone();
    image.scan(0,0,w,h,function(x,y,idx){ if(this.bitmap.data[idx]===255){ let keep=true; [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{ if(nx<0||nx>=w||ny<0||ny>=h||image.bitmap.data[image.getPixelIndex(nx,ny)]===0) keep=false; }); if(!keep) clone.setPixelColor(0x000000FF, x, y); }}); return clone;
}
function morphologicalClosing(image) { let temp = dilate(image); return erode(temp); }
function findConnectedComponents(image) { /* ...同前一版... */ 
    const width = image.bitmap.width, height = image.bitmap.height, visited = new Uint8Array(width * height), components = [];
    for(let y=0;y<height;y++){for(let x=0;x<width;x++){const idx=y*width+x;if(image.bitmap.data[idx*4]===255&&visited[idx]===0){
        let minX=x,maxX=x,minY=y,maxY=y,area=0,q=[idx];visited[idx]=1;
        while(q.length>0){const curr=q.shift(),cx=curr%width,cy=Math.floor(curr/width);area++;
        if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
        [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]].forEach(([nx,ny])=>{if(nx>=0&&nx<width&&ny>=0&&ny<height){let nIdx=ny*width+nx;if(visited[nIdx]===0&&image.bitmap.data[nIdx*4]===255){visited[nIdx]=1;q.push(nIdx);}}});}
        components.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,area,centerX:minX+(maxX-minX+1)/2,centerY:minY+(maxY-minY+1)/2});}}} return components;
}
function drawRect(image, x, y, w, h, hexColor) { const color = Jimp.cssColorToHex(hexColor); for(let i=0; i<w; i++) { image.setPixelColor(color, x+i, y); image.setPixelColor(color, x+i, y+h-1); } for(let i=0; i<h; i++) { image.setPixelColor(color, x, y+i); image.setPixelColor(color, x+w-1, y+i); } }

// ==========================================
// Part 2: 核心優化函式 (針對 '1' 修改)
// ==========================================

/**
 * 判斷鄰居 (以高度為基準，保護瘦子 '1')
 */
function areNeighbors(c1, c2) {
    const hMax = Math.max(c1.h, c2.h);
    if (Math.abs(c1.h - c2.h) / hMax > 0.35) return false; // 高度容許誤差稍微放大
    if (Math.abs(c1.centerY - c2.centerY) / hMax > 0.4) return false; 
    
    const distance = c2.x - (c1.x + c1.w);
    if (distance < -(c1.w * 0.5)) return false; // 允許重疊多一點 (瘦子1容易被誤判重疊)
    
    // ★ 關鍵：瘦子 '1' 往往跟別人的距離比較遠(相對寬度而言)，所以這裡必須用高度算
    if (distance > hMax * 1.5) return false; 

    return true;
}

// 規則修正表 (保持不變)
const FIX_TO_DIGIT = { 'O': '0', 'D': '0', 'Q': '0', 'B': '8', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'G': '6', 'A': '4', '|': '1' };
const FIX_TO_CHAR  = { '0': 'O', '8': 'B', '1': 'I', '5': 'S', '2': 'Z', '4': 'A', '6': 'G' };

function applyLicensePlateRules(text) {
    // (規則同前一版，省略以節省篇幅)
    const rules = [
        { id: 1, name: "規則1 (4數-2英)", format: ['D','D','D','D','L','L'], separatorIndex: 4 },
        { id: 2, name: "規則2 (3英-4數)", format: ['L','L','L','D','D','D','D'], separatorIndex: 3 },
        { id: 3, name: "規則3 (2英-4數)", format: ['L','L','D','D','D','D'], separatorIndex: 2 },
        { id: 4, name: "規則4 (1英1數-4數)", format: ['L','D','D','D','D','D'], separatorIndex: 2 },
        { id: 5, name: "規則5 (1數1英-4數)", format: ['D','L','D','D','D','D'], separatorIndex: 2 },
        { id: 6, name: "規則6 (4數-1英1數)", format: ['D','D','D','D','L','D'], separatorIndex: 4 },
        { id: 7, name: "規則7 (4數-1數1英)", format: ['D','D','D','D','D','L'], separatorIndex: 4 }
    ];

    let cleanText = text.replace(/[^A-Z0-9]/g, ''); 
    let bestMatch = null;
    let bestScore = -999; 

    rules.forEach(rule => {
        if (cleanText.length !== rule.format.length) return;
        let currentScore = 0;
        let correctedChars = [];
        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            const type = rule.format[i];
            if (type === 'D') {
                if (/[0-9]/.test(char)) { currentScore += 2; correctedChars.push(char); }
                else if (FIX_TO_DIGIT[char]) { currentScore += 1; correctedChars.push(FIX_TO_DIGIT[char]); }
                else { currentScore -= 2; correctedChars.push(char); }
            } else {
                if (/[A-Z]/.test(char)) { currentScore += 2; correctedChars.push(char); }
                else if (FIX_TO_CHAR[char]) { currentScore += 1; correctedChars.push(FIX_TO_CHAR[char]); }
                else { currentScore -= 2; correctedChars.push(char); }
            }
        }
        if (currentScore > bestScore) {
            bestScore = currentScore;
            let finalStr = correctedChars.join('');
            if (rule.separatorIndex > 0) finalStr = finalStr.slice(0, rule.separatorIndex) + '-' + finalStr.slice(rule.separatorIndex);
            bestMatch = { ruleName: rule.name, text: finalStr, score: bestScore };
        }
    });
    return bestMatch;
}

// ==========================================
// Part 3: 主流程 (Main Pipeline)
// ==========================================

async function processLicensePlate(fileName) {
    console.log(`\n=== 正在處理: ${fileName} ===`);
    
    try {
        const original = await Jimp.read(fileName);
        const imgH = original.bitmap.height;

        // 1. 前處理
        const processed = original.clone().greyscale();
        processed.convolute([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
        let binary = adaptiveThreshold(processed, 25, 10);
        binary = morphologicalClosing(binary);
        await binary.writeAsync(`debug_binary_${fileName}`);

        // 2. 篩選 (Filtering) - ★ 針對 '1' 的特赦條款
        let components = findConnectedComponents(binary);
        
        let candidates = components.filter(c => {
            const aspect = c.w / c.h; // 寬高比
            const heightRatio = c.h / imgH; // 高度佔比

            // 條件 A: 正常字元 (高度夠，形狀正常)
            const isNormalChar = heightRatio > 0.08 && aspect > 0.2 && aspect < 1.5;
            
            // 條件 B: ★ 「瘦子1」特赦條款
            // 如果它很高 (heightRatio > 0.08)，但非常瘦 (aspect < 0.2)，且不是極端細線 (aspect > 0.05)
            // 我們就認定它是 '1' 的候選人，即使面積小也保留
            const isThinOne = heightRatio > 0.08 && aspect > 0.05 && aspect <= 0.2;

            return (isNormalChar || isThinOne) && c.area > 10;
        });
        candidates.sort((a, b) => a.x - b.x);

        // 3. 分組 (Grouping)
        let groups = [];
        let visited = new Set();
        for (let i = 0; i < candidates.length; i++) {
            if (visited.has(i)) continue;
            let currentGroup = [candidates[i]];
            visited.add(i);
            let lastChar = candidates[i];
            
            for (let j = i + 1; j < candidates.length; j++) {
                if (visited.has(j)) continue;
                let nextChar = candidates[j];
                if (areNeighbors(lastChar, nextChar)) {
                    currentGroup.push(nextChar);
                    visited.add(j);
                    lastChar = nextChar;
                }
            }
            if (currentGroup.length >= 4) groups.push(currentGroup);
        }

        let bestGroup = [];
        if (groups.length > 0) {
            groups.sort((a, b) => b.length - a.length);
            bestGroup = groups[0];
            console.log(`   [Debug] 最佳群組: ${bestGroup.length} 個字元`);
        } else {
            console.log("⚠️  警告: 未找到符合結構的車牌文字鏈。");
        }

        // 4. OCR 辨識 (整形 + Heuristic)
        let rawPlateText = "";
        const finalOutputImg = original.clone();
        candidates.forEach(c => drawRect(finalOutputImg, c.x, c.y, c.w, c.h, '#FF0000'));

        for (let i = 0; i < bestGroup.length; i++) {
            const comp = bestGroup[i];
            const charAspect = comp.w / comp.h;

            // A. 切圖
            let charImg = binary.clone().crop(comp.x, comp.y, comp.w, comp.h);

            // B. ★ 暴力整形 (Square Padding)
            // 如果這個字很瘦 (1)，Tesseract 會看不懂。我們要把它貼在一個寬一點的背景中央。
            // 讓寬度至少是高度的 0.8 倍 (接近正方形)
            let targetW = comp.w;
            let targetH = comp.h;
            
            // 如果是瘦子，強制加寬背景
            if (charAspect < 0.4) {
                targetW = Math.floor(targetH * 0.8); 
            }

            // 先建立一個白底
            const squaredImg = await new Jimp(targetW, targetH, 0x00000000); // 先給透明或黑底(待會二值化會處理)
            // 算出置中位置
            const offsetX = Math.floor((targetW - comp.w) / 2);
            squaredImg.composite(charImg, offsetX, 0);
            
            // C. 放大 (Upscale) - 統一放到高度 80px
            squaredImg.scaleToFit(1000, 80, Jimp.RESIZE_BEZIER); // 寬度無限，高度80
            
            // D. 反轉與清理
            squaredImg.invert(); // 變白底黑字
            squaredImg.threshold({ max: 128 });

            // E. Padding
            const pad = 20;
            const finalChar = await new Jimp(squaredImg.bitmap.width + pad*2, squaredImg.bitmap.height + pad*2, 0xFFFFFFFF);
            finalChar.composite(squaredImg, pad, pad);
            
            const charBuffer = await finalChar.getBufferAsync(Jimp.MIME_PNG);
            
            // F. 辨識
            const { data } = await Tesseract.recognize(charBuffer, 'eng', {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                tessedit_pageseg_mode: '10' 
            });

            let recognizedChar = data.text.trim().charAt(0);

            // G. ★ 規則補位 (Heuristic Fallback)
            // 如果 OCR 讀不出來 (空值) 或者是讀成雜訊，但它的形狀很像 1 (aspect < 0.25)，直接認定是 '1'
            if ((!recognizedChar || recognizedChar === '|') && charAspect < 0.25) {
                console.log(`   [Debug] 區塊 ${i} OCR 失敗，但形狀(ratio=${charAspect.toFixed(2)})像 1，強制判定為 1`);
                recognizedChar = '1';
            }

            if (recognizedChar) {
                rawPlateText += recognizedChar;
                drawRect(finalOutputImg, comp.x, comp.y, comp.w, comp.h, '#00FF00');
            } else {
                rawPlateText += "?";
                drawRect(finalOutputImg, comp.x, comp.y, comp.w, comp.h, '#FFFF00');
            }
        }

        // 5. 結果修正
        if (rawPlateText.length >= 4) {
            console.log(`   OCR 原始結果: "${rawPlateText}"`);
            const finalResult = applyLicensePlateRules(rawPlateText);
            
            if (finalResult) {
                console.log(`✅ 匹配規則: ${finalResult.ruleName}`);
                console.log(`✅ 最終結果: ${finalResult.text}`);
            } else {
                console.log(`❌ 警告: 無法匹配任何已知規則。`);
            }
            await finalOutputImg.writeAsync(`result_${fileName}`);
            console.log(`   結果圖已儲存: result_${fileName}`);
        } else {
            console.log("❌ 錯誤: 辨識出的文字不足。");
        }

    } catch (err) {
        console.error("發生錯誤:", err);
    }
}

const files = ['image_0.png', 'image_1.png'];
(async () => {
    for (const f of files) {
        if (fs.existsSync(f)) await processLicensePlate(f);
    }
})();