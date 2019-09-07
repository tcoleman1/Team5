var maplocation; // global variable to hold latitude and longitude for setting the map to selected city
var map; //google map object
var config = {//credentials for the firebase server
    apiKey: "AIzaSyDYVNJ-Ggov5htghQ-BkNxOBcG3c6SfULU",
    authDomain: "bootcamp-example-8f83a.firebaseapp.com",
    databaseURL: "https://bootcamp-example-8f83a.firebaseio.com",
    projectId: "bootcamp-example-8f83a",
    storageBucket: "",
    messagingSenderId: "570706840985",
    appId: "1:570706840985:web:66af9a4c6d8e3d14"
};
firebase.initializeApp(config);//initalializing the firebase server
var database = firebase.database();//creating database object to add and make changes to the firebase server

function zomatoGetCity(e) {//function that querys the zomato api to search for the city from the users destination input and set the map location
    var city = $("#destination-input").val().trim();

    $.ajax({//the ajax call that will search the zomato api- this returns an array of relevant cities based on user input
        type: "GET",
        dataType: 'json',
        url: 'https://developers.zomato.com/api/v2.1/cities?q=' + city,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557' //zomato api key
        },
        success: function (data) {
            var cityID = data.location_suggestions[0].id;//this returns the id of the first suggested city from the zomato api (not foolproof but works pretty well)
            zomatoGetRestaurants(cityID)//calls the zomatoGetRestaurants function passing the id captured in the ajax call
        },
        error: function (xhr, status, err) {
        }
    });
    $.ajax({//this ajax call sets the google map to be centered at the coordinates from the first suggested city, this can be refactored to be included in the first ajax call now that im reviewing it
        type: "GET",
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/locations?query=" + city,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            var lat = data.location_suggestions[0].latitude;
            var long = data.location_suggestions[0].longitude;
            maplocation = [lat, long];
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: maplocation[0], lng: maplocation[1] },
                zoom: 12
            });

        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();

}
function zomatoGetRestaurants(a) {//this function is called by zomatoGetCity with the cityId that is captured in the city query search in the functon zomatoGetCity
    var id = a;
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/search?entity_id=" + id + "&entity_type=city",
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            console.log(data);
            var z = data.restaurants;// this variable holds the json data from the first 20 trending restaurants in a given city from the ajax call
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';//labels array to be displayed on entities in the google map
            var labelIndex = 0;//counter variable that will loop through the labels array
            $("#table-head").empty();//clearing all column titles from the html table 
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Restaurant Name</th><th scope='col'>Type</th><th scope='col'>Rating</th><th scope='col'></th><th scope='col'></th>");//creating the column headings for diplaying restaurants
            $("#table-body").empty();//clearing the main contents of the table so that new information can be added
            for (var i = 0; i < z.length; i++) {//each time this loop iterates a new table row will be created and appended with restaurant information captured from the api
                $("#table-body").append("<tr>" + "<td>" + labels[labelIndex] + "</td><td>" + z[i].restaurant.name + "</td><td>" + z[i].restaurant.cuisines + "</td><td>"
                    + z[i].restaurant.user_rating.aggregate_rating + "</td><td><button type='button' class='btn btn-success zomato' data-toggle='modal' data-target='exampleModal' id="
                    + z[i].restaurant.id + ">More Info</button></td><td><button type='button' class='btn btn-warning fav-zomato' id="
                    + z[i].restaurant.id + ">Add To Favorites</button></td></tr>");
                var myLatLng = new google.maps.LatLng(z[i].restaurant.location.latitude, z[i].restaurant.location.longitude);//this variable saves the lat and long of each restaurant fetched by the api call
                var marker = new google.maps.Marker({//marker creates a new pinpoint on the google map for the given restauarant
                    position: myLatLng,
                    animation: google.maps.Animation.DROP,//drop animation for each marker
                    label: labels[labelIndex++ % labels.length],//this uses the labels array to help display and differentiate pinpoints on the google map
                    map: map, // specifying the map that is targeted
                });

            }
        },
        error: function (xhr, status, err) {
        }
    });
}


