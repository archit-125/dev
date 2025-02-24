const fs = require("fs");
const fastcsv = require("fast-csv");
const path = require("path");
const moment = require("moment");
const zlib = require("zlib");
const { BigQuery } = require("@google-cloud/bigquery");

async function generateFiles() {
  /* Change 1
  Below dates are 0 indexed. If we need to generate files from Aug 2023 to Jan 2025
  Then set startDate = new Date(2023, 7), endDate = new Date(2024,12) */
  let startDate = new Date(2023, 7);
  let endDate = new Date(2024, 12);

  const bigquery = new BigQuery({ projectId: "triggeredmail" });
  const datasetId = "hsn";

  /* Change 2
  Set the table1Prefix, leave the YYYYMM part
  eg values - esp_events_other_ , click_ , open_ , delivered_ */
  const table1Prefix = `${bigquery.projectId}.${datasetId}.esp_events_other_`;
  const table2Name = `${bigquery.projectId}.${datasetId}.campaigns`;

  if (!fs.existsSync("results")) {
    fs.mkdirSync("results", { recursive: true });
  }

  while (startDate <= endDate) {
    let yearMonth = `${startDate.getFullYear()}${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}`;

    console.log(`Processing table for: ${yearMonth}`);
    const table1Name = `${table1Prefix}${yearMonth}`;

    /* Change 3
    Refer /sample-queries to see queries that were ran using this script.
    Paste the query to below const. Replace the tables to appropriate variables
    Like:  \`${table1Name}\`, \`${table2Name}\` */

    const query = `WITH 
    bounces AS (
      SELECT
      email email,
      created event_time,
      SUBSTR(subaction,11) campaign_id,
      subaction,
      'bounce' event,
      reason
    FROM (
      SELECT
        *
      FROM
        -- need to update for each historic export
        \`${table1Name}\`
      WHERE
        event = "bounce")),

    campaigns AS (
      (
      SELECT
        subaction,
        name,
        subject,
        segment_ids
      FROM (
        SELECT
          subaction,
          name,
          subject,
          segment_ids,
          ROW_NUMBER() OVER (PARTITION BY subaction ORDER BY created DESC) row_num
        FROM
          \`${table2Name}\` )
      WHERE
        row_num = 1 )
    )
    SELECT
      t1.email email,
      t1.event_time,
      campaigns.name campaign_name,
      SUBSTR(t1.subaction,11) campaign_id,
      campaigns.subject subject_line,
      t1.event,
      reason
      FROM
      (SELECT *
      FROM bounces) t1
    LEFT JOIN  campaigns
    ON
      t1.subaction = campaigns.subaction
    GROUP BY
      email,
      event_time,
      campaign_name,
      campaign_id,
      subject_line,
      event,
      reason`;

    const [job] = await bigquery.createQueryJob({ query });

    /* Change 4
    Set the output file name
    Eg below- bluecore_bounces_YYYYMM.csv.gz */
    const outputDirectory = path.join(__dirname, "results");
    const outputFilePath = path.join(
      outputDirectory,
      `bluecore_bounces_${yearMonth}.csv.gz`
    );

    console.log(`Query Job created. Job ID: ${job.id}`);

    const rowsStream = job.getQueryResultsStream();

    /* Change 5
    BQ returns timestamps as objects. If your query result includes multiple timestamps, 
    adjust the on("data") event handler accordingly, as shown below for event_time. */
    rowsStream
      .on("data", (row) => {
        if (row.event_time && row.event_time.value) {
          row.event_time = moment(row.event_time.value)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss UTC");
        }
      })
      .pipe(fastcsv.format({ headers: true }))
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(outputFilePath))
      .on("finish", () =>
        console.log("CSV successfully created and compressed.")
      )
      .on("error", (err) => console.error("Error writing data:", err));

    startDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
  }
}

generateFiles();
