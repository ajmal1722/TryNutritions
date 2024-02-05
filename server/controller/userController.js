const Userdb = require('../model/userModel');

// create and save user
exports.create = (req, res) => {

    if (!req.body){
        res.status(400).send('content cannot be empty')
        return;
    }

    const user = new Userdb({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password
    })

    // save the user in database
    user
        .save()
        .then(data => {
            console.log('data added succesfully');
            res.redirect('/');
        })
        .catch(error => {
            console.log('message:', error.message)
            res.status(500).send({
                message: error.message
            })
        })
}