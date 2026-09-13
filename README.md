# Digital Advocacy Studio

Digital Advocacy Studio helps users turn issues they care about into structured advocacy campaigns and propose practical solutions. Users can link their campaigns to the United Nations Sustainable Development Goals (SDGs). The app aims to guide users through creating an advocacy campaign in minutes. 

Users can generate an AI-assisted draft, edit and save a campaign, view its version history, and download campaign PDFs.

## Technology stack

- Frontend: React, TypeScript and Vite
- Backend: Java 21 and Spring Boot
- Database: MySQL
- Persistence: Spring Data JPA and Hibernate
- Containers: Docker Compose
- Frontend web server: Nginx

## Features

- Validated campaign creation and editing
- Saved campaign list and individual campaign views
- Automatic version history when campaigns are saved
- PDF downloads for current campaigns and saved versions
- Selection from the 17 Sustainable Development Goals
- AI-assisted campaign drafting

The AI review button was removed from the frontend in the second version of the app. The review endpoint remains available in the backend and is documented in the Postman collection. 

With guidance from my mentor, I initially developed the backend using PostgreSQL. After the containerisation class at the Coding Black Females bootcamp, I migrated the database to MySQL. The final application uses Java with Spring Boot and MySQL, as required by the assessment.

## Project planning

My project board documents the steps I took to build Digital Advocacy
Studio, including frontend development, backend development, database
configuration, containerisation, testing and documentation.

[View the project board](https://github.com/users/SuccessA-alt/projects/1)

## User stories

- As a campaign creator, I want help turning a concern into a structured draft so that I can develop an advocacy plan.
- As a campaign creator, I want to save and edit campaigns so that I can develop my ideas over time.
- As a campaign creator, I want to view earlier versions and download PDFs so that I can review and share my work.


## Requirements

Install the following before starting:

- Git
- Docker Desktop, running with Linux containers, or Docker Engine
  with Docker Compose
- Postman for testing the API

The Dockerfiles build the frontend and backend, so separate local installations of Java, Maven and Node.js are not required for this Docker setup.

Generating a new campaign draft through the frontend requires a valid AI provider API key. The reviewer must supply their own key and any required API credits.

## Get the project

```bash
git clone https://github.com/SuccessA-alt/digital-advocacy-studio.git
cd digital-advocacy-studio
```

Run the following setup commands from this project root—the folder
containing `docker-compose.yml`.

## Configure the environment

Copy `.env.example` to a new file named `.env` in the project root.

Edit `.env` and provide the required values:

| Variable | Purpose |
| --- | --- |
| MYSQL_DATABASE | Name of the application's MySQL database |
| MYSQL_USER | Application database username |
| MYSQL_PASSWORD | Password for the application database user |
| MYSQL_ROOT_PASSWORD | MySQL root password |
| OPENAI_API_KEY | Your own API key for AI features |
| OPENAI_MODEL | Optional model override; otherwise the Compose default is used |

Use a non-root application username and provide your own database
passwords.

Docker Compose supplies the backend's `DB_URL`, `DB_USERNAME` and
`DB_PASSWORD` automatically from its service configuration and the
`MYSQL_*` values.

The backend reads these settings from environment variables.

`.env.example` is a configuration template. Actual credentials belong
in `.env`, which is excluded by the project's Git ignore rules.

Without an AI key, campaigns can still be created directly through
the Postman `Create campaign` request using manually written content.

## Start the application

Ensure Docker is running, then execute:

```bash
docker compose up --build -d
```

The first build may take several minutes.

Check the containers:

```bash
docker compose ps
```

The stack contains:

- `mysql-db`: the MySQL database
- `backend`: the Spring Boot API
- `frontend`: the React application served by Nginx

The backend waits for the MySQL health check to pass before starting.
The services communicate over Docker Compose's default project network.

## Access the application

| Service | Address |
| --- | --- |
| React frontend | http://localhost:5173 |
| API base address | http://localhost:8080/api |
| Example API request | http://localhost:8080/api/sdgs |
| MySQL from the host computer | localhost:3307 |

Open the frontend address in a browser.

Inside Docker, the backend connects to MySQL using `mysql-db:3306`.
The frontend's Nginx server forwards `/api` requests to the backend.

`localhost` means the computer running the application. These addresses
become available after the reviewer starts the stack locally.

## Database structure

The application uses three main tables:

| Table | Primary key | Relationship |
| --- | --- | --- |
| sdgs | id | Referenced by campaigns |
| campaigns | id | Optional sdg_id references sdgs.id |
| campaign_versions | id | campaign_id references campaigns.id |

One SDG can be associated with multiple campaigns. One campaign can
have multiple saved versions.

Each version stores a snapshot of the campaign's content and selected
SDG details at the time it was saved. Its SDG snapshot fields preserve
those details; they are not a separate JPA relationship to the SDG table.

Hibernate creates or updates the mapped tables at application startup
using the configured `ddl-auto=update` setting.

MySQL data is stored in the Docker named volume `mysql_data`.

## Seed data and sample campaigns

`SdgDataLoader` automatically inserts the 17 Sustainable Development
Goals when the SDG table is empty.

No separate SQL import is required for these initial records.

Campaigns are not automatically seeded. To create a realistic sample
without using AI:

1. Import the Postman collection described below.
2. Open `Create campaign`.
3. Use the included example JSON body.
4. Send the request.
5. Copy the generated campaign `id` from the response.

The sample campaign concerns a safer pedestrian crossing. It can be
used to test viewing, editing, version history and PDF downloads.

Existing data on the developer's computer is not included in a fresh
clone of this repository.

## API documentation

Import this file into Postman:

`Digital Advocacy Studio API.postman_collection.json`

The collection documents all 13 backend endpoints, including:

- HTTP methods and URLs
- Path parameters
- Required and optional request fields
- Response formats and status codes
- Saved response examples for JSON endpoints
- PDF response details
- Instructions for testing with newly created records

In Postman, select Import and choose the collection JSON file.

Use the collection's requests individually and follow its overview
instructions.

## Suggested testing order

1. Retrieve all SDGs.
2. Create a campaign using the supplied example body.
3. Copy the newly generated campaign ID.
4. Retrieve the campaign by ID.
5. Update its title or another field.
6. Retrieve its saved versions.
7. Copy a version record's `id`.
8. Retrieve that individual version.
9. Download the current campaign PDF and version PDF.
10. Test AI drafting and review if an API key is configured.
11. Delete the test campaign last.
12. Retrieve the deleted campaign and check for a 404 response.

Replace the example campaign ID `26` and version record ID `9` with
IDs returned by your own requests.

A version record's `id` is different from its `versionNumber`.

Saved response examples show earlier results; their IDs may not exist
in a new database.

Also check that submitting invalid campaign data returns a descriptive
400 response and that the frontend displays validation messages.

## Troubleshooting

Check container status:

```bash
docker compose ps
```

Read backend and database logs:

```bash
docker compose logs backend mysql-db
```

If the application is unavailable, check that Docker is running and
ports 5173, 8080 and 3307 are available.

If AI generation fails, check the API key, configured model and provider
credit availability.

MySQL initialization variables are applied when its data directory is
first created. Changing a password in `.env` does not automatically
change an existing database user's password.

## Stop the application

```bash
docker compose down
```

This stops and removes the application's containers and network while
retaining the database's named volume.