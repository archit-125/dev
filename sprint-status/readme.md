# Sprint Status

Sprint Status is a tool that emails users a structured summary of all Jira tickets assigned to them during an open sprint.

It organizes tickets by status, applies formatting, and generates a ready-to-copy Slack message for quick sprint updates. This makes it easy to share updates with managers during **GSD blocks** or when unable to attend sprint sync-up meetings.

---

## Installation

### 1️⃣ Install Dependencies

Run the following command inside the project directory:

```bash
npm install
```

### 2️⃣ Configure Email & Manager Details

Open the file **`/sprint-status/src/constants.js`** and update the following values:

```js
EMAIL = "<your email>";
MANAGER = "<name of your manager>";
```

### 3️⃣ Set Up Environment Variables

Refer to `.env.sample` and create a `.env` file inside the `/sprint-status/` directory.

#### Required Environment Variables:

**JIRA API Token**

1. Visit [JIRA API Token Page](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Generate a new API token
3. Add it to your `.env` file:
   ```env
   JIRA_API_TOKEN="<Your JIRA API Token>"
   ```

**Google App Password**

1. Visit [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Generate an app password
3. Add it to your `.env` file:
   ```env
   GOOGLE_APP_PWD="<Your Google App Password>"
   ```

---

## Running the Tool

Navigate to the project’s source directory and execute the script:

```bash
cd sprint-status/src/
node index.js
```

This will generate and send your sprint status update via email.
