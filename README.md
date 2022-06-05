# Groot Bot

Discord BOT

[Invite it to your server](https://discord.com/api/oauth2/authorize?client_id=966233343291191306&permissions=137439243328&scope=bot)

## Required env vars

- **BOT_TOKEN**: Discord bot token
- **HEROKU_API_KEY**: API key for the deploying heroku account
- **HEROKU_APP_NAME**: Unique app name for deployment
- **HEROKU_EMAIL**: Email account associated with heroku account

## Running

`yarn start`

Alternatively, to test it will not fail on Heroku, install `heroku` cli and run:

`heroku local`

## Deploying

Every push to `main` will trigger a build and deploy to Heroku

# Shoutouts

Big shoutout to CowDAO, and https://github.com/alfetopito from whence this code was forked.
