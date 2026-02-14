/* Osano CookieConsent */

window.addEventListener("load", function(){
  window.cookieconsent.initialise({
    palette: {
      popup: { background: "#000" },
      button: { background: "#f1d600" }
    },
    theme: "classic",
    type: "opt-in",
    content: {
      message: "We use cookies to improve your experience and analyse traffic.",
      allow: "Accept",
      deny: "Decline",
      link: "Privacy Policy",
      href: "/privacy/"
    },
    onInitialise: function (status) {
      if (this.hasConsented()) {
        loadGoogleAnalytics();
      }
    },
    onStatusChange: function(status, chosenBefore) {
      if (this.hasConsented()) {
        loadGoogleAnalytics();
      }
    }
  });
});
