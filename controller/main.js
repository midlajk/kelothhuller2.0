exports.mainpage = (req, res) => {

    res.render('main', {
        mainpath: '/mainpage',

    })


}
exports.loginpage = (req, res) => {

    res.render('login', {
        mainpath: '/mainpage',

    })

}
exports.dashboard = (req, res) => {

    res.render('index', {
        mainpath: '/index',

    })

}