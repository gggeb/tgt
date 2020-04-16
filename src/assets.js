"use strict";

/**
 * An asset to be loaded.
 *
 * @typedef {Object} Asset
 *
 * @property {string} name - Name of the asset.
 * @property {string} src - Path of the asset.
 */

/**
 * A class for loading and accessing assets.
 *
 * @class
 * @memberof TGT
 */
class AssetManager {
    /**
     * @constructor
     *
     * @param {Asset[]} index - An array of asset source paths and their names.
     */
    constructor(index) {
        /**
         * An associative array of images.
         *
         * @private
         * @member {Object.<string, Image>}
         */
        this._images = {};
       
        /**
         * An array of callbacks to pe performed when all assets are loaded.
         *
         * @private
         * @member {Function[]}
         */
        this._callbacks = [];
        /**
         * @private
         * @member {boolean}
         */
        this._hasLoaded = false;

        for (let asset of index) {
            this._images[asset.name] = new Image();
            this._images[asset.name].src = asset.src;
            this._images[asset.name].addEventListener("load", () => {
                this._hasLoaded = true;
                for (let name in this._images)
                    if (!this._images[name].complete) {
                        this._hasLoaded = false;
                        return;
                    }

                if (this._hasLoaded)
                    for (let callback of this._callbacks)
                        callback();
            });
        }
    }

    /**
     * Register a callback to be performed when all assets are loaded.
     *
     * @param {Function} callback
     */
    onLoad(callback) {
        this._callbacks.push(callback);

        if (this._hasLoaded)
            callback();
    }

    /**
     * Get a loaded image.
     *
     * @param {string} name - Name of image to be retrieved.
     */
    get(name) {
        return this._images[name];
    }
}

export { AssetManager };
