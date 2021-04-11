# SneakerBot

This bot uses Node.js and Puppeteer to automate the checkout on various sneaker websites. It currently works on:

1. Footsites (footlocker.com, footaction.com, eastbay.com, champssports.com)
2. Shopify sites (e.g. BdgaStore, Concepts, Kith, etc.)
3. Demandware sites (e.g. Adidas)
4. Nike.com
5. Supreme

## Prerequisites

Install the following on your machine:

1. [Node.js](https://nodejs.org/en/download/) (comes with npm)
2. [PostgreSQL](https://www.postgresql.org/download/)

## Set up PostgreSQL

View the [documentation](https://www.postgresql.org/docs/9.0/sql-createdatabase.html) for creating a user and database.

## Configure environment variables

Make a copy of the `.env.example` file, replacing `example` with the name of your `NODE_ENV` e.g. `local` or `development`.

When you're ready, declare the environment name with:

`$ export NODE_ENV=local`

## Optional: Configure credit cards

The `.env` file that you configure is set up for a single credit card.

However, if you want to specify multiple credit cards, populate `credit-cards.json` using the example from `credit-cards-example.json`.

If you prefer not to use this method, you can simply leave this JSON file as-is.

When starting a task, you can optionally specify the card you want to use via its `friendlyName`, otherwise the card from the `.env` file will be used.

## Install the dependencies

`$ npm install`

## Run the DB migrations

`$ knex migrate:latest`

## Run the DB seeders

`$ knex seed:run`

## Start the server

Tasks run parallelly using [puppeteer-cluster](https://github.com/thomasdondorf/puppeteer-cluster).

Before starting up the server, define the number of concurrent tasks you plan to run:

`$ export PARALLEL_TASKS=5`

If you do not define this variable, it will default to `1`.

You can of course run more tasks, but they will be queued to run in a first-in, first-out (FIFO) manner.

Keep in mind that tasks that do not result in `checkoutComplete` will remain idle (not terminate) so that you can open the browser and view the error(s).

If a task encounters a captcha that must be manually solved, it will also remain idle and await completion.

Each task uses its own browser, so it's also important to keep in mind the CPU constraints of your machine.

When you're ready, start the server with:

`$ npm start`

## Optional: Using Docker / Docker Compose

This may be particularly useful for Linux users who have reported issues with Puppeteer and Chromium.

You will need to have [Docker Compose](https://docs.docker.com/compose/install/) and/or [Docker](https://docs.docker.com/get-docker/) installed to use this.

A Docker image is available for the server code [here](https://hub.docker.com/repository/docker/samc621/sneakerbot).

This Docker image is built from `node:12` and uses [xvfb](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml) with [x11vnc](https://github.com/LibVNC/x11vnc) to provide access to a GUI.

You can use [vncviewer](https://www.realvnc.com/en/connect/download/viewer/) to connect to the VNC server running in the container.

You may also opt to run Postgres via Docker, in which case you can make use of the `docker-compose.yml` file. Simply run:

`$ docker-compose build`

`$ docker-compose up`

## API

For each API, view the docs and try the requests in Postman.

- [Addresses](https://documenter.getpostman.com/view/5027621/TVt2c3ef)
- [Proxies](https://documenter.getpostman.com/view/5027621/TVt2c3ee)
- [Tasks](https://documenter.getpostman.com/view/5027621/TVt2c3ed)

## Starting a Task

You may start a task via `POST /v1/tasks/:id/start` or use the `start-task.js` script like:

`$ TASK_ID=<TASK_ID> CARD_FRIENDLY_NAME=<CARD_FRIENDLY_NAME> node ./scripts/start-task.js`

## Captcha Solving

This bot enables manual and automatic (via [2Captcha](https://2captcha.com)) solving of captchas.

When creating a task, you can specify `auto_solve_captcha` (Boolean), however, this parameter is optional and defaults to `true`.

You must sign up for and fund a 2Captcha account, and then add your `API_KEY_2CAPTCHA` to the .env file in order to auto-solve captchas.

For manually-solving captchas, you will be given a 5-minute timeout after the email notification to check the browser and solve the captcha.

## Motivation

As a teenager, I operated sneakerbots.us, where I sold sneakerbots like this in addition to early links and ATC services.

Fastforward several years, I decided to upgrade this all-in-one bot from Java + Selenium to Node.js + Puppeteer, which I enjoy more for bot projects.

I am open sourcing this repo now, since I no longer operate the business, but also because I am of the opinion that this software can rival any of the others out there that sell for hundreds of dollars.

Feel free to open a Pull Request to contribute to this proejct and help make it better! I will continue to support more websites and add more features as I can.

Also feel free to open an Issue or contact me via Telegram @samc621 if you have any trouble.

If you appreciate this, consider [buying me a coffee](https://www.buymeacoffee.com/samc621).
