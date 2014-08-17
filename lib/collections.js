Cars = new Meteor.Collection("cars");
Waitlist = new Meteor.Collection("waitlist");
Statuses = new Meteor.Collection("statuses");
HighScores = new Meteor.Collection("high_scores");

Waitlist.allow({
  // Only allow insert if player is not already on the list and not assigned to a car
  insert: function (userId, doc) {
    return Waitlist.find({player: doc.player}).count() === 0
           && Cars.find({driver: doc.player}).count() === 0;
  }
});

Statuses.allow({
  // Only allow update on modal (client resets it after modal closes)
  update: function (userId, doc, fields) {
    return doc._id === "modal";
  }
});