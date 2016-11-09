var TelegramBot = require('node-telegram-bot-api');
var dotenv = require('dotenv');
var fs = require('fs');
var crawler = require('./lib/crawler.js');
var conf = require("./lib/data.json");

dotenv.load();

/**
* /add - adds a pizza
* /getMeThePizza - prints a list of pizzas
* /end - deletes the old list
*/

var token = process.env.TELEGRAM_TOKEN;

var bot = new TelegramBot(token, {polling: true});

pizzaArray = [];

bot.onText(/\/add (.+)/, function (msg, match) {
	var user = msg.from.id;
 	var resp = match[1];
  var username = msg.from.username || msg.from.first_name || msg.from.last_name;
	pizzaArray.push(
		{
			id : msg.from.id,
      chat_id: msg.chat.id,
			first_name: msg.from.first_name,
			last_name: msg.from.last_name,
			username: username,
			pizza: resp
		}
	);
	console.log(pizzaArray);
});

bot.onText(/\/pizza/, function(msg, match) {
	var chat = msg.chat.id;
	var result = "";
	if(typeof pizzaArray !== 'undefined' && pizzaArray.length > 0) {
		for(var i=0;i<pizzaArray.length;i++) {
      if(pizzaArray[i].chat_id == chat) {
        if((pizzaArray[i].first_name != undefined) && (pizzaArray[i].last_name != undefined)) {
          result += pizzaArray[i].first_name + " " + pizzaArray[i].last_name + ": ";
          result += pizzaArray[i].pizza + "\n";
        } else {
          result += pizzaArray[i].username + ": ";
          result += pizzaArray[i].pizza + "\n";
        }
      }
		}
	} else {
		result = "Es wurde noch keine Pizza bestellt ... :D";
	}
	bot.sendMessage(chat, result);
});

bot.onText(/\/del (.+)/, function(msg, match) {
	var chat = msg.chat.id;
	var username = match[1];

	var index = pizzaArray.findIndex(function(obj) {
		return obj.username == username;
	});

	if (index > -1) {
    if(pizzaArray.splice(index, 1)) {
			var result = "Die Pizza von " + username + " hab ich gelöscht"
		};
	};

	bot.sendMessage(chat, result);
});

bot.onText(/\/end/, function(msg, match) {
	var chat = msg.chat.id;

  var index = pizzaArray.findIndex(function(obj) {
		return obj.chat_id == chat;
	});

	if (index > -1) {
    if(pizzaArray.splice(index, 1)) {
			var result = true;
		};
	};
  
  if(result) {
	  bot.sendMessage(chat, "Sagt einfach bescheid, wenn ihr wieder was zum Essen wollt ;-)");
  } else {
    bot.sendMessage(chat, "Yep, ...da war ein Fehler");
  }
});

bot.onText(/\/help/, function(msg) {
	var chat = msg.chat.id;
	var resp = "Ich biete folgende Befehle an:\n\n";
	resp += "/help\t listet alle Befehle auf\n";
	resp += "/add [Name der Pizza]\t fügt der Liste eine Pizza hinzu\n";
	resp += "/del [Dein username]\t löscht deine aktuell bestellte Pizza\n";
	resp += "/pizza\t gibt eine Liste mit allen bestellten Pizzen aus\n";
	resp += "/end\t löscht die gesamte Liste\n";
  resp += "/padu|subway\t zeigt dir die Speisekarte des jeweiligen Restaurants\n";
	bot.sendMessage(chat, resp);
});


function readContent(name, callback) {
  fs.exists('./lib/out/'+name+'.json', function(exists) {
    if (exists) {
      fs.readFile('./lib/out/'+name+'.json', 'utf8', function(err, data) {
        if(err) return callback(err);
        data = JSON.parse(data);
        return callback(null, data.meals);    
      });
    } else {
      if(name != undefined) {
        data = conf.restaurants[name];
        var cr = crawler.crawl(
          data.url,
          data.restaurant_name,
          data.container,
          data.name,
          data.price
        );
      }
   }
  });
}

bot.onText(/\/padu/, function(msg) {
    chatId = msg.chat.id;

    keyboard = [];
    readContent('padu', function(err, data) {
      for(var i=0;i<data.length;i++) {
        keyboard.push(['/add ' + data[i].name + ': ' + data[i].price]);
      }
      var reply_markup = {
        "keyboard": keyboard, 
        "resize_keyboard": true
      };
      var opts = {
        "reply_markup": JSON.stringify(reply_markup)
      }
      bot.sendMessage(chatId, "Welches Gericht willst du?", opts);
    });
});

bot.onText(/\/subway/, function(msg) {
    chatId = msg.chat.id;

    keyboard = [];
    readContent('subway', function(err, data) {
      for(var i=0;i<data.length;i++) {
        keyboard.push(['/add ' + data[i].name + ': ' + data[i].price]);
      }
      var reply_markup = {
        "keyboard": keyboard, 
        "resize_keyboard": true
      };
      var opts = {
        "reply_markup": JSON.stringify(reply_markup)
      }
      bot.sendMessage(chatId, "Welches Gericht willst du?", opts);
    });
});

//test
