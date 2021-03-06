import 'assets/app.css!'

// Load Angular libraries

import angular from 'angular'
import 'angular-ui-router'
import 'angular-ui-bootstrap'
import 'angular-schema-form'
import 'angular-schema-form-bootstrap'
import 'angular-ui-grid'
import 'angular-translate'
import 'angular-translate-loader-static-files'
import 'oauth-ng'
import 'ngstorage'
import structure from 'structure/Structure';
import authentication from 'authentication/Authentication';
import entities from 'entities/Entities';
import menu from 'menu/Menu';
import LoginController from 'authentication/LoginController'
import AuthenticationService from 'authentication/AuthenticationService'
import HomeController from 'home/HomeController'
import MenuController from 'menu/MenuController'
import EntitiesController from 'entities/EntitiesController'
import EntitiesListController from 'entities/EntitiesListController'
import EntitiesEditController from 'entities/EntitiesEditController'

angular
    .element(document)
    .ready(function () {
        let appName = 'inventory-web';
        let body = document.getElementsByTagName("body")[0];
        let app = angular
            .module(appName, ['ui.router', 'ui.bootstrap',
                'pascalprecht.translate',
                'oauth',
                structure, authentication, entities, menu])
            .config(['$translateProvider', function ($translateProvider) {
                $translateProvider.useStaticFilesLoader({
                    prefix: 'src/translations_',
                    suffix: '.json'
                });
                $translateProvider.preferredLanguage('de');
            }])
            .config(function ($stateProvider, $urlRouterProvider) {
                $urlRouterProvider
                    .when('/access_token=:accessToken', function ($log, $location, AccessToken) {
                        var hash = $location.path().substr(1);
                        $log.debug("Retrieving access token from uri: " + hash);
                        AccessToken.setTokenFromString(hash);
                        $location.path('/');
                        $location.replace();
                    });
                $urlRouterProvider.otherwise("/");
                $stateProvider
                    .state('default', {
                        url: "/",
                        templateUrl: 'src/home/view/home.html'
                    })
                    .state('entities', {
                        url: "/entities",
                        templateUrl: "src/entities/view/entities.html",
                        controller: EntitiesController
                    })
                    .state('entities.list', {
                        url: "/:entityName",
                        templateUrl: "src/entities/view/entities.list.html",
                        controller: EntitiesListController
                    })
                    .state('entities.edit', {
                        url: "/:entityName/:id",
                        templateUrl: "src/entities/view/entities.edit.html",
                        controller: EntitiesEditController
                    })
            })
            .config(['$httpProvider',  function ($httpProvider) {
                $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
                $httpProvider.interceptors.push(['$log', '$rootScope', '$q', 'AccessToken', function ($log, $rootScope, $q, AccessToken) {
                    return {
                        response: function(response) {
                            $log.debug("HTTP Response: ", response.status);
                            return response;
                        },
                        responseError: function (rejection) {
                            $log.debug("HTTP Error: ", rejection.status);
                            var config = rejection.config || {};
                            if (!config.ignoreAuthModule) {
                                switch (rejection.status) {
                                    case 401:
                                        var deferred = $q.defer();
                                        $rootScope.$broadcast('oauth:denied');

                                        return deferred.promise;
                                    case 403:
                                        $rootScope.$broadcast('oauth:forbidden');
                                        break;
                                }
                            }
                            // otherwise, default behaviour
                            return $q.reject(rejection);
                        },
                        request: function(config) {
                            if(AccessToken) {
                                var token = AccessToken.get();
                                if(token) {
                                    //config.headers['X-Auth-Token'] = token.access_token;
                                    config.headers.Authorization = 'Bearer ' + token.access_token;
                                }
                            }
                            return config;
                        }
                    };
                }]);
            }])

        //.run(function ($log, $rootScope, $state, AuthenticationService) {
        //    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        //        $log.debug('Transition to ' + JSON.stringify(toState));
        //        if (!AuthenticationService.isLoggedIn() && toState.url != '/login') {
        //            $log.info('Not logged in - forwarding to login page');
        //            $state.go('default');
        //            event.preventDefault();
        //        }
        //    })
        //})
            ;
        angular.bootstrap(body, [appName], {strictDi: false})
    });


