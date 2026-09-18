# Admin API Audit

This document classifies all Admin APIs found in the backend to determine their relevance to the Mobile Application.

| Module | APIs | Category | Notes |
| ------ | ---- | -------- | ----- |
| Admin Core | `GET /admin/*` | Web-dashboard-only | Admin metrics and dashboard are better suited for web. |
| Admin Providers | `GET /admin/providers` etc. | Web-dashboard-only | Provider approval and management. |
| Admin Promotions | `GET /admin/promotions` | Web-dashboard-only | Promotion creation and lifecycle management. |
| Admin Settlements | `POST /admin/settlements` | Web-dashboard-only | Financial batch processing and manual payouts. |
| Admin Customer Care| `GET /admin/customer-care` | Web-dashboard-only | Dispute resolution and ticket management. |

**Conclusion:** 
Currently, there is no explicit requirement for an Admin mobile experience. All Admin APIs are classified as `Web-dashboard-only` and are **DEFERRED** from the mobile implementation phase. If a mobile Admin view is required later, it will be built exclusively from these APIs.
