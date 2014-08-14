//determine winner/loser and respond accordingly
results = function () {

  var carA = Cars.findOne("A");
  var carB = Cars.findOne("B");
  var distanceX = Timing.timestep.get() * dx;
  console.log(distanceX);
  
  //midway point
  if (distanceX === (roadWidth/2 - carWidth)) {
    midway(carA, carB);
  }

  //end of the road, pal
  if (distanceX === roadWidth) {
    endOfRoad(carA, carB);
  }
};

function midway(carA, carB) {
  
  //if nobody chickened out, they both lose -> crash
  var crash = !carA.chickenedOut && !carB.chickenedOut;

  if (crash) {

    //this happens on both client AND server
    Timing.timer.stop();

    //update db on server only
    if (Meteor.isServer) {
      
      //set crash status to true, which will show the explosion svg on client
      Statuses.update("crash", {$set: {value: true}});
      
      //push modal popup message to client
      Statuses.update("modal", {$set: {message: "Crash! Nobody wins."}});
      
      //reset cars
      Cars.update({}, {$set: {driver: null}}, {multi: true});
    }
  }

  console.log("mid -", crash ? "crash" : "carry on");
}

function endOfRoad(carA, carB) {
  
  //this happens on both client AND server
  Timing.timer.stop();
  
  //the decision happens on the server only
  if (Meteor.isServer) {

    var winner;
    var loser;
    
    if (carA.chickenedOut && !carB.chickenedOut) {
      winner = carB;
      loser = carA;
    }
    else if (!carA.chickenedOut && carB.chickenedOut) {
      winner = carA;
      loser = carB;
    }
    //if both chickened out, compare timestamps. whoever bailed last wins.
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

    //update high score
    HighScores.upsert({player: winner.driver}, {$inc: {wins: 1}});

    //push modal popup message to client
    Statuses.update("modal", {$set: {message: "Winner: " + winner.driver + "<br>"
                                            + "Loser: &nbsp;" + loser.driver}});
    
    //winner stays on
    Cars.update(loser._id, {$set: {driver: null}});
    console.log("end - winner: " + winner.driver + " loser: " + loser.driver);
  }
}