### Demo Building

## Environments and DB

- create an `.env` file with `.env.example` files
- populate the correct DB value connection information into `.env` file
- if not using external DB, you can try to install docker and run `docker compose up` (with `-d` for background running)
- swagger for API is set up at http://url/docs (`https://localhost:8000/docs` if you're running the process at port 8000)

## Running node process

- install with `npm install`
- run with `npm run start:dev` for local dev / testing
- there're 4 APIs current running:
  - GET: `/buildings` for getting all buildings
  - POST: `/buildings` for creating a building
  - PUT: `/buildings/:id` for editing a building
  - DELETE: `/buildings/:id` for deleting a building
- also there's a init api at GET: `/init` for initing some buildings available before testing the apis
- i'm skipping the areas field on purpose for it's just a text field and no related to logic / coding
