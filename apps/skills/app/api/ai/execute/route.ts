import { executeAI } from '../../../../src/server/handlers/ai'

export function POST(request: Request) { return executeAI(request, 'workflow') }
