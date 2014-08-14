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
        results();
      }, Timing.dt)
    },
    
    stop: function() {
      Meteor.clearInterval(this.handle);
      this.handle = undefined;
    }
  }
};