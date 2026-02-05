# Deployment Update: New Environment Variable

**To:** QA / DevOps Team
**Date:** 2026-02-05
**Subject:** Add `NEXT_PUBLIC_APP_URL` and Redeploy

## Overview
A new environment variable is required for the application to function correctly. Please update the deployment configuration immediately.

## Action Items

1.  **Update Environment Variables**
    Add the following variable to your `.env.production` or CI/CD secrets:

    | Variable | Description | Value (Test/Staging) |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_APP_URL` | The public URL of the application. | `https://ecitizen-test.kra.go.ke` (or your specific testing URL) |

2.  **Redeploy Application**
    After updating the environment variables, please trigger a full redeploy of the application.

