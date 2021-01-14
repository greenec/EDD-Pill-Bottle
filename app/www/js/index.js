
const storage = window.localStorage;

let paired = false;
let lockStatus, lastOpened;

let app = {
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
	const fingerprintConfig = {
		'clientId': 'ctc-bottle'
	};

	$('#lock-toggle').click(function() {
		if(lockStatus === 'locked') {
			FingerprintAuth.encrypt(fingerprintConfig, function() { // user's fingerprint or passcode, pattern, etc. was accepted
				bluetoothSerial.write('unlock');

				lockStatus = 'unlocked';
				drawLockStatus(lockStatus);
			});
		}

		if(lockStatus === 'unlocked') {
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
				bluetoothSerial.connect(storage.getItem('bluetoothAddr'),
					function() { // connection succeeded
						let abortAndRetry = false;

						bluetoothSerial.read(function(statusMsg) {
							let status;
							try {
								status = JSON.parse(statusMsg);
							}
							catch { // invalid JSON error, abort and try again later
								abortAndRetry = true;
								return;
							}

							if (status === null || status === undefined || status === "") {
								abortAndRetry = true;
								return;
							}

							switch (status['lock_status']) {
								case 'locked':
									lockStatus = status['lock_status'];
									break;
								case 'unlocked':
									lockStatus = status['lock_status'];
									break;
								default:
									// invalid lock status (neither locked nor unlocked) returned
									abortAndRetry = true;
									return;
							}
							drawLockStatus(lockStatus);

							if (status['last_opened'] !== undefined && Number.isInteger(status['last_opened'])) {
								lastOpened = getDateString(new Date(status['last_opened'] * 1000));
							} else {
								lastOpened = 'N/A';
							}
							$('#last-opened').text(lastOpened);
						});

						if (abortAndRetry) {
							return;
						}

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
	let icon, buttonText;

	if (status === 'locked') {
		icon = 'fa-lock';
		buttonText = 'Unlock';
	}

	if (status === 'unlocked') {
		icon = 'fa-unlock-alt';
		buttonText = 'Lock';

		$('#last-opened').text(getDateString(new Date()));
	}

	$('#lock-status').removeClass('fa-lock fa-unlock-alt').addClass(icon);
	$('#lock-toggle').text(buttonText);
}

function getDateString(date) {
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
	return date.toLocaleDateString("en-US", options);
}