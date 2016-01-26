/**
Author: B00285812
*/
//Array that holds location objects.
var locationArray = new Array();
//stores the city name and the country code that the user has selected from the location selection screen.
var currentCity, currentCountry;
//Store the username of the currently logged user.
var user = "";

/**
Constructor definition for a location object that stores the city name, country code and id.
@constructor
@param {string} cityName - The name of the city.
@param {string} countryCode - Two letter abbreviation of the country.
@param {string} cityID - The seven character ID of the city.
*/
var Location = function(cityName, countryCode, cityID){
	this.cityName = cityName;
	this.countryCode = countryCode;
	this.cityID = cityID;
};

/**
Make sure that the document and all of it's components are successfuly loaded before making any reference.
*/
$(document).ready(function(){
	/**
	Click event handler for the "#currentlocation" anchor. Shows a 3 hourly 5 day
	weather forecast of a location based on the user's current geolocation
	coordinates (latitude and longitude).
	*/
	$("#currentlocation").click(function(){
		clearPage();
		showWeatherByGeoCoord();
	});

	/**
	Click event handler for the "#btngetweather" anchor. Shows a 3 hourly 5 day
	weather forecast of a location based on the user's selected country and city.
	*/
	$("#btngetweather").click(function(){
		currentCity = $("#selectedcity").val();
		currentCountry = $("#countrylist").val();
		clearPage();
		showWeatherByCity();
		$.mobile.changePage("#weather");
	});

	/**
	Click event hander for the delete button of a split button. Deletes an item
	from a list content that displays a location based on the city name and country code.
	*/
	$(document).on("click", "a[name=delete]", function(){
		removeFromCollection($(this).attr('id'));
		$(this).parent().remove();
		$('#locationlist').listview('refresh');
	});

	/**
	Click event hander for a split button. Displays the weather information of a location
	based on the city ID.
	*/
	$(document).on("click", "a[name=display]", function(){
		showWeatherById($(this).attr('id'));
		$("#mainPanel").panel("close");
	});

	/**
	Click event handler for the button to login existing users.
	*/
	$('#btnlogin').click(function(){
		login($('#eusername').val(), $('#epassword').val());
	})

	/**
	Click event handler for the button that registers a new user account.
	*/
	$('#btnregisteruser').click(function(){
		registerUser($('#newusername').val(), $('#newpassword').val());
	});

	/**
	Click event handler for the login button in the weather page.
	*/
	$('#login').click(function(){
		$.mobile.changePage("#userlogin", "pop");
	});

	/**
	Click event handler for the logout button in the weather page.
	*/
	$('#logout').click(function(){
		logout();
	});

	//Calls the method that initializes the page.
	initPage();
});

/**
Displays an alert message on a page.
@param {string} alert - The message to be displayed.
*/
function showMessage(alert){
	$("#alertmessage").html(alert);
	$(".ui-dialog").dialog("close");
	$.mobile.changePage("#alert", "pop");
}

/**
Page initialization. Called after all of the page's elements have finised loading.
*/
function initPage(){
	/*
	Toggle log in and log out buttons, depending on user's log in status.
	*/
	if(user){
		$("#login").toggle(false);
		$("#logout").toggle(true);
	}
	else{
		$("#login").toggle(true);
		$("#logout").toggle(false);
	}
	/*
	Populate list of countries for the selection drop-down. The list of countries and
	their corresponding codes are in the js/countrysymbol.js file.
	*/
	var options = "";
	for(symbol in countrySymbol){
		options += "<option value = '" + symbol + "'>" + countrySymbol[symbol] + "</option>"
	}
	$("#countrylist").html(options);
	locationArray = JSON.parse(localStorage.getItem("locations"));
	updateLocationList();
}

