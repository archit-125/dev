WITH 
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
    `triggeredmail.hsn.esp_events_other_202308`
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
      `triggeredmail.hsn.campaigns` )
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
  reason