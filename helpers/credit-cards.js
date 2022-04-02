import creditCards from '../credit-cards.js';

const getCardDetailsByFriendlyName = (friendlyName) => {
  return creditCards.find((card) => card.friendlyName === friendlyName);
};

export default getCardDetailsByFriendlyName;
