import { runOperationHTTP } from "../core/engine";
import { Step } from "./step";
import { TestContext } from "../core/context";
import { reportSuccess, reportFailure } from "../reporters/console";



// src/scenario/scenario.ts
export async function runScenario(params: {
  url: string;
  steps: Step[];
  ctx: TestContext;
}) {
  let totalScore = 0;
  let maxScore = 0;

  for (const step of params.steps) {
    if (step.score) maxScore += step.score;

    try {
      const headers = params.ctx.getHeaders();
      const result = await runOperationHTTP({
        url: params.url,
        operation: step.operation,
        variables: step.variables?.(params.ctx),
        headers
      });

      step.assert?.(result, params.ctx);
      step.after?.(result, params.ctx);

      if (step.score) totalScore += step.score;

      console.log(`✅ ${step.name}`);
    } catch (err: any) {
      console.error(`❌ ${step.name}: ${err.message}`);
    }
  }

  console.log(`\n🎯 Final Score: ${totalScore} / ${maxScore}`);
}
