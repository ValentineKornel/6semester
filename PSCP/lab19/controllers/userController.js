const UserModel = require('../models/userModel');

const UserController = {
    index: (req, res) => {
        const users = UserModel.getAllUsers();
        res.render('index', { users });
    },
    show: (req, res) => {
        const user = UserModel.getUserById(req.params.id);
        if (user) {
            res.render('show', { user });
        } else {
            res.status(404).send('User not found');
        }
    },
    createForm: (req, res) => {
        res.render('create');
    },
    createUser: (req, res) => {
        const { name, email } = req.body;
        UserModel.addUser(name, email);
        res.redirect('/');
    }
};

module.exports = UserController;
