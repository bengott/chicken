// Determine winner/loser and respond accordingly
determineResult = function () {

  var distanceX = Timing.timestep.get() * DX;
  console.log(distanceX);
  
  // Midway point
  if (distanceX === (ROAD_WIDTH/2 - CAR_WIDTH)) {
    midway();
  }

  // End of the road, pal
  if (distanceX === ROAD_WIDTH) {
    endOfRoad();
  }
};

function midway() {

  var carA = Cars.findOne("A");
  var carB = Cars.findOne("B");
  
  // If nobody chickened out, they both lose -> crash
  var crash = !carA.chickenedOut && !carB.chickenedOut;

  if (crash) {

    // This happens on both client AND server
    Timing.timer.stop();

    // Update db on server only
    if (Meteor.isServer) {
      
      // Set crash status to true, which will show the explosion svg on client
      Statuses.update("crash", {$set: {value: true}});
      // Then reset the crash status to false after a couple seconds
      Meteor.setTimeout(function () {
        Statuses.update("crash", {$set: {value: false}});
      }, 2000);
      
      // Push modal popup message to client
      Statuses.update("modal", {$set: {message: "Crash! Nobody wins."}});
      
      // Reset cars
      Cars.update({}, {$set: {driver: null}}, {multi: true});
    }

    // Reset the game to timestep 0 after a couple seconds
    Meteor.setTimeout(function () {
      Timing.timestep.set(0);
    }, 2000);
}

  console.log("mid -", crash ? "crash" : "carry on");
}

function endOfRoad() {
  
  var carA = Cars.findOne("A");
  var carB = Cars.findOne("B");
  var winner, loser;
  
  // This happens on both client AND server
  Timing.timer.stop();
  
  // The decision happens on the server only
  if (Meteor.isServer) {

    if (carA.chickenedOut && !carB.chickenedOut) {
      winner = carB;
      loser = carA;
    }
    else if (!carA.chickenedOut && carB.chickenedOut) {
      winner = carA;
      loser = carB;
    }
    // If both chickened out, compare timestamps. whoever bailed last wins.
    else if (carA.chickenedOut && carB.chickenedOut) {
      if (carA.chickenedOut < carB.chickenedOut) {
        winner = carA;
        loser = carB;
      } else {
        winner = carB;
        loser = carA;        
      }
    } else {
      console.log("should not be here: no winner, no loser");
    }

    // Update high score
    HighScores.upsert({player: winner.driver}, {$inc: {wins: 1}});

    // Push modal popup message to client
    Statuses.update("modal", {$set: {message: "Winner: " + winner.driver + "<br>"
                                            + "Loser: &nbsp;" + loser.driver}});
    
    // Winner stays on
    Cars.update(loser._id, {$set: {driver: null}});
    Cars.update({}, {$set: {chickenedOut: null}}, {multi: true});
    console.log("end - winner: " + winner.driver + " loser: " + loser.driver);
  }

  // Reset the game to timestep 0 after a couple seconds
  Meteor.setTimeout(function () {
    Timing.timestep.set(0);
  }, 2000);
}