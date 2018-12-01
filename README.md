# LHAtlas
An atlas application designed for LibreHealth. The app runs on NodeJS and MySQL. A demo can be found [here](https://lhatlas.herokuapp.com/).

### Setup
- Fork and Clone Repo
- Create A MySQL Database and use the following initiation code.
- Then open up .env file at the root of the repository and add the following information.
```
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASS=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
DB_PORT = 3306
DB_DIALECT = mysql || postgres
jwtSecret = YOUR_JWT_SECRET
issuer = YOUR_SITE_URL
```

- Finally, run `npm install` and `npm start` to start the atlas!

### OVERVIEW of API:

