import lint from "@commitlint/lint"
import { describe, expect, it } from "vitest"
import plugin from "./index.js"

describe("", () => {
	const { rules, plugins } = plugin
	const lintMessage = async (message: string) => {
		const m = message.replace(/^\s+/, "").trim()
		return await lint(m, rules, { plugins })
	}
	it("", async () => {
		const { valid } = await lintMessage("feat: EX-1 EX-2 some value")
		expect(valid).toBe(true)
	})
	it("", async () => {
		const { warnings } = await lintMessage("feat: EX-1 some value")
		expect(warnings[0]?.message).toBe("Commit message should include at least one JIRA subtask")
	})
	it("", async () => {
		const { warnings } = await lintMessage("feat: EX-2 some value")
		expect(warnings[0]?.message).toBe("Commit message should include at least one JIRA subtask")
	})
})
