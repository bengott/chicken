//timing object shared between client and server
Timing = {

  dt: 30, //1000ms/30ms ~= 33fps
  
  timestep: {

    _val: 0,

    get: function() {
      //use session on client (reactive)
      if (Meteor.isClient) {
        return Session.get("timestep") || 0;

      //use regular property on server
      } else if (Meteor.isServer) {
        return this._val;
      }
    },
    set: function(val) {
      //use session on client (reactive)
      if (Meteor.isClient) {
        Session.set("timestep", val);

      //use regular property on server
      } else if (Meteor.isServer) {
        this._val = val;
      }
    }
  },

  timer: {

    handle: undefined,
    
    start: function() {
      this.handle = Meteor.setInterval(function() {
        var newVal = Timing.timestep.get() + 1;
        Timing.timestep.set(newVal);
        calculate();
      }, Timing.dt)
    },
    
    stop: function() {
      Meteor.clearInterval(this.handle);
    }
  }
};

//constants: used for drawing/positioning graphics
roadWidth = 1000;
roadHeight = 300;
carWidth = 100;
carHeight = 50;
midY = roadHeight/2 - carHeight/2;
topLaneY = roadHeight/4 - carHeight/2;
bottomLaneY = roadHeight*3/4 - carHeight/2;
dx = 5;

//determine winner/loser and respond accordingly
function calculate() {

  var carA = Cars.findOne("A");
  var carB = Cars.findOne("B");
  var distanceX = Timing.timestep.get() * dx;
  console.log(distanceX);
  
  //midway point
  if (distanceX === (roadWidth/2 - carWidth)) {

    //if nobody chickened out, they both lose -> crash
    var crash = !carA.chickenedOut && !carB.chickenedOut;

    if (crash) {

      //this happens on both client AND server
      Timing.timer.stop();
            
      //update db on server only
      if (Meteor.isServer) {
        Statuses.update("crash", {$set: {value: true}});
        Cars.update({}, {$set: {driver: null}}, {multi: true});
      }
    }

    console.log("mid -", crash ? "crash" : "carry on");
  }

  //end of the road, pal
  if (distanceX === roadWidth) {

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
      
      //winner stays on
      Cars.update(loser._id, {$set: {driver: null}});
      console.log("end - winner: " + winner.driver + " loser: " + loser.driver);
    }
  }
}