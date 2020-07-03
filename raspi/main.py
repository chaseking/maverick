import gpio_control
from fastapi import FastAPI

app = FastAPI()
gpio_control.setup()

@app.get("/")
async def root():
    return {
        "message": "Hello world"
    }

@app.get("/toggle/{outlet}")
async def toggle(outlet: int):
    new_state = gpio_control.toggle_outlet_state(outlet)
    return {
        "outlet": outlet,
        "new_state": new_state
    }