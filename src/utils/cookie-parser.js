/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */

module.exports = async (req, res) => {
    req.cookies = {};

    let cookies = req.getHeader('cookie');

    if (!cookies) {
        return;
    }

    cookies = cookies.split(';');

    for (cookie of cookies) {
        cookie = cookie.trim().split('=');
        req.cookies[cookie[0]] = cookie[1];
    }
};
