const express = require('express');
const axios = require('axios');
const morgan = require("morgan");
const apicache = require("apicache");

require('dotenv').config();

const app = express();
const baserowAPIBaseUrl = 'https://api.baserow.io/api';
const apikey = process.env.API_URL;

// Middleware to handle JSON parsing
app.use(express.json());

// Middleware for caching
app.use(morgan('dev'));
let cache = apicache.middleware

  
//caching all routes for 5 minutes
app.use(cache('600 minutes'))

// Endpoint to retrieve data from baserow.io and publish it as JSON API
app.get('/', async (req, res) => {
  try {
    // Make a request to the baserow.io API to get the data
    const response = await axios.get(`https://api.baserow.io/api/database/rows/table/169912/?user_field_names=true&filter__field_1130032__boolean=true`, {
      headers: {
        Authorization: `Token ${apikey}`,
      },
    });

    //console.log(response.data.results);
    // Extract the relevant data from the response
    const data = response.data.results.map((row) => {
      let url = null;
      let image = null;
      if (row.useProxy === true) {
        url = 'https://login.libproxy.uregina.ca:8443/login?url=' + row.url
      } else {
        url = row.url
      }
      if (row.imageFile.length > 0) {
        image = row['imageFile'][0].thumbnails.card_cover.url
      } else {
        image = row.imageLink
      }

      return {
        name: row.name,
        description: row.description,
        url: url,
        image: image,
      };
    });

    // Send the data as a JSON response
    res.json(data);
  } catch (error) {
    // Handle errors
    console.error('Error retrieving data from baserow.io API:', error);
    res.status(500).json({ error: 'An error occurred while retrieving data.' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Running on port 5000');
});

// Export the Express API
module.exports = app;