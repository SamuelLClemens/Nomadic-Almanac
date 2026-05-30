Run a pre-flight check before proceeding with the requested task.

Steps:
1. Identify every external API, service, or file dependency the task requires.
2. For each external API: make ONE real test call and verify the response format is correct. Report the actual response, not an assumption.
3. For bulk operations: calculate the total number of calls/operations needed and compare against any known rate limits or quotas.
4. For file writes: confirm the target file exists and the write location is correct.
5. Report the result as GO or STOP:
   - GO: all checks passed — state what was verified and proceed with the task.
   - STOP: one or more checks failed — state exactly what failed and what must be resolved before proceeding. Do NOT start the main task.

Do not skip this check. Do not assume an API works without testing it.
