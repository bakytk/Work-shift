# Work shift

##### Task

Build a REST application from scratch that could serve as a work planning service

Business requirements:

    • A worker has shifts
    • A shift is 8 hours long
    • A worker never has two shifts on the same day
    • It is a 24 hour timetable 0-8, 8-16, 16-24

Preferably write a couple of units tests

##### Implementation

- There are two roles in this API: `admin` who can manage shifts & `workers` to whom these shifts are assigned
  1.  REGISTER: route accepts two params: `username-password`, returning `userId`, including for workers

- only `admin` can make following CRUD ops using `Bearer` token after `login`:

  1.  CREATE a shift, specifying worker `userId` and `timeString` in the format: `YYYY/MM/DD/0-8`, or `YYYY/M/D/8-16`;
  1.  UPDATE shift, specifying `shiftId` and `timeString`
  1.  GET shifts by urlencoded worker's `userId`
  1.  DELETE shift by urlencoded `shiftId`

- 'username' is constrained to be unique
- a separate function validates date, using `moment` library
- admin user authentication is via JWT Bearer tokens valid 30min
- collection of Postman requests  included in a separate repo for convenience as json file

##### Develop, test and build

```
# start Mongo database:
docker-compose up mongo_db

# from separate console tab & send curl commands
npm start

# from separate console
npm test

# run in docker
docker-compose up --build [-d]

# sample cURL commands

curl --location --request POST 'http://localhost:15500/register' \
--header 'Content-Type: application/json' \
--data-raw '
{"username": "work@outlook.com", "password": 1234, "role": "worker"}'

curl --location --request POST 'http://localhost:15500/login' \
--header 'Content-Type: application/json' \
--data-raw '
{"username": "bak@outlook.com", "password": 1234}'

curl --location --request POST 'http://localhost:15500/shift' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer myToken' \
--data-raw '
{"userId": "976411fb-045f-4c9a-b004-8ecd5f648d01", "timeString": "2023/10/4/8-16"}'

curl --location --request GET 'http://localhost:15500/shifts/976411fb-045f-4c9a-b004-8ecd5f648d01' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer myToken' \

curl --location --request PUT 'http://localhost:15500/shift' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer myToken' \
--data-raw '
{"shiftId": "2a509dca-e5d2-496f-972b-620e645ff507", "timeString": "2023/12/4/8-16"}'

curl --location --request DELETE 'http://localhost:15500/shift/21a66795-8800-40fd-8645-f1881a0c9fde' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer myToken' \
--data-raw '
```