/**
Display the five day weather forecast of a selected city.
*/
function showWeatherByCity(){
	var list = $("#forecastlist");
    $.getJSON("http://api.openweathermap.org/data/2.5/forecast?q=" + currentCity + "," + currentCountry + "&units=metric&appid=ccaf6faaeacdea9f10abdff2f83b0e60", function(data){
	$("#cityname").text(data.city.name + ", ");
	$("#countrycode").text(data.city.country);
	for(var i = 0; i < data.list.length; i ++){
		list.append("<li><span style = 'font-size:200%;'>" + getDay(new Date(data.list[i].dt * 1000).getDay()) + "&nbsp;&nbsp;<span style = 'font-size:60%;'>" + new Date(data.list[i].dt * 1000).getHours() + ":" + zeroPrefix(new Date(data.list[i].dt * 1000).getMinutes()) + "</span>" + "</span>" + "</li>");
		list.append("<li style = 'font-size:150%;'>" + data.list[i].weather[0].main + "/" + data.list[i].weather[0].description +  "</li>");
		list.append("<img src = 'img/" + data.list[i].weather[0].icon + ".png' />" +
					"<li style = 'text-align:right;'>High <span style = 'font-size:200%;'>" + data.list[i].main.temp_max + " C</span>" + "</li>");
		list.append("<li style = 'text-align:right;'>Low <span style = 'font-size:200%;'>" + data.list[i].main.temp_min + " C</span>" + "</li><br/>");
		list.append("<li>Wind Speed > <span style = 'font-size:150%;'>" + data.list[i].wind.speed + "</span> m/s" + "</li>");
		list.append("<li>Wind Direction > <span style = 'font-size:150%;'>" + data.list[i].wind.deg + "</span> degrees" + "</li>");

		list.append("<p class = 'horizontalline'></p>");
	}
	saveLocation(data.city.name, data.city.country, data.city.id);
	updateLocationList();
	});
}

/*
Display the five day weather forecast of a geolocation latitude and longitude.
*/
function showWeatherByGeoCoord() {
	var list = $("#forecastlist");
	if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(
            function(position){//run this function if location is available.
                $.getJSON("http://api.openweathermap.org/data/2.5/forecast?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&units=metric&appid=ccaf6faaeacdea9f10abdff2f83b0e60", function(data){
					$("#cityname").text(data.city.name + ", ");
					$("#countrycode").text(data.city.country);
					for(var i = 0; i < data.list.length; i ++){
						list.append("<li><span style = 'font-size:200%;'>" + getDay(new Date(data.list[i].dt * 1000).getDay()) + "&nbsp;&nbsp;<span style = 'font-size:60%;'>" + new Date(data.list[i].dt * 1000).getHours() + ":" + zeroPrefix(new Date(data.list[i].dt * 1000).getMinutes()) + "</span>" + "</span>" + "</li>");
						list.append("<li style = 'font-size:150%;'>" + data.list[i].weather[0].main + "/" + data.list[i].weather[0].description +  "</li>");
						//list.append("<img src = 'img/" + data.list[i].weather[0].icon + ".png' />");
						list.append("<img src = 'img/" + data.list[i].weather[0].icon + ".png' />" +
									"<li style = 'text-align:right;'>High <span style = 'font-size:200%;'>" + data.list[i].main.temp_max + " C</span>" + "</li>");
						list.append("<li style = 'text-align:right;'>Low <span style = 'font-size:200%;'>" + data.list[i].main.temp_min + " C</span>" + "</li><br/>");
						list.append("<li>Wind Speed > <span style = 'font-size:150%;'>" + data.list[i].wind.speed + "</span> m/s" + "</li>");
						list.append("<li>Wind Direction > <span style = 'font-size:150%;'>" + data.list[i].wind.deg + "</span> degrees" + "</li>");

						list.append("<p class = 'horizontalline'></p>");
					}
					saveLocation(data.city.name, data.city.country, data.city.id);
					updateLocationList();
				});
            },
           	function(error){//show error message if an error is encountered.
                switch(error.code){
                  	case error.TIMEOUT:
                    break;
                    case error.POSITION_UNAVAILABLE:
                    break;
                    case error.PERMISSION_DENIED:
                    break;
                    case error.UNKNOWN_ERROR:
                    break;
                }
           	}
        );
    }
    else{
        showMessage("Unable to determine your location. Make sure that location services is turned on.");
    }
}

