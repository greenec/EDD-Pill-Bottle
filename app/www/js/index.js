
 var paired = false;

 var app = {
 	initialize: function() {
 		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
 	},

    // Bind any cordova events here. Common events are: 'pause', 'resume', etc.
    onDeviceReady: function() {
    	lockControlInit();
    	bluetoothInit();
    }
};

app.initialize();

function lockControlInit() {
	var fingerprintConfig = {
		'clientId': 'ctc-bottle'
	};

	$('#open-btn').click(function() {
		FingerprintAuth.encrypt(fingerprintConfig, function() {
			bluetoothSerial.write('l');
		});;
	});

	$('#close-btn').click(function() {
		bluetoothSerial.write('r');
	});
}

function bluetoothInit() {
	setInterval(function() {

		if(!paired) {
			bluetoothSerial.list(function (devices) {
				for(var i = 0; i < devices.length; i++) {
					var device = devices[i];
					if(device.name == 'raspberrypi') {

						bluetoothSerial.connect(device.address,
							function() { // connection succeded
                                paired = true;
                                $('#bluetooth-inactive').addClass('d-none');
                                $('#bluetooth-active').removeClass('d-none');
                            },
                            function() { // connection failed or disconnected
                            	paired = false;
                            	$('#bluetooth-active').addClass('d-none');
                            	$('#bluetooth-inactive').removeClass('d-none');
                            });
					}
				}
			});
		}

	}, 1000);
}

