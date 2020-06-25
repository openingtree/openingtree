import Cookies from 'js-cookie'

class CookieManager {
    getLichessAccessToken() {
        return Cookies.get('at')
    }
}

export default new CookieManager();