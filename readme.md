# Sprut-transition-value

Инструмент для изменения числовых значений во времени(transition).

---

## Использование:

Здесь короткие примеры использования различных классов с их описанием. Ниже описание конструкторов и интерфейсов классов.

---

Классы с постфиксом ```interval``` предназначены для извлечения значения из интервала с помощью указания состояния от ```0``` до ```1``` в методе ```state```.

Классы с постфиксом ```ofTime``` предназначены для извлечения значения из интервала с помощью указания момента времени от ```0``` до времени жизни, указанного в конструкторе. Время указывается в методе ```state```.

Классы без постфикса имеют свойство ```now```, из которого извлекается значение в данный момент времени. Их можно перезапустить с помощью метода ```launch()```, указав время запуска или оставить пустым(по умолчанию ```new Date().getTime()``` - нынешний момент времени в миллисекундах).

```js
const { AnimationValue, Interval, IntervalOfTime } = require('sprut-transition-value');

const interval = new Interval(0, 10);
console.log(interval.state(0.5)); // 5

const intervalOfTime = new IntervalOfTime(0, 10, 1000);
console.log(intervalOfTime.state(250)) // 2.5

const animationValue = new AnimationValue(0, 10, 1000);
const iter = () => {
    if (animationValue.state === 'inprogress') {
        setTimeout(iter, 100);
    }

    console.log("Transition value now is ", animationValue.now);
};
iter();
```

### Механизм подписки для AnimationValue, TimeLine и Path:

```js
const { AnimationValue, Subscriber } = require('sprut-transition-value');
const updateInterval = 50;
const subscriber = new Subscriber(new AnimationValue(0, 100, 1000, timingFunctions.exponential(2, 'EaseInOut')));

subscriber
    .do((value) => console.log('1-я функция обратного вызова'))
    .do((value) => console.log('Значение сейчас =', value))
    .finished((value) => console.log('Переход значения завершён =', value))
    .finished(() => console.log('2-я функция обратного вызова'));
```

---

## Экспортируемые классы:
```js
module.exports = { Interval, IntervalOfTime, AnimationValue, TimeLineInterval, TimeLineOfTime, TimeLine, PathInterval, PathOfTime, Path, timingFunctions };
```
---

## Конструктор Interval:
```js
constructor (startValue, finishValue)
```
```startValue``` - стартовое значение

```finishValue``` - финальное значение.

