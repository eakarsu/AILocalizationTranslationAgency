// Every tool/field below is traced to the unchanged native prompt contract.
export default {
  "/interp/compliance-logging": [
    {
      "verb": "classify-phi-pii-content",
      "fields": [
        {
          "key": "phrase_text",
          "label": "Phrase text",
          "type": "textarea",
          "samples": [
            "Fictional redacted phrase: [person] requested a service appointment.",
            "Fictional redacted phrase: [person] needs accessible transport.",
            "Fictional redacted phrase: [person] reviewed a draft support plan."
          ]
        }
      ]
    },
    {
      "verb": "redact-phi-in-log",
      "fields": [
        {
          "key": "phrase_text",
          "label": "Phrase text",
          "type": "textarea",
          "samples": [
            "Fictional redacted phrase: [person] requested a service appointment.",
            "Fictional redacted phrase: [person] needs accessible transport.",
            "Fictional redacted phrase: [person] reviewed a draft support plan."
          ]
        }
      ]
    },
    {
      "verb": "detect-hipaa-violation",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Fictional internal draft review; no disclosure authorization asserted",
            "Fictional purpose-limited review; no disclosure authorization asserted",
            "Fictional redaction review; no disclosure authorization asserted"
          ]
        }
      ]
    },
    {
      "verb": "predict-audit-finding",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "hipaa_violation",
          "label": "Hipaa violation",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "recommend-retention-policy",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Fictional internal draft review; no disclosure authorization asserted",
            "Fictional purpose-limited review; no disclosure authorization asserted",
            "Fictional redaction review; no disclosure authorization asserted"
          ]
        }
      ]
    },
    {
      "verb": "generate-compliance-report",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "Hypothetical transcript review",
            "Hypothetical access review",
            "Hypothetical retention review"
          ]
        },
        {
          "key": "phrase_text",
          "label": "Phrase text",
          "type": "textarea",
          "samples": [
            "Fictional redacted phrase: [person] reviews a draft.",
            "Fictional redacted phrase: [person] requests information.",
            "Fictional redacted phrase: [person] asks for clarification."
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "hipaa_violation",
          "label": "Hipaa violation",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "tamper_detected",
          "label": "Tamper detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Hypothetical internal review; no disclosure permission asserted",
            "Hypothetical redaction review; no disclosure permission asserted",
            "Hypothetical retention review; no disclosure permission asserted"
          ]
        },
        {
          "key": "retention_policy",
          "label": "Retention policy",
          "type": "text",
          "samples": [
            "Unreviewed fictional retention research draft",
            "Unreviewed fictional retention planning draft",
            "Unreviewed fictional retention quality draft"
          ]
        },
        {
          "key": "encryption_verified",
          "label": "Encryption verified",
          "type": "boolean",
          "verification": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "compliance_score",
          "label": "Compliance score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "breach_risk",
          "label": "Breach risk",
          "type": "text",
          "samples": [
            "Fictional low exposure assumption",
            "Fictional medium exposure assumption",
            "Fictional high exposure assumption"
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        },
        {
          "key": "phi_count",
          "label": "Phi count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        },
        {
          "key": "violation_count",
          "label": "Violation count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        }
      ]
    },
    {
      "verb": "summarize-access-events",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "score-log-completeness",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "phrase_text",
          "label": "Phrase text",
          "type": "textarea",
          "samples": [
            "Fictional redacted phrase: [person] requested a service appointment.",
            "Fictional redacted phrase: [person] needs accessible transport.",
            "Fictional redacted phrase: [person] reviewed a draft support plan."
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Fictional internal draft review; no disclosure authorization asserted",
            "Fictional purpose-limited review; no disclosure authorization asserted",
            "Fictional redaction review; no disclosure authorization asserted"
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "hipaa_violation",
          "label": "Hipaa violation",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        },
        {
          "key": "tamper_detected",
          "label": "Tamper detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "retention_policy",
          "label": "Retention policy",
          "type": "text",
          "samples": [
            "Unreviewed fictional retention research draft",
            "Unreviewed fictional retention planning draft",
            "Unreviewed fictional retention quality draft"
          ]
        },
        {
          "key": "encryption_verified",
          "label": "Encryption verified",
          "type": "boolean",
          "verification": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "compliance_score",
          "label": "Compliance score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "breach_risk",
          "label": "Breach risk",
          "type": "text",
          "samples": [
            "Fictional low exposure assumption",
            "Fictional medium exposure assumption",
            "Fictional high exposure assumption"
          ]
        },
        {
          "key": "phi_count",
          "label": "Phi count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        },
        {
          "key": "violation_count",
          "label": "Violation count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        }
      ]
    },
    {
      "verb": "validate-encryption-at-rest",
      "fields": [
        {
          "key": "encryption_verified",
          "label": "Encryption verified",
          "type": "boolean",
          "verification": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "suggest-additional-audit-field",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        }
      ]
    },
    {
      "verb": "detect-tamper-attempt",
      "fields": [
        {
          "key": "id",
          "label": "Id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "log_id",
          "label": "Log id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "recommend-baa-coverage",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Fictional internal draft review; no disclosure authorization asserted",
            "Fictional purpose-limited review; no disclosure authorization asserted",
            "Fictional redaction review; no disclosure authorization asserted"
          ]
        }
      ]
    },
    {
      "verb": "classify-disclosure-type",
      "fields": [
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "hypothetical transcript review",
            "hypothetical access review",
            "hypothetical retention review"
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "resource_type": "redacted illustrative transcript",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "predict-breach-impact",
      "fields": [
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "breach_risk",
          "label": "Breach risk",
          "type": "text",
          "samples": [
            "Unreviewed hypothetical low exposure",
            "Unreviewed hypothetical medium exposure",
            "Unreviewed hypothetical high exposure"
          ]
        },
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        }
      ]
    },
    {
      "verb": "generate-breach-notification-draft",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "event_type",
          "label": "Event type",
          "type": "text",
          "samples": [
            "Hypothetical transcript review",
            "Hypothetical access review",
            "Hypothetical retention review"
          ]
        },
        {
          "key": "phrase_text",
          "label": "Phrase text",
          "type": "textarea",
          "samples": [
            "Fictional redacted phrase: [person] reviews a draft.",
            "Fictional redacted phrase: [person] requests information.",
            "Fictional redacted phrase: [person] asks for clarification."
          ]
        },
        {
          "key": "phi_pii_detected",
          "label": "Phi pii detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "hipaa_violation",
          "label": "Hipaa violation",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "tamper_detected",
          "label": "Tamper detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "disclosure_type",
          "label": "Disclosure type",
          "type": "text",
          "samples": [
            "Hypothetical internal review; no disclosure permission asserted",
            "Hypothetical redaction review; no disclosure permission asserted",
            "Hypothetical retention review; no disclosure permission asserted"
          ]
        },
        {
          "key": "retention_policy",
          "label": "Retention policy",
          "type": "text",
          "samples": [
            "Unreviewed fictional retention research draft",
            "Unreviewed fictional retention planning draft",
            "Unreviewed fictional retention quality draft"
          ]
        },
        {
          "key": "encryption_verified",
          "label": "Encryption verified",
          "type": "boolean",
          "verification": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "compliance_score",
          "label": "Compliance score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "breach_risk",
          "label": "Breach risk",
          "type": "text",
          "samples": [
            "Fictional low exposure assumption",
            "Fictional medium exposure assumption",
            "Fictional high exposure assumption"
          ]
        },
        {
          "key": "audit_meta",
          "label": "Audit meta",
          "type": "json",
          "samples": [
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            },
            {
              "events": [
                {
                  "event_type": "hypothetical_read",
                  "decision": "pending_review"
                }
              ]
            }
          ]
        },
        {
          "key": "phi_count",
          "label": "Phi count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        },
        {
          "key": "violation_count",
          "label": "Violation count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        }
      ]
    },
    {
      "verb": "score-compliance-posture",
      "fields": [
        {
          "key": "phi_count",
          "label": "Phi count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        },
        {
          "key": "violation_count",
          "label": "Violation count",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            0,
            1,
            2
          ]
        },
        {
          "key": "compliance_score",
          "label": "Compliance score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    }
  ],
  "/interp/dialect-adaptation": [
    {
      "verb": "detect-dialect",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "sample",
          "label": "Sample",
          "type": "textarea",
          "samples": [
            "Fictional speaker sample for a language review.",
            "Fictional speaker sample with regional phrasing.",
            "Fictional speaker sample with formal phrasing."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "suggest-dialect-model",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "region_tag",
          "label": "Region tag",
          "type": "text",
          "samples": [
            "US-CA",
            "US-NY",
            "CA-ON"
          ]
        }
      ]
    },
    {
      "verb": "classify-formality-level",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "sample",
          "label": "Sample",
          "type": "textarea",
          "samples": [
            "Fictional speaker sample for a language review.",
            "Fictional speaker sample with regional phrasing.",
            "Fictional speaker sample with formal phrasing."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        }
      ]
    },
    {
      "verb": "predict-comprehension-mismatch",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "recommend-dialect-switch",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "recognition_score",
          "label": "Recognition score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "generate-dialect-adaptation-rule",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "formality_level",
          "label": "Formality level",
          "type": "text",
          "samples": [
            "formal",
            "neutral",
            "informal"
          ]
        }
      ]
    },
    {
      "verb": "summarize-dialect-usage",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "recognition_score",
          "label": "Recognition score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "score-dialect-recognition",
      "fields": [
        {
          "key": "recognition_score",
          "label": "Recognition score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "validate-region-tagging",
      "fields": [
        {
          "key": "region_tag",
          "label": "Region tag",
          "type": "text",
          "samples": [
            "US-CA",
            "US-NY",
            "CA-ON"
          ]
        },
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "suggest-style-adjustment",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "formality_level",
          "label": "Formality level",
          "type": "text",
          "samples": [
            "formal",
            "neutral",
            "informal"
          ]
        }
      ]
    },
    {
      "verb": "detect-code-switching",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "sample",
          "label": "Sample",
          "type": "textarea",
          "samples": [
            "Fictional speaker sample for a language review.",
            "Fictional speaker sample with regional phrasing.",
            "Fictional speaker sample with formal phrasing."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "recommend-bilingual-handling",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "code_switching_detected",
          "label": "Code switching detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "classify-sociolect",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "sample",
          "label": "Sample",
          "type": "textarea",
          "samples": [
            "Fictional speaker sample for a language review.",
            "Fictional speaker sample with regional phrasing.",
            "Fictional speaker sample with formal phrasing."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "predict-listener-confusion",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "dialect_meta",
          "label": "Dialect meta",
          "type": "json",
          "samples": [
            {
              "region": "Illustrative region",
              "listener_context": "Fictional community meeting"
            },
            {
              "region": "Illustrative region",
              "listener_context": "Fictional community meeting"
            },
            {
              "region": "Illustrative region",
              "listener_context": "Fictional community meeting"
            }
          ]
        }
      ]
    },
    {
      "verb": "generate-dialect-doc",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "region_tag",
          "label": "Region tag",
          "type": "text",
          "samples": [
            "US-CA",
            "US-NY",
            "CA-ON"
          ]
        }
      ]
    },
    {
      "verb": "suggest-prosody-adjust",
      "fields": [
        {
          "key": "detected_dialect",
          "label": "Detected dialect",
          "type": "text",
          "samples": [
            "Illustrative regional English",
            "Illustrative regional Spanish",
            "Illustrative regional French"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    }
  ],
  "/interp/legal-glossary-pack": [
    {
      "verb": "detect-untranslatable-legal-term",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "suggest-jurisdiction-match",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "legal_area",
          "label": "Legal area",
          "type": "text",
          "samples": [
            "Contract terminology research",
            "Civil procedure terminology research",
            "Administrative terminology research"
          ]
        }
      ]
    },
    {
      "verb": "classify-doctrine-vs-procedural",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        }
      ]
    },
    {
      "verb": "predict-legal-meaning-shift",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "recommend-glossary-addition",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "legal_area",
          "label": "Legal area",
          "type": "text",
          "samples": [
            "Contract terminology research",
            "Civil procedure terminology research",
            "Administrative terminology research"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "generate-back-translation-test",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "summarize-glossary-usage",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "coverage_score",
          "label": "Coverage score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "score-glossary-quality",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "coverage_score",
          "label": "Coverage score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "validate-legal-equivalence",
      "fields": [
        {
          "key": "source_term",
          "label": "Source term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "target_term",
          "label": "Target term",
          "type": "text",
          "samples": [
            "cita",
            "seguimiento",
            "derivación de servicios"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "suggest-cross-jurisdiction-term",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        },
        {
          "key": "legal_area",
          "label": "Legal area",
          "type": "text",
          "samples": [
            "Contract terminology research",
            "Civil procedure terminology research",
            "Administrative terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "detect-faux-ami",
      "fields": [
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        }
      ]
    },
    {
      "verb": "recommend-loanword-strategy",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "classify-legal-area",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "predict-misinterpretation-risk",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        }
      ]
    },
    {
      "verb": "generate-glossary-doc",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "legal_area",
          "label": "Legal area",
          "type": "text",
          "samples": [
            "Contract terminology research",
            "Civil procedure terminology research",
            "Administrative terminology research"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-glossary-versioning",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "jurisdiction",
          "label": "Jurisdiction",
          "type": "text",
          "samples": [
            "Illustrative California research context",
            "Illustrative New York research context",
            "Illustrative Ontario research context"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    }
  ],
  "/interp/medical-glossary-pack": [
    {
      "verb": "detect-untranslatable-medical-term",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-icd-snomed-mapping",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language",
          "label": "Language",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "classify-term-acuity",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        }
      ]
    },
    {
      "verb": "predict-glossary-coverage-gap",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "coverage_score",
          "label": "Coverage score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "recommend-glossary-addition",
      "fields": [
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "generate-back-translation-test",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "summarize-glossary-usage",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "coverage_score",
          "label": "Coverage score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        }
      ]
    },
    {
      "verb": "score-glossary-quality",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "terms",
          "label": "Terms",
          "type": "json",
          "samples": [
            [
              {
                "source": "appointment",
                "target": "cita",
                "notes": "Illustrative glossary entry; requires qualified review"
              }
            ],
            [
              {
                "source": "appointment",
                "target": "cita",
                "notes": "Illustrative glossary entry; requires qualified review"
              }
            ],
            [
              {
                "source": "appointment",
                "target": "cita",
                "notes": "Illustrative glossary entry; requires qualified review"
              }
            ]
          ]
        },
        {
          "key": "coverage_score",
          "label": "Coverage score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "validate-medical-equivalence",
      "fields": [
        {
          "key": "source_term",
          "label": "Source term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "target_term",
          "label": "Target term",
          "type": "text",
          "samples": [
            "cita",
            "seguimiento",
            "derivación de servicios"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-cross-lang-term",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "detect-false-cognate",
      "fields": [
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        }
      ]
    },
    {
      "verb": "recommend-prefer-loanword-vs-translation",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        }
      ]
    },
    {
      "verb": "classify-specialty-domain",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        }
      ]
    },
    {
      "verb": "predict-translation-confusion",
      "fields": [
        {
          "key": "term",
          "label": "Term",
          "type": "text",
          "samples": [
            "appointment",
            "follow-up",
            "service referral"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "generate-glossary-doc",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-glossary-merge",
      "fields": [
        {
          "key": "name",
          "label": "Name",
          "type": "text",
          "samples": [
            "Illustrative community glossary",
            "Illustrative technical glossary",
            "Illustrative quality glossary"
          ]
        },
        {
          "key": "specialty_domain",
          "label": "Specialty domain",
          "type": "text",
          "samples": [
            "General medical terminology research",
            "Administrative terminology research",
            "Accessibility terminology research"
          ]
        },
        {
          "key": "language_pair",
          "label": "Language pair",
          "type": "text",
          "samples": [
            "en-es",
            "es-fr",
            "fr-en"
          ]
        }
      ]
    }
  ],
  "/interp/speaker-diarization": [
    {
      "verb": "classify-speaker",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "segment",
          "label": "Segment",
          "type": "textarea",
          "samples": [
            "Fictional facilitator introduces the agenda.",
            "Fictional attendee asks a question.",
            "Fictional facilitator summarizes the draft plan."
          ]
        },
        {
          "key": "diarization_meta",
          "label": "Diarization meta",
          "type": "json",
          "samples": [
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "detect-new-speaker",
      "fields": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea",
          "samples": [
            "Illustrative community appointment instructions.",
            "Illustrative service availability update.",
            "Illustrative volunteer reminder."
          ]
        },
        {
          "key": "segment",
          "label": "Segment",
          "type": "textarea",
          "samples": [
            "Fictional facilitator introduces the agenda.",
            "Fictional attendee asks a question.",
            "Fictional facilitator summarizes the draft plan."
          ]
        },
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        }
      ]
    },
    {
      "verb": "predict-speaker-turn",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "turn_distribution",
          "label": "Turn distribution",
          "type": "json",
          "samples": [
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ],
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ],
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ]
          ]
        }
      ]
    },
    {
      "verb": "recommend-mic-config",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        }
      ]
    },
    {
      "verb": "score-diarization-accuracy",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "accuracy_score",
          "label": "Accuracy score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "crosstalk_detected",
          "label": "Crosstalk detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "generate-speaker-labels",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "diarization_meta",
          "label": "Diarization meta",
          "type": "json",
          "samples": [
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "summarize-turn-distribution",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "turn_distribution",
          "label": "Turn distribution",
          "type": "json",
          "samples": [
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ],
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ],
            [
              {
                "speaker": "Illustrative facilitator",
                "turns": 2
              },
              {
                "speaker": "Illustrative attendee",
                "turns": 3
              }
            ]
          ]
        }
      ]
    },
    {
      "verb": "validate-speaker-count",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        }
      ]
    },
    {
      "verb": "suggest-overlap-handling",
      "fields": [
        {
          "key": "crosstalk_detected",
          "label": "Crosstalk detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        },
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        }
      ]
    },
    {
      "verb": "detect-crosstalk",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        }
      ]
    },
    {
      "verb": "recommend-channel-split",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        },
        {
          "key": "crosstalk_detected",
          "label": "Crosstalk detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "classify-speaker-role",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "diarization_meta",
          "label": "Diarization meta",
          "type": "json",
          "samples": [
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            },
            {
              "setting": "Illustrative meeting",
              "speaker_roles": [
                "facilitator",
                "attendee"
              ]
            }
          ]
        }
      ]
    },
    {
      "verb": "predict-speaker-id-confidence",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "accuracy_score",
          "label": "Accuracy score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "crosstalk_detected",
          "label": "Crosstalk detected",
          "type": "boolean",
          "samples": [
            false,
            true,
            false
          ]
        }
      ]
    },
    {
      "verb": "generate-diarization-doc",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "accuracy_score",
          "label": "Accuracy score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        }
      ]
    },
    {
      "verb": "suggest-min-segment-duration",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "mic_config",
          "label": "Mic config",
          "type": "text",
          "samples": [
            "Illustrative single microphone",
            "Illustrative dual microphone",
            "Illustrative separate channels"
          ]
        },
        {
          "key": "min_segment_duration_ms",
          "label": "Min segment duration ms",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            200,
            300,
            500
          ]
        }
      ]
    },
    {
      "verb": "detect-impostor-speaker",
      "fields": [
        {
          "key": "num_speakers",
          "label": "Num speakers",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            2,
            3,
            4
          ]
        },
        {
          "key": "speaker_labels",
          "label": "Speaker labels",
          "type": "json",
          "samples": [
            [
              "Illustrative facilitator",
              "Illustrative attendee"
            ],
            [
              "Illustrative facilitator",
              "Illustrative attendee"
            ],
            [
              "Illustrative facilitator",
              "Illustrative attendee"
            ]
          ]
        }
      ]
    }
  ],
  "/interp/streaming-asr": [
    {
      "verb": "classify-audio-quality",
      "fields": [
        {
          "key": "audio_format",
          "label": "Audio format",
          "type": "text",
          "samples": [
            "pcm_s16le",
            "wav",
            "flac"
          ]
        },
        {
          "key": "sample_rate",
          "label": "Sample rate",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            16000,
            22050,
            48000
          ]
        },
        {
          "key": "noise_level",
          "label": "Noise level",
          "type": "text",
          "samples": [
            "Low background noise (fictional)",
            "Moderate room noise (fictional)",
            "Variable background noise (fictional)"
          ]
        }
      ]
    },
    {
      "verb": "suggest-language-detected",
      "fields": [
        {
          "key": "partial_transcript",
          "label": "Partial transcript",
          "type": "textarea",
          "samples": [
            "Fictional meeting: please review community intake hours.",
            "Fictional meeting: accessible transport can be arranged.",
            "Fictional meeting: review the service handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "predict-recognition-accuracy",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "audio_format",
          "label": "Audio format",
          "type": "text",
          "samples": [
            "pcm_s16le",
            "wav",
            "flac"
          ]
        },
        {
          "key": "noise_level",
          "label": "Noise level",
          "type": "text",
          "samples": [
            "Low background noise (fictional)",
            "Moderate room noise (fictional)",
            "Variable background noise (fictional)"
          ]
        }
      ]
    },
    {
      "verb": "detect-noise-source",
      "fields": [
        {
          "key": "noise_level",
          "label": "Noise level",
          "type": "text",
          "samples": [
            "Low background noise (fictional)",
            "Moderate room noise (fictional)",
            "Variable background noise (fictional)"
          ]
        },
        {
          "key": "session_meta",
          "label": "Session meta",
          "type": "json",
          "samples": [
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            }
          ]
        }
      ]
    },
    {
      "verb": "recommend-noise-reduction",
      "fields": [
        {
          "key": "noise_source",
          "label": "Noise source",
          "type": "text",
          "samples": [
            "Illustrative ventilation hum",
            "Illustrative nearby conversation",
            "Illustrative traffic outside"
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "generate-vad-segments",
      "fields": [
        {
          "key": "partial_transcript",
          "label": "Partial transcript",
          "type": "textarea",
          "samples": [
            "Fictional meeting: please review community intake hours.",
            "Fictional meeting: accessible transport can be arranged.",
            "Fictional meeting: review the service handoff checklist."
          ]
        },
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        }
      ]
    },
    {
      "verb": "summarize-asr-session",
      "fields": [
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "session_meta",
          "label": "Session meta",
          "type": "json",
          "samples": [
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            }
          ]
        }
      ]
    },
    {
      "verb": "score-asr-confidence",
      "fields": [
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        },
        {
          "key": "confidence_score",
          "label": "Confidence score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "validate-audio-format",
      "fields": [
        {
          "key": "audio_format",
          "label": "Audio format",
          "type": "text",
          "samples": [
            "pcm_s16le",
            "wav",
            "flac"
          ]
        }
      ]
    },
    {
      "verb": "suggest-sample-rate-change",
      "fields": [
        {
          "key": "sample_rate",
          "label": "Sample rate",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            16000,
            22050,
            48000
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "detect-overlapping-speech",
      "fields": [
        {
          "key": "partial_transcript",
          "label": "Partial transcript",
          "type": "textarea",
          "samples": [
            "Fictional meeting: please review community intake hours.",
            "Fictional meeting: accessible transport can be arranged.",
            "Fictional meeting: review the service handoff checklist."
          ]
        },
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        }
      ]
    },
    {
      "verb": "recommend-domain-model",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "session_meta",
          "label": "Session meta",
          "type": "json",
          "samples": [
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            },
            {
              "duration_seconds": 45,
              "channel_count": 1
            }
          ]
        }
      ]
    },
    {
      "verb": "classify-speaker-accent",
      "fields": [
        {
          "key": "partial_transcript",
          "label": "Partial transcript",
          "type": "textarea",
          "samples": [
            "Fictional meeting: please review community intake hours.",
            "Fictional meeting: accessible transport can be arranged.",
            "Fictional meeting: review the service handoff checklist."
          ]
        },
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "predict-rebuffer-need",
      "fields": [
        {
          "key": "audio_format",
          "label": "Audio format",
          "type": "text",
          "samples": [
            "pcm_s16le",
            "wav",
            "flac"
          ]
        },
        {
          "key": "sample_rate",
          "label": "Sample rate",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            16000,
            22050,
            48000
          ]
        },
        {
          "key": "noise_level",
          "label": "Noise level",
          "type": "text",
          "samples": [
            "Low background noise (fictional)",
            "Moderate room noise (fictional)",
            "Variable background noise (fictional)"
          ]
        }
      ]
    },
    {
      "verb": "generate-asr-corrections",
      "fields": [
        {
          "key": "final_transcript",
          "label": "Final transcript",
          "type": "textarea",
          "samples": [
            "Fictional transcript: community intake is open during the illustrative planning window.",
            "Fictional transcript: accessible transport needs confirmation before scheduling.",
            "Fictional transcript: the handoff checklist needs a human review."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "suggest-restart-stream",
      "fields": [
        {
          "key": "status",
          "label": "Status",
          "type": "select",
          "options": [
            "active",
            "paused",
            "completed",
            "error"
          ],
          "samples": [
            "active",
            "paused",
            "error"
          ]
        },
        {
          "key": "confidence_score",
          "label": "Confidence score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "noise_level",
          "label": "Noise level",
          "type": "text",
          "samples": [
            "Low background noise (fictional)",
            "Moderate room noise (fictional)",
            "Variable background noise (fictional)"
          ]
        }
      ]
    }
  ],
  "/interp/streaming-mt": [
    {
      "verb": "classify-domain",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-glossary-pack",
      "fields": [
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "predict-translation-quality",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "detect-untranslatable-segment",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "recommend-context-window",
      "fields": [
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "generate-mt-correction",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "summarize-mt-session",
      "fields": [
        {
          "key": "session_id",
          "label": "Session id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        },
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        },
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "latency_ms",
          "label": "Latency ms",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            120,
            240,
            360
          ]
        },
        {
          "key": "mt_meta",
          "label": "Mt meta",
          "type": "json",
          "samples": [
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            },
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            },
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            }
          ]
        }
      ]
    },
    {
      "verb": "score-mt-confidence",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        }
      ]
    },
    {
      "verb": "validate-language-pair",
      "fields": [
        {
          "key": "source_lang",
          "label": "Source lang",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        }
      ]
    },
    {
      "verb": "suggest-formal-vs-informal",
      "fields": [
        {
          "key": "target_lang",
          "label": "Target lang",
          "type": "text",
          "samples": [
            "es",
            "fr",
            "en"
          ]
        },
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "mt_meta",
          "label": "Mt meta",
          "type": "json",
          "samples": [
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            },
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            },
            {
              "audience": "Fictional community participants",
              "tone": "formal",
              "domain": "general services"
            }
          ]
        }
      ]
    },
    {
      "verb": "detect-named-entity-issue",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        }
      ]
    },
    {
      "verb": "recommend-back-translation",
      "fields": [
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "classify-mt-error-type",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        }
      ]
    },
    {
      "verb": "predict-latency-spike",
      "fields": [
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        },
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "latency_ms",
          "label": "Latency ms",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            120,
            240,
            360
          ]
        }
      ]
    },
    {
      "verb": "generate-post-edit-suggestion",
      "fields": [
        {
          "key": "source_text",
          "label": "Source text",
          "type": "textarea",
          "samples": [
            "Fictional source text: please review the appointment instructions.",
            "Fictional source text: accessible services need confirmation.",
            "Fictional source text: review the draft handoff plan."
          ]
        },
        {
          "key": "translated_text",
          "label": "Translated text",
          "type": "textarea",
          "samples": [
            "Traducción ilustrativa: revise las instrucciones de la cita.",
            "Traduction illustrative : confirmez les services accessibles.",
            "Illustrative translation: review the draft handoff plan."
          ]
        },
        {
          "key": "domain",
          "label": "Domain",
          "type": "text",
          "samples": [
            "community services",
            "technical information",
            "quality review"
          ]
        }
      ]
    },
    {
      "verb": "suggest-segment-retry",
      "fields": [
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "error_type",
          "label": "Error type",
          "type": "text",
          "samples": [
            "illustrative terminology mismatch",
            "illustrative register mismatch",
            "illustrative segment boundary issue"
          ]
        },
        {
          "key": "latency_ms",
          "label": "Latency ms",
          "type": "number",
          "min": 0,
          "step": 1,
          "samples": [
            120,
            240,
            360
          ]
        }
      ]
    }
  ],
  "/interp/streaming-tts": [
    {
      "verb": "classify-voice-style",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "tts_meta",
          "label": "Tts meta",
          "type": "json",
          "samples": [
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            },
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            },
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            }
          ]
        }
      ]
    },
    {
      "verb": "suggest-voice-match",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "voice_style",
          "label": "Voice style",
          "type": "text",
          "samples": [
            "neutral",
            "formal",
            "calm"
          ]
        },
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        }
      ]
    },
    {
      "verb": "predict-naturalness-score",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "detect-mispronunciation",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "recommend-prosody-adjust",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        }
      ]
    },
    {
      "verb": "generate-ssml",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "prosody_settings",
          "label": "Prosody settings",
          "type": "json",
          "samples": [
            {
              "rate": 0.95,
              "pitch": 0,
              "volume": 0.8
            },
            {
              "rate": 0.95,
              "pitch": 0,
              "volume": 0.8
            },
            {
              "rate": 0.95,
              "pitch": 0,
              "volume": 0.8
            }
          ]
        }
      ]
    },
    {
      "verb": "summarize-tts-session",
      "fields": [
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "naturalness_score",
          "label": "Naturalness score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "score-tts-quality",
      "fields": [
        {
          "key": "naturalness_score",
          "label": "Naturalness score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "validate-text-segment-length",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "suggest-pause-insertion",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        }
      ]
    },
    {
      "verb": "detect-foreign-word",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "recommend-phoneme-override",
      "fields": [
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        }
      ]
    },
    {
      "verb": "classify-emotion-needed",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "tts_meta",
          "label": "Tts meta",
          "type": "json",
          "samples": [
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            },
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            },
            {
              "setting": "Fictional public information recording",
              "style": "neutral"
            }
          ]
        }
      ]
    },
    {
      "verb": "predict-listener-fatigue",
      "fields": [
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "naturalness_score",
          "label": "Naturalness score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        }
      ]
    },
    {
      "verb": "generate-tts-script-cleanup",
      "fields": [
        {
          "key": "text_input",
          "label": "Text input",
          "type": "textarea",
          "samples": [
            "Fictional recording script: review the community appointment instructions.",
            "Fictional recording script: confirm accessible service options.",
            "Fictional recording script: review the handoff checklist."
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        }
      ]
    },
    {
      "verb": "suggest-voice-swap",
      "fields": [
        {
          "key": "voice_id",
          "label": "Voice id",
          "type": "text",
          "reference": true,
          "samples": [
            "",
            "",
            ""
          ]
        },
        {
          "key": "quality_score",
          "label": "Quality score",
          "type": "number",
          "min": 0,
          "step": "any",
          "samples": [
            0.65,
            0.75,
            0.85
          ]
        },
        {
          "key": "language_code",
          "label": "Language code",
          "type": "text",
          "samples": [
            "en",
            "es",
            "fr"
          ]
        },
        {
          "key": "voice_style",
          "label": "Voice style",
          "type": "text",
          "samples": [
            "neutral",
            "formal",
            "calm"
          ]
        }
      ]
    }
  ]
};
