from fastapi import FastAPI, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Модель данных для обратной связи
class SFeedback(BaseModel):
    name: str
    email: str
    msg: str

# Эндпоинт для получения обратной связи
@app.post('/feedback')
async def get_feedback(
    name: str = Form(...),
    email: str = Form(...),
    msg: str = Form(...)
):
    # Здесь можно добавить сохранение в базу данных, отправку email и т.д.
    feedback_data = SFeedback(name=name, email=email, msg=msg)
    
    # Просто логируем полученные данные
    print(f"Получена новая обратная связь:")
    print(f"Имя: {name}")
    print(f"Email: {email}")
    print(f"Сообщение: {msg}")
    
    return feedback_data

# CORS middleware для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешает запросы с любого домена
    allow_credentials=True,
    allow_methods=["*"],  # Разрешает все HTTP методы
    allow_headers=["*"],  # Разрешает все заголовки
)

# Дополнительно можно добавить корневой эндпоинт
@app.get("/")
async def root():
    return {"message": "Feedback API is running"}

# Эндпоинт для проверки здоровья сервера
@app.get("/health")
async def health_check():
    return {"status": "healthy"}