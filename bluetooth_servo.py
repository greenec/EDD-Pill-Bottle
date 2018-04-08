import bluetooth
import wiringpi
import json
import os 

file_path = os.path.dirname(os.path.realpath(__file__)) + '/status.json'

with open(file_path) as json_file:
	status = json.load(json_file)

# setup GPIO for servo
wiringpi.wiringPiSetupGpio()
wiringpi.pinMode(18, wiringpi.GPIO.PWM_OUTPUT)
wiringpi.pwmSetMode(wiringpi.GPIO.PWM_MODE_MS)
wiringpi.pwmSetClock(192)
wiringpi.pwmSetRange(2000)

server_socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)

port = 1
server_socket.bind(("", port))
server_socket.listen(1)

client_socket, address = server_socket.accept()
print "Accepted connection from ", address

client_socket.send(status['lock_status'])

def lock():
	wiringpi.pwmWrite(18, 75)

def unlock():
	wiringpi.pwmWrite(18, 225)

while True:
	data = client_socket.recv(1024)

	print "Received: %s" % data

	if(data == "lock"):
		lock()
		status['lock_status'] = 'locked'

	if(data == "unlock"):
		unlock()
		status['lock_status'] = 'unlocked'

	if(data == "exit"):
		break

	with open(file_path, 'w') as outfile:  
		json.dump(status, outfile)

client_socket.close()
server_socket.close()
