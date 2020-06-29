import Cookies from 'js-cookie'

class CookieManager {
    getLichessAccessToken() {
        return Cookies.get('at')
    }
    deleteLichessAccessToken() {
        Cookies.remove('at', { path: '/', domain:'www.openingtree.com' })
    }
}

export default new CookieManager();