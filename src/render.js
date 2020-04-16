"use strict";

/**
 * A layered context to be rendered to.
 *
 * @class
 * @memberof TGT
 */
class Surface {
    /**
     * @constructor
     *
     * @param {number} width - The width of the internal canvasses.
     * @param {number} height - The height of the internal canvasses.
     * @param {number} nLayers - The number of layers (internal canvasses).
     */
    constructor(width, height, nLayers) {
        /**
         * The external canvas.
         *
         * @private
         * @member {HTMLCanvasElement}
         */
        this._out = document.createElement("canvas");
        this._out.ctx = this._out.getContext("2d");

        this._out.width = width;
        this._out.height = height;

        /**
         * The interval canvasses' width.
         *
         * @member {number}
         */
        this.width = width;
        /**
         * The interval canvasses' height.
         *
         * @member {number}
         */
        this.height = height;

        /**
         * The maximum width of the external canvas.
         * If less than 1, it will be interpretted as a fraction of the viewport width.
         *
         * @private
         * @member {number}
         */
        this._maxWidth = width;
        /**
         * The maximum height of the external canvas.
         * If less than 1, it will be interpretted as a fraction of the viewport height.
         *
         * @private
         * @member {number}
         */
        this._maxHeight = height;

        /**
         * Whether or not the external canvas should automatically resize with changes in viewport size.
         *
         * @private
         * @member {boolean}
         */
        this._autoResize = false;

        /**
         * The number of layers.
         *
         * @private
         * @member {number}
         */
        this._nLayers = nLayers;
        /**
         * The internal canvasses (layers).
         *
         * @private
         * @member {HTMLCanvasElement[]}
         */
        this._layers = [];
        for (let i = 0; i < nLayers; i++) {
            this._layers[i] = document.createElement("canvas");
            this._layers[i].ctx = this._layers[i].getContext("2d");

            this._layers[i].width = width;
            this._layers[i].height = height;
        }

        /**
         * The scale of the external canvas.
         *
         * @private
         * @member {number}
         */
        this._scale = 1;
        
        window.addEventListener("resize", () => {
            if (this._autoResize)
                this.resizeOutput(this.findLargestScale());
        });
    }

    /**
     * Get the external canvas.
     *
     * @returns {HTMLCanvasElement}
     */
    output() {
        return this._out;
    }

    /**
     * Set whether or not the external canvas should automatically resize.
     *
     * @param {boolean} shouldAutoResize
     */
    shouldAutoResize(shouldAutoResize) {
        this._autoResize = shouldAutoResize;
    }

    /**
     * Set the maximum dimensions of the external canvas and resize.
     *
     * @param {number} width - The maximum width.
     * @param {number} height - The maximum height.
     */
    setMaxDimensions(width, height) {
        this._maxWidth = width;
        this._maxHeight = height;
        
        this.resizeOutput(this.findLargestScale());
    }

    /**
     * Find the largest scale that can be rendered to according to the maximum dimensions.
     *
     * @returns {number}
     */
    findLargestScale() {
        let mw = window.innerWidth, mh = window.innerHeight;
        
        if (this._maxWidth <= 1)
            mw *= this._maxWidth;
        else
            mw = this._maxWidth;

        if (this._maxHeight <= 1)
            mh *= this._maxHeight;
        else
            mh = this._maxHeight;

        return Math.floor(Math.min(mw, mh) / Math.max(this.width, this.height));
    }

    /**
     * Resize the external canvas.
     *
     * @param {number} scale - The scale that the external canvas should be resized to.
     */
    resizeOutput(scale) {
        this._scale = scale;

        this._out.width = this.width * scale;
        this._out.height = this.height * scale;
    }

    /**
     * Appends the external output to the given element.
     *
     * @param {Element} element
     */
    attachOutput(element) {
        element.appendChild(this._out);
    }

    /**
     * Returns the nth layer's rendering context.
     *
     * @param {number} n
     */
    ctx(n) {
        return this._layers[n].ctx;
    }
   
    /**
     * Renders the internal canvasses to the external canvas, scaling if necessary.
     */
    display() {
        this._out.ctx.save();

        this._out.ctx.imageSmoothingEnabled = false;

        this._out.ctx.scale(this._scale, this._scale);

        for (let layer of this._layers)
            this._out.ctx.drawImage(layer, 0, 0);

        this._out.ctx.restore();
    }
}

/**
 * A section of an image, and its properties.
 *
 * @class
 * @memberof TGT
 */
class Sprite {
    /**
     * @constructor
     *
     * @param {Image} image
     */
    constructor(image) {
        /**
         * @private
         * @member {Image}
         */
        this._image = image;
       
        /**
         * The viewport of the image that this sprite pertains to.
         *
         * @member {Object}
         */
        this.port = {
            offset: {
                x: 0,
                y: 0
            },

            width: image.width,
            height: image.height
        };

        /**
         * The opacity to be rendered as.
         *
         * @member {number}
         */
        this.opacity = 1.0;

        /**
         * The position of the centre of the sprite, as a fraction of the total dimensions.
         *
         * @member {{{ x: number, y: number }}}
         */
        this.centre = {
            x: 0.0,
            y: 0.0,
        };
        
        /**
         * The scale that the sprite should be rendered to.
         *
         * @member {{{ x: number, y: number }}}
         */
        this.scale = {
            x: 1.0,
            y: 1.0
        };
    }

