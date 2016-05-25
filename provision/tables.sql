DROP TABLE IF EXISTS firmware, application_config, rules, device_config, images;

CREATE TABLE firmware
(
  "id" serial NOT NULL,
  "name" text,
  "serialNumber" text,
  "deviceId" text,
  "template" json,
  "associationCode" text,
  "organizationId" text,
  "accountId" text,
  "entityId" text,
  "entityType" text,
  "secret" text
)
WITH (
  OIDS=FALSE
);

CREATE TABLE device_config
(
  "templateName" text,
  "config" json
)
WITH (
  OIDS=FALSE
);

CREATE TABLE rules
(
  "id" serial NOT NULL,
  "ruleConfig" json
)
WITH (
  OIDS = FALSE
);

CREATE TABLE images
(
  "id" serial NOT NULL,
  "image" bytea
)
WITH (
  OIDS = FALSE
);

CREATE TABLE application_config
(
  "id" serial NOT NULL,
  "accountId" text,
  "organization" json,
  "mqttUser" json,
  "device" json,
  "endUser" json
)
WITH (
  OIDS = FALSE
);
