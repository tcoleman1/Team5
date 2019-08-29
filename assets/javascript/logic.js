

var apiKey = "caf17b1dfec1bc4c754bb5ebed865557" // zomato api key 

$("#submit-button").on("click", function () {

    var destinationInput = $("#destination-input").val()

    var queryUrl = 'https://developers.zomato.com/api/v2.1/search?entity_id=charlotte&entity_type=city'

    $.ajax({



    })
})
function ticketMaster(e) {
    var city = $("#destination-input").val().trim();
    var startDate = $("#depart-input").val();
    var endDate = $("#return-date-input").val();
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YlU1Z6st1DDtdKQahLrwevvAJXCU3LXr&city="
         + city + "&startDateTime=" + startDate + "T00:00:00Z&endDateTime=" + endDate + "T00:00:00Z",
        async: true,
        dataType: "json",
        success: function (data) {
            console.log(data._embedded.events[0].name);
            var tm = data._embedded.events;
            $("#table-body").empty();
            for (var i = 0; i < 11; i++) {
                $("#table-body").append("<tr>" + "<td>" + tm[i].name + "</td><td>" + tm[i].dates.start.localDate + "</td><td>"
                 + tm[i].dates.start.localTime + "</td><td><button type='button' class='btn btn-success'>More Info</button></td></tr>");
                console.log(tm[i].name);
            }
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
$("#tm-button").on("click", ticketMaster);






