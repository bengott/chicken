Meteor.methods({

  chickenOut: function (driver) {

    check(driver, String);

    // Enforce a cutoff point for chickening out (2 timesteps before true midpoint)
    var distanceX = Timing.timestep.get() * DX;
    var cutoffX = ROAD_WIDTH/2 - CAR_WIDTH - DX*2;
    var carId;

    if (distanceX < cutoffX) {

      carId = null;
      if      (driver === Cars.findOne("A").driver) carId = "A";
      else if (driver === Cars.findOne("B").driver) carId = "B";

      if (carId) {
        Cars.update(carId, {$set: {chickenedOut: Date.now()}});
        console.log(driver + " (car " + carId + ") chickened out");
      }

    } else {
      console.log("too late");
    }

  }

});