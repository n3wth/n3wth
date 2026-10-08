import { createRoot } from 'react-dom/client'
import { EntryChecks } from './EntryChecks'

const container = document.createElement('div')
document.body.append(container)
createRoot(container).render(<EntryChecks />)
