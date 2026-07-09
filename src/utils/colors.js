// Choix de la couleur de texte (blanc/sombre) selon la luminance d'un fond,
// pour rester lisible quelle que soit l'intensité de la couleur de fond
// (badges de type de compte, carte choroplèthe par région...).

export function getTextColorForBackground(color) {
  var r, g, b;
  var rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color);
  if (rgbMatch) {
    r = parseInt(rgbMatch[1], 10); g = parseInt(rgbMatch[2], 10); b = parseInt(rgbMatch[3], 10);
  } else if (color && color.charAt(0) === '#') {
    r = parseInt(color.slice(1, 3), 16); g = parseInt(color.slice(3, 5), 16); b = parseInt(color.slice(5, 7), 16);
  } else {
    return '#1a1a1a';
  }
  var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.6 ? '#FFFFFF' : '#1a1a1a';
}
