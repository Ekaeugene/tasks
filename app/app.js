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


myApp.controller('ListController', ['$scope', 'CrudeTaskService',
    function ($scope, CrudeService) {

        $scope.tasks = [];
        var date = new Date();
        $scope.date = date.getFullYear()+'-'+date.getMonth()+1+'-'+date.getDate();
        if($scope.search == undefined) {
          $scope.search = "Все";
        }
       $scope.options = function(data) {
          var selectOptions = ["Все"];
           console.log(data);
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
                $scope.options(data.data);

        }, function (err) {
            console.log(err);
        })
          $scope.updateTable = function(scopeList, dataElement, form) {
            console.log(scopeList);
            console.log(dataElement);
            console.log(form);
            angular.forEach(scopeList, function(value, key) {
                      if(value.id == dataElement.id) {
                          angular.forEach(scopeList[key], function(val_prop, k_prop) { 
                              scopeList[key][k_prop.toString()] = form[k_prop.toString()];
                          });
                        }
                });
            $scope.options(scopeList);

  }

    }
]);

myApp.controller('PopUpUpdate', ['$scope','$uibModalInstance', 'CrudeTaskService', 'items', function ($scope, $uibModalInstance, CrudeTaskService, items) {
  
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
          $scope.scopeList.updateTable($scope.scopeList.task,$scope.dataElement, $scope.formUpd);

        
    })
  }
}]);

myApp.controller('PopUpCreate', ['$scope','$uibModalInstance', 'CrudeTaskService','items', function ($scope, $uibModalInstance, CrudeTaskService, items) {

  console.log(items);
  $scope.scopeList = items;
  console.log(items);
  $scope.createForm = function() {
       if(Object.keys($scope.formCreate).length >= items.amountFields - 1 ) {
          var data = "name="+$scope.formCreate.name+"&description="+$scope.formCreate.description+"&important="+$scope.formCreate.important+"&date_deadline="+$scope.formCreate.date_deadline+"&date_completly="+$scope.formCreate.date_completly+"&statusTask="+$scope.formCreate.statusTask;
          CrudeTaskService.post(data).then(function() {
              $scope.createSuccess = "Задание создано";
             $scope.scopeList.updateTable($scope.scopeList.task,$scope.dataElement, $scope.formUpd);

          })
       }else {
        console.log("2342");
        $scope.errorText = "Не все поля заполнены";
       }
  }
  $scope.close = function () {    
    $uibModalInstance.close();
  };


}]);



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