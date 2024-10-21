import mysql.connector


#Create database connection with Django
dataBase = mysql.connector.connect(
    host = 'localhost',
    user = 'root',
    passwd = 'Lorgin2105*',
)

#middleware
cursorObject = dataBase.cursor()

# cursorObject.execute("CREATE DATABASE 3340database")
print("Hello data base 3340data")