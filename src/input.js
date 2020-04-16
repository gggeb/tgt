/**
 * A class for handling keyboard callbacks.
 *
 * @class
 * @memberof TGT
 */
class Keyboard {
    /**
     * @constructor
     */
    constructor() {
        /**
         * An array of callbacks for when a key is pressed.
         *
         * @private
         * @member {Function[]}
         */
        this._pressCallbacks = [];
        /**
         * An array of callbacks for when a key is released.
         *
         * @private
         * @member {Function[]}
         */
        this._releaseCallbacks = [];

        window.addEventListener("keydown", event => {
            if (!event.repeat)
                for (let callback of this._pressCallbacks)
                    callback(event.key);
        });

        window.addEventListener("keyup", event => {
            for (let callback of this._releaseCallbacks)
                callback(event.key);
        });
    }

    /**
     * Register a callback for when a key is pressed.
     *
     * @param {Function} callback
     */
    onPress(callback) {
        this._pressCallbacks.push(callback);
    }

    /**
     * Register a callback for when a key is released.
     *
     * @param {Function} callback
     */
    onRelease(callback) {
        this._releaseCallbacks.push(callback);
    }
}

/**
 * A class for handling mouse callbacks and locking the pointer.
 *
 * @class
 * @memberof TGT
 */
class Mouse {
    /**
     * @constructor
     *
     * @param {Element} element - The element for the pointer to be locked to.
     */
    constructor(element) {
        /**
         * An array of callbacks for when a mouse button is clicked.
         *
         * @private
         * @member {Function[]}
         */
        this._clickCallbacks = [];
        /**
         * An array of callbacks for when a mouse button is released.
         *
         * @private
         * @member {Function[]}
         */
        this._releaseCallbacks = [];
        /**
         * An array of callbacks for when the mouse is moved.
         *
         * @private
         * @member {Function[]}
         */
        this._moveCallbacks = [];

        /**
         * The element for the pointer to be locked to.
         *
         * @private
         * @member {Element}
         */
        this._owner = element;

        element.addEventListener("click", () => {
            this._owner.requestPointerLock();
            this._owner.focus();
        });
        
        element.addEventListener("mousedown", event => {
            if (document.pointerLockElement === this._owner)
                this.handleMouseDown(event);
        });
        element.addEventListener("mouseup", event => {
            if (document.pointerLockElement === this._owner)
                this.handleMouseUp(event);
        });
        element.addEventListener("mousemove", event => {
            if (document.pointerLockElement === this._owner)
                this.handleMouseMove(event);
        });
    }

    /**
     * Handle a mousedown event.
     *
     * @private
     * @param {MouseEvent} event
     */
    handleMouseDown(event) {
        if (!event.repeat)
            for (let callback of this._clickCallbacks)
                callback(event.button);
    }

    /**
     * Handle a mouseup event.
     *
     * @private
     * @param {MouseEvent} event
     */
    handleMouseUp(event) {
        for (let callback of this._releaseCallbacks)
            callback(event.button);
    }

    /**
     * Handle a mousemove event.
     *
     * @private
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        for (let callback of this._moveCallbacks)
            callback({
                x: event.movementX,
                y: event.movementY
            });
    }

    /**
     * Register a callback for click events.
     *
     * @param {Function} callback
     */
    onClick(callback) {
        this._clickCallbacks.push(callback);
    }

    /**
     * Register a callback for release events.
     *
     * @param {Function} callback
     */
    onRelease(callback) {
        this._releaseCallbacks.push(callback);
    }

    /**
     * Register a callback for movement events.
     *
     * @param {Function} callback
     */
    onMove(callback) {
        this._moveCallbacks.push(callback);
    }
}

export { Keyboard, Mouse };