function getZomatoReviews(a){ // this function will get called on click of the review button to get restutant reviews using the ID that
    var resId = a;
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/reviews?res_id=" + resId,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
                success: function (data) {
                    var reviews = data.user_reviews;
                   



                    $(".modal-body").append("<table class='table'><thead><tr id='review-list-head'></tr></thead><tbody id='review-list-body'></tbody></table>");
           $("#review-list-head").append("<th scope='col'></th><th scope='col'>UserName</th><th scope='col'>Ratings</th><th scope='col'>Reviews</th>");
           for(var i=0;i<reviews.length;i++){
               $("#review-list-body").append("<tr><td><img src=" + reviews[i].review.user.profile_image  +  "</td><td>" + reviews[i].review.user.name + "</td>" + "<td>" + reviews[i].review.rating+ "</td><td>" + reviews[i].review.review_text +"</td><td>");
           

                }}
            
            });
        }      


function addFavRestaurant() {//this function deals with adding a rstaurant id to the firebase server which can be called later to display the restaurants that have been favorited
    var id = $(this).attr('id');
    database.ref("/Restaurants/").push({
        id: id
    });
}
function zomatoModal(e) {//this function happens when then "more info" button is clicked and the pop up modal is displayed on the screen
    var id = $(this).attr('id');//capturing the id of a given restaurant so that another ajax call can be made to get more specific details of that restaurant
    console.log(id);
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/restaurant?res_id=" + id,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            var z = data;
            $(".modal-body").empty();//clearing the data of the modal (state=hidden) that is coded in the html document
            var modalImage = $("<img><br>")//this creates a variable that will hold an html image
            modalImage.attr("src", z.featured_image);//setting the attribute of src to the image with the image url provided in the zomato api
            modalImage.attr("height", "200px");//constricting the image to a height of 200px(can be changed when we swtich to the larger modal format)
            modalPhone = $("<h5 style='text-align:center'>");//this creates an html <h5> text object that will be center aligned
            modalAddress = $("<h5 style='text-align:center'>");
            modalAddress.text(z.location.address);//setting the text of this html <h5> to include the address of the restaurant that is targeted by clicking "more info"
            modalPhone.text(z.phone_numbers);// ^^ same as above but with phone number
            $(".modal-body").append(modalImage);//these calls append the restaurant information gathered to the body of the pop up modal
            $(".modal-body").append(modalPhone);
            $(".modal-body").append(modalAddress);
            getZomatoReviews(id)
            $("#exampleModalLabel").text(z.name);//the modal label is equivalent to what the <title> of an html page is
            $("#exampleModal").modal();//this command changes the modal from hidden to visible (makes it pop up)
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function ticketMaster(e) {
    var city = $("#destination-input").val().trim();//these calls grab the user input from the text inputs on the html page and saves them to local variables
    var startDate = $("#depart-input").val();
    var endDate = $("#return-date-input").val();

    $.ajax({// this function re draws the google map to centrally locate to the city that the user is searching for (can be refactored)
        type: "GET",
        async: false,
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/locations?query=" + city,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            var lat = data.location_suggestions[0].latitude;
            var long = data.location_suggestions[0].longitude;
            maplocation = [lat, long];
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: maplocation[0], lng: maplocation[1] },
                zoom: 12
            });

        },
        error: function (xhr, status, err) {
        }
    });
    $.ajax({//This ajax call gets the users destination and timeframe in order to display all ticket master events that occur within the timeframe and location
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YlU1Z6st1DDtdKQahLrwevvAJXCU3LXr&city="
            + city + "&startDateTime=" + startDate + "T00:00:00Z&endDateTime=" + endDate + "T00:00:00Z",//need to change to 11:59:59Z
        async: true,
        dataType: "json",
        success: function (data) {
            var tm = data._embedded.events;//creating a variable to hold json data from the api call
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';//google maps labels array and index below
            var labelIndex = 0;
            $("#table-head").empty();//Need to clear the table column headings so that they can be specified for ticketmaster
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Event Name</th><th scope='col'>Date</th><th scope='col'>Time</th><th scope='col'></th><th scope='col'></th>")//creates the ticketmaster events column headings
            $("#table-body").empty();//clearing the table body so that we can add rows of information specific to the ticket master events captured by the api
            for (var i = 0; i < tm.length; i++) {//for loop similar to the zomatoGetRestaurants (see line 72)
                $("#table-body").append("<tr>" +"<td>" + labels[labelIndex] + "</td><td>" + tm[i].name + "</td><td>" + tm[i].dates.start.localDate + "</td><td>"
                    + tm[i].dates.start.localTime + "</td><td><button type='button' class='btn btn-success ticket' data-toggle='modal' data-target='exampleModal' id="
                    + tm[i].id + ">More Info</button></td><td><button type='button' class='btn btn-warning fav-ticket' id="
                    + tm[i].id + ">Add To Favorites</button></td></tr>");
                var myLatLng = new google.maps.LatLng(tm[i]._embedded.venues[0].location.latitude, tm[i]._embedded.venues[0].location.longitude);//same google maps calls(could be refactored)
                var marker = new google.maps.Marker({
                    animation: google.maps.Animation.DROP,
                    position: myLatLng,
                    label: labels[labelIndex++ % labels.length],
                    map: map,
                });
            }
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function addFavEvent() {//adding the ticket master event id's to the firebase server when the user clicks add to favorites
    var id = $(this).attr('id');
    database.ref("/Events/").push({
        id: id
    });
}
function ticketMasterModal(e) {//this function works very similiarly to the zomatoModal function ( see zomatoModal(e) )--line 97
    var id = $(this).attr('id');
    console.log(id);
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YlU1Z6st1DDtdKQahLrwevvAJXCU3LXr&id=" + id,
        async: true,
        dataType: "json",
        success: function (data) {
            var tm = data._embedded.events[0];
            $(".modal-body").empty();
            var modalImage = $("<img><br>")
            modalImage.attr("src", tm.images[1].url);
            modalImage.attr("height", "200px");
            modalVenue = $("<h5 style='text-align:center'>");
            modalVenue.text(tm._embedded.venues[0].name);
            $(".modal-body").append(modalImage);
            $(".modal-body").append(modalVenue);
            $("#exampleModalLabel").text(tm.name);
            $(".modal-footer").append("<button type='button' class='btn btn-primary ticket-button' ></button>")
            $(".ticket-button").text("Buy Tickets");
            $(".ticket-button").attr("id",tm.url);
            console.log(tm.url);
            $("#exampleModal").modal();
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();

}
function openBreweryDB(e) {
    var city = $("#destination-input").val().trim();
    $.ajax({// the same zomato function that can be refactored - sets the map to the central location of the city - note to self:refactor
        type: "GET",
        async: false,
        dataType: 'json',
        url: "https://developers.zomato.com/api/v2.1/locations?query=" + city,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            var lat = data.location_suggestions[0].latitude;
            var long = data.location_suggestions[0].longitude;
            maplocation = [lat, long];
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: maplocation[0], lng: maplocation[1] },
                zoom: 12
            });

        },
        error: function (xhr, status, err) {
        }
    });
    $.ajax({// this ajax call uses the openbrewerydb database to search for breweries by city name- returns 26 results (no problems with a-z on map display, can display up to 50 at a time)
        type: "GET",
        url: "https://api.openbrewerydb.org/breweries?by_city=" + city +"&per_page=26",
        async: true,
        dataType: "json",
        success: function (data) {
            var ob = data;
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var labelIndex = 0;
            $("#table-head").empty();//Need to clear the table column headings so that they can be specified for breweriesa
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Brewery Name</th><th scope='col'>Type</th><th scope='col'>Address</th><th scope='col'></th><th scope='col'></th>")
            $("#table-body").empty();
            for (var i = 0; i < ob.length; i++) {
                var name = ob[i].name;//this captures the name of each specific brewery in a given city
                var urlName = name.split(' ').join('+');//this variable is needed for the getBrewId function and is saved as an id in a button that is created in each row of the table created below
                console.log(urlName); 
                $("#table-body").append("<tr>" + "<td>" + labels[labelIndex] + "</td><td>" + ob[i].name + "</td><td>" + ob[i].brewery_type + "</td><td>"
                    + ob[i].street + "</td><td><button type='button' class='btn btn-success brewery' data-toggle='modal' data-target='exampleModal' id="
                    + urlName + ">More Info</button></td></tr>");
                var myLatLng = new google.maps.LatLng(ob[i].latitude, ob[i].longitude);//google maps coordinates
                var marker = new google.maps.Marker({//google maps place of interest markers
                    animation: google.maps.Animation.DROP,
                    position: myLatLng,
                    label: labels[labelIndex++ % labels.length],
                    map: map,
                });
            }
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function getBrewID(e) {
    var name = $(this).attr('id');
    $.ajax({
        type: "GET",
        url: "https://api.untappd.com/v4/search/brewery?client_id=F1EED4739F6B586A4B45CDD1A7C031824655B6F6&client_secret=F42386C7B9B863163C04CE0CD470A82ED664A6CE&q=" + name ,//
        async: false,
        dataType: "json",
        success: function (data) {
             var id = data.response.brewery.items[0].brewery.brewery_id;
             breweryModal(id);
            
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function breweryModal(e) {
    var id = e;
    $.ajax({
        type: "GET",
        url: "https://api.untappd.com/v4/brewery/info/" + id + "?client_id=F1EED4739F6B586A4B45CDD1A7C031824655B6F6&client_secret=F42386C7B9B863163C04CE0CD470A82ED664A6CE",
        async: true,
        dataType: "json",
        success: function (data) {
            var untap = data.response.brewery;
            $(".modal-body").empty();
            var modalImage = $("<img><br>")
            modalImage.attr("src", untap.brewery_label);
            modalImage.attr("height", "300px");
            $(".modal-body").append(modalImage);
            modalDescription = $("<h5 style='text-align:center'>");
            modalDescription.text(untap.brewery_description);
            $(".modal-body").append(modalDescription);
            $(".modal-body").append("<table class='table'><thead><tr id='beer-list-head'></tr></thead><tbody id='beer-list-body'></tbody></table>");
            $("#beer-list-head").append("<th scope='col'></th><th scope='col'>Beer Name</th><th scope='col'>Style</th><th scope='col'>Description</th>");
            for(var i=0;i<untap.beer_list.items.length;i++){
                $("#beer-list-body").append("<tr><td><img src=" + untap.beer_list.items[i].beer.beer_label + "></td><td>" + untap.beer_list.items[i].beer.beer_name + "</td><td>" + untap.beer_list.items[i].beer.beer_style +"</td><td>"
                + untap.beer_list.items[i].beer.beer_description + "</td></tr>");
            }
            $("#exampleModalLabel").text(untap.brewery_name);
            $("#exampleModal").modal();


        },
        error: function (xhr, status, err) {
        }
    });
}
//these are the event listeners that happen when each type of button is clicked on the DOM
$("#tm-button").on("click", ticketMaster);
$("#restaurant-button").on("click", zomatoGetCity);
$("#ob-button").on("click", openBreweryDB);
$("#reviews-button").on("click", getZomatoReviews);
//These calls are formatted this way because these buttons are not loaded in the html document on start - they are dynamically created
$(document).on("click", ".ticket", ticketMasterModal);
$(document).on("click", ".zomato", zomatoModal);
$(document).on("click", ".fav-zomato", addFavRestaurant);
$(document).on("click", ".fav-ticket", addFavEvent);
$(document).on("click", ".brewery", getBrewID);
$(document).on("click",".ticket-button", function(){
    console.log($(this).attr('id'));
    var url = $(this).attr('id');
    window.open(url);
});







