'use strict';

angular.module('ffxivCraftOptWeb.components')
  .directive('actionSequence', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/action-sequence.html',
      scope: {
        actions: '=',
        cls: '=',
        onClick: '=',
        actionClasses: '=',
        draggable: '=',
        tooltipPlacement: '@'
      },
      controller: function ($scope, $rootScope, $translate, _allActions, _allClasses, _actionGroups, _actionsByName, _xivdbtooltips) {
        $scope.actionGroups = _actionGroups;

        $scope.getActionImagePath = function(actionName, cls) {
          return _actionsByName[actionName].imagePaths[cls];
        };

        function makeTooltipsFetchCallback(cls, actionShortName) {
          return function (data) {
            $scope.actionTooltips[cls + actionShortName] = data;
          };
        }

        function buildTooltipsCache(lang) {
          if (!lang) return;
          for (var i = 0; i < _allActions.length; i++) {
            var action = _allActions[i];
            if (action.skillID) {
              if (action.cls == 'All') {
                for (var j = 0; j < _allClasses.length; j++) {
                  var cls = _allClasses[j];
                  _xivdbtooltips.fetch(lang, action.skillID[cls])
                    .then(makeTooltipsFetchCallback(cls, action.shortName));
                }
              }
              else {
                _xivdbtooltips.fetch(lang, action.skillID[action.cls])
                  .then(makeTooltipsFetchCallback(action.cls, action.shortName));
              }
            }
          }
        }

        $rootScope.$on('$translateChangeSuccess', function (event, data) {
          console.log("language changed: ", data.language);
          buildTooltipsCache(data.language);
        });
        buildTooltipsCache($translate.use());

        $scope.actionTooltips = {};
        $scope.actionTooltip = function (action, cls) {
          var info = _actionsByName[action];
          var tooltipClass = info.cls;
          if (tooltipClass == 'All') {
            tooltipClass = cls;
          }
          var tooltip = $scope.actionTooltips[tooltipClass + action];
          return tooltip ? tooltip : action.name;
        };

        $scope._actionClasses = function (action, cls) {
          var classes = {};
          if ($scope.actionClasses) {
            classes = $scope.actionClasses(action, cls);
          }
          classes['action'] = true;
          return classes;
        }
      }
    }
  });