## Интерфейс Interval:
```js
{
    state (stateProgress: number, timingFunction: (stateProgress: number) => number): number // Значение между стартовым и финальным, описываемое состоянием анимации stateProgress(0-1)
    start: number | { now: number };
    finish: number | { now: number };
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```timingFunction``` - Функция динамики анимации(Timing function), управляющая характером анимации значения. По умолчанию линейная(linear).

---

## Конструктор IntervalOfTime:
```js
constructor (startValue, finishValue, timeInterval)
```
```startValue``` - стартовое значение

```finishValue``` - финальное значение.

```timeInterval``` - Время, за которое значение изменится от стартового до финального.

## Интерфейс IntervalOfTime:
```js
{
    state (stateTime: number, timingFunction: (stateProgress: number) => number): number // Значение между стартовым и финальным, описываемое временем, пройденного со старта анимации stateTime в миллисекундах
    start: number | { now: number };
	finish: number | { now: number };
}
```

```stateTime``` - Пройденное время после старта анимации в миллисекундах.

---

## Конструктор AnimationValue:
```js
constructor (startValue, finishValue, timeInterval, timingFunction, iterations, startOffset)
```
```startValue``` - стартовое значение.

```finishValue``` - финальное значение.

```timeInterval``` - Время, за которое значение изменится от стартового до финального.

```timingFunction``` - Функция динамики анимации(Timing function), управляющая характером анимации значения. По умолчанию линейная(linear).

```iterations``` - тип анимации. Возможные значения ```"loop"```, ```"ping-pong"```, ```undefined```.

```startOffset``` - задержка перед началом анимации.

## Интерфейс AnimationValue:
```js
{
    get state: number
    start: number | { now: number };
	finish: number | { now: number };
    now: number;
    launch (time? = new Date().getTime(): number);
    get state: string;
}
```

```state``` - Состояние анимации. Возможные значения - ```inprogress```, ```finish```.

```now``` - значение анимации в данный момент времени.

Метод ```launch``` - установка времени старта анимации в момент времени ```time``` в миллисекундах или по умолчанию в данный момент времени.

---

## Типы анимации:

```"loop"``` - изменение значения будет зациклено в бесконечном промежутке времени, начинаясь каждый раз сначала.

```"ping-pong"``` - изменение значения будет зациклено в бесконечном промежутке времени, перемещаясь от старта к финишу, а потом обратно.

В будущем будет переработано и добавлено количество выполняемых итераций анимации.

---

## Конструктор TimeLineInterval:
```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        point: number; // Значение от 0 до 1, описывающее состояние интервала, в течение которого будет изменяться значение value из массива до следующего value из массива pointArray. Крайний элемент должен иметь значение point равным еденице.
        timingFunction?: stateProgress: number) => number;
    }>,
    localTimingFunction: (stateProgress: number) => number = timimingFunctions.linear
)
```
```pointArray``` - набор ключевых точек анимации.

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

## Интерфейс TimeLineInterval:
```js
{
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

---

## Конструктор TimeLineOfTime:
```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        point: number; // Значение от 0 до 1, описывающее состояние интервала, в течение которого будет изменяться значение value из массива до следующего value из массива pointArray. Крайний элемент должен иметь значение point равным еденице.
        timingFunction?: stateProgress: number) => number;
    }>,
    interval: number;
    localTimingFunction: (stateProgress: number) => number = timimingFunctions.linear
)
```
```pointArray``` - набор ключевых точек анимации.

```interval``` - Время, за которое значение изменится от стартового до финального.

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

## Интерфейс TimeLineOfTime:
```js
{
    pointArray: Array<{
        value: number | { now: number };
        point: number;
        timingFunction?: stateProgress: number) => number;
    }>;
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
    timeInterval: number;
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```timeInterval``` - время анмиации таймлайна.

---

## Конструктор TimeLine:
```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        point: number; // Значение от 0 до 1, описывающее состояние интервала, в течение которого будет изменяться значение value из массива до следующего value из массива pointArray. Крайний элемент должен иметь значение point равным еденице.
        timingFunction?: stateProgress: number) => number;
    }>,
    interval: number,
    iterations?: string,
    globalTimingFunction?: (stateProgress: number) => number = timimingFunctions.linear,
    localTimingFunction?: (stateProgress: number) => number = timimingFunctions.linear,
    startOffset?: number = 0
)
```
```pointArray``` - набор ключевых точек анимации.

```interval``` - Время, за которое значение изменится от стартового до финального.

```iterations``` - тип анимации. Возможные значения ```"loop"```, ```"ping-pong"```, ```undefined```.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

```startOffset``` - задержка перед началом анимации.

## Интерфейс TimeLine:
```js
{
    pointArray: Array<{
        value: number | { now: number };
        point: number;
        timingFunction?: stateProgress: number) => number;
    }>;
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
    timeInterval: number;
    now: number;
    launch (time? = new Date().getTime(): number);
    get state: string;
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```timeInterval``` - время анмиации таймлайна.

```now``` - значение анимации в данный момент времени.

```state``` - Состояние анимации. Возможные значения - ```inprogress```, ```finish```.

Метод ```launch``` - установка времени старта анимации в момент времени ```time``` в миллисекундах или по умолчанию в данный момент времени.

---

## Конструктор PathInterval:
```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        timingFunction?: stateProgress: number) => number;
    }>,
    localTimingFunction: (stateProgress: number) => number = timimingFunctions.linear
)
```
```pointArray``` - набор ключевых точек анимации. Поле ```point``` в точках здесь необязательно, так как это значение вычисляется и задаётся автоматически при создании экземпляра таким образом, чтобы изменение значение происходило с постоянной одинаковой скоростью между разными ключевыми точками.

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

