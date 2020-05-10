## Summary

1. **web-extension-1**
    * Estimated time: ~4 hours
    * Completion: Total

2. **rxjs-1**
    * Estimated time: ~4 hours
    * Completion: Total


## Test instructions and expectations

1. **web-extension-1**
    * Install dependencies
      ```bash
      npm i
      ```

    * Run dev environment
      ```bash
      npm start
      ```

    * The previous command will open the Chrome browser, make sure it's installed on your computer
    * From the default tab, try to access any url, `https://www.wikipedia.org/` for instance
    * After url load, you should expect the page body to be replaced by `Popup opened <C> times on this tab` with `<C>` the current count.
    * You can then repetitively open/close the extension popup to see the current tab count increment.
    * You can also refresh your tab to retrieve the last tab count
    * You can finally repeat the steps with another tab to observe the same behaviour

2. **rxjs-1**
    * Install dependencies
      ```bash
      npm i
      ```

    * Test `getLeaderBoard` observable - DEFAULT
      - Command
        ```bash
        npm start
        ```
      - You'll see a live table of the cars with their respective gap-distance (distance to 1st car) & gap-time (time to 1st car).
    * Test `getCardSpeed` observable
      - Its code is commented by default. Check the `/example.js` file.
      - You'll see the two observables are separated by large commented titles
      - Comment the `LEADERBOARD TEST` code section and uncomment the `CAR SPEED TEST` one.
      - As you'll see, that's the car-1 (Lightning McQueen) speed that is observed by default.
        You can change it if you want by the car-2 (The King)
        LOCATE `car1Speed$.subscribe(defaultSubscribe);` in example.js
      - You can then run it with:
        ```bash
        npm start
        ```
      - You'll see the car-1 (Lightning McQueen) speed evolve in live

## How does it work?

1. **web-extension-1**
  - It all starts with a tab that loads a url and at the same time the content script `/src/content_script/content_script.ts`.
    * On load, the script sends a `TAB_LOAD_OR_RELOAD_REQUEST` message to the `background` script/process to let it know a tab opened and need to be considered in the counting process or just need to reveive its current count.
    * This is also where the page DOM refresh is happening
    * This script also behaves as a intermediary for the popup openings count.
  - The background process/script `/src/background/background.ts` is the central piece:
    * It handles the count state of every tab and sync it with the localStorage
      * On browser opening, it checks if the localStorage contains cached data, if so it's used as the current state, otherwise, the default state is used.
      * On every action/message reveived, the state in memory is updated together with the localStorage
    * Every tab state update is handled via the default message mechanism available that allows to subscribe to different actions/messages and behave accordingly (similarly to redux).
      * Tab opening/load or reload/refresh
      * Popup openings
  - Finally the popup script `/src/popup/popup.tsx`:
    * Is loaded/executed on each popup opening
    * Just send a message to the content script which in turn send it to the background script for the counting process.

2. **rxjs-1**
  - getCarSpeed:
    * There's a local state called `state`
      * This stores whether or not we are handling the first cardData or not. It's needed because we cannot calculate a speed with a single piece of data. So the speed is initially 0.
      * Because of that, it also stores the previous carData in `previousData`.
    * The other important piece is the `throttleTime(200)` which allows to consider only one carData in a timeframe on 200ms. Without that, the speed changes too quickly.

  - getLeaderBoard:
    * Similarly, there's a state called `state`
      * It stores the first car name in `state.firstCarName`
      * And also the 2 last carData from both cars. This is necessary to first calculate the gap-distance and then the gap-time which is a function of the gap-distance and a car speed (which requires the two last data from a car)
    * The other important piece is the `calculateLeaderBoard` function.
      * It takes in input the current state, the list of cars & the carData that was just received.
      * By comparing all the passed data , it generates the `leaderboard` data structure that is later used in the consoled table.

### Alternatives

1. **web-extension-1**

There's only thing I considered using is `longer-lived connections` to exchange messages instead of `one-off` messages. But I wanted to start simple and also I didn't have to handle a lot of messages so it seemed fine.

