var crawler = require("./crawler.js");
var conf = require("./data.json");


var name = 'padu';
data = conf.restaurants[name];
var cr = crawler.crawl(
  data.url,
  data.restaurant_name,
  data.container,
  data.name,
  data.price
);

name = 'subway';
data = conf.restaurants[name];
var cr = crawler.crawl(
  data.url,
  data.restaurant_name,
  data.container,
  data.name,
  data.price
);

