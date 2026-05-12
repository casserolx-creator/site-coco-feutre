(function () {
  var places = {
    "boulangerie": {
      kicker: "Lieu gourmand",
      title: "La boulangerie de Fifi",
      text: "La boulangerie de Fifi rassemble la vitrine, le salon de the, le petit jardin et l'atelier ou le grand four a pain chauffe les fournees.",
      friends: "Fifi, Pinouille, Galipo, Gros Bidouille, Tipidou et les gourmands de passage.",
      image: "assets/boulangerie-exterieur.png",
      alt: "Exterieur colore de la boulangerie de Fifi"
    },
    "ville-foret": {
      kicker: "Grand centre",
      title: "La Ville-Foret",
      text: "La Ville-Foret est un centre joyeux ou l'on se promene, travaille, apprend et se retrouve les jours de marche.",
      friends: "Baba le Hibou, Mimi Souris, Mimolette, Tipidou, Canono, Colimacon, Fifi et Bernard l'Hermite.",
      image: "assets/ville-foret-plan.png",
      alt: "Plan detaille de la Ville-Foret"
    },
    "foret-pompon": {
      kicker: "Foret tendre",
      title: "La Foret Pompon",
      text: "Une foret profonde et douce, pleine de promenades, de feuilles, de pluie legere et de petits secrets bien caches.",
      friends: "Tortillon, Rififou et Gulo-Gulo.",
      image: "assets/rififou-fruits.png",
      alt: "Rififou court vers un panier de fruits"
    },
    "ferme": {
      kicker: "Lieu champetre",
      title: "La Ferme Foin-Foin",
      text: "Un lieu de champs, de basse-cour et de grandes scenes joyeuses, ou meme les pommes de terre semblent chanter.",
      friends: "Dindin, Petit Poussin, Maman Poule, Gros Matou, Bourrino, Bibu, Mirabelle et Gripolain.",
      image: "assets/ferme-patates.png",
      alt: "Fete a la Ferme Foin-Foin dans un champ"
    },
    "prairie": {
      kicker: "Monde des insectes",
      title: "La Prairie Fleurie",
      text: "Un monde de fleurs, de tiges, d'ailes multicolores et de petites scenes rigolotes au ras de l'herbe.",
      friends: "Papillou, Pipou, Nini, Pinouille et Galipo.",
      image: "assets/prairie-danse.png",
      alt: "Danse dans une prairie coloree"
    },
    "manoir": {
      kicker: "Lieu musical",
      title: "Le manoir Coco Feutre",
      text: "Dans le vieux grenier, entre caisses et tresors caches, Tricotine fait tourner les platines et reveille tout le manoir.",
      friends: "Tricotine, Filou et les invites de la salle de musique.",
      image: "assets/tricotine-dj.png",
      alt: "Tricotine aux platines dans une ambiance musicale"
    },
    "montagne": {
      kicker: "Exploration",
      title: "La Grande Montagne Bibi",
      text: "Dans sa cabane perdue, Tapotin prepare ses expeditions avec sa boussole, ses cartes et son gout des pierres precieuses.",
      friends: "Tapotin, le gros mammouth explorateur.",
      image: "assets/tapotin-montagne.png",
      alt: "Tapotin explore la Montagne Bibi dans une grotte"
    },
    "ocean": {
      kicker: "Royaume marin",
      title: "Le Royaume de l'Ocean",
      text: "Sous l'eau, Sacre Baleine veille sur la fabrique des bonbons Bouzous avec une bande marine tres attachante.",
      friends: "Petit Colin, Poulpossa, Crabouille, Sacre Baleine, Roupin et Bernard l'Hermite.",
      image: "assets/ocean-bisou.png",
      alt: "Poulpossa et Petit Colin dans le Royaume de l'Ocean"
    },
    "brousse": {
      kicker: "Aventure chaude",
      title: "La Brousse",
      text: "Un lieu chaud, colore et aventureux, parfait pour les trajets fous, les rencontres amicales et les grandes rigolades.",
      friends: "Badada, Tabouli, Pantatou, Zezula et Boulbou.",
      image: "assets/brousse-amis.png",
      alt: "Zezula, Pantatou et Boulbou dans la Brousse"
    }
  };

  var characters = [
    ["Pinouille", "mouton laineux blanc rigolo", "Prairie Fleurie"],
    ["Galipo", "petit daim aux petites cornes roses", "Prairie Fleurie"],
    ["Pikapito", "herisson au grand chapeau", "Ville-Foret"],
    ["Fifi", "gros lapin boulanger", "Boulangerie"],
    ["Zuzu", "petit extraterrestre bleu au chapeau de coccinelle", "Espace"],
    ["Bigoudet", "petit chien chatain touffu et bricoleur", "Riviere"],
    ["Gros Bidouille", "castor rigolo cuisinier", "Riviere"],
    ["Zouzaluche", "belle autruche", "Mare aux Samba"],
    ["Grenouilla", "danseuse de samba dans l'etang", "Mare aux Samba"],
    ["Fululu", "caribou touffu gentil qui aime faire la course", "Prairie"],
    ["Dindin", "petit dindonneau bleu taquin", "Ferme Foin-Foin"],
    ["Petit Poussin", "petit poussin de la basse-cour", "Ferme Foin-Foin"],
    ["Maman Poule", "maman de la basse-cour", "Ferme Foin-Foin"],
    ["Colimacon", "escargot geant professeur", "Ville-Foret"],
    ["Pinpin", "canard bleu-vert de la petite mare", "Mare"],
    ["Badada", "girafe volante", "Brousse"],
    ["Tabouli", "petit singe gentil qui aime les bananes", "Brousse"],
    ["Pantatou", "petite panthere noire gentille", "Brousse"],
    ["Zezula", "petite zebrelle curieuse", "Brousse"],
    ["Boulbou", "grand elephant beige un peu pataud", "Brousse"],
    ["Petit Colin", "poisson blanc", "Ocean"],
    ["Poulpossa", "pieuvre violette aux tentacules en coeur", "Ocean"],
    ["Crabouille", "gentil crabe rouge", "Ocean"],
    ["Sacre Baleine", "fabrique les bonbons Bouzous", "Ocean"],
    ["Roupin", "grand requin gentil", "Ocean"],
    ["Bernard l'Hermite", "vendeur de bidules au marche", "Ocean"],
    ["Baba le Hibou", "hibou bleu", "Ville-Foret"],
    ["Mimi Souris", "cultive des plantes a tisanes", "Ville-Foret"],
    ["Mimolette", "belette aux grosses lunettes bleues", "Ville-Foret"],
    ["Tipidou", "petit ecureuil a la sacoche verte", "Ville-Foret"],
    ["Canono", "petit caneton noir jardinier", "Ville-Foret"],
    ["Tortillon", "ver de terre en impermeable et chapeau bleu", "Foret Pompon"],
    ["Rififou", "sanglier fou-fou", "Foret Pompon"],
    ["Gulo-Gulo", "petit glouton gourmand", "Foret Pompon"],
    ["Gros Matou", "gros chat roux tigre au ventre blanc", "Ferme Foin-Foin"],
    ["Bourrino", "bouc blanc rigolo", "Ferme Foin-Foin"],
    ["Bibu", "lievre gris", "Ferme Foin-Foin"],
    ["Mirabelle", "petite vachette au chapeau fripe bleu", "Ferme Foin-Foin"],
    ["Gripolain", "petit poulain gris a taches noires", "Ferme Foin-Foin"],
    ["Papillou", "papillon bleu aux ailes multicolores", "Prairie Fleurie"],
    ["Pipou", "coccinelle coquine", "Prairie Fleurie"],
    ["Nini", "chenille rigolote", "Prairie Fleurie"],
    ["Tricotine", "fameuse araignee DJ", "Manoir"],
    ["Filou", "petit chien beige tres poilu", "Manoir"],
    ["Tapotin", "gros mammouth explorateur", "Montagne Bibi"]
  ];

  var colors = ["#ffd33d", "#ff4f9a", "#16a4ff", "#27b55c", "#ff8a1f", "#8b55e8", "#f02b24"];

  function $(selector) {
    return document.querySelector(selector);
  }

  function initCocoFeutre() {
    var placeTabs = document.querySelectorAll(".place-tab");
    var placeImage = $("#placeImage");
    var placeKicker = $("#placeKicker");
    var placeTitle = $("#placeTitle");
    var placeText = $("#placeText");
    var placeFriends = $("#placeFriends");
    var characterGrid = $("#characterGrid");
    var characterSearch = $("#characterSearch");
    var characterCount = $("#characterCount");
    var galleryItems = document.querySelectorAll(".gallery-item");
    var lightbox = $("#imageLightbox");
    var lightboxImage = $("#lightboxImage");
    var lightboxCaption = $("#lightboxCaption");
    var closeLightboxButton = $(".close-lightbox");
    var zoomButtons = document.querySelectorAll("[data-zoom]");
    var currentZoom = 1;
    var lastGalleryItem = null;

    function showPlace(placeId) {
      var place = places[placeId];
      var i;
      if (!place || !placeImage) return;

      for (i = 0; i < placeTabs.length; i += 1) {
        placeTabs[i].classList.toggle("is-active", placeTabs[i].getAttribute("data-place") === placeId);
      }

      placeImage.src = place.image;
      placeImage.alt = place.alt;
      placeKicker.textContent = place.kicker;
      placeTitle.textContent = place.title;
      placeText.textContent = place.text;
      placeFriends.textContent = place.friends;
    }

    function renderCharacters(query) {
      var normalizedQuery = (query || "").trim().toLowerCase();
      var html = "";
      var count = 0;
      var i;

      if (!characterGrid) return;

      for (i = 0; i < characters.length; i += 1) {
        var character = characters[i];
        var haystack = (character[0] + " " + character[1] + " " + character[2]).toLowerCase();
        var color = colors[count % colors.length];

        if (haystack.indexOf(normalizedQuery) !== -1) {
          html += '<article class="character-card" style="--card-color: ' + color + '">';
          html += '<span class="tag">' + character[2] + '</span>';
          html += '<h3>' + character[0] + '</h3>';
          html += '<p>' + character[1] + '</p>';
          html += '</article>';
          count += 1;
        }
      }

      characterGrid.innerHTML = html;
      if (characterCount) {
        characterCount.textContent = count + " ami" + (count > 1 ? "s" : "");
      }
    }

    function applyZoom() {
      var resetButton = document.querySelector('[data-zoom="reset"]');
      if (!lightboxImage) return;
      lightboxImage.style.setProperty("--zoom", currentZoom);
      if (resetButton) resetButton.textContent = Math.round(currentZoom * 100) + "%";
    }

    function openLightbox(item) {
      var image = item.querySelector("img");
      var caption = item.querySelector("figcaption");
      if (!image || !lightbox || !lightboxImage || !closeLightboxButton) return;

      lastGalleryItem = item;
      currentZoom = 1;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = caption ? caption.textContent : image.alt;
      }
      applyZoom();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeLightboxButton.focus();
    }

    function closeLightbox() {
      if (!lightbox || !lightboxImage) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");
      if (lastGalleryItem) lastGalleryItem.focus();
    }

    function changeZoom(action) {
      if (action === "reset") currentZoom = 1;
      if (action === "in") currentZoom = Math.min(currentZoom + 0.25, 3);
      if (action === "out") currentZoom = Math.max(currentZoom - 0.25, 0.5);
      applyZoom();
    }

    for (var i = 0; i < placeTabs.length; i += 1) {
      placeTabs[i].addEventListener("click", function () {
        showPlace(this.getAttribute("data-place"));
      });
    }

    if (characterSearch) {
      characterSearch.addEventListener("input", function () {
        renderCharacters(this.value);
      });
    }

    for (var j = 0; j < galleryItems.length; j += 1) {
      galleryItems[j].setAttribute("role", "button");
      galleryItems[j].setAttribute("tabindex", "0");
      galleryItems[j].addEventListener("click", function () {
        openLightbox(this);
      });
      galleryItems[j].addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(this);
        }
      });
    }

    for (var k = 0; k < zoomButtons.length; k += 1) {
      zoomButtons[k].addEventListener("click", function () {
        changeZoom(this.getAttribute("data-zoom"));
      });
    }

    if (lightbox) {
      lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) closeLightbox();
      });
      lightbox.addEventListener("wheel", function (event) {
        if (!lightbox.classList.contains("is-open")) return;
        event.preventDefault();
        changeZoom(event.deltaY < 0 ? "in" : "out");
      }, { passive: false });
    }

    if (closeLightboxButton) {
      closeLightboxButton.addEventListener("click", closeLightbox);
    }

    document.addEventListener("keydown", function (event) {
      if (!lightbox || !lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "+" || event.key === "=") changeZoom("in");
      if (event.key === "-") changeZoom("out");
      if (event.key === "0") changeZoom("reset");
    });

    renderCharacters("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCocoFeutre);
  } else {
    initCocoFeutre();
  }
}());
