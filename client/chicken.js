UI.registerHelper("sessionGet", function(key) {
  return Session.get(key);
});

Template.header.events({
  'click button#btnName': function() {
    enterName();
  },
  'keydown input#txtName': function(e) {
    //enter key
    if (e.which === 13) {
      enterName();
      e.stopPropagation();
    }
  },
 'click button#btnShowHighScores': function() {
    bootbox.dialog({
      message: " ", //bootbox won't allow an empty message
      onEscape: bootbox.hideAll()
    });
    UI.insert(UI.render(Template.highScores), $(".bootbox-body").get(0));
  }
});

Template.waitlist.players = function() {
  return Waitlist.find().fetch();
};

Template.graphics.helpers({
  roadWidth: function() { return roadWidth; },
  roadHeight: function() { return roadHeight; },
  carWidth: function() { return carWidth; },
  carHeight: function() { return carHeight; },

  carXY: function (carId) {
    var car = Cars.findOne(carId);
    var chickenedOut = (car && car.chickenedOut) || false;
    var distanceX = Timing.timestep.get() * dx;
    var crash = Statuses.findOne("crash") && Statuses.findOne("crash").value;

    if (carId === "A") {
      return {
        x: distanceX,
        y: chickenedOut && !crash ? bottomLaneY : midY
      };
    } else if (carId === "B") {
      return {
        x: roadWidth - carWidth - distanceX,
        y: chickenedOut && !crash ? topLaneY : midY
      };
    }
  },
  countdown: function() {
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
  countdownXY: function() {
    var countdown = Statuses.findOne("countdown") && Statuses.findOne("countdown").value;
    var xOffset = 30;
    if (countdown === 10) xOffset = 60;
    if (countdown === 0) xOffset = 70;

    return {
      x: roadWidth/2 - xOffset,
      y: roadHeight/2 + 30
    };
  },
  explosionCSS: function() {
    var crash = Statuses.findOne("crash") && Statuses.findOne("crash").value;
    return crash ?  "" : "display: none;";
  }
});

Template.graphics.events({
  'click': function() {
    chickenOut();
  }
});

$(document).keydown(function (e) {
  //if user hits spacebar, chicken out!
  if (e.which === 32) {
    chickenOut();
  }
});

Template.driverLabels.helpers({
  driverA: function() { return getDriver("A"); },
  driverB: function() { return getDriver("B"); }
});

Template.highScores.rows = function() {
  return HighScores.find({}, {sort: {wins: -1, player: 1}, limit: 10}).fetch();
};

Template.modal.showMessage = function() {
  var modalMessage = Statuses.findOne("modal") && Statuses.findOne("modal").message;
  if (modalMessage) {
    bootbox.dialog({
      title: "Result",
      message: modalMessage,
      onEscape: bootbox.hideAll()
    });
    UI.insert(UI.render(Template.highScores), $(".bootbox-body").get(0));

    //auto-hide the modal after 3 seconds and reset the modal message
    Meteor.setTimeout(function() {
      bootbox.hideAll();
      Statuses.update("modal", {$set: {message: null}});
    }, 3000);
  }
};

function getDriver(carId) {
  return (Cars.findOne(carId) && Cars.findOne(carId).driver) || "waiting for player..."; 
}

function enterName() {
  var name = $("#txtName").val();
  console.log("enterName", name);
  check(name, String);
  //TODO: check that player name is unique (create server method for insert)
  //      publish only names to client, return _id on insert method to use with chickenOut
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