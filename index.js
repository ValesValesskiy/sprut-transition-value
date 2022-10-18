class Interval {
	constructor (val_1, val_2) {
		this.start = val_1;
		this.finish = val_2;
	}
	state (stateProgress, timingFunction) {
		var isCompositeValue, start, finish;

		isCompositeValue = this.start.now;
		start = isCompositeValue ? isCompositeValue : this.start;
		isCompositeValue = this.finish.now;
		finish = isCompositeValue ? isCompositeValue : this.finish;
		return start + ((finish - start) * (timingFunction ? timingFunction(stateProgress) : stateProgress));
	}
}

class IntervalOfTime {
	constructor (val_1, val_2, interval) {
		this.intervalObject = new Interval(val_1, val_2);
		this.timeInterval = interval;
	}
	get start() {
		return this.intervalObject.start;
	}
	set start(val) {
		this.intervalObject.start = val;
	}
	get finish() {
		return this.intervalObject.finish;
	}
	set finish(val) {
		this.intervalObject.finish = val;
	}
	state (stateTime, timingFunction) {
		return this.intervalObject.state((stateTime / this.timeInterval), timingFunction);
	}
}

class AnimationValue {
	constructor (val_1, val_2, timeInterval, timingFunction, iterations, startOffset) {
		this.intervalOfTimeObject = new IntervalOfTime(val_1, val_2, timeInterval);
		this.timeInterval = timeInterval;
		this.createTime = new Date().getTime() - (startOffset ? startOffset : 0);
		this.timingFunction = timingFunction;
		this.iterations = iterations;
	}
	get start() {
		return this.intervalOfTimeObject.start;
	}
	set start(val) {
		this.intervalOfTimeObject.start = val;
	}
	get finish() {
		return this.intervalOfTimeObject.finish;
	}
	set finish(val) {
		this.intervalOfTimeObject.finish = val;
	}
	get now() {
		var now = new Date().getTime(),
			nowInterval = now - this.createTime,
			calcInterval;

		switch(this.iterations) {
			default:
				if(nowInterval > this.timeInterval) {
					calcInterval = this.timeInterval;
				} else {
					calcInterval = nowInterval;
				}
				break;
			case 'loop':
				calcInterval = nowInterval % this.timeInterval;
				break;
			case 'ping-pong':
				if(parseInt(nowInterval / this.timeInterval) % 2 == 0) {
					calcInterval = nowInterval % this.timeInterval;
				} else {
					calcInterval = this.timeInterval - (nowInterval % this.timeInterval);
				}
				break;
		}
		return this.intervalOfTimeObject.state(calcInterval, this.timingFunction);
	}
	get state() {
		var	nowInterval = new Date().getTime() - this.createTime;

		if(nowInterval > this.timeInterval) {
			if((this.iterations == 'loop') || (this.iterations == 'ping-pong')) {
				return 'inprogress';
			} else {
				return 'finish';
			}
		} else {
			return 'inprogress';
		}
	}
	launch(time) {
		this.createTime = time ? time : new Date().getTime();
	}
}

class TimeLineInterval {
	constructor(pointArray, localTimingFunction) {
		this.pointArray = pointArray;
		this.intervalArray = [];
		for (var i = 0; i < this.pointArray.length - 1; i++) {
			var thisTimingFunction;

			if(this.pointArray[i + 1].timingFunction) {
				thisTimingFunction = this.pointArray[i + 1].timingFunction;
			} else if(localTimingFunction) {
				thisTimingFunction = localTimingFunction;
			} else {
				thisTimingFunction = timingFunctions.linear;
			}
			this.intervalArray.push({
				interval: new Interval(this.pointArray[i].value, this.pointArray[i + 1].value),
				from: this.pointArray[i].point,
				to: this.pointArray[i + 1].point,
				distance: this.pointArray[i + 1].point - this.pointArray[i].point,
				timingFunction: thisTimingFunction
			});
		}
	}
	state(stateProgress, globalTimingFunction = timingFunctions.linear) {
		var result;

		stateProgress = globalTimingFunction(stateProgress);
		for (var i = 0; i < this.intervalArray.length; i++) {
			var intObj = this.intervalArray[i];

			if(stateProgress <= intObj.to) {
				result = intObj.interval.state((stateProgress - intObj.from) / intObj.distance, intObj.timingFunction);
				break;
			}
		}
		return result;
	}
}

class TimeLineOfTime {
	constructor(pointArray, interval, localTimingFunction) {
		this.timeLineIntervalObject = new TimeLineInterval(pointArray, localTimingFunction);
		this.timeInterval = interval;
		this.localTimingFunction = localTimingFunction;
	}
	get pointArray() {
		return this.timeLineIntervalObject.pointArray;
	}
	set pointArray(pointArray) {
		this.timeLineIntervalObject = new TimeLineInterval(pointArray, this.localTimingFunction);
	}
	state(stateTime, globalTimingFunction) {
		return this.timeLineIntervalObject.state(stateTime / this.timeInterval, globalTimingFunction);
	}
}

