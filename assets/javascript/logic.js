var maplocation;
var map;
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
         maplocation = [lat,long];
         map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: maplocation[0], lng: maplocation[1]},
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
             var z=data.restaurants;
            $("#table-head").empty();
            $("#table-head").append("<th scope='col'>Restaurant Name</th><th scope='col'>Type</th><th scope='col'>Rating</th><th scope='col'></th>");
            $("#table-body").empty();
            for (var i = 0; i < z.length; i++) {
                $("#table-body").append("<tr>" + "<td>" + z[i].restaurant.name + "</td><td>" + z[i].restaurant.cuisines + "</td><td>"
                    + z[i].restaurant.user_rating.aggregate_rating + "</td><td><button type='button' class='btn btn-success zomato' data-toggle='modal' data-target='exampleModal' id=" + z[i].restaurant.id + ">More Info</button></td></tr>");
                    var myLatLng = new google.maps.LatLng(z[i].restaurant.location.latitude, z[i].restaurant.location.longitude);
                    var marker = new google.maps.Marker({
                        position: myLatLng,
                        map: map,
                    });
                
            }
        },
        error: function (xhr, status, err) {
        }
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
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YlU1Z6st1DDtdKQahLrwevvAJXCU3LXr&city="
            + city + "&startDateTime=" + startDate + "T00:00:00Z&endDateTime=" + endDate + "T00:00:00Z",//need to change to 11:59:59Z
        async: true,
        dataType: "json",
        success: function (data) {
            var tm = data._embedded.events;
            $("#table-head").empty();
            $("#table-head").append("<th scope='col'>Event Name</th><th scope='col'>Date</th><th scope='col'>Time</th><th scope='col'></th>")
            $("#table-body").empty();
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: maplocation[0], lng: maplocation[1]},
                zoom: 12
              });
            for (var i = 0; i < tm.length; i++) {
                $("#table-body").append("<tr>" + "<td>" + tm[i].name + "</td><td>" + tm[i].dates.start.localDate + "</td><td>"
                    + tm[i].dates.start.localTime + "</td><td><button type='button' class='btn btn-success ticket' data-toggle='modal' data-target='exampleModal' id=" + tm[i].id + ">More Info</button></td></tr>");
                    var myLatLng = new google.maps.LatLng(tm[i]._embedded.venues[0].location.latitude, tm[i]._embedded.venues[0].location.longitude);
                    var marker = new google.maps.Marker({
                        position: myLatLng,
                        map: map,
                    });
            }
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
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
$("#tm-button").on("click", ticketMaster);
$("#restaurant-button").on("click", zomatoGetCity);
$(document).on("click", ".ticket", ticketMasterModal);
$(document).on("click", ".zomato", zomatoModal);






