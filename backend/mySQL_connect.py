import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="3Hi59mt1",
  database="cvfit"
)

mycursor = mydb.cursor()

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="3Hi59mt1",
        database="cvfit",
        autocommit=True
    )