'use strict';

angular.module('asambleistasApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
