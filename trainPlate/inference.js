const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// 設定模型路徑
const MODEL_PATH = 'file://./saved_model/model.json';
const LABEL_PATH = './saved_model/labels.json';

// 全域變數緩存模型
let model = null;
let labels = null;

// ==========================================
// Part 1: 強力影像演算法 (來自 generate.js)
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
    // 這裡使用高度做距離判斷，保護瘦子 '1'
    return (dist > -(c1.w*0.5) && dist < hMax*1.5);
}

// 輔助畫框
function drawRect(image, x, y, w, h, hexColor) {
    const color = Jimp.cssColorToHex(hexColor);
    for(let i=0; i<w; i++) { image.setPixelColor(color, x+i, y); image.setPixelColor(color, x+i, y+h-1); }
    for(let i=0; i<h; i++) { image.setPixelColor(color, x, y+i); image.setPixelColor(color, x+w-1, y+i); }
}

// ==========================================
// Part 2: AI 模型預測 (TensorFlow.js)
// ==========================================

async function loadModel() {
    if (!model) {
        console.log("正在載入 AI 模型...");
        model = await tf.loadLayersModel(MODEL_PATH);
        labels = JSON.parse(fs.readFileSync(LABEL_PATH, 'utf-8'));
        console.log("模型載入完成。");
    }
}

/**
 * 將切下來的圖片送入模型預測
 */
async function predictChar(charImg) {
    // 1. 預處理：貼到正方形 -> 縮放 28x28 -> 轉 Tensor
    // 必須與訓練時(1_generate.js)的處理邏輯完全一致！
    const size = Math.max(charImg.bitmap.width, charImg.bitmap.height);
    const square = await new Jimp(size, size, 0x00000000); 
    square.composite(charImg, (size-charImg.bitmap.width)/2, (size-charImg.bitmap.height)/2);
    
    square.resize(28, 28, Jimp.RESIZE_BEZIER);

    const buffer = new Float32Array(28 * 28);
    square.scan(0, 0, 28, 28, function(x, y, idx) {
        // 訓練時我們假設是白底黑字輸入並反轉，或者直接取值
        // 這裡假設 charImg 已經是二值化的白字黑底 (255=字)
        // 我們要轉成 normalized 0-1
        // 注意：這裡要確認您訓練時的邏輯。通常是 (255 - val) / 255.0 做成黑底白字
        // 如果您訓練時輸入是白字黑底，這裡就直接除 255
        // 假設訓練時是用 (255 - pixel) / 255 (黑底白字):
        buffer[y * 28 + x] = (255 - this.bitmap.data[idx]) / 255.0;
    });

    const tensor = tf.tensor4d(buffer, [1, 28, 28, 1]);
    const prediction = model.predict(tensor);
    const bestIdx = prediction.argMax(1).dataSync()[0];
    const confidence = prediction.max().dataSync()[0];
    
    tensor.dispose();
    prediction.dispose();

    return { char: labels[bestIdx], score: confidence };
}

// ==========================================
// Part 3: 規則引擎 (Rule Engine)
// ==========================================
const FIX_TO_DIGIT = { 'O': '0', 'D': '0', 'Q': '0', 'B': '8', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'G': '6', 'A': '4' };
const FIX_TO_CHAR  = { '0': 'O', '8': 'B', '1': 'I', '5': 'S', '2': 'Z', '4': 'A', '6': 'G' };

function applyRules(text) {
    const rules = [
        { name: "4數-2英", format: ['D','D','D','D','L','L'], sep: 4 },
        { name: "3英-4數", format: ['L','L','L','D','D','D','D'], sep: 3 },
        { name: "2英-4數", format: ['L','L','D','D','D','D'], sep: 2 },
        { name: "1英1數-4數", format: ['L','D','D','D','D','D'], sep: 2 },
        { name: "1數1英-4數", format: ['D','L','D','D','D','D'], sep: 2 },
        { name: "4數-1英1數", format: ['D','D','D','D','L','D'], sep: 4 },
        { name: "4數-1數1英", format: ['D','D','D','D','D','L'], sep: 4 }
    ];
    let bestMatch = null, bestScore = -999;
    
    rules.forEach(rule => {
        if(text.length !== rule.format.length) return;
        let score=0, corrected=[];
        for(let i=0; i<text.length; i++){
            const c=text[i], type=rule.format[i];
            if(type==='D'){
                if(/[0-9]/.test(c)){score+=2; corrected.push(c);}
                else if(FIX_TO_DIGIT[c]){score+=1; corrected.push(FIX_TO_DIGIT[c]);}
                else{score-=2; corrected.push(c);}
            }else{
                if(/[A-Z]/.test(c)){score+=2; corrected.push(c);}
                else if(FIX_TO_CHAR[c]){score+=1; corrected.push(FIX_TO_CHAR[c]);}
                else{score-=2; corrected.push(c);}
            }
        }
        if(score > bestScore){
            bestScore = score;
            let res = corrected.join('');
            if(rule.sep) res = res.slice(0, rule.sep)+'-'+res.slice(rule.sep);
            bestMatch = { name: rule.name, text: res };
        }
    });
    return bestMatch;
}

