var maplocation;
var map;
var config = {
    apiKey: "AIzaSyDYVNJ-Ggov5htghQ-BkNxOBcG3c6SfULU",
    authDomain: "bootcamp-example-8f83a.firebaseapp.com",
    databaseURL: "https://bootcamp-example-8f83a.firebaseio.com",
    projectId: "bootcamp-example-8f83a",
    storageBucket: "",
    messagingSenderId: "570706840985",
    appId: "1:570706840985:web:66af9a4c6d8e3d14"
};
firebase.initializeApp(config);
var database = firebase.database();

function zomatoGetCity(e) {
    var city = $("#destination-input").val().trim();

    $.ajax({
        type: "GET",
        dataType: 'json',
        url: 'https://developers.zomato.com/api/v2.1/cities?q=' + city,
        headers: {
            'user-key': 'caf17b1dfec1bc4c754bb5ebed865557'
        },
        success: function (data) {
            var cityID = data.location_suggestions[0].id;
            zomatoGetRestaurants(cityID)
        },
        error: function (xhr, status, err) {
        }
    });
    $.ajax({
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
function zomatoGetRestaurants(a) {
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
            var z = data.restaurants;
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var labelIndex = 0;
            $("#table-head").empty();
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Restaurant Name</th><th scope='col'>Type</th><th scope='col'>Rating</th><th scope='col'></th><th scope='col'></th>");
            $("#table-body").empty();
            for (var i = 0; i < z.length; i++) {
                $("#table-body").append("<tr>" + "<td>" + labels[labelIndex] + "</td><td>" + z[i].restaurant.name + "</td><td>" + z[i].restaurant.cuisines + "</td><td>"
                    + z[i].restaurant.user_rating.aggregate_rating + "</td><td><button type='button' class='btn btn-success zomato' data-toggle='modal' data-target='exampleModal' id="
                    + z[i].restaurant.id + ">More Info</button></td><td><button type='button' class='btn btn-warning fav-zomato' id="
                    + z[i].restaurant.id + ">Add To Favorites</button></td></tr>");
                var myLatLng = new google.maps.LatLng(z[i].restaurant.location.latitude, z[i].restaurant.location.longitude);
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    animation: google.maps.Animation.DROP,
                    label: labels[labelIndex++ % labels.length],
                    map: map,
                });

            }
        },
        error: function (xhr, status, err) {
        }
    });
}
function addFavRestaurant() {
    var id = $(this).attr('id');
    database.ref("/Restaurants/").push({
        id: id
    });
}
function zomatoModal(e) {
    var id = $(this).attr('id');
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
            $(".modal-body").empty();
            var modalImage = $("<img><br>")
            modalImage.attr("src", z.featured_image);
            modalImage.attr("height", "200px");
            modalPhone = $("<h5 style='text-align:center'>");
            modalAddress = $("<h5 style='text-align:center'>");
            modalAddress.text(z.location.address);
            modalPhone.text(z.phone_numbers);
            $(".modal-body").append(modalImage);
            $(".modal-body").append(modalPhone);
            $(".modal-body").append(modalAddress);
            $("#exampleModalLabel").text(z.name);
            $("#exampleModal").modal();
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function ticketMaster(e) {
    var city = $("#destination-input").val().trim();
    var startDate = $("#depart-input").val();
    var endDate = $("#return-date-input").val();

    $.ajax({
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
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YlU1Z6st1DDtdKQahLrwevvAJXCU3LXr&city="
            + city + "&startDateTime=" + startDate + "T00:00:00Z&endDateTime=" + endDate + "T00:00:00Z",//need to change to 11:59:59Z
        async: true,
        dataType: "json",
        success: function (data) {
            var tm = data._embedded.events;
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var labelIndex = 0;
            $("#table-head").empty();
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Event Name</th><th scope='col'>Date</th><th scope='col'>Time</th><th scope='col'></th><th scope='col'></th>")
            $("#table-body").empty();
            for (var i = 0; i < tm.length; i++) {
                $("#table-body").append("<tr>" +"<td>" + labels[labelIndex] + "</td><td>" + tm[i].name + "</td><td>" + tm[i].dates.start.localDate + "</td><td>"
                    + tm[i].dates.start.localTime + "</td><td><button type='button' class='btn btn-success ticket' data-toggle='modal' data-target='exampleModal' id="
                    + tm[i].id + ">More Info</button></td><td><button type='button' class='btn btn-warning fav-ticket' id="
                    + tm[i].id + ">Add To Favorites</button></td></tr>");
                var myLatLng = new google.maps.LatLng(tm[i]._embedded.venues[0].location.latitude, tm[i]._embedded.venues[0].location.longitude);
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
function addFavEvent() {
    var id = $(this).attr('id');
    database.ref("/Events/").push({
        id: id
    });
}
function ticketMasterModal(e) {
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
            console.log(tm.url);
            //Trying to add link to Buy tickets
            //$(".modal-body").append(modalDescription);
            $("#exampleModalLabel").text(tm.name);
            $("#exampleModal").modal();
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();

}
function openBreweryDB(e) {
    var city = $("#destination-input").val().trim();
    $.ajax({
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
    $.ajax({
        type: "GET",
        url: "https://api.openbrewerydb.org/breweries?by_city=" + city +"&per_page=26",
        async: true,
        dataType: "json",
        success: function (data) {
            var ob = data;
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var labelIndex = 0;
            $("#table-head").empty();
            $("#table-head").append("<th scope='col'>Map</th><th scope='col'>Brewery Name</th><th scope='col'>Type</th><th scope='col'>Address</th><th scope='col'></th><th scope='col'></th>")
            $("#table-body").empty();
            for (var i = 0; i < ob.length; i++) {
                var name = ob[i].name;
                var urlName = name.split(' ').join('+');
                console.log(urlName); 
                $("#table-body").append("<tr>" + "<td>" + labels[labelIndex] + "</td><td>" + ob[i].name + "</td><td>" + ob[i].brewery_type + "</td><td>"
                    + ob[i].street + "</td><td><button type='button' class='btn btn-success brewery' data-toggle='modal' data-target='exampleModal' id="
                    + urlName + ">More Info</button></td></tr>");
                var myLatLng = new google.maps.LatLng(ob[i].latitude, ob[i].longitude);
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
            $("#exampleModalLabel").text(untap.brewery_name);
            $("#exampleModal").modal();


        },
        error: function (xhr, status, err) {
        }
    });
}
$("#tm-button").on("click", ticketMaster);
$("#restaurant-button").on("click", zomatoGetCity);
$("#ob-button").on("click", openBreweryDB);
$(document).on("click", ".ticket", ticketMasterModal);
$(document).on("click", ".zomato", zomatoModal);
$(document).on("click", ".fav-zomato", addFavRestaurant);
$(document).on("click", ".fav-ticket", addFavEvent);
$(document).on("click", ".brewery", getBrewID);