2. **rxjs-1**
  In fact, I thought I would start just with what I know from RxJS and later try in integrate operators but I in the end spent slightly more time than expected on the challenge and so couldn't do it.

  - getCarSpeed:
    * It seems I could have taken advantage of the `combineLatest` & `zip` operators to automatically handle the previousData I need to
    calculate the speed.
      * [obs1] There would be a first observable emitting the current car data
      * [obs2] Another observable which uses the `combineLatest` over the first observable to get the last (previous) emitted car data
      * The `zip` operator would then wrap both observables:
        ```javascript
        zip(obs2, obs1).subscribe(([previousData, currentData]) => ...)
        ```
  - getLeaderBoard:
    * It seems I could have taken avantage of the `zip` operator again to combine:
      - the `getCarSpeed` observable of the first car (without the throttleTime)
      - the `getCarSpeed` observable of the second car (without the throttleTime)
      - a third observable that emits raw cars data also probably
    *

## Critical analysis

### General feeling

1. **web-extension-1**

  - General thoughts
    * I've always wanted to know how browser extensions were working so I'm pretty happy I got the opportunity to work with them.
    * It's a good exploratory project I think for people who don't now anything about the specs.
  - Implementation reflects correctly your technical skills?
    * It's hard to say, I've tried to make my implementation as simple as possible and I think it is.
    * Also apart from the new apis to get used to (WebExtensions APIs), the problem to solve was familiar.
      It's pretty close to a react/redux (with a message/action mecanism) app with a (localStorage synchronisation in a middleware) I did several times

2. **rxjs-1**

  - General thoughts
    * Clearly understand reactive prog, the streams, observables and all the operators is a challenge on its own in my opinion. It's not something straightforward to clearly understand BUT I would like to have a deeper understanding of it, the possibilities seem so infinite with it, so it's cool to work with it again (last time I used it was some time ago and I don't remember much in fact)
  - Implementation reflects correctly your technical skills?
    * It definitely doesn't reflect my RxJS skills as I could have used more operators but probably my technical skills in general and the way I think about a problem.

### Difficulties

> If any, list the difficulties you faced when trying to complete the challenges and how you overcome them.
>
> (you very probably faced difficulties)
1. **web-extension-1**
    * Too much documentation on MDN, I felt lost several times whereas the basics could probably fit on a single page
    * The specs are still pretty recent so you don't find much help/support on tech websites
      * Though, there were example projects, they've been every helpful.
    * The background script debugging is really not straightforward or convenient to access/find
      - I actually thought we couldn't do it. I later discovered, after finishing the challenge, we could do it on Chrome & Firefox :|
      - So I've been using messages to make sure everything was working as expected!

2. **rxjs-1**
    * Understanding the operators was a non-negligeable difficulty. Even the examples on the official doc are not simple enough for a
      newcomer in my opinion. The weird thing is that they often use several operators to explain how a single operator works.

### Strengths and weaknesses

> List and argue the points of strengths or weaknesses/oddnesses of your implementation.
>
> For weaknesses/oddnesses, suggest improvements and give an estimation of the time necessary to implement them.
>
> You can use [line comments](https://help.github.com/en/articles/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request) to point to certain parts in your code.

1. **web-extension-1**
  - Strenghts
    * It works
    * Simplicity
    * No external dependencies / Lightweight (I haven't added anything)
  - Weaknesses:
    * Not handling possible rejection of `sendMessage` returned promise
      LOCATE AN EXAMPLE IN CONTENT-SCRIPT
    * Not handling possible rejection of `browser.tabs.query()` in popup-script
      LOCATE EXAMPLE IN POPUP-SCRIPT
    * I'm expecting all pages to have a standard dom tree with a `body` tag.
      In 99.9999999999% of the cases it's here I think but if it isn't, my `renderTabCount` doesn't work!
      LOCATE THE CODE LINE HERE IN CONTENT-SCRIPT
    * Maybe also not using the `port` in content-script to exchange messages. It was here from the start, it was probably expected to be used
      LOCATE THE CODE LINE HERE IN CONTENT-SCRIPT
  - Time to resolve issues: ~1hour at most I think

2. **rxjs-1**
  - Strenghts:
    * It works
  - Weaknesses:
    * Lot of code for the for the getLeaderBoard observable (could have fix that by using more operators)
    * It was expected to use as much RxJS as possible and I could definitely use more of it.
  - Time to resolve issues:
    * getCarSpeed: less than an hour
    * getLeaderBoard: not really sure