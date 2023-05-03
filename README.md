# Personal Assets Tracker (PAT)

Personal Assets Tracker is an open-source back-end solution for tracking and calculating an individual's total net worth. It allows users to create profiles, add personal assets, and monitor their financial position. The application supports cryptocurrencies, stock market operations, and currency exchange rates, leveraging the CoinGecko API and ExchangeRate API for the latest data.

## Features

- User profile creation and management
- Support for multiple asset types (cryptocurrencies, stocks, and currencies)
- Real-time cryptocurrency data from the CoinGecko API
- Real-time currency exchange rates from the ExchangeRate API
- Stock market operations and monitoring (coming soon)

## Technologies

- Node.js
- Mongoose
- Express

## Getting Started

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

   
   git clone https://github.com/your_username/personal-assets-tracker.git
   cd personal-assets-tracker
   

2. Install the required dependencies:

   
   npm install
   

3. Create a .env file in the project root with the following variables:

   
   MONGODB_URI=mongodb://localhost:27017/personal_assets_tracker
   COINGECKO_API_BASE_URL=https://api.coingecko.com/api/v3
   EXCHANGERATE_API_BASE_URL=https://api.exchangerate-api.com/v4
   EXCHANGERATE_API_KEY=your_api_key_here
   

   Replace your_api_key_here with your actual API key from [ExchangeRate API](https://www.exchangerate-api.com/).

4. Start the development server:

   
   npm run dev
   

   The server should now be running on http://localhost:3000.

## Usage

Once the server is running, you can use the provided API endpoints for managing user profiles, personal assets, and fetching data from external APIs. Please refer to the API documentation for details on available endpoints and their usage.

## Contributing

We welcome contributions from the community! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin feature/your-feature)
5. Create a new pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
