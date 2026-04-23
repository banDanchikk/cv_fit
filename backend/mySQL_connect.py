import mysql.connector

config = {
    "host": "localhost",
    "user": "root",
    "password": "3Hi59mt1",
    "database": "cvfit",
    "autocommit": False,
    "connection_timeout": 30
}

mydb = mysql.connector.connect(**config)
mycursor = mydb.cursor()

def get_cursor():
    global mydb, mycursor
    try:
        mydb.ping(reconnect=True, attempts=3, delay=1)
        mycursor = mydb.cursor()
    except Exception:
        mydb = mysql.connector.connect(**config)
        mycursor = mydb.cursor()
    return mycursor, mydb

def get_db():
    return mysql.connector.connect(**config)