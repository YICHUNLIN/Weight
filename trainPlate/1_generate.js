const Jimp = require('jimp');
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

// ==========================================
// 自動標記與儲存邏輯
// ==========================================
async function processFile(filename) {
    // 1. 解析檔名 (Correct Answer)
    const nameWithoutExt = path.parse(filename).name; // e.g., "1051-K7"
    const correctLabel = nameWithoutExt.replace(/[^A-Z0-9]/g, '').toUpperCase(); // "1051K7"
    
    console.log(`處理: ${filename} -> 預期標籤: ${correctLabel}`);

    try {
        const original = await Jimp.read(path.join(RAW_DIR, filename));
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

        // --- 關鍵核對 ---
        // 如果切出來的數量 != 檔名長度，代表自動切割失敗，跳過不存，以免訓練到錯誤資料
        if (bestGroup.length !== correctLabel.length) {
            console.log(`  ❌ 數量不符 (偵測到 ${bestGroup.length}, 檔名 ${correctLabel.length}) -> 跳過`);
            return;
        }

        console.log(`  ✅ 數量符合，開始儲存訓練樣本...`);

        // 逐字儲存
        for (let i = 0; i < bestGroup.length; i++) {
            const comp = bestGroup[i];
            const char = correctLabel[i]; // 這就是這個圖片的「正確答案」

            // 切下該字
            let charImg = binary.clone().crop(comp.x, comp.y, comp.w, comp.h);

            // 暴力整形 (Square Padding) & Resize 28x28
            const size = Math.max(charImg.bitmap.width, charImg.bitmap.height);
            const square = await new Jimp(size, size, 0x00000000); // 透明或黑底
            square.composite(charImg, (size-charImg.bitmap.width)/2, (size-charImg.bitmap.height)/2);
            
            // 縮放至 28x28 (AI 標準)
            square.resize(28, 28, Jimp.RESIZE_BEZIER);
            square.invert(); // 轉成白底黑字 (或黑底白字，需統一，這裡設為白底黑字方便人看，進訓練再轉)
            
            // 存檔
            const labelDir = path.join(DATASET_DIR, char);
            if (!fs.existsSync(labelDir)) fs.mkdirSync(labelDir);
            
            const outName = `${Date.now()}_${Math.floor(Math.random()*1000)}.png`;
            await square.writeAsync(path.join(labelDir, outName));
        }
        console.log(`  -> 已儲存 ${bestGroup.length} 個字元樣本。`);

    } catch (err) {
        console.error(`  發生錯誤: ${err.message}`);
    }
}

// 執行
(async () => {
    if (!fs.existsSync(RAW_DIR)) {
        console.log(`請建立 ${RAW_DIR} 資料夾並放入檔名正確的車牌照片。`);
        return;
    }
    const files = fs.readdirSync(RAW_DIR).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
    console.log(`找到 ${files.length} 張圖片，開始製作資料集...`);
    
    for (const f of files) {
        await processFile(f);
    }
    console.log("\n資料集製作完成！請檢查 dataset 資料夾。");
})();