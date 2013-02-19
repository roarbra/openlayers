// FIXME handle geolocation not supported
// FIXME handle geolocation errors

goog.provide('ol.Geolocation');
goog.provide('ol.GeolocationProperty');

goog.require('goog.functions');
goog.require('goog.math');
goog.require('ol.Coordinate');
goog.require('ol.Object');
goog.require('ol.Projection');


/**
 * @enum {string}
 */
ol.GeolocationProperty = {
  ACCURACY: 'accuracy',
  ALTITUDE: 'altitude',
  ALTITUDE_ACCURACY: 'altitudeAccuracy',
  HEADING: 'heading',
  POSITION: 'position',
  PROJECTION: 'projection',
  SPEED: 'speed'
};



/**
 * @constructor
 * @extends {ol.Object}
 * @param {GeolocationPositionOptions=} opt_positionOptions PositionOptions.
 */
ol.Geolocation = function(opt_positionOptions) {

  goog.base(this);

  /**
   * The unprojected (EPSG:4326) device position.
   * @private
   * @type {ol.Coordinate}
   */
  this.position_ = null;

  if (ol.Geolocation.isSupported) {
    goog.events.listen(
        this, ol.Object.getChangedEventType(ol.GeolocationProperty.PROJECTION),
        this.handleProjectionChanged_, false, this);

    /**
     * @private
     * @type {number}
     */
    this.watchId_ = navigator.geolocation.watchPosition(
        goog.bind(this.positionChange_, this),
        goog.bind(this.positionError_, this),
        opt_positionOptions);
  }
};
goog.inherits(ol.Geolocation, ol.Object);


/**
 * @inheritDoc
 */
ol.Geolocation.prototype.disposeInternal = function() {
  navigator.geolocation.clearWatch(this.watchId_);
  goog.base(this, 'disposeInternal');
};


/**
 * @private
 */
ol.Geolocation.prototype.handleProjectionChanged_ = function() {
  var projection = this.getProjection();
  if (goog.isDefAndNotNull(projection)) {
    this.transformCoords_ = ol.Projection.getTransform(
        ol.Projection.getFromCode('EPSG:4326'), projection);
    if (!goog.isNull(this.position_)) {
      this.set(ol.GeolocationProperty.POSITION,
          this.transformCoords_(this.position_));
    }
  }
};


/**
 * @type {boolean} Is supported.
 */
ol.Geolocation.isSupported = 'geolocation' in navigator;


/**
 * @private
 * @param {GeolocationPosition} position position event.
 */
ol.Geolocation.prototype.positionChange_ = function(position) {
  var coords = position.coords;
  this.set(ol.GeolocationProperty.ACCURACY, coords.accuracy);
  this.set(ol.GeolocationProperty.ALTITUDE,
      goog.isNull(coords.altitude) ? undefined : coords.altitude);
  this.set(ol.GeolocationProperty.ALTITUDE_ACCURACY,
      goog.isNull(coords.altitudeAccuracy) ?
      undefined : coords.altitudeAccuracy);
  this.set(ol.GeolocationProperty.HEADING, goog.isNull(coords.heading) ?
      undefined : goog.math.toRadians(coords.heading));
  this.position_ = new ol.Coordinate(coords.longitude, coords.latitude);
  this.set(ol.GeolocationProperty.POSITION,
      this.transformCoords_(this.position_));
  this.set(ol.GeolocationProperty.SPEED,
      goog.isNull(coords.speed) ? undefined : coords.speed);
};


/**
 * @private
 * @param {GeolocationPositionError} error error object.
 */
ol.Geolocation.prototype.positionError_ = function(error) {
};


/**
 * The accuracy of the position in meters.
 * @return {number|undefined} accuracy.
 */
ol.Geolocation.prototype.getAccuracy = function() {
  return /** @type {number} */ (
      this.get(ol.GeolocationProperty.ACCURACY));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getAccuracy',
    ol.Geolocation.prototype.getAccuracy);


/**
 * @return {number|undefined} Altitude.
 */
ol.Geolocation.prototype.getAltitude = function() {
  return /** @type {number|undefined} */ (
      this.get(ol.GeolocationProperty.ALTITUDE));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getAltitude',
    ol.Geolocation.prototype.getAltitude);


/**
 * @return {number|undefined} Altitude accuracy.
 */
ol.Geolocation.prototype.getAltitudeAccuracy = function() {
  return /** @type {number|undefined} */ (
      this.get(ol.GeolocationProperty.ALTITUDE_ACCURACY));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getAltitudeAccuracy',
    ol.Geolocation.prototype.getAltitudeAccuracy);


/**
 * @return {number|undefined} Heading.
 */
ol.Geolocation.prototype.getHeading = function() {
  return /** @type {number|undefined} */ (
      this.get(ol.GeolocationProperty.HEADING));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getHeading',
    ol.Geolocation.prototype.getHeading);


/**
 * The position of the device.
 * @return {ol.Coordinate|undefined} position.
 */
ol.Geolocation.prototype.getPosition = function() {
  return /** @type {ol.Coordinate} */ (
      this.get(ol.GeolocationProperty.POSITION));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getPosition',
    ol.Geolocation.prototype.getPosition);


/**
 * @return {ol.Projection|undefined} projection.
 */
ol.Geolocation.prototype.getProjection = function() {
  return /** @type {ol.Projection} */ (
      this.get(ol.GeolocationProperty.PROJECTION));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getProjection',
    ol.Geolocation.prototype.getProjection);


/**
 * @return {number|undefined} Speed.
 */
ol.Geolocation.prototype.getSpeed = function() {
  return /** @type {number|undefined} */ (
      this.get(ol.GeolocationProperty.SPEED));
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'getSpeed',
    ol.Geolocation.prototype.getSpeed);


/**
 * @param {ol.Projection} projection Projection.
 */
ol.Geolocation.prototype.setProjection = function(projection) {
  this.set(ol.GeolocationProperty.PROJECTION, projection);
};
goog.exportProperty(
    ol.Geolocation.prototype,
    'setProjection',
    ol.Geolocation.prototype.setProjection);


/**
 * @private
 * @param {ol.Coordinate} coordinate Coordinate.
 * @return {ol.Coordinate} Coordinate.
 */
ol.Geolocation.prototype.transformCoords_ = goog.functions.identity;