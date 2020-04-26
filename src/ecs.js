"use strict";

/**
 * A class containing data.
 *
 * @typedef {Object} Component
 */

/**
 * An entity - a collection of components, under an id.
 * 
 * @class
 * @memberof TGT
 */
class Entity {
    /**
     * @constructor
     *
     * @param {...Component} components - The components that the entity consists of.
     */
    constructor(...components) {
        /**
         * The id of the entity given by a scene.
         * 
         * @member {string}
         */
        this.id = "";

        /**
         * An array of systems that can affect this entity.
         *
         * @private
         * @member {System[]}
         */
        this._systems = [];
        /**
         * An array of all components that the entity consists of.
         *
         * @private
         * @member {Component[]}
         */
        this._components = {};

        for (let component of components)
            this.add(component);
    }

    /**
     * Adds a component to the entity (doesn't update systems or scene).
     *
     * @param {Component} component
     */
    add(component) {
        this._components[component.name] = new component();
    }

    /**
     * Get entity's instance of component.
     *
     * @param {Component} component
     * 
     * @returns {Object}
     */
    get(component) {
        return this._components[component.name];
    }

    /**
     * Sets data of entity's instance of a component.
     *
     * @param {Component} component
     */
    set(component, data) {
        for (let key in data) {
            this.get(component)[key] = data[key];
        }
    }

    /**
     * Check if entity has all of the given components.
     *
     * @param {...Component} components
     *
     * @returns {boolean}
     */
    has(...components) {
        for (let component of components)
            if (this._components[component.name] == undefined)
                return false;
        return true;
    }

    /**
     * Perform a function on this entity for all relevant systems.
     *
     * @param {string} funcName - Name of the function to be called.
     * @param {*} [param] - A parameter to be passed to the function.
     */
    dispatch(funcName, param) {
        for (let system of this._systems)
            if (typeof system[funcName] === "function")
                system[funcName](this, param);
    }
}

/**
 * An interface for systems that operate on entities.
 *
 * @class
 * @memberof TGT
 */
class System {
    /**
     * @constructor
     */
    constructor() {
        /**
         * The scene that this system belongs to.
         *
         * @member {Scene}
         */
        this.scene = null;
        /**
         * An array of entities that the system operates on.
         *
         * @member {Entity[]}
         */
        this.entities = [];
    }

    /**
     * A test to see if an entity should be operated on by the system.
     *
     * @param {Entity} entity
     *
     * @returns {boolean}
     */
    test(entity) { return false; }

    /**
     * Called when a relevant entity is added to a scene.
     *
     * @param {Entity}
     */
    init(entity) {}
    /**
     * Called when a relevant entity is removed from a scene.
     *
     * @param {Entity}
     */
    exit(entity) {}
}

/**
 * A collection of entities and systems.
 *
 * @class
 * @memberof TGT
 */
class Scene {
    /**
     * @constructor
     */
    constructor() {
        /**
         * An array of all entities in the scene.
         *
         * @private
         * @member {Entity[]}
         */
        this._entities = {};
        /**
         * An array of all systems in the scene.
         *
         * @private
         * @member {System[]}
         */
        this._systems = [];

        /**
         * How many entities have been added. Used for id generation.
         *
         * @private
         * @member {number}
         */
        this._count = 0;
    }

    /**
     * Returns a unique id for an entity.
     *
     * @returns {string}
     */
    generateUID() { return (this._count++).toString(); }

    /**
     * Adds an entity the scene.
     *
     * @param {Entity} entity
     * @param {string} [id] - Optional id for the entity. If not provided, a unique one is generated.
     *
     * @returns {Entity}
     */
    addEntity(entity, id) {
        if (id == undefined)
            entity.id = this.generateUID();
        else
            entity.id = id;

        this._entities[entity.id] = entity;

        for (let system of this._systems)
            if (system.test(entity)) {
                entity._systems.push(system);
                system.entities.push(entity);

                system.init(entity);
            }

        return entity;
    }

    /**
     * Removes the given entity from the scene and then returns the entity.
     *
     * @param {Entity} entity
     *
     * @returns {Entity}
     */
    removeEntity(entity) {
        let i = this._entities.indexOf(entity);

        if (i !== -1) {
            for (let system of entity._systems) {
                system.exit(entity);
                system.entities.splice(i, 1);
            }

            entity.id = "";
            entity.scene = null;
            entity.systems = [];

            this._entities.splice(i, 1);
        }
    }

    /**
     * Gets the entity with the given id.
     *
     * @param {string} id
     *
     * @returns {Entity}
     */
    getEntity(id) {
        return this._entities[id];
    }

    /**
     * Adds a system to the scene.
     *
     * @param {System} system
     */
    addSystem(system) {
        this._systems.push(system);

        system.scene = this;


        for (let id in this._entities) {
            if (system.test(this.getEntity(id))) {
                system.entities.push(this.getEntity(id));
                this.getEntity(id)._systems.push(system);

                system.init(this.getEntity(id));
            }
        }
    }

    /**
     * Calls function on all relevant systems, passing a parameter to them if provided.
     *
     * @param {string} funcName - The name of the function.
     * @param {*} [param] - The parameter to be passed.
     */
    dispatch(funcName, param) {
        for (let system of this._systems)
            if (typeof system[funcName] === "function")
                for (let entity of system.entities)
                    system[funcName](entity, param);
    }

    /**
     * Returns all entities that have all of the given components.
     *
     * @param {...Component} components;
     *
     * @returns {Entity[]}
     */
    query(...components) {
        let matches = [];
        for (let id in this._entities)
            if (this.getEntity(id).has(...components))
                matches.push(this.getEntity(id));
        return matches;
    }

    /**
     * Adds a component to an entity and updates the systems.
     *
     * @param {Entity} entity - The entity to be added to.
     * @param {Component} component - The component to be added.
     */
    addComponentToEntity(entity, component) {
        entity.add(component);
        for (let system of this._systems) {
            if (system.entities.indexOf(entity) === -1)
                if (system.test(entity)) {
                    system.entities.push(entity);
                    entity._systems.push(system);

                    system.init(entity);
                }
        }
    }
}

export { Entity, System, Scene };
