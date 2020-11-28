import * as Constants from './Constants'

export const LICHESS_TIME_CONTROLS = [
    Constants.TIME_CONTROL_ULTRA_BULLET,
    Constants.TIME_CONTROL_BULLET,
    Constants.TIME_CONTROL_BLITZ,
    Constants.TIME_CONTROL_RAPID,
    Constants.TIME_CONTROL_CLASSICAL,
    Constants.TIME_CONTROL_CORRESPONDENCE
]
export const CHESS_DOT_COM_TIME_CONTROLS = [
    Constants.TIME_CONTROL_BULLET,
    Constants.TIME_CONTROL_BLITZ,
    Constants.TIME_CONTROL_RAPID,
    Constants.TIME_CONTROL_DAILY,
]

export const TIME_CONTROL_LABELS = {
    [Constants.TIME_CONTROL_ULTRA_BULLET]: "Ultrabullet",
    [Constants.TIME_CONTROL_BULLET]: "Bullet",
    [Constants.TIME_CONTROL_BLITZ]: "Blitz",
    [Constants.TIME_CONTROL_RAPID]: "Rapid",
    [Constants.TIME_CONTROL_CLASSICAL]: "Classical",
    [Constants.TIME_CONTROL_CORRESPONDENCE]: "Correspondence",
    [Constants.TIME_CONTROL_DAILY]: "Daily"
}

export function trimString(str) {
    return str.replace(/^\s+|\s+$/g, '')
}

export function lichessVariantHeader(variant) {
    if(variant === Constants.VARIANT_RACING_KINGS) {
        return Constants.LICHESS_HEADER_RACING_KINGS
    } else if(variant === Constants.VARIANT_KING_OF_THE_HILL) {
        return Constants.LICHESS_HEADER_KING_OF_THE_HILL
    } else if(variant === Constants.VARIANT_THREE_CHECK) {
        return Constants.LICHESS_HEADER_THREE_CHECK
    } else if(variant === Constants.VARIANT_CRAZYHOUSE) {
        return Constants.LICHESS_HEADER_CRAZYHOUSE
    }
    return Constants.LICHESS_HEADER_STANDARD
}
export function lichessPerf(variant) {
    if (variant === Constants.VARIANT_KING_OF_THE_HILL) {
        return Constants.LICHESS_PERF_KING_OF_THE_HILL
    } else if (variant === Constants.VARIANT_RACING_KINGS) {
        return Constants.LICHESS_PERF_RACING_KINGS
    } else if (variant === Constants.VARIANT_THREE_CHECK) {
        return Constants.LICHESS_PERF_THREE_CHECK
    } else if (variant === Constants.VARIANT_CRAZYHOUSE) {
        return Constants.LICHESS_PERF_CRAZYHOUSE
    } else if (variant === Constants.VARIANT_STANDARD) {
        return Constants.LICHESS_PERF_STANDARD
    }
}
export function chessDotComRules(variant) {
    if(variant === Constants.VARIANT_KING_OF_THE_HILL) {
        return Constants.CHESS_COM_RULES_KING_OF_THE_HILL
    } else if(variant === Constants.VARIANT_THREE_CHECK) {
        return Constants.CHESS_COM_RULES_THREE_CHECK
    } else if(variant === Constants.VARIANT_CRAZYHOUSE) {
        return Constants.CHESS_COM_RULES_CRAZYHOUSE
    }
    return Constants.CHESS_COM_RULES_STANDARD
}


export const DP_TABLE = {
    "100":800,   "99":677,    "98":589,    "97":538,
    "96":501,    "95":470,    "94":444,    "93":422,
    "92":401,    "91":383,    "90":366,    "89":351,
    "88":336,    "87":322,    "86":309,    "85":296,
    "84":284,    "83":273,    "82":262,    "81":251,
    "80":240,    "79":230,    "78":220,    "77":211,
    "76":202,    "75":193,    "74":184,    "73":175,
    "72":166,    "71":158,    "70":149,    "69":141,
    "68":133,    "67":125,    "66":117,    "65":110,
    "64":102,    "63":95,     "62":87,     "61":80,
    "60":72,     "59":65,     "58":57,     "57":50,
    "56":43,     "55":36,     "54":29,     "53":21,
    "52":14,     "51":7,      "50":0,      "49":-7,
    "48":-14,    "47":-21,    "46":-29,    "45":-36,
    "44":-43,    "43":-50,    "42":-57,    "41":-65,
    "40":-72,    "39":-80,    "38":-87,    "37":-95,
    "36":-102,   "35":-110,   "34":-117,   "33":-125,
    "32":-133,   "31":-141,   "30":-149,   "29":-158,
    "28":-166,   "27":-175,   "26":-184,   "25":-193,
    "24":-202,   "23":-211,   "22":-220,   "21":-230,
    "20":-240,   "19":-251,   "18":-262,   "17":-273,
    "16":-284,   "15":-296,   "14":-309,   "13":-322,
    "12":-336,   "11":-351,   "10":-366,   "9":-383,
    "8":-401,    "7":-422,    "6":-444,    "5":-470,
    "4":-501,    "3":-538,    "2":-589,    "1":-677,
    "0":-800,
}