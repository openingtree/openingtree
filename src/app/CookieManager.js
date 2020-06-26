import Cookies from 'js-cookie'

class CookieManager {
    getLichessAccessToken() {
        return Cookies.get('at')
    }
    deleteLichessAccessToken() {
        Cookies.remove('at')
        Cookies.remove('login')
    }
}

export default new CookieManager();