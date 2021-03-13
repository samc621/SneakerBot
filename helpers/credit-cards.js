const creditCards = require('../credit-cards.json');

exports.getCardDetailsByFriendlyName = (friendlyName) => {
  return creditCards && creditCards.find((card) => card.friendlyName === friendlyName);
};
