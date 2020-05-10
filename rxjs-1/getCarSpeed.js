const Rx = require("rxjs");
const { throttleTime } = require('rxjs/operators');

/**
 * Calculates car speed in m/s
 * @param {DataEmittion} previousData - Previous car data
 * @param {DataEmittion} currentData - Current car data
 */
function calculateSpeed(previousData, currentData) {
  // Time: milliseconds (ms)
  const duration = currentData.time - previousData.time;
  // Distance: meter (m)
  const distance = currentData.xLocation - previousData.xLocation;
  // Get speed in m/s
  const speed = duration === 0
    ? 0
    : (distance/duration) * 1000;
  return speed;
}

/**
 * Returns a car speed Observable
 * @param {Race} race - Race event-emitter instance
 * @param {string} speedCarName - Car name we want the speed from
 */
function getCarSpeed(race, speedCarName) {
  return new Rx.Observable(subscriber => {
    let state = {
      isFirstData: true,
      previousData: null,
    };
    race.on('data', ({ time, carName, xLocation }) => {
      if (carName === speedCarName) {
        let speed = 0;
        if (state.isFirstData) {
          state = {
            ...state,
            isFirstData: false,
            previousData: { time, carName, xLocation }
          };
        } else {
          speed = calculateSpeed(state.previousData, { time, xLocation });
          state = {
            ...state,
            previousData: { time, carName, xLocation },
          };
        }
        subscriber.next(speed);
      }
    });
    race.on('end', () => {
      subscriber.complete();
    });
    // Speed is calculated using the car location in a 200ms window.
  }).pipe(throttleTime(200));
}

/**
 * Default observable subscriber function:
 * - Outputs speed
 * @param {number} speed - Car speed
 */
function defaultSubscribe(speed) {
  process.stdout.write(`Speed: ${speed} m/s\r`);
}

module.exports = {
  calculateSpeed,
  getCarSpeed,
  defaultSubscribe
}