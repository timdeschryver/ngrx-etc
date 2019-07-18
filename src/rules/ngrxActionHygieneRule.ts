import { tsquery } from '@phenomnomnominal/tsquery'
import * as Lint from 'tslint'
import * as ts from 'typescript'

export class Rule extends Lint.Rules.TypedRule {
  public static metadata: Lint.IRuleMetadata = {
    description: 'Enforces the use of good action hygiene',
    descriptionDetails: 'See more at https://www.youtube.com/watch?v=JmnsEvoy-gY',
    options: null,
    optionsDescription: 'Not configurable',
    ruleName: 'ngrx-action-hygiene',
    type: 'maintainability',
    typescriptOnly: true,
  }

  public static FAILURE_STRING =
    'Action type does not follow the good action hygiene practices, use "[Source] Event" to define action types'

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    const creators = tsquery(sourceFile, `CallExpression:has(Identifier[name=/createAction.*/]) > StringLiteral`)
    const hits = creators.filter((node): boolean => !node.getText().match(/[\[].*[\]]\s.*/))
    const failures = hits.map(
      (node): Lint.RuleFailure =>
        new Lint.RuleFailure(
          sourceFile,
          node.getStart(),
          node.getStart() + node.getWidth(),
          Rule.FAILURE_STRING,
          this.ruleName,
        ),
    )
    return failures
  }
}
