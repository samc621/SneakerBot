# SneakerBot

This bot uses Node.js and Puppeteer to automate the checkout on various sneaker websites. It currently works on the Footsites (footlocker.com, footaction.com, eastbay.com, champssports.com), Nike.com, and all Shopify sites (e.g. BdgaStore, Concepts, Kith, etc.).

## Configure environment variables

Make a copy of the `.env.example` file, replacing `example` with the name of your `NODE_ENV` e.g. `local` or `development`.

Declare the environment name with:

`$ export NODE_ENV=local`

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

If a task encounters a captcha (usually only on the footsites), it will auto-retry after you manually complete it.

Each task uses its own browser, so it's also important to keep in mind the CPU constraints of your machine.

When you're ready, start the server with:

`$ npm start`

## API

For each API, view the docs and try the requests in Postman.

- [Addresses](https://documenter.getpostman.com/view/5027621/TVt2c3ef)
- [Proxies](https://documenter.getpostman.com/view/5027621/TVt2c3ee)
- [Tasks](https://documenter.getpostman.com/view/5027621/TVt2c3ed)

## Captcha Solving

This bot enables manual and automatic (via [2Captcha](https://2captcha.com)) solving of captchas.

When creating a task, you can specify `auto_solve_captcha` (Boolean), however, this parameter is optional and defaults to true.

You must sign up for and fund a 2Captcha account, and then add your `API_KEY_2CAPTCHA` to the .env file in order to auto-solve captchas.

For manually-solving captchas, you will be given a 5-minute timeout after the email notification to check the browser and solve the captcha.

WARNING: The auto-solved captcha submissions are not currently working on the footsites.
