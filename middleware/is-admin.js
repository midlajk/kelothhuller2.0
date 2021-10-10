module.exports = (req, res, next) => {
    if (!req.session.isadminlogged) {
        req.flash('error',"You have To Login First")
        return res.redirect('/login');
    }
    next();
}