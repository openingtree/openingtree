import Cookies from 'js-cookie'

class CookieManager {
    getLichessAccessToken() {
        return Cookies.get('at')
    }

    setLichessAccessToken(value) {
        Cookies.set('at', value, {expires: 365})
    }

    deleteLichessAccessToken() {
        // delete cookie set by cloudflare worker
        // This is only for older logins.
        Cookies.remove('at', { path: '/', domain:'www.openingtree.com' })
        //delete cookie set by pkce
        Cookies.remove('at')
    }

    setSettingsCookie(settings) {
        Cookies.set('set',JSON.stringify(settings))
    }

    setDarkModeCookie(darkMode) {
        Cookies.set('dm',darkMode)
    }
    getDarkModeCookie() {
        return Cookies.get('dm')

    }

    getSettingsCookie() {
        let settingsCookie = null
        try {
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

    currentVisit = null

    getVisitInfo(){
        if(this.currentVisit) {
            return this.currentVisit
        }
        // executes when page loads
        let lastVisitCookie = Cookies.get('lst')
        let visitsCookie = Cookies.get('vcnt')
        let firstVisitCookie = Cookies.get('fst')
        let lastVisit = lastVisitCookie?parseInt(lastVisitCookie):null
        let timesVisited = visitsCookie?parseInt(visitsCookie):0
        let firstVisit = firstVisitCookie?parseInt(firstVisitCookie):null
        let currDate = new Date().getTime()
        this.currentVisit = {
            firstVisit:firstVisit,
            lastVisit: lastVisit,
            currentVisit: currDate,
            numVisits: timesVisited,
        }
        if(lastVisit === null || currDate-lastVisit>1000*60*60*24){
            // increment count if visit in more than an day
            Cookies.set('lst', currDate);
            Cookies.set('vcnt', timesVisited+1)
        }
        if(firstVisit === null) {
            Cookies.set('fst', currDate);
        }
        return this.currentVisit
    }

}

export default new CookieManager();