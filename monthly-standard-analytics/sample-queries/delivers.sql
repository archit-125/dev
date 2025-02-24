WITH
delivers AS (
    SELECT
    email,
    created,
    subaction,
    FROM
    `triggeredmail.hsn.delivered_202501`
),
campaigns AS (
    SELECT
    subaction,
    name,
    subject
    FROM
    `triggeredmail.hsn.campaigns`
    QUALIFY
    ROW_NUMBER() OVER (PARTITION BY subaction ORDER BY created DESC) = 1
),
deliver_export AS (
SELECT
    d.email AS email,
    d.created AS event_time,
    c.name AS campaign_name,
    SUBSTR(d.subaction,11) AS campaign_id,
    c.subject AS subject_line,
    'delivered' AS event
    FROM
    delivers AS d
    LEFT JOIN
    campaigns AS c
    ON d.subaction = c.subaction
)
SELECT
*
FROM
deliver_export
GROUP BY
  email,
  event_time,
  campaign_name,
  campaign_id,
  subject_line,
  event