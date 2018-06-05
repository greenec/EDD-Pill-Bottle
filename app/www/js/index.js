
var storage = window.localStorage;
var paired = false, lockStatus, lastOpened;

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
	bluetoothSerial.enable(function() {
		setInterval(function() {
			if(!paired) {
			
				// TODO: loading animation and error handling for connecting
				bluetoothSerial.connect( storage.getItem('bluetoothAddr'),
					function() { // connection succeded
						bluetoothSerial.read(function(statusObj) {
							var status = JSON.parse(statusObj);

							lockStatus = (status.length != 0) ? status['lock_status'] : 'locked';
							drawLockStatus(lockStatus);

							lastOpened = (status.length != 0) ? getDateString(new Date(status['last_opened'] * 1000)) : 'N/A';
							$('#last-opened').text(lastOpened);
						});

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
		}, 1000);
	});
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

		$('#last-opened').text(getDateString(new Date()));
	}

	$('#lock-status').removeClass('fa-lock fa-unlock-alt').addClass(icon);
	$('#lock-toggle').text(buttonText);
}

function getDateString(date) {
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
	return date.toLocaleDateString("en-US", options);
}