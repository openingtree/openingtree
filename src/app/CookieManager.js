import Cookies from 'js-cookie'

class CookieManager {
    getLichessAccessToken() {
        return Cookies.get('at')
    }
    deleteLichessAccessToken() {
        Cookies.remove('at', { path: '/', domain:'www.openingtree.com' })
    }
    setSettingsCookie(settings) {
        Cookies.set('set',JSON.stringify(settings))
    }
    getSettingsCookie() {
        let settingsCookie = null
        try{
            settingsCookie = Cookies.get('set')
        } catch (e) {
            console.log(e)
            return null
        }
        if(!settingsCookie) {
            return null
        }
        return JSON.parse(settingsCookie)
    }
}

export default new CookieManager();