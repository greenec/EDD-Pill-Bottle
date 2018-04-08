
 var paired = false, lockStatus;

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

	$('#lock-toggle').click(function() {
		if(lockStatus == 'locked') {
			FingerprintAuth.encrypt(fingerprintConfig, function() {
				bluetoothSerial.write('unlock');

				lockStatus = 'unlocked';
				drawLockStatus(lockStatus);
			});
		}

		if(lockStatus == 'unlocked') {
			bluetoothSerial.write('lock');

			lockStatus = 'locked';
			drawLockStatus(lockStatus);
		}
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
								setTimeout(function() {
									bluetoothSerial.read(function(status) {
										lockStatus = status;
										drawLockStatus(lockStatus);
									});
								}, 500);

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

function drawLockStatus(status) {
	var icon, buttonText;

	if(status == 'locked') {
		icon = 'fa-lock';
		buttonText = 'Unlock';
	}

	if(status == 'unlocked') {
		icon = 'fa-unlock-alt';
		buttonText = 'Lock';
	}

	$('#lock-status').removeClass('fa-lock fa-unlock-alt').addClass(icon);
	$('#lock-toggle').text(buttonText);
}