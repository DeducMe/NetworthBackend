# README for Networth app

## Overview
Networth is a back-end application that helps users calculate their total net worth by creating a user profile and adding their personal assets. It can also operate with cryptocurrencies and uses CoinGecko API for working with crypto and ExchangeRate API for currency exchange. The app uses Node.js with Mongoose and Express libraries, making it easy to deploy and scale.

## Installation
To install the Networth app, you will need to have Node.js and npm installed on your machine. After cloning the project from GitHub, navigate to the project directory in your terminal and run the following command to install the dependencies:

```
npm install
```

## Configuration
Before running the Networth app, you will need to set your environment variables in the `.env` file. The `SERVER_HOSTNAME` should be set to your server hostname, and the `SERVER_PORT` should be set to the port you want to use for the server.

Additionally, you will need to edit your API keys in the `config.ts` file.

## Usage
To start the Networth app, run the following command:

```
npm start
```

This will start the server and listen for requests at the port specified in your `.env` file.
