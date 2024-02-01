// home route (home page)
exports.homeRoutes = (req, res) => res.render('index');

// signup
exports.userSigup = (req, res) => res.render('signup');

// login
exports.userLogin = (req, res) => res.render('login');