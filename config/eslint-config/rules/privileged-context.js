// eslint-plugin-context/rules/privileged-context.js

export default {
  meta: {
    type: 'problem',
    docs: {
      description: '特权函数/回调只能在标记的上下文中调用',
    },
    schema: [
      {
        type: 'object',
        properties: {
          privilegedTag: { type: 'string', default: '@privileged' },
          privilegedFunctions: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  },

  create(ruleContext) {
    const options = ruleContext.options[0] || {}
    const PRIV_TAG = options.privilegedTag || '@privileged'
    const PRIV_FUNCS = new Set(options.privilegedFunctions || [])

    const sourceCode = ruleContext.sourceCode || ruleContext.getSourceCode?.()
    if (!sourceCode) {
      throw new Error('Unable to access sourceCode from rule context.')
    }

    // ========== 辅助函数 ==========

    function findParent(node, type) {
      let current = node.parent
      while (current) {
        if (current.type === type) return current
        current = current.parent
      }
      return null
    }

    function isPrivilegedFunction(callee) {
      if (callee.type === 'Identifier') return PRIV_FUNCS.has(callee.name)
      if (callee.type === 'MemberExpression' && callee.property?.type === 'Identifier') {
        return PRIV_FUNCS.has(callee.property.name)
      }
      return false
    }

    function makeTagRegex() {
      return new RegExp(`(^|\\n)[\\s\\*]*${PRIV_TAG}(\\s|$)`)
    }

    function hasPrivilegedTag(node) {
      const tagPattern = makeTagRegex()
      const candidates = [node]
      if (
        node?.parent &&
        ['ExportDefaultDeclaration', 'ExportNamedDeclaration'].includes(
          node.parent.type,
        ) &&
        node.parent.declaration === node
      ) {
        candidates.push(node.parent)
      }

      for (const candidate of candidates) {
        const comments = sourceCode.getCommentsBefore?.(candidate) || []
        const jsdocComment = sourceCode.getJSDocComment?.(candidate)

        if (jsdocComment && tagPattern.test(jsdocComment.value)) return true

        for (const comment of comments) {
          if (tagPattern.test(comment.value)) return true
        }
      }

      return false
    }

    function hasPrivilegedTypeAnnotation(node) {
      const paramComments = sourceCode.getCommentsBefore?.(node) || []
      for (const comment of paramComments) {
        if (comment.value?.includes(PRIV_TAG)) return true
      }
      if (node.typeAnnotation) {
        const annotation = node.typeAnnotation
        const comments = sourceCode.getCommentsBefore?.(annotation) || []
        for (const comment of comments) {
          if (comment.value?.includes(PRIV_TAG)) return true
        }
      }
      const jsdoc = sourceCode.getJSDocComment?.(node)
      if (jsdoc && jsdoc.value?.includes(PRIV_TAG)) return true
      return false
    }

    function getNodeName(node) {
      if (!node) return null
      if (node.type === 'Identifier' || node.type === 'PrivateIdentifier')
        return node.name
      if (node.type === 'Literal' && typeof node.value === 'string')
        return node.value
      return null
    }

    function getPropertyPrivilegeContext(propertyNode) {
      if (!propertyNode || propertyNode.type !== 'Property') return null

      const objectExpression = propertyNode.parent
      if (!objectExpression || objectExpression.type !== 'ObjectExpression')
        return null

      const enclosingCall = findParent(propertyNode, 'CallExpression')
      if (!enclosingCall) return null
      if (!enclosingCall.arguments.includes(objectExpression)) return null

      const argIndex = enclosingCall.arguments.indexOf(objectExpression)
      const calleeResolved = resolveFunction(enclosingCall.callee)
      const targetParam = calleeResolved?.params?.[argIndex]
      const typeAnnotation = targetParam?.typeAnnotation?.typeAnnotation
      if (!typeAnnotation || typeAnnotation.type !== 'TSTypeLiteral')
        return null

      const member = typeAnnotation.members?.find((memberNode) => {
        if (
          !['TSMethodSignature', 'TSPropertySignature'].includes(
            memberNode.type,
          )
        )
          return false
        const memberName = getNodeName(memberNode.key || memberNode.name)
        const propName = getNodeName(propertyNode.key)
        return Boolean(memberName && propName && memberName === propName)
      })

      if (member && hasPrivilegedTag(member)) {
        return { isPrivileged: true, source: 'callback-signature' }
      }

      return null
    }

    function getPrivilegeContext(node) {
      let current = node

      while (current) {
        if (current.type === 'Property') {
          const propertyContext = getPropertyPrivilegeContext(current)
          if (propertyContext) return propertyContext
        }

        if (
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression'
        ) {
          if (hasPrivilegedTag(current)) {
            return { isPrivileged: true, source: 'function-tag' }
          }

          if (current.parent?.type === 'Property') {
            const propertyContext = getPropertyPrivilegeContext(current.parent)
            if (propertyContext) return propertyContext
          }

          const argContext = getPrivilegedArgContext(current)
          if (argContext) return argContext
        }

        current = current.parent
      }

      return { isPrivileged: false, source: 'global' }
    }

    function getPrivilegedArgContext(funcNode) {
      const parent = funcNode.parent
      if (!parent) return null

      let callExpr = null
      if (parent.type === 'CallExpression' || parent.type === 'NewExpression') {
        callExpr = parent
      } else if (parent.type === 'ExpressionStatement') {
        return null
      }

      if (!callExpr) return null

      const argIndex = callExpr.arguments.indexOf(funcNode)
      if (argIndex === -1) return null

      const calleeResolved = resolveFunction(callExpr.callee)
      if (!calleeResolved) return null

      const param = calleeResolved.params?.[argIndex]
      if (!param) return null

      if (hasPrivilegedTypeAnnotation(param)) {
        return { isPrivileged: true, source: 'callback-argument' }
      }

      return null
    }

    function resolveFunction(node) {
      if (node.type !== 'Identifier') return null

      let current = node.parent
      while (current) {
        if (current.type === 'BlockStatement' || current.type === 'Program') {
          const declaration = findDeclarationInBody(current.body, node.name)
          if (declaration) return declaration
        }
        current = current.parent
      }

      return null
    }

    function findDeclarationInBody(body, name) {
      for (const statement of body) {
        if (
          statement.type === 'FunctionDeclaration' &&
          statement.id?.name === name
        ) {
          return statement
        }
        if (
          statement.type === 'ExportNamedDeclaration' &&
          statement.declaration?.type === 'FunctionDeclaration' &&
          statement.declaration.id?.name === name
        ) {
          return statement.declaration
        }
        if (statement.type === 'VariableDeclaration') {
          for (const declarator of statement.declarations) {
            if (
              declarator.id.type === 'Identifier' &&
              declarator.id.name === name
            ) {
              return declarator.init || declarator
            }
          }
        }
      }
      return null
    }

    // ========== 关键规则 ==========

    return {
      CallExpression(node) {
        const { callee } = node

        if (!isPrivilegedFunction(callee)) return

        const privilegeContext = getPrivilegeContext(node)

        if (!privilegeContext.isPrivileged) {
          ruleContext.report({
            node,
            message: `特权函数 '{{name}}' 只能在标记为 ${PRIV_TAG} 的上下文中调用`,
            data: {
              name:
                callee.type === 'Identifier'
                  ? callee.name
                  : callee.type === 'MemberExpression'
                    ? callee.property.name
                    : 'unknown',
            },
          })
        }
      },

      ArrowFunctionExpression(node) {
        const lambdaContext = getPrivilegeContext(node)
        if (!lambdaContext.isPrivileged) return
        checkEscape(node)
      },

      FunctionExpression(node) {
        const lambdaContext = getPrivilegeContext(node)
        if (!lambdaContext.isPrivileged) return
        checkEscape(node)
      },
    }

    function checkEscape(lambdaNode) {
      let current = lambdaNode.parent

      while (current) {
        if (current.type === 'ReturnStatement') {
          const funcContext = getPrivilegeContext(current)
          if (!funcContext.isPrivileged) {
            ruleContext.report({
              node: lambdaNode,
              message: `标记为 ${PRIV_TAG} 的回调不能从非特权函数中返回`,
            })
          }
          return
        }

        if (current.type === 'VariableDeclarator') {
          const decl = current.parent
          if (!hasPrivilegedTag(decl)) {
            ruleContext.report({
              node: lambdaNode,
              message: `标记为 ${PRIV_TAG} 的回调不能赋值给非特权变量`,
            })
          }
          return
        }

        if (
          current.type === 'CallExpression' ||
          current.type === 'NewExpression'
        ) {
          const argIndex = findArgIndex(lambdaNode, current)
          if (argIndex === -1) return

          const calleeResolved = resolveFunction(current.callee)
          if (calleeResolved) {
            const params = calleeResolved.params
            if (
              params[argIndex] &&
              !hasPrivilegedTypeAnnotation(params[argIndex])
            ) {
              ruleContext.report({
                node: lambdaNode,
                message: `标记为 ${PRIV_TAG} 的回调不能传递给非特权参数`,
              })
            }
          }
          return
        }

        if (current.type === 'Property') {
          const propertyContext = getPropertyPrivilegeContext(current)
          if (propertyContext) {
            return
          }

          ruleContext.report({
            node: lambdaNode,
            message: `标记为 ${PRIV_TAG} 的回调不能赋值给对象属性（可能逃逸）`,
          })
          return
        }

        current = current.parent
      }
    }

    function findArgIndex(argNode, callNode) {
      for (let i = 0; i < callNode.arguments.length; i++) {
        if (callNode.arguments[i] === argNode) return i
      }
      return -1
    }
  },
}
