class MockDelegate {
    constructor(name) {
        this.name = name;
        this.store = [];
    }

    async findUnique({ where }) {
        const key = Object.keys(where)[0];
        return this.store.find(item => item[key] === where[key]) || null;
    }

    async findFirst({ where }) {
        // Simple implementation for finding one
        if (!where) return this.store[0] || null;
        return this.store.find(item => {
            return Object.entries(where).every(([k, v]) => item[k] === v);
        }) || null;
    }

    async findMany(args = {}) {
        const { where, orderBy } = args;
        let results = this.store;

        if (where) {
            results = results.filter(item => {
                return Object.entries(where).every(([k, v]) => item[k] === v);
            });
        }

        if (orderBy) {
            // fast and loose sort
            const key = Object.keys(orderBy)[0];
            const dir = orderBy[key];
            results.sort((a, b) => {
                if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
                if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return results;
    }

    async create({ data }) {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            ...data
        };
        this.store.push(newItem);
        return newItem;
    }

    async update({ where, data }) {
        const key = Object.keys(where)[0];
        const index = this.store.findIndex(item => item[key] === where[key]);
        if (index === -1) throw new Error(`${this.name} not found`);

        // Merge data, but handle numbers for increment/decrement if needed (skipping for now)
        const updatedUser = { ...this.store[index], ...data };
        this.store[index] = updatedUser;
        return updatedUser;
    }

    async delete({ where }) {
        const key = Object.keys(where)[0];
        const index = this.store.findIndex(item => item[key] === where[key]);
        if (index === -1) throw new Error(`${this.name} not found`);
        const deleted = this.store[index];
        this.store.splice(index, 1);
        return deleted;
    }
}

const prisma = {
    user: new MockDelegate('user'),
    board: new MockDelegate('board'),
    list: new MockDelegate('list'),
    task: new MockDelegate('task'),
};

module.exports = prisma;
