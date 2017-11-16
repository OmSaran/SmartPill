

var app = angular.module('myApp',[]);

localStorage.setItem("authBearer","");

app.controller('login_controller',function($scope, $http){

    $scope.message = null;
    $scope.register_link = null;
    $scope.username = null;
    $scope.password = null;

    $scope.login = 
                    function()
                    {
                        var requestJSON = {username:$scope.username, password:$scope.password};
                        var req = JSON.stringify(requestJSON);
                        $http({
                            method: 'POST',
                            url: '/api/login',
                            data: req,
                            headers: {
                                'Content-Type': 'application/json'
                            }}).then(function(result) {
                                   if(localStorage.getItem("authBearer")=="")
                                        localStorage.setItem("authBearer",result.data.token); 
                                    console.log(localStorage.getItem("authBearer"));    
                               }, 
                               function(error) {
                                   $scope.message = "User does not exist. Create a new account?";
                                   $scope.register_link = " Register now!";
                                   console.log(error);
                                   
                               });

                        
                    };

});