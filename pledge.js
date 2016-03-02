'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
function $Promise(){
    this.state = 'pending';
    this.value = undefined;
    this.handlerGroups = [];
}

function Deferral(){
  if(arguments.length > 0)
    this.$promise = arguments[0];
  else
    this.$promise = new $Promise();
}

function defer(){
  return new Deferral();
}

Deferral.prototype.resolve = function(data){
  if (this.$promise.state === 'pending'){
    this.$promise.state = 'resolved';
    this.$promise.value = data;
    this.$promise.callHandlers();
  } 
};

Deferral.prototype.reject = function(reason){
  if (this.$promise.state === 'pending'){
    this.$promise.state = 'rejected';
    this.$promise.value = reason;
    this.$promise.callHandlers();
  } 
}

$Promise.prototype.then = function(sCB, eCB){
  if (typeof sCB !== 'function' && sCB !== null){ 
    sCB = undefined;
  } 
  if (typeof eCB !== 'function'){
    eCB = undefined;
  }
  var callbacks = {successCb: sCB, errorCb: eCB, forwarder: new Deferral()};
  this.handlerGroups.push(callbacks);

  if (sCB !== null)
    this.newest(callbacks);
  else
    this.nError(callbacks);
  return callbacks.forwarder.$promise;
}

$Promise.prototype.callHandlers = function(){
  while (this.handlerGroups.length > 0 && this.state !== 'pending'){
    var callbacks = this.handlerGroups.shift();
    if (this.state === 'resolved') {
      this.newest(callbacks);
    }
    else {
      this.nError(callbacks);
      //this.state = 'resolved';
    }  
  }
}

$Promise.prototype.newest = function(callbacks){
  if (this.state === 'resolved') {
      //console.log(" in  <- "+this.value);
      //console.log(" successCb : "+callbacks.successCb);
      if (typeof callbacks.successCb === 'function') {
          try {
            var tmp = callbacks.successCb(this.value);
            if(tmp !== undefined) {
              if(tmp instanceof $Promise) {
                callbacks.forwarder = new Deferral(tmp);
                this.state = tmp.state;
                return;
              }
              else 
                this.value = tmp;    
            }
          }
          catch(err) {
            this.value = err;
            this.state = 'rejected';
            this.nError(callbacks);
            return;
          }
      }
      //console.log(" post call -> "+this.value);
      callbacks.forwarder.resolve(this.value);
  }
}

$Promise.prototype.nError = function(callbacks){
  if (this.state === 'rejected') {
      if (typeof callbacks.errorCb === 'function') {
        try {
          var tmp = callbacks.errorCb(this.value);
          if(tmp !== undefined) this.value = tmp;
          callbacks.forwarder.resolve(this.value);
        }
        catch(err) {
            this.value = err;
            this.state = 'rejected';
            callbacks.forwarder.reject(this.value);
            return;
          }
      }
      else
        callbacks.forwarder.reject(this.value);
  }
}

$Promise.prototype.catch = function(func){
    return this.then(null, func);
}




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
