const creditCards = require('../credit-cards.json');

exports.getCardDetailsByFriendlyName = (friendlyName) => {
  return creditCards.find((card) => card.friendlyName === friendlyName);
};
