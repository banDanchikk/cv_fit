from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from mySQL_connect import mycursor, mydb
from pydantic import BaseModel
from datetime import datetime, timedelta
import bcrypt
import jwt

SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()

class RegisterData(BaseModel):
    username: str
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

def create_token(user_id: int, username: str):
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register(data: RegisterData):
    mycursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
    if mycursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already in use")

    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    mycursor.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        (data.username, data.email, password_hash)
    )
    mydb.commit()
    user_id = mycursor.lastrowid

    token = create_token(user_id, data.username)
    return {"token": token, "user_id": user_id, "username": data.username}

@router.post("/login")
def login(data: LoginData):
    mycursor.execute(
        "SELECT id, username, password_hash FROM users WHERE email = %s",
        (data.email,)
    )
    row = mycursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, username, password_hash = row

    if not bcrypt.checkpw(data.password.encode(), password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user_id, username)
    return {"token": token, "user_id": user_id, "username": username}

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    mycursor.execute(
        "SELECT id, username, email FROM users WHERE id = %s",
        (user["user_id"],)
    )
    row = mycursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    cols = [c[0] for c in mycursor.description]
    return dict(zip(cols, row))