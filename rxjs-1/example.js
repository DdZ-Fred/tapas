const Table = require('easy-table')

const { getRace } = require('./race');
const { getCarSpeed, defaultSubscribe } = require('./getCarSpeed');
const { getLeaderBoard } = require('./getLeaderBoard');

const race = getRace();
const carNames = race.getCars();

// ────────────────────────────────────────────────────────────────────────────────
//
// ─── CAR SPEED TEST ─────────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────

// const car1Speed$ = getCarSpeed(race, carNames[0]);
// const car2Speed$ = getCarSpeed(race, carNames[1]);
// car1Speed$.subscribe(defaultSubscribe);

// ────────────────────────────────────────────────────────────────────────────────
//
// ─── LEADERBOARD TEST ───────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────

const leaderBoard$ = getLeaderBoard(race);
leaderBoard$.subscribe(leaderBoard => {
  const t = new Table()
  leaderBoard.forEach(function(car) {
    t.cell('#', car.position)
    t.cell('Name', car.carName)
    t.cell('Gap Distance', `${car.leaderGapDistance}m`)
    t.cell('Gap Time', `${car.leaderGapTime}ms`)
    t.newRow()
  });
  process.stdout.write(t.toString());
  // clear current the table at next writing
  process.stdout.moveCursor(0, -4)
});

// ────────────────────────────────────────────────────────────────────────────────
//
// ─── DEFAULT CODE ───────────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────



// console.log('Participants:', carNames.join('/'));
// race.on('data', ({time, carName, xLocation}) => {
//   if (carName === 'Lightning McQueen') {
//     process.stdout.write(`Time: ${time}, Location: ${xLocation}m\r`);
//   }
// });
// race.on('end', () => {
// });


// ────────────────────────────────────────────────────────────────────────────────
//
// ─── COMMON ─────────────────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────

race.start();
