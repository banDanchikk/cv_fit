from fastapi import APIRouter
from mySQL_connect import mycursor

router = APIRouter(prefix="/auth", tags=["Auth"])

# @router.post("/register")
# def register():


# @router.post("/login")
# def login():
