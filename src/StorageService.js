import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;

export default {
    async setObject(key, object) {
        await Storage.set({
            key,
            value: JSON.stringify(object)
        });
    },

    async getObject(key) {
        const res = await Storage.get({ key });
        return JSON.parse(res.value);
    },

    async setItem(key, value) {
        return await Storage.set({ key, value });
    },

    async getItem(key) {
        const { value } = await Storage.get({ key });
        return value;
    },

    async removeItem(key) {
        return await Storage.remove({ key });
    },

    async keys() {
        const { keys } = await Storage.keys();
        return keys;
    },

    async clear() {
        return await Storage.clear();
    }
};
