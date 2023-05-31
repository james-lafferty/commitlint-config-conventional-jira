import { Axios, AxiosResponse } from "axios"
import { getJiraConfig } from "./get-jira-config"

type IssueDetail = {
	isSubtask: boolean
	parentKey?: string
	issueStatus: string
}
const requestCache = <Record<string, Promise<AxiosResponse>>>{}
const cache = <Record<string, Record<string, IssueDetail>>>{}
export const getJiraIssueDetails = async (
	issueIds: string[],
	config = getJiraConfig()
) => {
	const { baseURL, password, username } = await config
	const key = JSON.stringify({ baseURL, password, username, issueIds })
	if (cache[key] != null) {
		return cache[key]
	}
	if (requestCache[key] == null) {
		const axios = new Axios({
			baseURL: `${baseURL}/rest/api/2`,
			auth: {
				username,
				password,
			},
		})
		requestCache[key] = axios.get(
			`/search?fields=issuetype,parent,status&jql=issueKey in (${issueIds.join(
				","
			)})`
		)
	}
	const { data, status } = (await requestCache[key]) as AxiosResponse
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
