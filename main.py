from fastapi import FastAPI
from pydantic import BaseModel
from pydantic import BaseModel, conint

app = FastAPI()

class SFeedback(BaseModel):
    name: str
    email: str
    msg: str

@app.get('/feedback'. response_model=SFeedback)
async get_feedback(feedback_data: SFeedback=Form(...)):
    return feedback_data

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)