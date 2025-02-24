require("dotenv").config({ path: "../.env" });
console.log("GOOGLE_APP_PWD:", process.env.GOOGLE_APP_PWD);
console.log("JIRA_API_TOKEN:", process.env.JIRA_API_TOKEN);
const axios = require("axios");
const {
  EMAIL,
  JIRA_DOMAIN,
  JQL_QUERY,
  FIELDS,
  MAX_RESULTS,
} = require("./constants");
const { sanitizeJiraTickets, formatEmailBody } = require("./emailBody");
const { sendMailDriver } = require("./sendMail");

const headers = {
  Accept: "application/json",
  Authorization: `Basic ${Buffer.from(
    `${EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString("base64")}`,
};

async function fetchSprintTickets() {
  let startAt = 0;
  let allIssues = [];

  while (true) {
    const url = `https://${JIRA_DOMAIN}/rest/api/2/search?jql=${encodeURIComponent(
      JQL_QUERY
    )}&fields=${FIELDS}&startAt=${startAt}&maxResults=${MAX_RESULTS}`;

    try {
      const response = await axios.get(url, { headers });
      const issues = response.data.issues || [];
      if (issues.length === 0) break;
      allIssues = allIssues.concat(issues);
      startAt += MAX_RESULTS;
    } catch (error) {
      console.error("Error fetching Jira issues:", error.message);
      break;
    }
  }
  console.log(`Fetched ${allIssues.length} sprint tickets`);
  return allIssues;
}

async function main() {
  const totalTickets = await fetchSprintTickets();
  const sanitizedTickets = sanitizeJiraTickets(totalTickets);
  const emailBody = formatEmailBody(sanitizedTickets);
  sendMailDriver(emailBody);
}
main();
