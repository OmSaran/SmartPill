var app = angular.module('dashboardApp',[]);

function check_authBearer()
{
    console.log("checkauthbearer");
    if(localStorage.getItem("authBearer")=="")
        return false;
    return true;
}

app.controller('navbar-controller',function($scope){


    console.log("navbar-controller");
    $scope.username = localStorage.getItem("username");

    $scope.logout = function()
    {
        localStorage.setItem("authBearer","");
        localStorage.setItem("username","");
        window.location = "/index.html";
    }
});

app.controller('sidebar-controller',function($scope, $http){

    console.log("sidebar-controller");
     request = 'Bearer '+localStorage.getItem("authBearer");
    console.log("token "+localStorage.getItem("authBearer"));

    
    $scope.patients = [];
    $scope.patientDetails = [];
    $scope.selectedPatientName = "";
    $scope.dosageParam = [];

 
    if(check_authBearer()) 
    {
        $http({
            method: 'GET',
            url: '/api/doc/patient',
            headers: {
                'Authorization': request
                
            }}).then(function(result) {
                
                $scope.patients = result.data;
                
            
            }, 
            function(error) {
               console.log("error "+error.status);
                
            });
    }

    

    $scope.getPatientDetails = function(patient){

                                    $scope.selectedPatientName = patient.name;
                                   
                                    var patientUsername = patient.username;
                                    var request = 'Bearer '+localStorage.getItem("authBearer");
                                    if(check_authBearer()) 
                                    {
                                        $http({
                                            method: 'GET',
                                            url: '/api/doc/patient/'+patientUsername,
                                            headers: {
                                                'Authorization': request
                                                
                                            }}).then(function(result) {
                                                
                                               
                                                console.log(result);
                                                $scope.patientDetails = result.data;
                                                
                                            
                                            }, 
                                            function(error) {
                                                
                                               console.log("error "+error.status);
                                                
                                            });
                                    }

                                };



        $scope.addDosageTime = function(){

                                    ($scope.dosageParam).push($scope.dosage);
                                    console.log($scope.dosageParam);
                                    $scope.dosage = "";
                                    document.getElementById("dosageField").style.backgroundColor = "yellow";
                                    


                                };

        $scope.updateCourse = function(){


                               idParam = ($scope.patientDetails[0]).id;
                               pillNameParam = $scope.pillName; 
                               pillDescriptionParam = $scope.pillDescription;
                               courseParam = $scope.course;
                               var request = 'Bearer '+localStorage.getItem("authBearer");

                               var requestJSON = {pill:pillNameParam, course:courseParam, description:pillDescriptionParam, dosage: $scope.dosageParam};
                               var req = JSON.stringify(requestJSON); 
                              

                               if(check_authBearer()) 
                               {
                                   $http({
                                       method: 'POST',
                                       url: '/api/pillbottle/course/'+idParam,
                                       data: req,
                                       headers: {
                                           'Authorization': request,
                                           'Content-Type': 'application/json'
                                           
                                       }}).then(function(result) {
                                           
                                          
                                           alert("[Status: "+result.status+"]     Successfully changed the course for "+$scope.selectedPatientName);
                                           $scope.pillName = "";
                                           $scope.pillDescription = "";
                                           $scope.course = 0;
                                           $scope.dosageParam = [];
                                        
                                       
                                       }, 
                                       function(error) {
                                          alert("Error "+error.status+"     Try Again");
                                          console.log("error "+error.status);
                                           
                                       });
                               }





                        };


        $scope.deleteCourse = function(){
                                
                                var response = window.confirm("Are you sure you want to delete the course for "+$scope.selectedPatientName+"?");
                                var request = 'Bearer '+localStorage.getItem("authBearer");
                                if(response)
                                {
                                    if(check_authBearer()) 
                                    {
                                        $http({
                                            method: 'DELETE',
                                            url: '/api/pillbottle/course/'+($scope.patientDetails[0]).id,
                                            headers: {
                                                'Authorization': request
                                                                                
                                            }}).then(function(result) {
                                                                                                  
                                                window.location = '/dashboard.html';        
                                                                            
                                            }, 
                                            function(error) {
                                               
                                                alert("Oops! There was an ERROR with status "+error.status+". Try Again ");
                                                console.log("error "+error.status);
                                                
                                                                                
                                            });
                                    }
                                }
                                
                                
                                
                    };


});





