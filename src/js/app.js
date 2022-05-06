App = {
  web3Provider: null,
  contracts: {},

  init: async function (adopters) {
    console.log(adopters);

    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");
      var inventoryRow = $("#inventoryRow");
      web3.eth.getAccounts(function (err, accounts) {
        var account = accounts[0];

        for (i = 0; i < data.length; i++) {
          if (parseInt(adopters[i]) === 0) {
            petTemplate.find(".panel-title").text(data[i].name);
            petTemplate.find("img").attr("src", data[i].picture);
            petTemplate.find(".pet-breed").text(data[i].breed);
            petTemplate.find(".pet-age").text(data[i].age);
            petTemplate.find(".pet-location").text(data[i].location);
            petTemplate
              .find(".btn")
              .attr("data-id", data[i].id)
              .removeClass("btn-remove")
              .addClass("btn-adopt")
              .text("Adopt")
              .attr("disabled", false)
              .attr("id", data[i].id);

            petsRow.append(petTemplate.html());
          } else if (String(adopters[i]) === String(account)) {
            petTemplate.find(".panel-title").text(data[i].name);
            petTemplate.find("img").attr("src", data[i].picture);
            petTemplate.find(".pet-breed").text(data[i].breed);
            petTemplate.find(".pet-age").text(data[i].age);
            petTemplate.find(".pet-location").text(data[i].location);
            petTemplate
              .find(".btn")
              .attr("data-id", data[i].id)
              .removeClass("btn-adopt")
              .addClass("btn-remove")
              .text("Remove")
              .attr("disabled", false)
              .attr("id", data[i].id);

            inventoryRow.append(petTemplate.html());
          }
        }
      });
    });
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Adoption.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
    $(document).on("click", ".btn-remove", App.handleRemove);
  },

  markAdopted: function () {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        App.init(adopters);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handleAdopt: function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data("id"));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance
            .adopt(petId, { from: account, gas: 50000 })
            .then(function (result) {
              console.log(result);
            });
        })
        .then(function (result) {
          location.reload();
          console.log(result);
          //console.log("pass");
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  handleRemove: function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data("id"));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance
            .remove(petId, { from: account, gas: 50000 })
            .then(function (result) {
              console.log(result);
            });
        })
        .then(function (result) {
          location.reload();
          console.log(result);
          //console.log("pass");
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.initWeb3();
  });
});
