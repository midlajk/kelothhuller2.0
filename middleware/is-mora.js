module.exports = (req, res, next) => {
    if (req.session.ismanager | req.session.isadminlogged ) {
        next();
    }else{

        req.flash('error',"You have To Login First")
        return res.redirect('/login');
    }
    
}