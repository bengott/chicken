Cars = new Mongo.Collection("cars");
Waitlist = new Mongo.Collection("waitlist");
Statuses = new Mongo.Collection("statuses");
HighScores = new Mongo.Collection("high_scores");

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
