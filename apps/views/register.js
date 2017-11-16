

var app = angular.module('registerApp',[]);

app.controller('registration_controller',function($scope, $http){

    $scope.message = null;
    $scope.login_link = null;
    $scope.username = null;
    $scope.password = null;
    $scope.name = null;

    $scope.register = 
                    function()
                    {

                        if($scope.confirm_password!=$scope.password)
                            $scope.message = "Passwords do not match";
                        else
                        {
                            var requestJSON = {name:$scope.name, username:$scope.username, password:$scope.password, typeId:2};
                            var req = JSON.stringify(requestJSON);
                            $http({
                                method: 'POST',
                                url: '/api/signup',
                                data: req,
                                headers: {
                                    'Content-Type': 'application/json'
                                }}).then(function(result) {
                                    $scope.message = "Registration Successful!";
                                    $scope.login_link = "Login with Credentials now! ";   
                                }, 
                                function(error) {
                                    if(error.status==409)
                                        $scope.message = "Username Exists";
                                    else if(error.status==200)
                                    {
                                        $scope.message = " Successfully created !";
                                        $scope.login_link = "Login now";
                                    }
                                    else
                                        console.log(error);
                                    
                                });

                        }
                    };

});