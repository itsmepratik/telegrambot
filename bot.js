const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const xml2js = require('xml2js');

// Replace YOUR_BOT_TOKEN with your actual bot token
const bot = new TelegramBot('5972206479:AAHLrLS0IFayfq1gDOZ2mOSkTPWzk3VQ3tk', {polling: true});

// Replace YOUR_WEATHERSTACK_API_KEY with your actual Weatherstack API key
const weatherstackApiKey = 'b71bd7844a6f624b979840144bfa1369';

// Function to send the top news stories from Google News to the specified chat
function sendGoogleNews(chatId) {
  request('https://news.google.com/rss', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Parse the XML data
      xml2js.parseString(body, function (err, result) {
        // Extract the title and link of the news items
        const items = result.rss.channel[0].item;
        const numItems = Math.min(items.length, 10); // Send a maximum of 10 items

        // Send the news items to the chat
        bot.sendMessage(chatId, 'Here are the top news stories from Google News:');
        for (let i = 0; i < numItems; i++) {
          const item = items[i];
          const title = item.title[0];
          const link = item.link[0];
          bot.sendMessage(chatId, `${i + 1}. ${title}\n${link}`);
        }
      });
    }
  });
}

// Handle the /news command
bot.onText(/\/news/, (msg, match) => {
  // Send the Google News to the chat
  sendGoogleNews(msg.chat.id);
});

// Handle the /weather command
bot.onText(/\/weather/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];

  // Make a request to the Weatherstack API to get the current weather for the specified city
  request(`http://api.weatherstack.com/current?access_key=${weatherstackApiKey}&query=${city}`, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      const location = data.location;
      const current = data.current;
      const temperature = current.temperature;
      const weatherStatus = current.weather_descriptions[0];

      // Send a message to the user with the weather information in the specified format
      bot.sendMessage(chatId, `🌆 City: ${location.name}
-
🌡 Temperature: ${temperature}°
-
❓ Weather status: ${(weatherStatus.toLowerCase().includes('clear') === true && '☀️') ||
(weatherStatus.toLowerCase().includes('sunny') === true && '☀️') ||
(weatherStatus.toLowerCase().includes('cloud') === true && '☁️') ||
(weatherStatus.toLowerCase().includes('overcast') === true && '☁️') ||
(weatherStatus.toLowerCase().includes('rain') === true && '🌧') ||
(weatherStatus.toLowerCase().includes('snow') === true && '❄️')} ${weatherStatus}`);
    } else {
      // An error occurred, so send a message to the user
      bot.sendMessage(chatId, 'Sorry, I was unable to get the weather information for that city.');
    }
  });
});

