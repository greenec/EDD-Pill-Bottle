
var storage = window.localStorage;

var app = {
	initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},

    // Bind any cordova events here. Common events are: 'pause', 'resume', etc.
    onDeviceReady: function() {

    	bluetoothSerial.enable(function() {
			bluetoothSerial.list(function (devices) {
				for(var i = 0; i < devices.length; i++) {
					var device = devices[i];
					$('#device-list').append('<option value="' + device.address + '">' + device.name + '</option>');
				}

				$('#device-list').val( localStorage.getItem('bluetoothAddr') );
			});
		});

		$('#save').click(function() {
			localStorage.setItem( 'bluetoothAddr', $('#device-list').val() );
			$('#status').addClass('text-success').text('Settings saved!');
		});

    }
};

app.initialize();
