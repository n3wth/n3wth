import ts from 'typescript'

const clientReactApi = name => /^use[A-Z]/.test(name) || ['createContext', 'forwardRef', 'memo', 'Component', 'PureComponent'].includes(name)

export function needsClientBoundary(code, filename) {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true)
  const bindings = new Set()
  const namespaces = new Set()
  for (const statement of source.statements) {
    if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
      if (statement.expression.text === 'use client') return true
    } else break
  }
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue
    const clause = statement.importClause
    const module = statement.moduleSpecifier.text
    if (module === 'react' && clause?.name) namespaces.add(clause.name.text)
    const imports = clause?.namedBindings
    if (imports && ts.isNamespaceImport(imports)) namespaces.add(imports.name.text)
    if (imports && ts.isNamedImports(imports)) {
      for (const binding of imports.elements) {
        if (binding.isTypeOnly) continue
        const name = (binding.propertyName ?? binding.name).text
        if ((module === 'react' && clientReactApi(name)) || /^use[A-Z]/.test(name) || module === 'react-dom') {
          bindings.add(binding.name.text)
        }
      }
    }
  }
  const clientReference = expression => {
    if (ts.isIdentifier(expression)) return bindings.has(expression.text) || /^use[A-Z]/.test(expression.text)
    if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
      return namespaces.has(expression.expression.text) && clientReactApi(expression.name.text)
    }
    return false
  }
  let client = false
  function visit(node) {
    if ((ts.isCallExpression(node) || ts.isExpressionWithTypeArguments(node)) && clientReference(node.expression)) client = true
    if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source)) && node.initializer && ts.isJsxExpression(node.initializer)) client = true
    if (!client) ts.forEachChild(node, visit)
  }
  visit(source)
  return client
}

export function packageEmission() {
  return {
    name: 'ui-package-emission',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null
      return { meta: { uiClientBoundary: needsClientBoundary(code, id) } }
    },
    banner(chunk) {
      const client = chunk.moduleIds.some(id => this.getModuleInfo(id)?.meta.uiClientBoundary)
      return `${client ? "'use client';\n" : ''}/* @n3wth/ui - Built on Astryx */`
    },
  }
}
