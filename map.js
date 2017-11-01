/*jshint loopfunc: true */
var map;
     // Create a new blank array for all the listing markers.
     var markers = [];
     var locations = [];

     function initMap() {
       var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#6A8194' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#1C262F' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];
       // Constructor creates a new map - only center and zoom are required.
       map = new google.maps.Map(document.getElementById('map'), {
         center: {lat:  31.200092, lng:  29.918739},
         zoom: 13,
         styles: styles,
         mapTypeControl: false
       });
       // These are the real estate listings that will be shown to the user.
       // Normally we'd have these in a database instead.
       // locations
       var locations = [
                 {
                   title: 'Alexandria Stadium',
                    location: {
                      lat: 31.197275,
                      lng: 29.91369
                 }},

                 {
                   title: 'Alexandria National Museum',
                    location: {
                      lat: 31.200955,
                      lng: 29.91325
                 }},

                 {
                   title: 'Stanley Bridge',
                    location: {
                      lat: 31.2349534,
                      lng: 29.9484707
                 }},

                 {
                   title: 'Citadel of Qaitbay',
                    location: {
                      lat: 31.2140,
                      lng: 29.8856
                 }},

                 {
                   title: 'Bibliotheca_Alexandrina',
                     location: {
                       lat: 31.208872,
                       lng: 29.9092
                 }}
       ];

       var largeInfowindow = new google.maps.InfoWindow();
       // Style the markers a bit. This will be our listing marker icon.
       var defaultIcon = makeMarkerIcon('34A853');
       // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FBBC05');
       // The following group uses the location array to create an array of markers on initialize.
       for (var i = 0; i < locations.length; i++) {
         // Get the position from the location array.
         var position = locations[i].location;
         var title = locations[i].title;
         // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
           position: position,
           title: title,
           animation: google.maps.Animation.DROP,
            icon: defaultIcon,
           id: i,
           map: map
         });

         // Push the marker to our array of markers.
        markers.push(marker);

         // Create an onclick event to open an infowindow at each marker.
         marker.addListener('click', function() {
           populateInfoWindow(this, largeInfowindow);
           toggleBounce(this);
         });
         // Two event listeners - one for mouseover, one for mouseout,
         // to change the colors back and forth.
         marker.addListener('mouseover', function() {
           this.setIcon(highlightedIcon);
         });
         marker.addListener('mouseout', function() {
           this.setIcon(defaultIcon);
         });
         this.bounce = function(place) {
           google.maps.event.trigger(this.marker, 'click');
         };

       }

       function toggleBounce(marker) {
         if (marker.getAnimation() !== null) {
             marker.setAnimation(null);
           }
         }

       //search
       var viewModel = {
        items : [{ Name: ""},{ Name: ""}, { Name: ""}, { Name: ""}, { Name: ""}]
      };

      for (i = 0; i < markers.length; i++) {
        viewModel.items[i].Name  = markers[i].title;
         viewModel.items[i].location = locations[i].location;
      }

      viewModel.Query = ko.observable('');

      viewModel.searchResults = ko.computed(function() {
          var q = viewModel.Query();

          return viewModel.items.filter(function(i) {
            var name = i.Name.toLowerCase().indexOf(q) >= 0;
            return name;
          });
      });

      //end search
      $(function(){
     ko.applyBindings(new viewModel(markers));
 });

     // This function populates the infowindow when the marker is clicked. We'll only allow
     // one infowindow which will open at the marker that is clicked, and populate based
     // on that markers position.
     function populateInfoWindow(marker, infowindow) {
      //get info

  var search = marker.title;
  var extract;

  //var getData = function(country,type){
  var url= 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+search;
        $.ajax({
            url: url,
            crossOrigin: true,
            type: 'GET',
            dataType: "jsonp",
            xhrFields: { withCredentials: true },
            accept: 'application/json'
        }).done(function (data) {
            var g = data.query.pages;
            extract = g[Object.keys(g)[0]].extract;
            if (infowindow.marker != marker) {
              infowindow.marker = marker;

                 infowindow.setContent('<div>' + marker.title +'</br>'+extract+ '</div>');
                 infowindow.open(map, marker);


              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
              });
            }
            console.log(extract);
        }).fail(function (xhr, textStatus, error) {
            var title, message;
            switch (xhr.status) {
                case 403:
                    title = xhr.responseJSON.errorSummary;
                    message = 'Please login to your server before running the test.';
                    document.getElementById('#error').innerHTML=message;
                    break;
                default:
                    title = 'Invalid URL or Cross-Origin Request Blocked';
                    message = 'You must explictly add this site (' + window.location.origin + ') to the list of allowed websites in your server.';
                    document.getElementById('#error').innerHTML=message;
                    break;
            }
        });


        var interval = setInterval(function () {
          if(extract===undefined){
            console.log("err");
          }else{
            console.log(extract);
            clearInterval(interval);
          }
        }, 100);

  //end

       // Check to make sure the infowindow is not already opened on this marker.
       for (var i=0;i<markers.length;i++) {
        console.log(marker.title);
      }

     }

     // handle map error
      function googleMapsError() {
          alert('An error occurred while loading Google Maps, Please refresh the page!');
      }
     // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
      var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
      return markerImage;
    }

    function myFunction() {
        var x = document.getElementById("options");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
