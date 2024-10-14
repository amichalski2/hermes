from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to HermesScroll"}

@app.get("/notes")
async def get_notes():
    return {"notes": ["Sample note 1", "Sample note 2"]}