// Petit helper DOM partagé par (presque) tous les modules : lit la valeur
// d'un champ de formulaire par son id, avec une valeur de repli si absent.
export function getVal(id, fallback) {
  var el = document.getElementById(id);
  return el ? el.value : fallback;
}
