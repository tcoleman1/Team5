

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
            var tm = data._embedded.events;
            $("#table-body").empty();
            for (var i = 0; i < tm.length; i++) {
                $("#table-body").append("<tr>" + "<td>" + tm[i].name + "</td><td>" + tm[i].dates.start.localDate + "</td><td>"
                 + tm[i].dates.start.localTime + "</td><td><button type='button' class='btn btn-success' data-toggle='modal' data-target='exampleModal' id=" + tm[i].id + ">More Info</button></td></tr>");
            }
        },
        error: function (xhr, status, err) {
        }
    });
    e.preventDefault();
}
function ticketMasterModal(e){
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
$(document).on("click", ".btn-success", ticketMasterModal);






