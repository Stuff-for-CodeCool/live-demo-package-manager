const { readFile, writeFile } = require("fs/promises");

module.exports = {
    reader: async (path) => {
        try {
            const file = await readFile(path);
            return JSON.parse(file);
        } catch (error) {
            console.error(`File reading error: ${error.message}`);
        }
    },
    writer: async (path, data) => {
        try {
            return await writeFile(path, JSON.stringify(data, 2, null));
        } catch (error) {
            console.error(`File writing error: ${error.message}`);
        }
    },
};
