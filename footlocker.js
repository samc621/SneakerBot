//Set desired size
var sizeWanted = "10.0";

//Set billing details
var billCountry = "United States";
var billFirstName = "Samuel";
var billLastName = "Corso";
var billStreet1 = "106 Fulton Street #6G";
var billStreet2 = "";
var billZipcode = "10038";
var billCity = "New York";
var billState = "New York";
var billPhone = "3473082597";
var billEmail = "samcorso10@gmail.com";

//Set shipping details
var shipCountry = "United States";
var shipFirstName = "Samuel";
var shipLastName = "Corso";
var shipStreet1 = "106 Fulton Street #6G";
var shipStreet2 = "";
var shipZipcode = "10038";
var shipCity = "New York";
var shipState = "New York";
var shipPhone = "3473082597";

//Set expedited shipping
var expeditedShipping = false;

//Set payment details
var giftCard = false;
var cardNumber = "1234 5678 9012 3456";
var cardExpireDateMM = "01";
var cardExpireDateYY = "19";
var cardCCV = "123";

function selectSize() {
  var sizesAvailable = document.getElementsByTagName("a");

  for (var i = 0; i < sizesAvailable.length; i++) {
    if (sizesAvailable[i].innerHTML == sizeWanted) {
      sizesAvailable[i].click();
    }
  }

  addToCart();
}

function addToCart() {
  document.getElementById("pdp_addtocart_button").click();
  navigateToCart();
}

function navigateToCart() {
  document.getElementById("header_cart_button").click();
  //navigateToCheckout();
}

function navigateToCheckout() {
  document.getElementById("cart_checkout_button").click();
}

function fillBillingDetails() {
  var billCountries = document
    .getElementById("billCountry")
    .getElementsByTagName("option");
  for (var i = 0; i < billCountries.length; i++) {
    if (billCountries[i].innerHTML === billCountry) {
      document.getElementById("billCountry").selectedIndex = i;
    }
  }
  document.getElementById("billFirstName").value = billFirstName;
  document.getElementById("billLastName").value = billLastName;
  document.getElementById("billAddress1").value = billStreet1;
  document.getElementById("billAddress2").value = billStreet2;
  document.getElementById("billPostalCode").value = billZipcode;
  document.getElementById("billCity").value = billCity;
  var billStates = document
    .getElementById("billState")
    .getElementsByTagName("option");
  for (var i = 0; i < billStates.length; i++) {
    if (billStates[i].innerHTML === billState) {
      document.getElementById("billState").selectedIndex = i;
    }
  }
  document.getElementById("billHomePhone").value = billPhone;
  document.getElementById("billEmailAddress").value = billEmail;
}

function fillShippingDetails() {
  if (shipFirstName.length > 1) {
    document.getElementById("billPaneShipToBillingAddress").click();

    var shipCountries = document
      .getElementById("shipCountry")
      .getElementsByTagName("option");
    for (var i = 0; i < shipCountries.length; i++) {
      if (shipCountries[i].innerHTML === shipCountry) {
        document.getElementById("shipCountry").selectedIndex = i;
      }
    }
    document.getElementById("shipFirstName").value = shipFirstName;
    document.getElementById("shipLastName").value = shipLastName;
    document.getElementById("shipAddress1").value = shipStreet1;
    document.getElementById("shipAddress2").value = shipStreet2;
    document.getElementById("shipPostalCode").value = shipZipcode;
    document.getElementById("shipCity").value = shipCity;
    var shipStates = document
      .getElementById("shipState")
      .getElementsByTagName("option");
    for (var i = 0; i < shipStates.length; i++) {
      if (shipStates[i].innerHTML === shipState) {
        document.getElementById("shipState").selectedIndex = i;
      }
    }
    document.getElementById("shipHomePhone").value = shipPhone;

    document.getElementById("shipPaneContinue").click();
  } else {
    document.getElementById("billPaneContinue").click();
  }
}

function selectShipping() {
  if (expeditedShipping === false) {
    document.getElementById("shipMethodPaneContinue").click();
  }
}

function fillPaymentDetails() {
  document.getElementById("promoCodePaneContinue").click();
  if (giftCard === false) {
    document.getElementById("CardNumber").value = cardNumber;
    document.getElementById("CardExpireDateMM").value = cardExpireDateMM;
    document.getElementById("CardExpireDateYY").value = cardExpireDateYY;
    document.getElementById("CardCCV").value = cardCCV;

    document.getElementById("payMethodPaneContinue").click();
  }
}

selectSize();

//Check that cart is empty
if (document.getElementById("header_cart_count").innerHTML == "0") {
  selectSize();
}
