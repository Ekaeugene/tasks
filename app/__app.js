'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
  'ngRoute',
  'LocalStorageModule',
  'ngResource',
  'ui.bootstrap'
  
]);



myApp.service('CrudeTaskService', function($http) {
    this.header = {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}};
    this.url = "http://srv73095.ht-test.ru/index.php/v1/default";

    this.get = function() {
        return $http.get(this.url);
    };
    this.getOneEl = function(id) {
        return $http.get(this.url+"/"+id);
    },
    this.post = function (data) {
        return $http.post(this.url, data, this.header   );
    };
    this.put = function (id, data) {
        return $http.put(this.url + '/' + id, data, this.header );
    };
    this.delete = function (id) {
        return $http.delete(this.url + '/' + id );
    };
});

myApp.service('UpdateWindowState', function($http){

   this.options = function(data, scope) {
       var options = ["Все"];
        angular.forEach(data, function(value, key) {
          if(options.indexOf(value.important) == -1) {
                options.push(value.important); 
            }   
      });
      scope.selectOptions = options;
   }
   this.updateState = function(scopeList, dataElement, form) {

             angular.forEach(scopeList, function(value, key) {
                      if(value.id == dataElement.id) {
                          angular.forEach(scopeList[key], function(val_prop, k_prop) { 
                              scopeList[key][k_prop.toString()] = form[k_prop.toString()];
                          });
                      }
                });
   }
    this.addItemState = function(scopeList, dataElement) {
     scopeList.push(dataElement); 

   }
})
myApp.controller('ListController', ['$scope', 'CrudeTaskService', 'UpdateWindowState',
    function ($scope, CrudeService, UpdateWindowState) {
        $scope.tasks = [];
         $scope.selectOptions;
        var date = new Date();
        $scope.date = date.getFullYear()+'-'+date.getMonth()+1+'-'+date.getDate();
        if($scope.search == undefined) {
          $scope.search = "Все";
        }
       $scope.options = function(data) {
          var selectOptions = ["Все"];
          angular.forEach(data, function(value, key) {
              if(selectOptions.indexOf(value.important) == -1) {
                  selectOptions.push(value.important);
              }      
          });
          $scope.selectOptions = selectOptions;
        } 
        CrudeService.get().then(function (data) {
            if (data.status == 200)
                $scope.task = data.data;
                $scope.amountFields = Object.keys(data.data[0]).length;
                //$scope.options(data.data);
              UpdateWindowState.options(data.data,  $scope);

        }, function (err) {
            console.log(err);
        })

          $scope.updateTable = function(scopeList, dataElement, form) {

            UpdateWindowState.options(scopeList,  $scope);
            UpdateWindowState.updateState(scopeList,  dataElement, form);

          }

    }
]);

myApp.controller('CrudeController', ['$scope', '$uibModal','CrudeTaskService', function($scope, $uibModal, CrudeTaskService) {
      
      var $ctrl = this;
      $scope.updateTask = function () {
          $ctrl.elElement = $scope.item.id; 
          var modalInstance = $uibModal.open({
            templateUrl: 'template/Popup.html',
            controller: 'PopUpUpdate',
            resolve: {
              items: function () {
                return $scope;
              }
            }
          });
      };
    $scope.createTask = function() {
       var modalInstance = $uibModal.open({
            templateUrl: 'template/PopUpCreate.html',
            controller: 'PopUpCreate',
            resolve: {
              items: function () {
                return $scope;
              }
            }
        });      
    }
    $scope.compliteTask = function() {
      var data = 'name='+$scope.item.name+'&statusTask=1';
      CrudeTaskService.put($scope.item.id, data).then(function(){
        $scope.item.statusTask = 1;
      });
    }
     $scope.deleteTask = function() {  
          CrudeTaskService.delete($scope.item.id).then(function(){
            console.log('delete'+ $scope.item.id);
            $scope.task
            angular.forEach($scope.task, function(value, key) {
                if(value.id == $scope.item.id) {
                  $scope.task.splice(key, 1);
                  $scope.options($scope.task);
                }
            })
          }, function (err) {
            console.log(err);
        });  
     };   
}]);


myApp.controller('PopUpUpdate', ['$scope','$uibModalInstance', 'CrudeTaskService', 'items', '$timeout','UpdateWindowState', function ($scope, $uibModalInstance, CrudeTaskService, items, $timeout, UpdateWindowState) {
  
  $scope.scopeList = items;
  $scope.formUpd = {};
  var dataEl = CrudeTaskService.getOneEl(items.item.id).then(function(data){
      $scope.dataElement = data.data;
      angular.forEach(data.data, function(value, key) {
          $scope.formUpd[key.toString()] = value;
      })  
  }); 

  $scope.close = function () {    
    $uibModalInstance.close();
  };

  $scope.updateForm = function() {
    var data = "name="+$scope.formUpd.name+"&description="+$scope.formUpd.description+"&important="+$scope.formUpd.important+"&date_deadline="+$scope.formUpd.date_deadline+"&date_completly="+$scope.formUpd.date_completly+"&statusTask="+$scope.formUpd.statusTask;
    CrudeTaskService.put($scope.dataElement.id, data).then(function(){
          $scope.updateSucces = "Обновление завершено";
           UpdateWindowState.options($scope.scopeList.task,  $scope);
           UpdateWindowState.updateState($scope.scopeList.task, $scope.dataElement, $scope.formUpd);
           $timeout(function () {
                $scope.close();
              }, 1000);
            })
  }
}]);

myApp.controller('PopUpCreate', ['$scope','$uibModalInstance', 'CrudeTaskService','items','$timeout','UpdateWindowState', function ($scope, $uibModalInstance, CrudeTaskService, items, $timeout, UpdateWinState) {

  $scope.scopeList = items;
  $scope.formCreate = {};
  $scope.formCreate.id = $scope.scopeList.task[$scope.scopeList.task.length-1].id + 1;
  $scope.createForm = function() {
       if(Object.keys($scope.formCreate).length >= items.amountFields - 1 ) {
          var data = "name="+$scope.formCreate.name+"&description="+$scope.formCreate.description+"&important="+$scope.formCreate.important+"&date_deadline="+$scope.formCreate.date_deadline+"&date_completly="+$scope.formCreate.date_completly+"&statusTask="+$scope.formCreate.statusTask;
          console.log($scope.formCreate);
          CrudeTaskService.post(data).then(function() {
              $scope.createSuccess = "Задание создано";
              UpdateWinState.options($scope.scopeList.task,  $scope);
              UpdateWinState.addItemState($scope.scopeList.task,  $scope.formCreate);
              $timeout(function () {
                $scope.close();
              }, 1000);
          })
       }else {
        $scope.errorText = "Не все поля заполнены";
       }
  }
  $scope.close = function () {    
    $uibModalInstance.close();
  };
}]);


