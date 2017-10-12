$(document).ready(function(){

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAuWrOgkdto7GBZU12WfRg_TBx-in_XGdg",
    authDomain: "train-scheduler-6e3a4.firebaseapp.com",
    databaseURL: "https://train-scheduler-6e3a4.firebaseio.com",
    projectId: "train-scheduler-6e3a4",
    storageBucket: "train-scheduler-6e3a4.appspot.com",
    messagingSenderId: "652045751072"
  };

  firebase.initializeApp(config);

  //create variable to hold fb database
  var database = firebase.database();

  $("#submit").on("click", function(event){
    event.preventDefault();

      //on submit event, grab values in the text fields, trim them and assign
      //to new variables
      var train = $("#train").val().trim();
      var destination = $("#destination").val().trim();
      var firstTrain = $("#trainTime").val().trim();
      var frequency = $("#frequency").val().trim();

        //run validation functions and set to variables
        var valTime = checkInput.validateTime(firstTrain);
        var valFreq = checkInput.validateFreq(frequency);

          //use if else statements with validation variables to determine
          //if values are pushed to database or not
          if(valTime && valFreq){
            database.ref("/trains").push({
              train: train,
              destination: destination,
              firstTrain: firstTrain,
              frequency: frequency
            }) //end push to train values in fbase db

            $("#train").html("").val("");
            $("#destination").html("").val("");
            $("#trainTime").html("").val("");
            $("#frequency").html("").val("");

          } else if (!valTime || !valFreq) {
            alert("Your inputs are invalid.  Make sure you are using only military time for first train or valid integers for frequency");
            $("#trainTime").html("").val("");
            $("#frequency").html("").val("");
          }

  }) //end submit on click event

  //listener event for any child added to the database
  database.ref("/trains").on("child_added", function(childSnapshot){

      //set values of children to values of the variables
      train = childSnapshot.val().train;
      destination = childSnapshot.val().destination;
      firstTrain = childSnapshot.val().firstTrain;
      frequency = childSnapshot.val().frequency;

      //convert the firstTrain variable to 1 year prior, ensures this variable will always before 'now' or moment()
      var trainTime = moment(firstTrain, "HH:mm").subtract(1, "years");

      //find difference between our trainTime variable and now, convert to minutes
      var diff = moment().diff(moment(trainTime), "minutes");

      //use mod to find the remainder of the diff variable and frequency input
      var rem = diff % frequency;

      //minutes away
      var minsAway = frequency - rem;

      //next train time, adding the minsAway value to now
      var next = moment().add(minsAway, "minutes");

      //format the next variable into the desired military time output
      var nextFormat = moment(next).format("HH:mm");

      //append variables to the table body
      $("#sheet").append("<tr><td>" + train + "</td><td>" + destination +
                        "</td><td>" + frequency + "</td><td>" + nextFormat +
                        "</td><td>" + minsAway + "</td><td>");

  })

}) //end document ready

//create checkInput object to hold validation functions
var checkInput = {

  /*
    validateTime function accepts an input and checks that input against a regular expression
    the regex looks specifically for military time input
    if input === re, set match to true and return the bool val true

    @param input:  value from firstTrain input
  */
  validateTime: function(input){
    var re = input.match(/([01]\d|2[0-3]):?[0-5]\d/);
    var match = false;

    if(re){
      match = true;
      return match;
    }

  }, //end validateTime function

  /*
    validateFreq function accepts an input and checks that input against a regular expression
    the regex looks for only integers
    if arg === re, set match to true and return the bool val true

    @param arg:  value from frequency input
  */
  validateFreq: function(arg){
    var re = arg.match(/^\d+$/);
    var match = false;

    if(re){
      match = true;
      return match;
    }
  } //end validateFreq function

};//end checkInput object
