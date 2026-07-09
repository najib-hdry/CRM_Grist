// Squelette DOM minimal requis par l'IIFE d'init de src/app.js (isInsideGrist() est
// toujours faux sous jsdom, donc c'est la branche "not-in-grist" qui s'exécute à
// l'import — sans ces éléments, `document.getElementById(...).classList` lève).
document.body.innerHTML = `
  <div id="not-in-grist" class="hidden"></div>
  <div id="main-content"></div>
  <div id="toast-container"></div>
  <div id="modal-container" class="hidden"></div>
`;

// jsdom n'implémente pas ces deux méthodes (export CSV / export de données contact RGPD).
if (!URL.createObjectURL) URL.createObjectURL = function() { return 'blob:mock'; };
if (!URL.revokeObjectURL) URL.revokeObjectURL = function() {};
