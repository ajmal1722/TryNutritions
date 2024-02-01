// home route (home page)
exports.homeRoutes = (req, res) => res.send('hello users, welcome to TryNutritions');

// signup
exports.userSigup = (req, res) => res.render('signup');

// login
exports.userLogin = (req, res) => res.render('login');