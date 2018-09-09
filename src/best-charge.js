const loadAllItems = require("./items")
const loadPromotions = require("./promotions")

function bestCharge(selectedItems) {
  const cartItems = selectedItems2CartItems(selectedItems);
  const bestProm = getBestProm(cartItems);
  return getBill(cartItems, bestProm);
}

function selectedItems2CartItems(selectedItems) {
  return selectedItems.map(selectedItem => {
    const id = selectedItem.substring(0, selectedItem.indexOf("x")).trim();
    const number = selectedItem.substring(selectedItem.indexOf("x") + 1).trim();
    const item = getItemById(id);
    return {
      id: id, name: item.name, number: number,
      totalPrice: item.price * number,
    }
  });
}

function getBestProm(cartItems) {
  let cartPrice = cartItems.reduce((acc, cur) => acc + cur.totalPrice, 0);
  let bestProm = {"type": null, "discount": 0, "count": cartPrice};
  loadPromotions().forEach(function (promotion) {
    var discount = 0;
    if (promotion.type === "指定菜品半价") {
      let discountItems = cartItems.filter(item => promotion.items.includes(item.id))
      discount = discountItems.reduce((acc, cur) => acc + cur.totalPrice / 2, 0);
      promotion.type += "(" + discountItems.map(item => item.name).join("，") + ")";
    }
    if (promotion.type === "满30减6元") {
      discount = Math.floor(cartPrice / 30) * 6;
    }
    if (discount > bestProm.discount) {
      bestProm = {"type": promotion.type, "discount": discount, "count": cartPrice - discount}
    }
  });
  return bestProm;
}

function getBill(cartItems, bestProm) {
  const header = "============= 订餐明细 =============\n";
  const delimiter = "-----------------------------------\n";
  const footer = "===================================\n";
  let bill = header;
  bill += cartItems.reduce((acc, cur) => acc + `${cur.name} x ${cur.number} = ${cur.totalPrice}元\n`, "");
  bill += delimiter;
  bill += bestProm.type ? `使用优惠:\n${bestProm.type}，省${bestProm.discount}元\n${delimiter}` : ""
  bill += `总计：${bestProm.count}元\n`;
  bill += footer;
  return bill;
}

function getItemById(id) {
  return loadAllItems().filter(item => item.id === id)[0];
}

module.exports = bestCharge;
