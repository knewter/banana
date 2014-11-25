/**
 * main app level module
 */
define([
  'angular',
  'jquery',
  'underscore',
  'require',

  'elasticjs',
  'solrjs',
  'bootstrap',
  'angular-sanitize',
  'angular-strap',
  'angular-dragdrop',
  'extend-jquery'
],
function (angular, $, _, appLevelRequire) {
  "use strict";

  var app = angular.module('kibana', []),
    // we will keep a reference to each module defined before boot, so that we can
    // go back and allow it to define new features later. Once we boot, this will be false
    pre_boot_modules = [],
    // these are the functions that we need to call to register different
    // features if we define them after boot time
    register_fns = {};

  /**
   * Tells the application to watch the module, once bootstraping has completed
   * the modules controller, service, etc. functions will be overwritten to register directly
   * with this application.
   * @param  {[type]} module [description]
   * @return {[type]}        [description]
   */
  app.useModule = function (module) {
    if (pre_boot_modules) {
      pre_boot_modules.push(module);
    } else {
      _.extend(module, register_fns);
    }
    return module;
  };

  app.safeApply = function ($scope, fn) {
    switch($scope.$$phase) {
    case '$apply':
      // $digest hasn't started, we should be good
      $scope.$eval(fn);
      break;
    case '$digest':
      // waiting to $apply the changes
      setTimeout(function () { app.safeApply($scope, fn); }, 10);
      break;
    default:
      // clear to begin an $apply $$phase
      $scope.$apply(fn);
      break;
    }
  };

  app.config(function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
    $routeProvider
      .when('/dashboard', {
        templateUrl: 'app/partials/dashboard.html',
      })
      .when('/dashboard/:kbnType/:kbnId', {
        templateUrl: 'app/partials/dashboard.html',
      })
      .when('/dashboard/:kbnType/:kbnId/:params', {
        templateUrl: 'app/partials/dashboard.html'
      })
      .otherwise({
        redirectTo: 'dashboard'
      });
    // this is how the internet told me to dynamically add modules :/
    register_fns.controller = $controllerProvider.register;
    register_fns.directive  = $compileProvider.directive;
    register_fns.factory    = $provide.factory;
    register_fns.service    = $provide.service;
    register_fns.filter     = $filterProvider.register;
  });

  // $http requests in Angular 1.0.x include the 'X-Requested-With' header
  // which triggers the preflight request in CORS. This does not work as
  // Solr rejects the preflight request, so I have to remove the header.
  // NOTE: The 'X-Requested-With' header has been removed in Angular 1.1.x
  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
  }]);

  app.value("config_url", (document.location.hostname === "localhost" && document.location.port === "8080")
    ? "http://localhost:8080/dirsearch/configs"
    : "http://" + document.location.hostname + "/dirsearch/configs"
  );

  app.run(['$http', 'config_url', '$rootScope', function($http, config_url, $rootScope) {
    $http({
        method: "GET",
        url: config_url,
        responseType: "json",
        headers: {
         "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }).then(function(res) {
          // go ahead and keep this on the $rootScope, that's ok, right? :)
          console.debug("Config data retrieved", res.data);
          $rootScope.configs = res.data.configs;
          $rootScope.solrDefaultParams = res.data.solrDefaultParams;
       }, function(err, status, headers, config){
          console.error("failed to retrieve configs", err);
      });
  }]);

  // TODO: add ajax-solr ?
  var apps_deps = [
    'elasticjs.service',
    'solrjs.service',
    '$strap.directives',
    'ngSanitize',
    'ngDragDrop',
    'kibana'
  ];

  _.each('controllers directives factories services filters'.split(' '),
  function (type) {
    var module_name = 'kibana.'+type;
    // create the module
    app.useModule(angular.module(module_name, []));
    // push it into the apps dependencies
    apps_deps.push(module_name);
  });

  app.panel_helpers = {
    partial: function (name) {
      return 'app/partials/'+name+'.html';
    }
  };

  // load the core components
  require([
    'controllers/all',
    'directives/all',
    'filters/all'
  ], function () {

    // bootstrap the app
    angular
      .element(document)
      .ready(function() {
        $('body').attr('ng-controller', 'DashCtrl');
        angular.bootstrap(document, apps_deps)
          .invoke(['$rootScope', function ($rootScope) {
            _.each(pre_boot_modules, function (module) {
              _.extend(module, register_fns);
            });
            pre_boot_modules = false;

            $rootScope.requireContext = appLevelRequire;
            $rootScope.require = function (deps, fn) {
              var $scope = this;
              $scope.requireContext(deps, function () {
                var deps = _.toArray(arguments);
                $scope.$apply(function () {
                  fn.apply($scope, deps);
                });
              });
            };
          }]);
      });
  });

  return app;
});