class TimeLine {
	constructor(pointArray, interval, iterations, globalTimingFunction, localTimingFunction, startOffset) {
		this.timeLineOfTimeObject = new TimeLineOfTime(pointArray, interval, localTimingFunction);
		this.createTime = new Date().getTime() - (startOffset ? startOffset : 0);
		this.iterations = iterations;
		this.globalTimingFunction = globalTimingFunction ? globalTimingFunction : timingFunctions.linear;
	}
	get timeInterval() {
		return this.timeLineOfTimeObject.timeInterval;
	}
	set timeInterval(interval) {
		this.timeLineOfTimeObject.timeInterval = interval;
	}
	get pointArray() {
		return this.timeLineOfTimeObject.pointArray;
	}
	set pointArray(pointArray) {
		this.timeLineOfTimeObject.pointArray = pointArray;
	}
	get now() {
		var now = new Date().getTime(),
			nowInterval = now - this.createTime,
			calcInterval,
			local;

		switch(this.iterations) {
			default:
				if(nowInterval > this.timeInterval) {
					calcInterval = this.timeInterval;
				} else {
					calcInterval = nowInterval;
				}
				break;
			case 'loop':
				calcInterval = nowInterval % this.timeInterval;
				break;
			case 'ping-pong':
				if(parseInt(nowInterval / this.timeInterval) % 2 == 0) {
					calcInterval = nowInterval % this.timeInterval;
				} else {
					calcInterval = this.timeInterval - (nowInterval % this.timeInterval);
				}
				break;
		}
		return this.timeLineOfTimeObject.state(calcInterval, this.globalTimingFunction);
	}
	get state() {
		var	nowInterval = new Date().getTime() - this.createTime;

		if(nowInterval > this.timeInterval) {
			if((this.iterations == 'loop') || (this.iterations == 'ping-pong')) {
				return 'inprogress';
			} else {
				return 'finish';
			}
		} else {
			return 'inprogress';
		}
	}
	launch(time) {
		this.createTime = time ? time : new Date().getTime();
	}
}

class PathInterval {
	constructor(pointArray, localTimingFunction) {
		this.pointArray = pointArray;
		this.timeLineArray = [];

		var distance = 0,
			localDistance = [];

		for (var i = 0; i < this.pointArray.length - 1; i++) {
			localDistance[i] = 0;
			for(var j = 0; j < this.pointArray[0].length; j++) {
				localDistance[i] += Math.pow(this.pointArray[i + 1][j].value - this.pointArray[i][j].value, 2);
			}
			localDistance[i] = Math.sqrt(localDistance[i]);
			distance += localDistance[i];
		}
		this.distance = distance;
		for(var j = 0; j < this.pointArray[0].length; j++) {
			var pointLine = [];

			for (var i = 0; i < this.pointArray.length; i++) {
				var pointSumm = 0;
				for (var k = 0; k < i; k++) {
					pointSumm += localDistance[k] / this.distance;
				}
				pointLine.push({ value: this.pointArray[i][j].value, point: pointSumm });
			}
			this.timeLineArray.push(new TimeLineInterval(pointLine, localTimingFunction));
		}
	}
	state(stateProgress, globalTimingFunction) {
		var result = [];

		for (var i = 0; i < this.timeLineArray.length; i++) {
			result.push(this.timeLineArray[i].state(stateProgress, globalTimingFunction));
		}

		return result;
	}
}

class PathOfTime {
	constructor(pointArray, interval, localTimingFunction) {
		this.pathIntervalObject = new PathInterval(pointArray, localTimingFunction);
		this.timeInterval = interval;
		this.localTimingFunction = localTimingFunction;
	}
	get pointArray() {
		return this.pathIntervalObject.pointArray;
	}
	set pointArray(pointArray) {
		this.pathIntervalObject = new PathInterval(pointArray, this.localTimingFunction);
	}
	state(stateTime, globalTimingFunction) {
		return this.pathIntervalObject.state(stateTime / this.timeInterval, globalTimingFunction);
	}
}

class Path {
	constructor(pointArray, interval, iterations, globalTimingFunction, localTimingFunction, startOffset) {
		this.pathOfTimeObject = new PathOfTime(pointArray, interval, localTimingFunction);
		this.createTime = new Date().getTime() - (startOffset ? startOffset : 0);
		this.iterations = iterations;
		this.globalTimingFunction = globalTimingFunction ? globalTimingFunction : timingFunctions.linear;
	}
	get timeInterval() {
		return this.pathOfTimeObject.timeInterval;
	}
	set timeInterval(interval) {
		this.pathOfTimeObject.timeInterval = interval;
	}
	get pointArray() {
		return this.pathOfTimeObject.pointArray;
	}
	set pointArray(pointArray) {
		this.pathOfTimeObject.pointArray = pointArray;
	}
	get state() {
		var	nowInterval = new Date().getTime() - this.createTime;

		if(nowInterval > this.timeInterval) {
			if((this.iterations == 'loop') || (this.iterations == 'ping-pong')) {
				return 'inprogress';
			} else {
				return 'finish';
			}
		} else {
			return 'inprogress';
		}
	}
	get now() {
		var now = new Date().getTime(),
			nowInterval = now - this.createTime,
			calcInterval;

		switch(this.iterations) {
			default:
				if(nowInterval > this.timeInterval) {
					calcInterval = this.timeInterval;
				} else {
					calcInterval = nowInterval;
				}
				break;
			case 'loop':
				calcInterval = nowInterval % this.timeInterval;
				break;
			case 'ping-pong':
				if(parseInt(nowInterval / this.timeInterval) % 2 == 0) {
					calcInterval = nowInterval % this.timeInterval;
				} else {
					calcInterval = this.timeInterval - (nowInterval % this.timeInterval);
				}
				break;
		}
		return this.pathOfTimeObject.state(calcInterval, this.globalTimingFunction);
	}
	launch(time) {
		this.createTime = time ? time : new Date().getTime();
	}
}

