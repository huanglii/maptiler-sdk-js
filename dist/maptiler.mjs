import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

const config = {
  apiToken: "Not defined yet.",
  verbose: false
};

const defaults = {
  mapStyle: "streets",
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiURL: "https://api.maptiler.com/"
};

class LogoControl extends maplibre.LogoControl {
  constructor(options = {}) {
    var _a, _b;
    super(options);
    this.logoURL = "";
    this.linkURL = "";
    this.logoURL = (_a = options.logoURL) != null ? _a : defaults.maptilerLogoURL;
    this.linkURL = (_b = options.linkURL) != null ? _b : defaults.maptilerURL;
  }
  onAdd(map) {
    this._map = map;
    this._compact = this.options && this.options.compact;
    this._container = window.document.createElement("div");
    this._container.className = "maplibregl-ctrl";
    const anchor = window.document.createElement("a");
    anchor.style.backgroundRepeat = "no-repeat";
    anchor.style.cursor = "pointer";
    anchor.style.display = "block";
    anchor.style.height = "23px";
    anchor.style.margin = "0 0 -4px -4px";
    anchor.style.overflow = "hidden";
    anchor.style.width = "88px";
    anchor.style.backgroundImage = `url(${this.logoURL})`;
    anchor.style.backgroundSize = "100px 30px";
    anchor.style.width = "100px";
    anchor.style.height = "30px";
    anchor.target = "_blank";
    anchor.rel = "noopener nofollow";
    anchor.href = this.linkURL;
    anchor.setAttribute("aria-label", this._map._getUIString("LogoControl.Title"));
    anchor.setAttribute("rel", "noopener nofollow");
    this._container.appendChild(anchor);
    this._container.style.display = "block";
    this._map.on("resize", this._updateCompact);
    this._updateCompact();
    return this._container;
  }
}

