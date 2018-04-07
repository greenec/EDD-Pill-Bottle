import bluetooth
import wiringpi

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

def spinLeft():
	wiringpi.pwmWrite(18, 75)

def spinRight():
	wiringpi.pwmWrite(18, 225)

while True:
	data = client_socket.recv(1024)

	print "Received: %s" % data

	if(data == "r"):
		spinRight()
	if(data == "l"):
		spinLeft()
	if(data == "q"):
		break

client_socket.close()
server_socket.close()
