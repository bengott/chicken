// Timing object shared between client and server
Timing = {

  dt: 30, // 1000ms/30ms ~= 33fps
  
  timestep: (function () {

    var _value =  0;
    
    return {
      get: function () {
        
        // Use session on client (reactive)
        if (Meteor.isClient) {
          return Session.get("timestep") || 0;

        // Use regular property on server
        } else if (Meteor.isServer) {
          return this._value;
        }
      },
      set: function (value) {
        
        // Use session on client (reactive)
        if (Meteor.isClient) {
          Session.set("timestep", value);

        // Use regular property on server
        } else if (Meteor.isServer) {
          this._value = value;
        }
      }
    };
  }()),

  timer: {

    handle: undefined,
    
    start: function () {
      this.handle = Meteor.setInterval(function () {
        var newVal = Timing.timestep.get() + 1;
        Timing.timestep.set(newVal);
        determineResult();
      }, Timing.dt)
    },
    
    stop: function () {
      Meteor.clearInterval(this.handle);
      this.handle = undefined;
    }
  }
};