## Интерфейс PathInterval:
```js
{
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

---

## Конструктор PathOfTime:
```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        timingFunction?: stateProgress: number) => number;
    }>,
    interval: number;
    localTimingFunction: (stateProgress: number) => number = timimingFunctions.linear
)
```
```pointArray``` - набор ключевых точек анимации. Поле ```point``` в точках здесь необязательно, так как это значение вычисляется и задаётся автоматически при создании экземпляра таким образом, чтобы изменение значение происходило с постоянной одинаковой скоростью между разными ключевыми точками.

```interval``` - Время, за которое значение изменится от стартового до финального.

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

## Интерфейс PathOfTime:
```js
{
    pointArray: Array<{
        value: number | { now: number };
        timingFunction?: stateProgress: number) => number;
    }>;
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
    timeInterval: number;
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```timeInterval``` - время анмиации таймлайна.

---

## Конструктор Path:

Объекте Path кофигурирует все промежуточные значения таким образом, чтобы переход значения между различными ключевыми точками осуществлялся с равномерной скоростью, постоянной на всех интервалах между ключевыми значениями.

```js
constructor (
    pointArray: Array<{
        value: number | { now: number };
        timingFunction?: stateProgress: number) => number;
    }>,
    interval: number,
    iterations?: string,
    globalTimingFunction?: (stateProgress: number) => number = timimingFunctions.linear,
    localTimingFunction?: (stateProgress: number) => number = timimingFunctions.linear,
    startOffset?: number = 0
)
```
```pointArray``` - набор ключевых точек анимации. Поле ```point``` в точках здесь необязательно, так как это значение вычисляется и задаётся автоматически при создании экземпляра таким образом, чтобы изменение значение происходило с постоянной одинаковой скоростью между разными ключевыми точками.

```interval``` - Время, за которое значение изменится от стартового до финального.

```iterations``` - тип анимации. Возможные значения ```"loop"```, ```"ping-pong"```, ```undefined```.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```localTimingFunction``` - тайминг-функция, которая определяет характер изменения значения в интервалах между точками, если она не задана для них отдельно.

```startOffset``` - задержка перед началом анимации.

## Интерфейс Path:
```js
{
    pointArray: Array<{
        value: number | { now: number };
        timingFunction?: stateProgress: number) => number;
    }>;
    state (stateProgress, globalTimingFunction: (stateProgress: number) => number = timimingFunctions.linear): number; // Значение между заданными интервалами в pointArray, описываемое временем, пройденного со старта анимации stateTime в миллисекундах и тайминг-функцией.
    timeInterval: number;
    now: number;
    launch (time? = new Date().getTime(): number);
    get state: string;
}
```

```stateProgress``` - значение от ```0``` до ```1```. Описывает состояние анимации значения.

```globalTimingFunction``` - глобальная тайминг-фукнция, определяющая глобальный характер изменения занчения в рамках всего таймлайна(совокупности точек pointArray, не отдельного интервала).

```timeInterval``` - время анмиации таймлайна.

```now``` - значение анимации в данный момент времени.

```state``` - Состояние анимации. Возможные значения - ```inprogress```, ```finish```.

Метод ```launch``` - установка времени старта анимации в момент времени ```time``` в миллисекундах или по умолчанию в данный момент времени.

---

## Конструктор Subscriber:

Объект ```Subscriber``` используется для подписки на объекты анимации ```AnimationValue```, ```TimeLine``` и ```Path```.

Методы ```Subscriber``` возможно вызывать по цепочке(chaning).

```js
constructor (
    animations: AnimationValue | TimeLine | Path | Array<AnimationValue | TimeLine | Path>,
    updateInterval?: number = 0
)
```

## Интерфейс Subscriber:

```js
{
    do(callback: (...animationValues: number[])): this;
    finished(callback: (...animationValues: number[])): this;
    stop(callFinished?: boolean): this;
    start(startTime: number = new Date().getTime()): this;
    get isStoped: boolean;
}
```

```do``` - добавление функции обратного вызова от спреда всех значений анимаций в настоящее время.

```finished``` - добавление функции обратного вызова от спреда всех значений анимаций по завершению всех анимаций.

```stop``` - остановка анмации с возможным(опциональным) выполнением финишных функций обратного вызова.

```start``` - запуск всех анимаций и подписки на них. По умолчанию время старта анимации ```startTime``` равняется ```new Date().getTime()```.

```isStoped``` - состояние, показывающее, остановлено ли слежение за анимациями.