/***
Display the five day weather forecast of a selected city by it's id.
@param {string} id - The id of the selected city.
*/
function showWeatherById(id){
	clearPage();
	var list = $("#forecastlist");
    $.getJSON("http://api.openweathermap.org/data/2.5/forecast?id=" + id + "&units=metric&appid=2de143494c0b295cca9337e1e96b00e0", function(data){
		$("#cityname").text(data.city.name + ", ");
		$("#countrycode").text(data.city.country);
		for(var i = 0; i < data.list.length; i ++){
			list.append("<li><span style = 'font-size:200%;'>" + getDay(new Date(data.list[i].dt * 1000).getDay()) + "&nbsp;&nbsp;<span style = 'font-size:60%;'>" + new Date(data.list[i].dt * 1000).getHours() + ":" + zeroPrefix(new Date(data.list[i].dt * 1000).getMinutes()) + "</span>" + "</span>" + "</li>");
			list.append("<li style = 'font-size:150%;'>" + data.list[i].weather[0].main + "/" + data.list[i].weather[0].description +  "</li>");
			list.append("<img src = 'img/" + data.list[i].weather[0].icon + ".png' />" +
						"<li style = 'text-align:right;'>High <span style = 'font-size:200%;'>" + data.list[i].main.temp_max + " C</span>" + "</li>");
			list.append("<li style = 'text-align:right;'>Low <span style = 'font-size:200%;'>" + data.list[i].main.temp_min + " C</span>" + "</li><br/>");
			list.append("<li>Wind Speed > <span style = 'font-size:150%;'>" + data.list[i].wind.speed + "</span> m/s" + "</li>");
			list.append("<li>Wind Direction > <span style = 'font-size:150%;'>" + data.list[i].wind.deg + "</span> degrees" + "</li>");

			list.append("<p class = 'horizontalline'></p>");
		}
		saveLocation(data.city.name, data.city.country, data.city.id);
		updateLocationList();
	});
}

/**
Returns the name of the Day, eg. Monday, Tuesday...
0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
@param {string} day - numeric representation of the day from 0 to 6.
@returns {string} The name of the day, eg, "Monday".
*/
function getDay(day){
	var dayName = "";
	switch(day){
		case 0:
			dayName = "Sunday";
			break;
		case 1:
			dayName = "Monday";
			break;
		case 2:
			dayName = "Tuesday";
			break;
		case 3:
			dayName = "Wednesday";
			break;
		case 4:
			dayName = "Thursday";
			break;
		case 5:
			dayName = "Friday";
			break;
		case 6:
			dayName = "Saturday";
			break;
	}
	return dayName;
}

