// Projection for the base map imagini/reale/europa-relief-laea.jpg
// ("Europe relief laea location map.jpg", Alexrk2, Wikimedia Commons, CC BY-SA 3.0).
// The formulas are the ones Wikipedia uses to place points on this exact image
// (Module:Location map/data/Europe): Lambert azimuthal equal-area centred on
// 52°N 10°E, giving x/y as a percentage of the image width/height.
const W = 1580, H = 1351;
const rad = d => d * Math.PI / 180;

function proj(lat, lon){
  const p = rad(lat), l = rad(lon - 10), p0 = rad(52);
  const k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
  const xPct = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
  const yPct = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
  return [xPct / 100 * W, yPct / 100 * H];
}

const r1 = v => Math.round(v * 10) / 10;

// Smooth path through [lat, lon] waypoints (Catmull-Rom converted to cubic Béziers).
function path(points, map){
  const P = points.map(([la, lo]) => map ? map(proj(la, lo)) : proj(la, lo));
  let d = 'M' + r1(P[0][0]) + ',' + r1(P[0][1]);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + r1(c1[0]) + ',' + r1(c1[1]) + ' ' + r1(c2[0]) + ',' + r1(c2[1]) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
  }
  return d;
}

// Closed smooth polygon.
function polygon(points, map){
  const P = points.map(([la, lo]) => map ? map(proj(la, lo)) : proj(la, lo));
  const n = P.length;
  let d = 'M' + r1(P[0][0]) + ',' + r1(P[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + r1(c1[0]) + ',' + r1(c1[1]) + ' ' + r1(c2[0]) + ',' + r1(c2[1]) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
  }
  return d + ' Z';
}

module.exports = { W, H, proj, path, polygon, r1 };
