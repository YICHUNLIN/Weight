
const { isMainThread, parentPort, workerData } = require('worker_threads');

var workerThread = () => {
    parentPort.on('message', msg => {
        if(msg == 'stop') process.exit();
    })
    setInterval(()=>{
        parentPort.postMessage({message: 'times up'});
    }, workerData.interval * 1000);
}
if(!isMainThread){
    workerThread();
} else {
    console.log('is main thread');
}