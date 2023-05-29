import { QualifiedConfig } from "@commitlint/types"
import { getJiraIssueDetails } from "./libs/get-jira-issue-details"

const getJiraIssues = async (commitMessage: string) => {
	const jiraIssueIds = commitMessage.match(/([A-Z][A-Z0-9_]*-\d+)(?![^\W_])/g)
	if (jiraIssueIds == null) {
		return "No valid JIRA issue keys found in commit message"
	}
	const issueDetails = await getJiraIssueDetails(jiraIssueIds)
	if (issueDetails == null) {
		return "Could not validate JIRA issues on the server"
	}
	return issueDetails
}

export default <Pick<QualifiedConfig, "extends" | "plugins" | "rules">>{
	extends: ["conventional-commits"],
	rules: {
		"jira-issue": [2, "always"],
		"jira-issue-subtask": [1, "always", true],
		"jira-issue-include-parent": [1, "always", true],
		"jira-issue-status": [1, "always", ["In Progress", "In Review", "Under review"]]
	},
	plugins: {
		jira: {
			rules: {
				"jira-issue": async (
					{ header },
					_when,
					_value
				): Promise<[boolean, string?]> => {
					const issues = await getJiraIssues(header)
					if (typeof issues === "string") {
						return [false, issues]
					}
					return [true]
				},
				"jira-issue-subtask": async (
					{ header },
					_when,
					value
				): Promise<[boolean, string?]> => {
					const issues = await getJiraIssues(header)
					if (typeof issues === "string") {
						return [false, issues]
					}
					const subtask = Object.values(issues).find(
						({ isSubtask }) => isSubtask === true
					)
					if (subtask == null && value === true) {
						return [
							false,
							"Commit message should include at least one JIRA subtask",
						]
					}
					return [true]
				},
				"jira-issue-include-parent": async ({ header }, _when, value) => {
					const issues = await getJiraIssues(header)
					if (typeof issues === "string") {
						return [false, issues]
					}
					const subtasks = Object.values(issues).filter(
						({ isSubtask }) => isSubtask === true
					)
					if (subtasks.length === 0 && value === true) {
						return [
							false,
							"Commit message should include at least one JIRA subtask",
						]
					}
					// const issueIds = Object.keys(issueDetails)
					// console.log(issueIds)
					return [true]
				},
			},
		},
	},
	prompt: {},
}
