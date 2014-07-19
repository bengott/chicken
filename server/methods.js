Meteor.methods({

  chickenOut: function (driver) {

    check(driver, String);
    console.log("chickenOut", driver);

    //enforce a cutoff point for chickening out (2 timesteps before true midpoint)
    var distanceX = Timing.timestep.get() * dx;
    var cutoffX = roadWidth/2 - carWidth - dx*2;
    if (distanceX < cutoffX) {

      var carId = null;
      if      (driver === Cars.findOne("A").driver) { carId = "A"; }
      else if (driver === Cars.findOne("B").driver) { carId = "B"; }
      
      console.log(driver, carId);
      if (carId) {
        Cars.update(carId, {$set: {chickenedOut: Date.now()}});
        console.log(driver + " (car "+carId+") chickened out");
      }

    } else {
      console.log("too late");
    }

  }

});