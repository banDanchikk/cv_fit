


import mysql.connector
import os

config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "3Hi59mt1"),
    "database": os.getenv("DB_NAME", "cvfit"),
    "autocommit": False,
    "connection_timeout": 30
}

def get_db():
    return mysql.connector.connect(**config)

def get_cursor():
    global mydb, mycursor
    try:
        mydb.ping(reconnect=True, attempts=3, delay=1)
        mycursor = mydb.cursor()
    except Exception:
        mydb = mysql.connector.connect(**config)
        mycursor = mydb.cursor()
    return mycursor, mydb

mydb = mysql.connector.connect(**config)
mycursor = mydb.cursor()