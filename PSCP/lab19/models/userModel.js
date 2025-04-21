const users = [
    { id: 1, name: 'user1', email: 'user1@example.com' },
    { id: 2, name: 'user2', email: 'user2@example.com' },
];

const UserModel = {
    getAllUsers: () => {
        return users;
    },
    getUserById: (id) => {
        return users.find(user => user.id === parseInt(id));
    },
    addUser: (name, email) => {
        const newUser = {
            id: users.length + 1,
            name,
            email,
        };
        users.push(newUser);
        return newUser;
    }
};

module.exports = UserModel;
