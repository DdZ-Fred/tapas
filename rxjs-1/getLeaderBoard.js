const Rx = require("rxjs");
const { calculateSpeed } = require('./getCarSpeed');

function calculateLeaderBoard(state, cars, currentCarData) {
  if (!state.firstCarName) {
    return cars.map(carName => {
      const isCurrentCar = carName === currentCarData.carName;
      return {
        carName,
        position: isCurrentCar ? 1 : 2,
        leaderGapDistance: isCurrentCar ? 0 : currentCarData.xLocation,
        leaderGapTime: 0,
      };
    })
  }

  const previousFirstCar = state.carsData[state.firstCarName];
  const previousSecondCar = state.carsData[state.firstCarName === cars[0] ? cars[1] : cars[0]];

  // 1. CurrentCar is in front of previous first car
  if (currentCarData.xLocation > previousFirstCar.last.xLocation) {

    // 1.1. Previous first car was the same car
    if (currentCarData.carName === previousFirstCar.last.carName) {
      return cars.map(carName => {
        const isCurrentCar = carName === currentCarData.carName;
        const leaderGapDistance = isCurrentCar
          ? 0
          : currentCarData.xLocation - previousSecondCar.last.xLocation;

        const leaderGapTime = isCurrentCar
          ? 0
          : (leaderGapDistance / calculateSpeed(previousSecondCar.penultimate, previousSecondCar.last)) || 0;
        return {
          carName,
          position: isCurrentCar ? 1 : 2,
          leaderGapDistance,
          leaderGapTime,
        };
      });
    // 1.2. Previous first car was the other car
    } else {
      return cars.map(carName => {
        const isCurrentCar = carName === currentCarData.carName;
        const leaderGapDistance = isCurrentCar
          ? 0
          : currentCarData.xLocation - previousFirstCar.last.xLocation;
        const leaderGapTime = isCurrentCar
          ? 0
          : (leaderGapDistance / calculateSpeed(previousFirstCar.penultimate, previousFirstCar.last)) || 0;
        return {
          carName,
          position: isCurrentCar ? 1 : 2,
          leaderGapDistance,
          leaderGapTime,
        };
      })
    }
  }

  // 2. Current car is behind the previous first car.
  // Also means previous first car is neccessarily the other car
  if (currentCarData.xLocation < previousFirstCar.last.xLocation) {
    return cars.map(carName => {
      const isCurrentCar = carName === currentCarData.carName;
      const leaderGapDistance = isCurrentCar
        ? previousFirstCar.last.xLocation - currentCarData.xLocation
        : 0
      const leaderGapTime = isCurrentCar
        ? (leaderGapDistance / calculateSpeed(previousSecondCar.last, currentCarData)) || 0
        : 0;
      return {
        carName,
        position: isCurrentCar ? 2 : 1,
        leaderGapDistance,
        leaderGapTime,
      }
    });
  }

  // 3. Current car reached the previous first car
  return cars.map(carName => ({
    carName,
    position: 1,
    leaderGapDistance: 0,
    leaderGapTime: 0,
  }));
}

const defaultCarData = {
  time: 0,
  xLocation: 0
}
const getInitialState = (cars) => {
  return {
    firstCarName: '',
    carsData: cars.reduce((acc, carName) => {
      return {
        ...acc,
        [carName]: {
          last: { ...defaultCarData, carName },
          penultimate: { ...defaultCarData, carName },
        },
      };
    }, {}),
  };
}

/**
 *
 * @param {Race} race - Race event-emitter instance
 */
function getLeaderBoard(race) {
  return new Rx.Observable(subscriber => {
    const cars = race.getCars();

    let state = getInitialState(cars);

    race.on('data', ({ time, carName, xLocation }) => {
      const leaderBoard = calculateLeaderBoard(state, cars, { time, carName, xLocation });
      const firstCarName = leaderBoard.find(car => car.position === 1).carName;

      state = {
        ...state,
        firstCarName,
        carsData: {
          ...state.carsData,
          [carName]: {
            last: { time, carName, xLocation },
            penultimate: state.carsData[carName].last,
          }
        },
      };
      subscriber.next(leaderBoard)
    });
    race.on('end', () => {
      subscriber.complete();
    });
  });
}


module.exports = {
  getLeaderBoard
};