'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
function $Promise(){
  this.state = 'pending';
  this.value;
  this.handlerGroups = [];
  // this.pointer = -1;
}

function Deferral(){
  this.$promise = new $Promise();
}

function defer(){
  return new Deferral();
}

Deferral.prototype.resolve = function(data){
  if (this.$promise.state === 'pending'){
    this.$promise.state = 'resolved';
    this.$promise.value = data;
    // this.$promise.pointer++;
    this.$promise.callHandlers();
  } else {

  }
};

Deferral.prototype.reject = function(reason){
  if (this.$promise.state === 'pending'){
    this.$promise.state = 'rejected';
    this.$promise.value = reason;
    this.$promise.callHandlers();
  } else {

  }
}

$Promise.prototype.then = function(sCB, eCB){
  if (typeof sCB !== 'function' && sCB !== null){ 
    sCB = undefined;
  } 
  if (typeof eCB !== 'function'){
    eCB = undefined;
  }
  var callbacks = {successCb: sCB, errorCb: eCB};
  this.handlerGroups.push(callbacks);
  if (sCB !== null)
    this.newest(callbacks);
  else
    this.nError(callbacks);
}

$Promise.prototype.callHandlers = function(){
  // this.handlerGroups[this.handlerGroups.length-1].successCb(this.value);
  // for (var i = 0; i < this.handlerGroups.length; i++){
  //   if (this.state === 'resolved')
  //     this.newest(i);
  //   else
  //     this.nError(i);
  // }
  while (this.handlerGroups.length > 0 && this.state !== 'pending'){
    var promise = this.handlerGroups.shift();
      if (this.state === 'resolved')
        this.newest(promise);
      else
        this.nError(promise);
  }
}

$Promise.prototype.newest = function(promise){
  if ((this.state === 'resolved') && (typeof promise.successCb === 'function'))
    promise.successCb(this.value);
  // console.log(this.value);
}

$Promise.prototype.nError = function(promise){
  if ((this.state === 'rejected') && (typeof promise.errorCb === 'function'))
   promise.errorCb(this.value);
}

$Promise.prototype.catch = function(func){
  this.then(null, func);
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