/**
Adds a leading zero to the argument passed to this function.
@param {int} i - The number to prefix zero with.
@returns {int} The number prefixed with zero.
*/
function zeroPrefix(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

/**
Clear the weather page.
*/
function clearPage(){
	$("#cityname").text("");
	$("#countrycode").text("");
	$("#forecastlist").empty();
}

/**
Save a location in an array and online.
@param {string} cityName - The name of the city.
@param {string} countryCode - The two letter abbreviation of the country where the
city is located.
@param {string} cityID - The seven character ID of a city.
*/
function saveLocation(cityName, countryCode, cityID){
	if(isLocationExists(cityID) == false){
		var newLocation = new Location(cityName, countryCode, cityID);
		locationArray.push(newLocation);
		localStorage.setItem("locations", JSON.stringify(locationArray));

		/*Update the online location list for the current user
		 if the user is logged-in.*/
		if(user != ""){
			var ref = null;
			var ref = new Firebase('https://forecaster.firebaseio.com/users/' + user);
			ref.update({
				"locations": JSON.stringify(locationArray)
			});
			//}
			//else{
			//	alert("removing");
			//	var ref = new Firebase('https://forecaster.firebaseio.com/users/' + user);
			//	ref.child("locations").remove();
			//}
		}
	}
}

/**
Update the list view that displays the locations.
*/
function updateLocationList(){
	$("#locationlist").empty();
	for(var i = 0; i < locationArray.length; i ++){
		$("#locationlist").append('<li><a href="#weather" name = "display" data-rel = "close" id = "' + locationArray[i].cityID +
															'">' + locationArray[i].cityName + ", " + locationArray[i].countryCode +
															'</a><a name = "delete" data-icon = "delete" data-icon-post="notext" id = "' +
															locationArray[i].cityID + '"></a></li>');
	}
	$("#locationlist").listview('refresh');
}

/**
Remove a location object from the array that stores a collection of location objects.
@param {string} cityID - The seven character ID of a city.
*/
function removeFromCollection(cityID){
	for(var i = 0; i < locationArray.length; i ++){
		if(locationArray[i].cityID == cityID){
			locationArray.splice(i, 1);
		}
	}//end for
	localStorage.setItem("locations", JSON.stringify(locationArray));
	if(user != ""){
		var ref = null;
		var ref = new Firebase('https://forecaster.firebaseio.com/users/' + user);
		ref.update({
			"locations": JSON.stringify(locationArray)
		});
	}
}

/**
Check if location is already saved. Returns true if it is, false otherwise.
@param {string} cityID - The seven character ID of a city.
@returns {boolean} True if cityID exists in the current collection of locations (user favorites). False otherwise.
*/
function isLocationExists(cityID){
	var exists = false
	for(var i = 0; i < locationArray.length; i ++){
		if(locationArray[i].cityID == cityID){
			exists = true;
		}
	}
	return exists;
}

/**
Checks that all the information needed to register a new user is entered.
*/
function registerUser(username, password){
	if(navigator.onLine){
		//Reference to the Firebase database.
		if($('#newusername').val() && $('#newpassword').val() && $('#confirmpassword').val()){
			if($('#newpassword').val() == $('#confirmpassword').val()){
				createAccount(username, password);
			}
			else{
				showMessage("Passwords does not match. Please try again.");
			}
		}
		else{
			showMessage("All fields are required. Please try again.");
		}
	}
	else{
		showMessage("Please check your internet connection.");
	}
}

/**
Checks that all the information needed to authenticate a user is entered.
@param {string} username - The username to be validated.
@param {string} password - The password to be validated.
*/
function login(username, password){
	if(username && password){
		validateUser(username, password);
	}
	else{
		showMessage("All fields are required to login. Please try again.");
	}
}

/**
Checks the firebase database if username already exists. An account will only be created if
the username is not already in the database.
@param {string} username - The username for the new account.
@param {string} password - The password for the new account.
*/
function createAccount(username, password){
	var ref = null;
	var ref = new Firebase('https://forecaster.firebaseio.com/users/' + username);
	ref.once('value', function(snapshot){
		var a = JSON.stringify(snapshot.val());
		if(a === 'null'){
			firebaseRef = new Firebase('https://forecaster.firebaseio.com/');
			var newUserRef = firebaseRef.child("users");
			newUserRef.child(username).set({
				password: password,
				username: username
			});
			initUser(username);
		}
		else{
			showMessage("The username is already taken. Please try a different one.");
		}
	})
}

/**
Checks the firebase database if username already exists and whether the password matches the one
entered by the user.
@param {string} username - The username used by the user to log in.
@param {string} password - The password to validate against the user's password in the firebase database.
*/
function validateUser(username, password){
	var ref = null;
	var ref = new Firebase('https://forecaster.firebaseio.com/users/' + username);
	ref.once('value', function(snapshot){
		var a = JSON.stringify(snapshot.val());
		if(a === 'null'){
			showMessage("Invalid username. Please try again.");
		}
		else{
			ref.child('password').on('value', function(snapshot){
				var pass = JSON.stringify(snapshot.val());
				password = '"' + password + '"';
				if(pass != password){
					showMessage("Invalid password. Please try again.");
				}
				else{
					initUser(username);
					ref.child('locations').on('value', function(snapshot){
						if(JSON.stringify(snapshot.val()) != 'null'){
							locationArray = JSON.parse(snapshot.val());
							updateLocationList();
							$("#locationlist").listview('refresh');
						}
					});
				}
			})
		}
	})
}

/**
Initialize page after a user has logged in.
@param {string} username - The username of the user currently logged in.
*/
function initUser(username){
	user = username;
	clearPage();
	$.mobile.changePage("#weather");
	$("#cityname").text("Welcome");
	$("#countrycode").text(user + "!");
	locationArray = [];
	$("#locationlist").empty();
	$("#locationlist").listview('refresh');
	$("#login").toggle(false);
	$("#logout").toggle(true);
}

/**
Clears the location array and the currently logged user.
*/
function logout(){
	user = "";
	locationArray = []
	clearPage();
	$("#locationlist").empty();
	$("#locationlist").listview('refresh');
	$("#login").toggle(true);
	$("#logout").toggle(false);
	$.mobile.changePage("#main", "pop");
}
