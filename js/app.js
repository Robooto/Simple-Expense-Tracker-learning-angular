"use strict";

var app = angular.module('expensesApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider){
   $routeProvider
   .when('/expenses', {
       templateUrl: 'views/expenses.html',
       controller: 'ExpensesViewController'
   })
   .when('/expenses/new', {
       templateUrl: 'views/expenseForm.html',
       controller: 'ExpenseViewController'
   })
   .when('/expenses/edit/:id',{
       templateUrl: 'views/expenseForm.html',
       controller: 'ExpenseViewController'
   })
    .when('/', {
       templateUrl: 'views/expenses.html',
       controller: 'ExpensesViewController'
    })
   .otherwise({
       redirectTo: '/'
   }); 
}]);

app.factory('Expense', function($http){
    var service = {};
    
    service.entries = [];
    
    $http.get('data/get_all.json')
        .success(function(data){
        service.entries = data;
    }).error(function(data, status){
        alert('error!');
    })
    
    service.save = function(entry) {
        var toUpdate = service.getById(entry.id);
        
        if(toUpdate) {
            _.extend(toUpdate, entry);
        } else {
            entry.id = service.getNewId();
            service.entries.push(entry);            
        }
    
    }
    
    service.getNewId = function() {
        if(service.newId){
            service.newId++;
            return service.newId;
        } else {
            var entryMaxId = _.max(service.entries, function(entry){
                return entry.id;
            });
            service.newId = entryMaxId.id+1;
            return service.newId;
        }
    }
    
    service.getById = function(id) {
        return _.find(service.entries, function(entry){
            return entry.id == id;
        });
    }
    
    service.remove = function(entry) {
        service.entries = _.reject(service.entries, function(element){
            return element.id == entry.id;
        });
    }
    
    return service;
})

app.controller('ExpensesViewController', ['$scope', 'Expense', function ($scope, Expense) {
    $scope.expenses = Expense.entries;
    
    $scope.remove = function(expense) {
      Expense.remove(expense);  
    };
    
    $scope.$watch(
        function(){ return Expense.entries}, 
        function(entries) { $scope.expenses = entries;
                                                                          })
}]);

app.controller('ExpenseViewController', ['$scope', '$routeParams', 'Expense', '$location', function($scope, $routeParams, Expense, $location) {
    if(!$routeParams.id) {
        $scope.expense = { id: 7, description: 'something', amount: 10, date: new Date()};
    } else {
        $scope.expense = _.clone(Expense.getById($routeParams.id));
    }
    
    $scope.save = function(){
        Expense.save($scope.expense);
        $location.path('/');
    }
}]);

app.directive('oaExpense', function(){
    return {
        restrict: 'E',
        templateUrl: 'views/expense.html'
    }
})