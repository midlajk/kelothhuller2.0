module.exports = (req, res, next) => {
    if (!req.session.ismanager) {
        console.log(req.session)
        req.flash('error',"You have To Login First")
        return res.redirect('/login');
    }
    next();
}