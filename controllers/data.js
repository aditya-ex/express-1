const request = require("request");
const cheerio = require("cheerio");

let flipkart_url ="https://www.flipkart.com/mobiles/pr?sid=tyy%2C4io&p%5B%5D=facets.brand%255B%255D%3Drealme&p%5B%5D=facets.availability%255B%255D%3DExclude%2BOut%2Bof%2BStock&param=7564&otracker=clp_metro_expandable_1_3.metroExpandable.METRO_EXPANDABLE_Shop%2BNow_mobile-phones-store_Q1PDG4YW86MF_wp3&fm=neo%2Fmerchandising&iid=M_088d54e5-79b9-44dc-a610-c4c2846dfc2b_3.Q1PDG4YW86MF&ppt=browse&ppn=browse&ssid=6v31tf69o00000001632567335175";
  // "https://www.flipkart.com/mobiles-accessories/mobiles/pr?sid=tyy,4io&otracker=categorytree";
const flipkart = (req, res) => {
  request({ method: "GET", url: flipkart_url }, (err, res, body) => {
    if (err) console.error(err);
    let $ = cheerio.load(body);
    $("div._1AtVbE > div._13oc-S").each(function (index) {
      let name = $(this).find("div._4rR01T").text();
      let price = $(this).find("div._30jeq3").text();
      const obj = {
        name: name,
        price: price,
      };
      console.log(obj);
    });
  });
  res.send("fetched data from flipkart");
};

let snapdeal_url =
  "https://www.snapdeal.com/search?keyword=tshirts&sort=rlvncy";
const snapdeal = (req, res) => {
  request({ method: "GET", url: snapdeal_url }, (err, res, body) => {
    if (err) console.error(err);
    let $ = cheerio.load(body);
    $("div.favDp").each(function (index) {
      let name = $(this).find("p.product-title").text();
      let price = $(this).find("span.product-price").text();
      const obj = {
        name: name,
        price: price,
      };
      console.log(obj);
    });
  });
  res.send("fetched data from snapdeal");
};

const flipkart_full = async (req, res) => {
  const arr = [];
  request({ method: "GET", url: flipkart_url}, (err, res, body) => {
    if (err) console.error(err);
    let $ = cheerio.load(body);
    $("div._1AtVbE > div._13oc-S").each(function (index) {
      let url = $(this).find("a._1fQZEK").attr("href");
      arr.push(url);
    });
    console.log(arr);
  });
  res.send("fetched detailed data of flipkart");
};

module.exports = { flipkart, snapdeal, flipkart_full };