function vlog(...args) {
  if (config.verbose) {
    console.log(...arguments);
  }
}
function expandMapStyle(style) {
  const trimmed = style.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  const match = maptilerDomainRegex.exec(trimmed);
  if (match) {
    return `https://api.maptiler.com/maps/${match[1]}/style.json`;
  }
  return `https://api.maptiler.com/maps/${trimmed}/style.json`;
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async$4 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Map extends maplibre.Map {
  constructor(options) {
    let style = expandMapStyle(defaults.mapStyle);
    if ("style" in options) {
      style = expandMapStyle(options.style);
    } else {
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }
    if (!style.includes("key=")) {
      style = `${style}?key=${config.apiToken}`;
    }
    super(__spreadProps(__spreadValues({}, options), { style, maplibreLogo: false }));
    this.attributionMustDisplay = false;
    this.attibutionLogoUrl = "";
    this.once("load", () => __async$4(this, null, function* () {
      let tileJsonURL = null;
      try {
        tileJsonURL = this.getSource("openmaptiles").url;
      } catch (e) {
        return;
      }
      const tileJsonRes = yield fetch(tileJsonURL);
      const tileJsonContent = yield tileJsonRes.json();
      if ("logo" in tileJsonContent && tileJsonContent.logo) {
        this.attributionMustDisplay = true;
        this.attibutionLogoUrl = tileJsonContent.logo;
        const logoURL = tileJsonContent.logo;
        this.addControl(new LogoControl({ logoURL }), options.logoPosition);
        if (!options.attributionControl) {
          this.addControl(new maplibre.AttributionControl());
        }
      } else if (options.maptilerLogo) {
        this.addControl(new LogoControl(), options.logoPosition);
      }
    }));
  }
}

class ServiceError extends Error {
  constructor(res, customMessage = "") {
    super(`Call to enpoint ${res.url} failed with the status code ${res.status}. ${customMessage}`);
    this.res = res;
  }
}

var __async$3 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const customMessages$3 = {
  400: "Query too long / Invalid parameters",
  403: "Key is missing, invalid or restricted"
};
function forward(_0) {
  return __async$3(this, arguments, function* (query, options = {}) {
    const endpoint = new URL(`geocoding/${encodeURIComponent(query)}.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    if ("bbox" in options) {
      endpoint.searchParams.set("bbox", [
        options.bbox.southWest.lng,
        options.bbox.southWest.lat,
        options.bbox.northEast.lng,
        options.bbox.northEast.lat
      ].join(","));
    }
    if ("proximity" in options) {
      endpoint.searchParams.set("proximity", [
        options.proximity.lng,
        options.proximity.lat
      ].join(","));
    }
    if ("language" in options) {
      const languages = (Array.isArray(options.language) ? options.language : [options.language]).join(",");
      endpoint.searchParams.set("language", languages);
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages$3 ? customMessages$3[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
function reverse(_0) {
  return __async$3(this, arguments, function* (lngLat, options = {}) {
    const endpoint = new URL(`geocoding/${lngLat.lng},${lngLat.lat}.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    if ("bbox" in options) {
      endpoint.searchParams.set("bbox", [
        options.bbox.southWest.lng,
        options.bbox.southWest.lat,
        options.bbox.northEast.lng,
        options.bbox.northEast.lat
      ].join(","));
    }
    if ("proximity" in options) {
      endpoint.searchParams.set("proximity", [
        options.proximity.lng,
        options.proximity.lat
      ].join(","));
    }
    if ("language" in options) {
      const languages = (Array.isArray(options.language) ? options.language : [options.language]).join(",");
      endpoint.searchParams.set("language", languages);
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages$3 ? customMessages$3[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
const geocoder = {
  forward,
  reverse
};

var __async$2 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const customMessages$2 = {
  403: "Key is missing, invalid or restricted"
};
function info() {
  return __async$2(this, null, function* () {
    const endpoint = new URL(`geolocation/ip.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages$2 ? customMessages$2[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
const geolocation = {
  info
};

var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const customMessages$1 = {
  403: "Key is missing, invalid or restricted"
};
function search(_0) {
  return __async$1(this, arguments, function* (query, options = {}) {
    const endpoint = new URL(`coordinates/search/${query}.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    if ("limit" in options) {
      endpoint.searchParams.set("limit", options.limit.toString());
    }
    if ("transformations" in options) {
      endpoint.searchParams.set("transformations", options.transformations.toString());
    }
    if ("exports" in options) {
      endpoint.searchParams.set("exports", options.exports.toString());
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages$1 ? customMessages$1[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
function transform(_0) {
  return __async$1(this, arguments, function* (coordinates2, options = {}) {
    const coordinatesStr = (Array.isArray(coordinates2) ? coordinates2 : [coordinates2]).map((coord) => `${coord.lng},${coord.lat}`).join(";");
    const endpoint = new URL(`coordinates/transform/${coordinatesStr}.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    if ("sourceCrs" in options) {
      endpoint.searchParams.set("s_srs", options.sourceCrs.toString());
    }
    if ("targetCrs" in options) {
      endpoint.searchParams.set("t_srs", options.targetCrs.toString());
    }
    if ("operations" in options) {
      endpoint.searchParams.set("ops", (Array.isArray(options.operations) ? options.operations : [options.operations]).join("|"));
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages$1 ? customMessages$1[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
const coordinates = {
  search,
  transform
};

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const customMessages = {
  403: "Key is missing, invalid or restricted"
};
function get(dataId) {
  return __async(this, null, function* () {
    const endpoint = new URL(`data/${encodeURIComponent(dataId)}/features.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiToken);
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(res, res.status in customMessages ? customMessages[res.status] : "");
    }
    const obj = yield res.json();
    return obj;
  });
}
const data = {
  get
};

function getSqSegDist(p, p1, p2) {
  let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    let t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}
function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance, index;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }
  if (maxSqDist > sqTolerance) {
    if (index - first > 1) {
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);
    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
}
function simplifyDouglasPeucker(points, sqTolerance) {
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}
function simplify(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }
  const sqTolerance = tolerance !== void 0 ? tolerance * tolerance : 1;
  const simplePoints = simplifyDouglasPeucker(points, sqTolerance);
  return simplePoints;
}

function staticMapMarkerToString(marker, includeColor = true) {
  let str = `${marker.lng},${marker.lat}`;
  if (marker.color && includeColor) {
    str += `,${marker.color}`;
  }
  return str;
}
function simplifyAndStringify(path, maxNbChar = 3e3) {
  let str = path.map((point) => point.join(",")).join("|");
  let tolerance = 5e-6;
  const toleranceStep = 1e-5;
  while (str.length > maxNbChar) {
    const simplerPath = simplify(path, tolerance);
    str = simplerPath.map((point) => `${point[0]},${point[1]}`).join("|");
    tolerance += toleranceStep;
  }
  return str;
}
function centered(center, zoom, options = {}) {
  var _a, _b, _c, _d, _e;
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  const width = ~~((_c = options.width) != null ? _c : 800);
  const height = ~~((_d = options.height) != null ? _d : 600);
  const endpoint = new URL(`maps/${encodeURIComponent(style)}/static/${center.lng},${center.lat},${zoom}/${width}x${height}${scale}.${format}`, defaults.maptilerApiURL);
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      pathStr += `width:${options.pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiToken);
  return endpoint.toString();
}
function bounded(boundingBox, options = {}) {
  var _a, _b, _c, _d, _e;
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  const width = ~~((_c = options.width) != null ? _c : 800);
  const height = ~~((_d = options.height) != null ? _d : 600);
  const endpoint = new URL(`maps/${encodeURIComponent(style)}/static/${boundingBox.southWest.lng},${boundingBox.southWest.lat},${boundingBox.northEast.lng},${boundingBox.northEast.lat}/${width}x${height}${scale}.${format}`, defaults.maptilerApiURL);
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      pathStr += `width:${options.pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiToken);
  return endpoint.toString();
}
function automatic(options = {}) {
  var _a, _b, _c, _d, _e;
  if (!("marker" in options) && !("path" in options)) {
    throw new Error("Automatic static maps require markers and/or path to be created.");
  }
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  const width = ~~((_c = options.width) != null ? _c : 800);
  const height = ~~((_d = options.height) != null ? _d : 600);
  const endpoint = new URL(`maps/${encodeURIComponent(style)}/static/auto/${width}x${height}${scale}.${format}`, defaults.maptilerApiURL);
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      pathStr += `width:${options.pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiToken);
  return endpoint.toString();
}
const staticMaps = {
  centered,
  bounded,
  automatic
};

export { Map, ServiceError, config, coordinates, data, geocoder, geolocation, staticMaps };
//# sourceMappingURL=maptiler.mjs.map
