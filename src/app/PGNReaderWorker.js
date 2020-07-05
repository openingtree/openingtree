import {wrap} from 'comlink'

const PGNReader = wrap(new Worker('./PGNReader.js', { type: 'module' }))

export default PGNReader