    /**
     * Sets the viewport of the sprite.
     *
     * @param {number} x - The viewport x offset.
     * @param {number} y - The viewport y offset.
     * @param {number} width - The viewport width..
     * @param {number} height - The viewport height.
     */
    setPort(x, y, width, height) {
        this.port = {
            offset: {
                x: x,
                y: y
            },

            width: width,
            height: height
        };
    }

    /**
     * Sets the centre of the sprite.
     *
     * @param {number} x
     * @param {number} y
     */
    setCentre(x, y) {
        this.centre = {
            x: x,
            y: y
        };
    }

    /**
     * Sets the scale of the sprite.
     *
     * @param {number} x
     * @param {number} y
     */
    setScale(x, y) {
        this.scale = {
            x: x,
            y: y
        };
    }
}

/**
 * Converts degrees into radians.
 *
 * @private
 *
 * @param {number} deg
 */
function degToRad(deg) { return deg * Math.PI / 180; }

/**
 * A class for performing rendering operations on a surface.
 *
 * @class
 * @memberof TGT
 */
class Renderer {
    /**
     * @constructor
     *
     * @param {Surface} surface - The surface to be rendered to.
     */
    constructor(surface) {
        /**
         * The surface to be rendered to.
         *
         * @member {Surface}
         */
        this.surface = surface;
    }

    /**
     * Clears all contexts to colour.
     *
     * @param {string} [colour=#FFF] - Colour to cleared to, defaulting to white.
     */
    clear(colour = "#FFF") {
        for (let i = 0; i < this.surface._nLayers; i++)
            this.surface.ctx(i).clearRect(0, 0, this.surface.width, this.surface.height);

        this.surface.ctx(0).fillStyle = colour;

        this.surface.ctx(0).fillRect(0, 0, this.surface.width, this.surface.height);
    }

    display() {
        this.surface.display();
    }

    /**
     * Renders a sprite.
     *
     * @param {Sprite} sprite - The sprite to be rendered.
     * @param {number} x - The x position to be rendered at.
     * @param {number} y - The y position to be rendered at.
     * @param {number} rotation - The rotation of the sprite.
     * @param {number} layer - The layer to be rendered onto.
     */
    drawSprite(sprite, x, y, rotation, layer) {
        let ctx = this.surface.ctx(layer);

        ctx.save();

        ctx.imageSmoothingEnabled = false;

        ctx.translate(x, y);
        ctx.rotate(degToRad(rotation));

        let rw = sprite.port.width * sprite.scale.x;
        let rh = sprite.port.height * sprite.scale.y;

        ctx.drawImage(sprite._image,
                      sprite.port.offset.x, sprite.port.offset.y,
                      sprite.port.width, sprite.port.height,
                      -sprite.centre.x * rw, -sprite.centre.y * rh,
                      rw, rh);

        ctx.restore();
    }

    /**
     * Fills in a rectangle.
     *
     * @param {string} colour - The colour of the rectangle.
     * @param {number} x - The x position of the rectangle.
     * @param {number} y - The y position of the rectangle.
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle.
     * @param {number} centreX - The central x position on the rectangle.
     * @param {number} centreY - The central y position on the rectangle.
     * @param {number} rotation - The rotation of the rectangle.
     * @param {number} layer - The layer for the rectangle to be rendered onto.
     */
    fillRect(colour, x, y, width, height, centreX, centreY, rotation, layer) {
        let ctx = this.surface.ctx(layer);
        
        ctx.save();

        ctx.translate(x, y);
        ctx.rotate(degToRad(rotation));

        ctx.fillStyle = colour;

        ctx.fillRect(-width * centreX, -height * centreY, width, height);

        ctx.restore();
    }

    /**
     * Fills in an ellipse.
     *
     * @param {string} colour - The colour of the ellipse.
     * @param {number} x - The x position of the ellipse.
     * @param {number} y - The y position of the ellipse.
     * @param {number} xRadius - The horizontal radius of the ellipse.
     * @param {number} yRadius - The vertical radius of the ellipse.
     * @param {number} rotation - The rotation of the ellipse.
     * @param {number} layer - The layer for the ellipse to be rendered onto.
     */
    fillEllipse(colour, x, y, xRadius, yRadius, rotation, layer) {
        let ctx = this.surface.ctx(layer);
        
        ctx.save();

        ctx.fillStyle = colour;

        ctx.beginPath();
        ctx.ellipse(x, y, xRadius, yRadius, degToRad(rotation), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws a line.
     *
     * @param {string} colour - The colour of the line.
     * @param {number} x1 - The x position of the beginning of the line.
     * @param {number} y1 - The y position of the beginning of the line.
     * @param {number} x2 - The x position of the end of the line.
     * @param {number} y2 - The y position of the end of the line.
     * @param {number} layer - The layer for the line to be rendered onto.
     */
    line(colour, lineWidth, x1, y1, x2, y2, layer) {
        let ctx = this.surface.ctx(layer);

        ctx.save();

        ctx.strokeStyle = colour;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.restore();
    }
}

export { Surface, Sprite, Renderer };
