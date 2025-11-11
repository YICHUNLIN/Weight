const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');


// 工作
function Job(name, content, start, done, error = null){
    this.name = name;
    this.content = content
    this.start = start
    this.done = done
    this.error = error;
}

Job.prototype.exec = function(){
    return this.content(this.name)
}
function TimeManager(name){
    this.queue = [];
    this.lock = false;
    this.worker = null;
    this.name = `${name} ${(new Date()).getTime()}`;
}

TimeManager.prototype.addJob = function(job) {
    this.queue.push(job)
};

TimeManager.prototype.start = function(){
    if (this.worker !== null) return `${this.name} already start`
    let t_this = this;
    this.worker = new Worker(`${process.cwd()}/src/utils/timer.js`, { 
        workerData: {
            interval: 1
        }
    });
    this.worker.on('exit', code => { console.log(`worker stopped`); });
    this.worker.on('message', msg => {
        if ((t_this.queue.length > 0) && !t_this.lock){
            t_this.LOCK()
            const first = t_this.queue.shift();
            first.start(first.name, Date.now())
            first.exec()
                .then(e => {
                    first.done(first.name, Date.now(), e)
                    t_this.UNLOCK();
                })
                .catch(err => {
                    first.error(first.name, Date.now(), err)
                    t_this.UNLOCK();
                })
        }
    });
    console.log(`${this.name} is Start...`)
}

TimeManager.prototype.LOCK = function(){
    this.lock = true;
}

TimeManager.prototype.UNLOCK = function () {
    this.lock = false;
}

TimeManager.prototype.stop = function(){
    parentPort.postMessage({message: 'stop'});
    this.worker = null;
    console.log(`${this.name} is Stop...`)
}



module.exports = {
    TimeManager,Job
};

