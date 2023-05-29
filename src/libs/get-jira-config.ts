import { readFile } from "fs/promises"
import { normalize } from "path"
import { cwd } from "process"

export const getJiraConfig = async () => {
	const jirarc = await readFile(normalize(`${cwd()}/.jirarc.json`), {
		encoding: "utf8",
	})
	const { baseURL, password, username } = JSON.parse(jirarc)
	return {
		baseURL,
		password,
		username,
	}
}
