Meteor.startup(function () {

  initialize();

  // Manage matchups on a one-second loop
  Meteor.setInterval(function () {
    manageMatchups();
  }, 1000);
});

function initialize() {

  Cars.remove({});
  Cars.insert({_id: "A", driver: null, chickenedOut: null});
  Cars.insert({_id: "B", driver: null, chickenedOut: null});

  Waitlist.remove({});

  Statuses.remove({});
  Statuses.insert({_id: "countdown", value: null});
  Statuses.insert({_id: "crash", value: false});
  Statuses.insert({_id: "modal", message: null});
}

function manageMatchups() {

  var listItem, carId, countdown, newVal;

  // Assign players from waitlist to cars
  if ((!Cars.findOne("A").driver || !Cars.findOne("B").driver) && Waitlist.findOne()) {

    listItem = Waitlist.findOne();
    carId = !Cars.findOne("A").driver ? "A" : "B";
    Cars.update(carId, {$set: {driver: listItem.player}});
    Waitlist.remove(listItem._id);

    // If both cars now have drivers, reset and start the countdown...
    if (Cars.findOne("A").driver && Cars.findOne("B").driver) {

      // Wait 5 seconds to restart (allow Result modal to go away)
      Meteor.setTimeout(function () {

        // Reset the board
        Timing.timestep.set(0);
        Cars.update({}, {$set: {chickenedOut: null}}, {multi: true});
        Statuses.update("crash", {$set: {value: false}});

        //start the countdown
        Statuses.update("countdown", {$set: {value: 10}});
        console.log(10);
      }, 5000); // (the aforementioned 5 seconds)
    }
  } else {

    // Continue countdown: decrement until 0, then reset to null
    countdown = Statuses.findOne("countdown").value;
    newVal = (countdown > 0) ? countdown - 1 : null;
    Statuses.update("countdown", {$set: {value: newVal}});

    if (countdown !== null) console.log(newVal);

    if (newVal === 0) {
      Timing.timer.start();
    }
  }
}
