import RPi.GPIO as GPIO
import time

OUTLET_TO_PIN = [7, 11, 12, 13, 15, 16, 18, 22, 25]

def setup():
    # So the parameters to GPIO methods correspond to Raspberry Pi pins
    # See pins here: https://www.raspberrypi.org/documentation/usage/gpio/
    GPIO.setmode(GPIO.BOARD);
    
    for pin in OUTLET_TO_PIN:
        print(f"Setting up {pin}")
        GPIO.setup(pin, GPIO.OUT)

def get_outlet_state(outlet):
    # TODO error handling (e.g. outlet not valid)
    return GPIO.input(OUTLET_TO_PIN[outlet])

def set_outlet_state(outlet, output):
    GPIO.output(OUTLET_TO_PIN[outlet], output)

def toggle_outlet_state(outlet):
    new_state = not get_outlet_state(outlet)
    set_outlet_state(outlet, new_state)
    return new_state