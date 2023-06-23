module.exports = {
  rules: {
    "indents": {
      meta: {
        type: "layout",
        docs: {
          description: "Checks indents for comments in propTypes object",
        },
        fixable: null,
        schema: [],
        messages: {
          noComment: "Every propType shoud have one comment before it",
          wrongIndentsForSingleProp: "If propTypes has single prop it should not have empty line before comment",
          wrongIndentsForMultiProps: "If propTypes has several props it should have empty line before each comment"
        }
      },

      create: function (context) {
        return {
          AssignmentExpression(node) {
            const isPropTypesExpression = node.left.property
              && node.left.property.type === "Identifier"
              && node.left.property.name === "propTypes";

            if (!isPropTypesExpression) {
              return;
            }

            const sourceCode = context.getSourceCode();
            const propTypes = node.right.properties;
            const propTypesFirstLine = node.loc.start.line + 1;

            let propStartLine = propTypesFirstLine;

            propTypes.forEach((currentProp) => {
              const leadingComments = sourceCode.getCommentsBefore(currentProp);

              if (!leadingComments || leadingComments.length !== 1) {
                context.report({
                  node: currentProp,
                  messageId: "noComment"
                });

                return;
              }

              const hasSingleProp = propTypes.length === 1;
              const currentComment = leadingComments[0];
              const currentCommentStartLine = currentComment.loc.start.line;
              const prevTokenForComment = sourceCode.getTokenBefore(currentComment);

              if (hasSingleProp) {
                if (propTypesFirstLine === currentCommentStartLine) {
                  return;
                } else {
                  context.report({
                    node: currentComment,
                    messageId: "wrongIndentsForSingleProp"
                  });
                }
              }
              else {
                if (currentCommentStartLine !== propStartLine + 1) {
                  context.report({
                    node: currentComment,
                    messageId: "wrongIndentsForMultiProps"
                  });
                }
              }

              propStartLine = currentProp.loc.end.line + 1;
            });
          }
        };
      }
    }
  }
};
