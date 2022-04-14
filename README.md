# SneakerBot

[![build, lint, test, deploy](https://github.com/samc621/SneakerBot/actions/workflows/build_lint_deploy.yml/badge.svg)](https://github.com/samc621/SneakerBot/actions/workflows/build_lint_deploy.yml)

This bot uses Node.js and Puppeteer to automate the checkout on various sneaker websites. It currently works on:

1. Footsites (footlocker.com, footaction.com, eastbay.com, champssports.com)
2. Shopify sites (e.g. BdgaStore, Concepts, Kith, etc.)
3. Demandware sites (e.g. Adidas)
4. Nike.com
5. Supreme

## About this project

This bot was made by developers, for developers. It is not a commercial product, it is a free and open source software. Thus, it may not be suitable for those with little or no software engineering experience.

The developers of this software should not be held liable for any lost opportunities resulting from its usage.

## Prerequisites

Install the following on your machine:

1. [Node.js](https://nodejs.org/en/download/) (comes with npm)
2. [PostgreSQL](https://www.postgresql.org/download/)

## Set up PostgreSQL

View the [documentation](https://www.postgresql.org/docs/9.0/sql-createdatabase.html) for creating a user and database.

## Configure environment variables

Make a copy of the `.env.example` file, replacing `example` with the name of your `NODE_ENV` e.g. `.env.local` or `.env.development`.

When you're ready, declare the environment name with:

### Linux/Mac

`$ export NODE_ENV=local`

### Windows

`$ set NODE_ENV=local`

### How to populate the .env file

1. `PORT` is the port that the Node/Express API server will run on, _defaults to 8080_. You can use any TCP/UDP port (0-65535) that is unused by another service e.g. Postgres on 5432.
2. `DB_USERNAME` and `DB_PASSWORD` is the username/password combo for the Postgres user you created (see documentation above for assistance).
3. `DB_NAME` is the name of the Postgres database you created.
4. `DB_PORT` and `DB_HOST` are the Postgres defaults, `5432` and `localhost`, respectively.
5. `EMAIL_HOST` and `EMAIL_PORT` are the SMTP details for your email provider e.g. `smtp.gmail.com` and `587`, respectively, for Gmail.
6. `EMAIL_USERNAME` and `EMAIL_PASSWORD` are your actual email credentials. We use the SMTP server to send email notifications about things like checkout errors or completions.
7. `CARD_NUMBER`, `NAME_ON_CARD`, `EXPIRATION_MONTH`, `EXPIRATION_YEAR`, and `SECURITY_CODE` are your actual credit/debit card details.
8. `API_KEY_2CAPTCHA` is your API key provided by `2Captcha` if you so desire to use their service. This can be left blank if not.

## Optional: Configure credit cards

The `.env` file that you configure is set up for a single credit card.

However, if you want to specify multiple credit cards, populate `credit-cards.js` using the example from `credit-cards-example.js`.

If you prefer not to use this method, you can simply leave this JS file as-is.

When starting a task, you can optionally specify the card you want to use via its `friendlyName`, otherwise the card from the `.env` file will be used.

## Install the dependencies

`$ npm install`

## Run the DB migrations

> You may need to include `npx` at the start of the commands

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

You will also need to make a copy of the `.env.example` file, replacing `example` with the name of your `NODE_ENV` e.g. `docker`.

A Docker image is available for the server code [here](https://hub.docker.com/repository/docker/samc621/sneakerbot). You can also build it yourself by running the following in the root directory:

`$ docker build -t sneakerbot .`

Then run it and specify the env file with:

`docker run -p 5900:5900 -p 8000:8000 --env NODE_ENV=docker --env-file .env.docker sneakerbot` (replace `8000` with whatever `PORT` you specified in `.env.docker`)

This Docker image is built from `node:12` and uses [xvfb](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml) with [x11vnc](https://github.com/LibVNC/x11vnc) to provide access to a GUI.

You can use [vncviewer](https://www.realvnc.com/en/connect/download/viewer/) to connect to the VNC server running in the container.

You may also opt to run Postgres via Docker, in which case you can make use of the `docker-compose.yml` file. Simply run the following in the root directory:

`$ docker-compose build`

`$ docker-compose up`

## API

This bot exposes a Node/Express API server for managing addresses, proxies, and tasks. I would eventually like to see a UI, which integrates these APIs, built.

For each API, view the docs and try the requests in Postman.

- [Addresses](https://documenter.getpostman.com/view/5027621/TVt2c3ef) - this is how you can pre-store billing and shipping addresses applied to tasks, and more specifically used at checkout time.
- [Proxies](https://documenter.getpostman.com/view/5027621/TVt2c3ee) - this is how you can pre-store proxies that the bot will use when launching a task. Proxies are rotated so that they are never reused. In the future, this bot may include an integration with a proxy service like [Bright Data (formerly Luminati)](https://brightdata.com/).
- [Tasks](https://documenter.getpostman.com/view/5027621/TVt2c3ed) - this is how you can pre-store, and then start checkout tasks.

### UPDATE (as of 05/30/2021)

You can now specify a `product_code` on tasks. You will still need to provide the `url` e.g. https://nike.com but can also provide a `product_code` e.g. "DA3130-100".

If a `product_code` is specified, the bot will iteratively search the desired site until there is a search result, click it, and then proceed as usual.

This will work with the `nike.com`, `footsites`, and `demandware` sites.

If using with adidas.com, be sure to include the full site path e.g. https://www.adidas.com/us.

Feel free to check the new [example](https://documenter.getpostman.com/view/5027621/TVt2c3ed#d55d7ad1-7126-4663-9fa1-fdc2220615d4) "with product code" under the POST /tasks API.

### UPDATE (as of 06/24/2021)

You can now specify a `WEBHOOK_ENDPOINT` in your `.env` file for receiving webhook events (over HTTP/HTTPS) about task status.

When a task is done processing, a `POST` request will be sent to the supplied URL with the following data:

```
{
    taskId: integer,
    checkoutComplete: true/false,
    message: Some text about the task status, the same message is sent via email
}
```

## Starting a Task

You may start a task via `POST /v1/tasks/:id/start` or use the `start-task.js` script like:

`$ TASK_ID=<TASK_ID> CARD_FRIENDLY_NAME=<CARD_FRIENDLY_NAME> node ./scripts/start-task.js`

## Stopping a Task

You may stop a task that has run too long via `POST /v1/tasks/:id/stop`

## Captcha Solving

This bot enables manual and automatic (via [2Captcha](https://2captcha.com)) solving of captchas.

When creating a task, you can specify `auto_solve_captcha` (Boolean), however, this parameter is optional and defaults to `true`.

You must sign up for and fund a 2Captcha account, and then add your `API_KEY_2CAPTCHA` to the .env file in order to auto-solve captchas.

For manually-solving captchas, you will be given a 5-minute timeout after the email notification to check the browser and solve the captcha.

## Motivation

As a teenager, I operated sneakerbots.us, where I sold sneakerbots like this in addition to early links and ATC services.

Fastforward several years, I decided to upgrade this all-in-one bot from Java + Selenium to Node.js + Puppeteer, which I enjoy more for bot projects.

I am open sourcing this repo now, since I no longer operate the business, but also because I am of the opinion that this software can rival many of its commercial competitors.

Feel free to open a Pull Request to contribute to this proejct and help make it better! I will continue to support more websites and add more features as I can.

Also feel free to open an Issue or contact me via Telegram @samc621 if you have any trouble.

If you appreciate this, consider [buying me a coffee](https://www.buymeacoffee.com/samc621).
