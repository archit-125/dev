//Only set EMAIL(Your Email) and MANAGER (Manager's Name) here
const EMAIL = "archit.saini@bluecore.com";
const MANAGER = "PJ";

const JIRA_DOMAIN = "bluecore.atlassian.net";
const JQL_QUERY = "assignee=currentUser() AND sprint in openSprints()";
const FIELDS = "summary,status";
const MAX_RESULTS = 25;
module.exports = {
  EMAIL,
  JIRA_DOMAIN,
  JQL_QUERY,
  FIELDS,
  MAX_RESULTS,
  MANAGER,
};
