import { SAVED_TREE_LOCALSTORAGE_KEY } from '../app/Constants'

export function saveOpeningTree(openingTreeObject) {
    window.localStorage.setItem(
        SAVED_TREE_LOCALSTORAGE_KEY,
        JSON.stringify(openingTreeObject)
    )
}

export function loadOpeningTree() {
    try {
        return JSON.parse(
            window.localStorage.getItem(SAVED_TREE_LOCALSTORAGE_KEY)
        )
    } catch (err) {
        return null
    }
}
