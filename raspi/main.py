import gpio_control
from fastapi import FastAPI
# from pydantic import BaseModel

app = FastAPI()
gpio_control.setup()

@app.get("/")
async def root():
    return {
        "message": "Hello world"
    }

@app.get("/outlet/{outlet}/{state}")
async def toggle(outlet: int, state: str):
    curr_state = gpio_control.get_outlet_state(outlet)

    if state == "toggle":
        new_state = not curr_state
    else:
        if state == "0" or state == "false" or state == "off":
            new_state = False
        elif state == "1" or state == "true" or state == "on":
            new_state = True
        else:
            return {
                "success": False,
                "message": f"Unknown state: {state}"
            }

    if new_state != curr_state:
        gpio_control.set_outlet_state(outlet, new_state)

    return {
        "success": True,
        "outlet": outlet,
        "new_state": new_state
    }

# @app.post("/outlet/{outlet}")
# async def set_outlet_state(P):