// ==========================================
// 主流程
// ==========================================

async function recognizePlate(fileName) {
    console.log(`\n=== 辨識圖片: ${fileName} ===`);
    try {
        await loadModel(); // 確保模型已載入
        
        const original = await Jimp.read(fileName);
        const imgH = original.bitmap.height;

        // 1. 影像演算法 (切割)
        let binary = original.clone().greyscale().convolute([[0,-1,0],[-1,5,-1],[0,-1,0]]);
        binary = morphologicalClosing(adaptiveThreshold(binary, 25, 10));
        
        // 儲存 debug 圖
        await binary.writeAsync(`inference_debug_${fileName}`);

        let comps = findComponents(binary);
        // 包含瘦子 1 的篩選條件
        let candidates = comps.filter(c => {
            const aspect = c.w/c.h, hRatio = c.h/imgH;
            return (hRatio>0.08 && aspect>0.08 && aspect<1.5 && c.area>15) || 
                   (hRatio>0.08 && aspect>0.05 && aspect<=0.2 && c.area>10);
        }).sort((a,b)=>a.x-b.x);

        let groups=[], visited=new Set();
        for(let i=0;i<candidates.length;i++){
            if(visited.has(i))continue;
            let grp=[candidates[i]]; visited.add(i); let last=candidates[i];
            for(let j=i+1;j<candidates.length;j++){
                if(!visited.has(j) && areNeighbors(last, candidates[j])){
                    grp.push(candidates[j]); visited.add(j); last=candidates[j];
                }
            }
            if(grp.length>=4) groups.push(grp);
        }
        groups.sort((a,b)=>b.length-a.length);
        const bestGroup = groups[0];

        if (!bestGroup) {
            console.log("⚠️  找不到車牌區塊");
            return;
        }

        // 2. 逐字送入 AI 預測
        let rawText = "";
        const finalOutputImg = original.clone();
        
        // 畫紅框(雜訊)
        candidates.forEach(c => drawRect(finalOutputImg, c.x, c.y, c.w, c.h, '#FF0000'));

        for (let i = 0; i < bestGroup.length; i++) {
            const comp = bestGroup[i];
            
            // 切下該字 (建議切 binary 圖，雜訊較少)
            let charImg = binary.clone().crop(comp.x, comp.y, comp.w, comp.h);
            
            // AI 預測
            const result = await predictChar(charImg);
            
            rawText += result.char;
            
            // 畫綠框
            drawRect(finalOutputImg, comp.x, comp.y, comp.w, comp.h, '#00FF00');
            console.log(`   字元 ${i+1}: ${result.char} (信心度: ${(result.score*100).toFixed(1)}%)`);
        }

        console.log(`   AI 原始結果: ${rawText}`);

        // 3. 規則引擎修正
        const finalResult = applyRules(rawText);
        if (finalResult) {
            console.log(`✅ 匹配規則: ${finalResult.name}`);
            console.log(`✅ 最終車牌: ${finalResult.text}`);
        } else {
            console.log(`❌ 無法匹配規則，原始輸出: ${rawText}`);
        }
        
        await finalOutputImg.writeAsync(`inference_result_${fileName}`);
        console.log(`結果圖已儲存。`);

    } catch (err) {
        console.error("錯誤:", err);
    }
}

const p = `${process.cwd()}/raw_plates`;
// 執行
const files = fs.readdirSync(p); // 您的測試圖片
(async () => {
    for (const f of files) {
        if (fs.existsSync(`${p}/${f}`)) await recognizePlate(`${p}/${f}`);
    }
})();