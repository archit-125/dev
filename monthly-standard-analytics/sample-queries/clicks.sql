WITH
clicks AS (
    SELECT
    email,
    created,
    subaction,
    FROM
    `triggeredmail.hsn.click_202310`
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
click_export AS (
SELECT
    d.email AS email,
    d.created AS event_time,
    c.name AS campaign_name,
    SUBSTR(d.subaction,11) AS campaign_id,
    c.subject AS subject_line,
    'click' AS event
    FROM
    clicks AS d
    LEFT JOIN
    campaigns AS c
    ON d.subaction = c.subaction
)
SELECT
*
FROM
click_export
GROUP BY
  email,
  event_time,
  campaign_name,
  campaign_id,
  subject_line,
  event