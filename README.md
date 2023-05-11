## Movie App Project with NestJS

This is a Movie App project created with NestJS. It uses MySQL as a RDBMS and TypeORM as an ORM. For handling authentication, JWT and PassportJS are used. The project also uses Ethereal Email as an SMTP service for handling emails.This is a Movie App project created with NestJS. It uses MySQL as a RDBMS and TypeORM as an ORM. For handling authentication, JWT and PassportJS are used. The project also uses Ethereal Email as an SMTP service for handling emails.

## Getting Started

Before starting the app, create an .env file in your project folder and assign all environment variables. For an example, please refer to the env.txt file attached.

To install the project dependencies, open a terminal and navigate to the project directory. Run the following command:

```bash
$ npm install
```

After the installation is complete, start the development server by running the following command:

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run app on Container

you should first step create an .mysql.env file in your project folder and assign all environment variables. For an example, please refer to the mysql.env.txt file attached.

use command to run container:

```bash
$  docker-compose up -d
```

## Support

The project should now be running locally on your machine. Open a web browser and visit http://localhost:3000 to view the application.

Feel free to explore the Movie App and search for your favorite movies!

## Notice :

every time you create a user he will be assigned automatically to role :user
so the user with role "user" will not be able to access some rotes .
to create a user with role: "admin" you need to change the code in /src/typeorm/entities/User.ts
you need to remove this option in colomn role "{ default: 'user', insert: false, update: false }" .
