import { Axios } from "axios"
import { getJiraConfig } from "./get-jira-config"

type IssueDetail = {
	isSubtask: boolean
	parentKey?: string
	issueStatus: string
}
export const getJiraIssueDetails = ((
	cache = {} as Record<string, Record<string, IssueDetail>>
) => {
	return async (issueIds: string[], config = getJiraConfig()) => {
		const { baseURL, password, username } = await config
		const key = JSON.stringify({ baseURL, password, username, issueIds })
		if (cache[key] != null) {
			return cache[key]
		}
		const axios = new Axios({
			baseURL: `${baseURL}/rest/api/2`,
			auth: {
				username,
				password,
			},
		})
		const { data, status } = await axios.get(
			`/search?jql=issueKey in (${issueIds.join(",")})`
		)
		if (status === 200) {
			const { issues, warningMessages } = JSON.parse(data)
			const result = <Record<string, IssueDetail>>{}
			for (const issue of issues) {
				const {
					key,
					fields: {
						issuetype: { subtask: isSubtask },
						parent,
						status: { name: issueStatus },
					},
				} = issue
				result[key] = {
					isSubtask,
					issueStatus,
					parentKey: isSubtask ? parent.key : undefined,
				}
			}
			if (warningMessages != null) {
				for (const warningMessage of warningMessages) {
					console.warn(warningMessage)
				}
			}
			cache[key] = result
			return result
		}
		return null
	}
})()
