$(document).ready(function(){

    var apiKey =  caf17b1dfec1bc4c754bb5ebed865557 // zomato api key 

    ("#submit-button").on("click", function(){

        var destinationInput = $("#destination-input").val()

        var queryUrl = 'https://developers.zomato.com/api/v2.1/search?entity_id=charlotte&entity_type=city&radius=20'

        $.ajax({

            

        })
    })
}) 