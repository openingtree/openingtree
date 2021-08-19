import { SAVED_TREE_LOCALSTORAGE_KEY } from '../app/Constants'

export function saveOpeningTree(openingTreeObject) {
    try {
        window.localStorage.setItem(
            SAVED_TREE_LOCALSTORAGE_KEY,
            JSON.stringify(openingTreeObject)
        )
    } catch (err) {
        alert(`Error: ${err.message}`)
    }
}

export function loadOpeningTree() {
    try {
        return JSON.parse(
            window.localStorage.getItem(SAVED_TREE_LOCALSTORAGE_KEY)
        )
    } catch (err) {
        alert(`Error: ${err.message}`)
    }
}
