"use strict";

/**
 * A class for maintaining an update loop.
 *
 * @class
 * @memberof TGT
 */
class Timer {
    /**
     * @constructor
     *
     * @param {number} [fps=60] - Target ticks per second.
     */
    constructor(fps = 60) {
        /**
         * Target ticks per second.
         *
         * @private
         * @member {number}
         */
        this._fps = fps;

        /**
         * Time of last tick.
         *
         * @private
         * @member {number}
         */
        this._then = performance.now();
        /**
         * Current time.
         *
         * @private
         * @member {number}
         */
        this._now = this._then; 

        /**
         * How many ticks have happened since starting.
         *
         * @member {number}
         */
        this.ticks = 0;

        /**
         * An array of callbacks to be performed each tick.
         *
         * @private
         * @member {Function[]}
         */
        this._callbacks = [];

        /**
         * @private
         * @member {boolean}
         * Should the timer stop.
         */
        this._shouldStop = false;
    }

    /**
     * How many milliseconds should ellapse between ticks.
     * 
     * @member {number}
     */
    get interval() {
        return 1000 / this._fps;
    }

    /**
     * Time between last two ticks.
     *
     * @member {number}
     */
    get delta() {
        return this._now - this._then;
    }
   
    /**
     * Register a callback to be called on each tick.
     *
     * @param {Function} callback
     */
    onTick(callback) {
        this._callbacks.push(callback);
    }

    /**
     * Perform one tick if enough time has ellapsed and queue the next tick.
     *
     * @private
     */
    tick() {
        this.ticks++;

        this._now = performance.now();

        if (this.delta >= this.interval) {
            for (let callback of this._callbacks)
                callback();

            this._then = this._now - (this.delta % this.interval);
        }
        
        if (!this._shouldStop)
            window.requestAnimationFrame(() => {
                this.tick();
            });
    }

    /**
     * Start ticking.
     */
    start() {
        this.ticks = 0;
        this._shouldStop = false;
        
        this.tick();
    }

    /**
     * Stop ticking.
     */
    stop() {
        this._shouldStop = true;
    }
}

export { Timer };
