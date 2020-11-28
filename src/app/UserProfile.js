import cookieManager from './CookieManager'

class UserProfile {
    userProfile = null
    getUserProfile(){
        if(this.userProfile !== null) {
            return this.userProfile
        }
        let visitInfo = cookieManager.getVisitInfo();
        let userType = null
        if(visitInfo.numVisits === 0) {
            userType = USER_PROFILE_FIRST_TIME_USER
        } else if(visitInfo.numVisits < 6) {
            userType = USER_PROFILE_NEW_USER
        } else if (visitInfo.numVisits < 12) {
            userType = USER_PROFILE_OCCAISONAL_USER
        } else if (visitInfo.currentVisit - visitInfo.firstVisit > 1000*60*60*24*30
            && visitInfo.currentVisit - visitInfo.lastVisit < 1000*60*60*24*7) {
            // power user classified if :
            // 1. has more than 10 visits total
            // 2. first visited more than a month ago 
            // 3. last visited within the past week
            userType = USER_PROFILE_POWER_USER
        } else {
            userType = USER_PROFILE_FREQUENT_USER
        }
        this.userProfile = {
            userType:userType,
            numVisits:visitInfo.numVisits
        }
        return this.userProfile
    }
}
export const USER_PROFILE_FIRST_TIME_USER = 1
export const USER_PROFILE_NEW_USER = 2
export const USER_PROFILE_OCCAISONAL_USER = 3
export const USER_PROFILE_FREQUENT_USER = 4
export const USER_PROFILE_POWER_USER = 5

export default new UserProfile();