var timingFunctions = {};

timingFunctions.bounce = function bounce(timeFraction) {
	return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * timeFraction);
}
timingFunctions.linear = function (timeFraction) {
	return timeFraction;
}
timingFunctions.exponential = function(e, timing) {
	switch(timing) {
		default:
			return expression;
		case 'EaseOut':
			return expressionEaseOut;
		case 'EaseInOut':
			return expressionEaseInOut;
	}

	function expression(timeFraction) {
		return Math.pow(timeFraction, e);
	}
	function expressionEaseOut(timeFraction) {
		return 1 - expression(1 - timeFraction);
	}
	function expressionEaseInOut(timeFraction) {
		if (timeFraction <= 0.5) {
			return expression(2 * timeFraction) / 2;
		} else {
			return 1 - expression(2 * (1 - timeFraction)) / 2;
		}
	}
}
timingFunctions.random = function() {
	return Math.random();
}
timingFunctions.randomIn = function(timeFraction) {
	return Math.random() * timeFraction;
}
timingFunctions.randomOut = function(timeFraction) {
	return Math.random() * (1 - timeFraction);
}
timingFunctions.randomInOut = function(timeFraction) {
	if (timeFraction <= 0.5) {
		return Math.random() * timeFraction * 2;
	} else {
		return Math.random() * ((1 - timeFraction) * 2);
	}
}
timingFunctions.sin = function(timeFraction) {
	return Math.sin(timeFraction * Math.PI * 2);
}
timingFunctions.sinIn = function(timeFraction) {
	return Math.sin(timeFraction * Math.PI * 2) * timeFraction;
}
timingFunctions.sinOut = function(timeFraction) {
	return 1 - Math.sin((1 - timeFraction) * Math.PI * 2) * (1 - timeFraction);
}

class Subscriber {
	constructor(animations, updateInterval = 0) {
		if (animations instanceof AnimationValue || animations instanceof TimeLine || animations instanceof Path) {
			animations = [animations];
		} else if (animations instanceof Array) {
			animations.forEach(a => {
				if (!(a instanceof AnimationValue || a instanceof TimeLine || a instanceof Path)) {
					throw new Error(`Object must be instance of AnimationValue or TimeLine or Path`);
				}
			});
		} else {
			throw new Error(`Object must be instance of AnimationValue or TimeLine or Path`);
		}

		this._animations = animations;
		this._updateInterval = updateInterval;
		this._callbacks = [];
		this._finishCallbacks = [];

		startSubscriber(this);
	}

	get isStoped() {
		return this._stoped;
	}

	do(callback) {
		this._callbacks.push(callback);

		return this;
	}

	finished(callback) {
		this._finishCallbacks.push(callback);

		return this;
	}

	stop(callFinished) {
		if (!this._stoped) {
			if (callFinished) {
				callFinished(this);
			}

			this._stoped = true;
		}

		return this;
	}

	start(startTime) {
		startSubscriber(this, startTime);

		return this;
	}
}

function startSubscriber(subscriber, startTime = new Date().getTime()) {
	subscriber._stoped = false;

	subscriber._animations.forEach(a => a.launch(startTime));
	callInprogress(subscriber);
}

function callInprogress(subscriber) {
	subscriber._callbacks.forEach(cb => {
		const values = subscriber._animations.map(a => a.now);

		cb(...values);
	});

	let inprogress = false;

    for(let a of subscriber._animations) {
        if (a.state !== 'finish') {
            inprogress = true;
            break;
        }
    }
	
	if (!inprogress) {
		this._stoped = true;
		callFinished(subscriber);
	} else {
		setTimeout(() => callInprogress(subscriber), this._updateInterval);
	}
}

function callFinished(subscriber) {
	const values = subscriber._animations.map(a => a.now);

	subscriber._finishCallbacks.forEach(cb => {
		cb(...values);
	});
}

module.exports = { Interval, IntervalOfTime, AnimationValue, TimeLineInterval, TimeLineOfTime, TimeLine, PathInterval, PathOfTime, Path, Subscriber, timingFunctions };