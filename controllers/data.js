const request = require("request");
const cheerio = require("cheerio");

let flipkart_url =
  "https://www.flipkart.com/mobiles-accessories/mobiles/pr?sid=tyy%2C4io&otracker=categorytree&p%5B%5D=facets.brand%255B%255D%3DAPPLE";
// "https://www.flipkart.com/mobiles-accessories/mobiles/pr?sid=tyy,4io&otracker=categorytree";
const flipkart = (req, res) => {
  try {
    request({ method: "GET", url: flipkart_url }, (err, res, body) => {
      if (err) console.error(err);
      let $ = cheerio.load(body);
      $("div._1AtVbE > div._13oc-S").each(function (index, element) {
        // console.log(index);
        let name = $(element).find("div._4rR01T").text();
        let price = $(element).find("div._30jeq3").text();
        const obj = {
          name: name,
          price: price,
        };
        console.log(obj);
      });
    });
    res.send("success");
  } catch (err) {
    res.send("failure");
    console.log(err);
  }
};

let snapdeal_url =
  "https://www.snapdeal.com/search?keyword=tshirts&sort=rlvncy";
const snapdeal = (req, res) => {
  try {
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
    res.send("success");
  } catch (err) {
    res.send("failure");
    console.log(err);
  }
};

const flipkart_full = async (req, res) => {
  const arr = [];
  request({ method: "GET", url: flipkart_url }, (err, res, body) => {
    if (err) console.error(err);
    let $ = cheerio.load(body);
    $("div._1AtVbE > div._13oc-S").each(function (index) {
      let url = $(this).find("a._1fQZEK").attr("href");
      arr.push(url);
    });
    arr.map(function (url) {
      return parseData("https://www.flipkart.com" + url);
    });
  });
  res.send("success");
};

async function parseData(newUrl) {
  try {
    request({ method: "GET", url: newUrl }, (err, res, body) => {
      if (err) console.error(err);
      let $ = cheerio.load(body);
      let name = $("span.B_NuCI").text();
      let price = $("div._16Jk6d").text();
      let rating = $("div._2d4LTz").text();
      let ratingAndReview = $("span._2_R_DZ > span > span").text();
      let highlights = $("li._21Ahn-").text();
      let sellersCode = $("div._1RLviY > span > span").text();
      let sellersRating = $("div._1D-8OL").text();
      let obj = {
        name: name,
        price: price,
        rating: rating,
        ratingAndReview: ratingAndReview,
        highlights: highlights,
        sellersCode: sellersCode,
        sellersRating: sellersRating,
      };
      console.log(obj);
    });
  } catch (err) {
    res.send("failure");
    console.log(err);
  }
}

module.exports = { flipkart, snapdeal, flipkart_full };
