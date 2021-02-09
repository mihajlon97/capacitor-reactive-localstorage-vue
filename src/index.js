const keyBase = "vrs_";
import StorageService from "./StorageService";
const store = {
    async _initialize(defaults) {
        let json = await StorageService.getItem(keyBase);
        if (json === null) {
            await StorageService.setItem(keyBase, JSON.stringify(defaults));
        } else {
            let storage = JSON.parse(json);
            this._objectDefaults(defaults, storage);
            await StorageService.setItem(keyBase, JSON.stringify(storage));
        }
    },
    _objectDefaults(object, storage) {
        Object.keys(object).reduce((acc, key) => {
            let value = object[key];
            if (typeof value === "object") {
                this._objectDefaults(storage[key], value);
            } else {
                if (!storage.hasOwnProperty(key)) {
                    storage[key] = value;
                }
            }
            return acc;
        }, []);
    },
    async getRaw() {
        let json = await StorageService.getItem(keyBase);
        return JSON.parse(json);
    },
    async setRaw(object) {
        let json = JSON.stringify(object);
        await StorageService.setItem(keyBase, json);
    },
    async set(key, value) {
        if (value === undefined) {
            return this.remove(key);
        }
        // Set value
        await StorageService.setItem(keyBase + key, this.serialize(value));
        // Store key
        let keys = this.getKeys();
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }
        await StorageService.setItem(keyBase, this.serialize(keys));

        return value;
    },
    async get(key) {
        let value = await StorageService.getItem(keyBase + key);
        return value === null ? null : this.deserialize(value);
    },
    async remove(key) {
        let value = await this.get(key);
        // Remove value
        await StorageService.removeItem(keyBase + key);
        // Remove key
        let keys = await this.getKeys();
        let index = keys.indexOf("test");
        if (index !== -1) keys.splice(index, 1);
        await StorageService.setItem(keyBase, this.serialize(keys));

        return value;
    },
    async getAll() {
        let items = [];
        let keys = await this.getKeys();
        for (let i = 0; i < keys.length; i++) {
            items[keys[i]] = this.get(keys[i]);
        }
        return items;
    },
    async getKeys() {
        return await this.deserialize(StorageService.getItem(keyBase));
    },
    async clear() {
        await this.set(keyBase, "[]");
        let keys = this.getKeys();
        for (let i = 0; i < keys.length; i++) {
            await this.remove(keyBase + keys[i]);
        }
    },
    serialize: function (object) {
        return JSON.stringify(object);
    },
    deserialize: function (json, defaultValue) {
        if (!json) {
            return defaultValue;
        }
        let val = JSON.parse(json);
        return val !== undefined ? val : defaultValue;
    }
};

const ReactiveStorage = {
    store,
    async install(Vue, options) {
        await store._initialize(options);
        let values = await store.getRaw();

        Vue.mixin({
            data() {
                return {
                    get storage() {
                        return values;
                    }
                };
            },
            watch: {
                storage: {
                    async handler() {
                        await store.setRaw(this.storage);
                    },
                    deep: true
                }
            }
        });
    }
};

export default ReactiveStorage;
