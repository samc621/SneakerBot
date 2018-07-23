var sc = document.createElement("script");
sc.setAttribute("src", "footlocker.js");
sc.setAttribute("type", "text/javascript");
document.addEventListener("DOMContentLoaded", function() {
  var sizeButton = document.getElementById("sizeButton");
  sizeButton.onclick = function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        file: "footlocker.js"
      });
    });
  };
});
