Template.header.events({
  'click #btnName': function () {
    enterName();
  },
  'keydown #txtName': function (e) {
    // Enter key
    if (e.which === 13) {
      enterName();
      e.stopPropagation();
    }
  }
});

Template.waitlist.helpers({
  players: function () {
    return Waitlist.find().fetch();
  }
});

Template.graphics.helpers({
  roadWidth:  function () { return ROAD_WIDTH; },
  roadHeight: function () { return ROAD_HEIGHT; },
  carWidth:   function () { return CAR_WIDTH; },
  carHeight:  function () { return CAR_HEIGHT; },

  carXY: function (carId) {
    var car = Cars.findOne(carId);
    var chickenedOut = (car && car.chickenedOut) || false;
    var distanceX = Timing.timestep.get() * DX;
    var crash = Statuses.findOne("crash") && Statuses.findOne("crash").value;

    if (carId === "A") {
      return {
        x: distanceX,
        y: chickenedOut && !crash ? BOTTOM_LANE_Y : MID_Y
      };
    } else if (carId === "B") {
      return {
        x: ROAD_WIDTH - CAR_WIDTH - distanceX,
        y: chickenedOut && !crash ? TOP_LANE_Y : MID_Y
      };
    }
  },
  countdown: function () {
    var countdown = Statuses.findOne("countdown") && Statuses.findOne("countdown").value;
    if (countdown > 0) {
      Timing.timestep.set(0);
      return countdown;
    } else if (countdown === 0) {
      Timing.timer.start();
      return "GO!";
    } else {
      return "";
    }
  },
  countdownXY: function () {
    var countdown = Statuses.findOne("countdown") && Statuses.findOne("countdown").value;
    var xOffset = 25;
    if (countdown === 10) xOffset = 55;
    if (countdown === 0)  xOffset = 70;

    return {
      x: ROAD_WIDTH/2 - xOffset,
      y: ROAD_HEIGHT/2 + 30
    };
  },
  explosionCSS: function () {
    var crash = Statuses.findOne("crash") && Statuses.findOne("crash").value;
    return crash ?  "" : "display: none;";
  }
});

Template.graphics.events({
  'click': function () {
    chickenOut();
  }
});

$(document).keydown(function (e) {
  // If user hits spacebar, chicken out!
  if (e.which === 32) {
    chickenOut();
  }
});

Template.driverLabels.helpers({
  driverA: function () { return getDriver("A"); },
  driverB: function () { return getDriver("B"); }
});

Template.driverLabels.events({
 'click #btnShowHighScores': function () {
    bootbox.dialog({
      message: " ", // Bootbox won't allow an empty message
      onEscape: bootbox.hideAll()
    });

    // Insert the high scores template into the bootbox modal body
    Blaze.render(Template.highScores, $(".bootbox-body").get(0));

    // Clicking anywhere will close the bootbox modal
    $(".bootbox.modal").click(function () {
      bootbox.hideAll();
    });
  }
});

Template.highScores.helpers({
  rows: function () {
    return HighScores.find({}, {sort: {wins: -1, player: 1}, limit: 10}).fetch();
  }
});

Template.modal.helpers({
  showMessage: function () {
    var modalMessage = Statuses.findOne("modal") && Statuses.findOne("modal").message;
    if (modalMessage) {
      bootbox.dialog({
        title: "Result",
        message: modalMessage,
        onEscape: bootbox.hideAll()
      });
      Blaze.render(Template.highScores, $(".bootbox-body").get(0));

      // Auto-hide the modal after 5 seconds and reset the modal message
      Meteor.setTimeout(function () {
        bootbox.hideAll();
        Statuses.update("modal", {$set: {message: null}});
      }, 5000);
    }
  }
});

function getDriver(carId) {
  return (Cars.findOne(carId) && Cars.findOne(carId).driver) || "waiting for player...";
}

function enterName() {
  var name = $("#txtName").val();
  console.log("enterName", name);
  check(name, String);
  // TODO: check that player name is unique (create server method for insert)
  //       publish only names to client, return _id on insert method to use with chickenOut
  Waitlist.insert({player: name});
  Session.set("myName", name);
  $("#txtName").blur();
}

function chickenOut() {
  if (Timing.timer.handle) {
    var driver = Session.get("myName");
    console.log("chickenOut", driver);
    Meteor.call("chickenOut", driver);
  }
}
