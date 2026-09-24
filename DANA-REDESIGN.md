# Dana design integration — 24 September 2026

Applied Dana's 17 supplied HTML designs and adapted the remaining 20 marketing pages using the matching article, comparison, case-study or form layout. DANA-REDESIGN-MAP.json maps every page to its template.

The team preview is the review target. Production bunya.ai is unchanged. Previous preview is recoverable at commit 0fb9e0a. Draft articles, comparisons and case studies remain available here; form submission remains disabled.

Implementation:
- Extracted embedded image/font payloads into deduplicated assets/dana/media files; styles and scripts are reusable files rather than duplicated base64 HTML.
- Navigation and footer are shared nav.js/footer.js. Restored draft resource links for this preview.
- Restored hidden resource cards and comparison section using Dana's card styling.
- Kept Link Wealth off the homepage; anonymised illustrative interface names carried in the supplied HTML.
- Repaired production-only URL/anchor paths for the GitHub Pages preview.
- Kept the full interactive demo separate and unchanged.

Validation:
- All 37 marketing pages checked for local asset/link targets and noindex.
- Template families checked at 1440px desktop and 390px mobile; all articles checked on mobile. No page-wide horizontal overflow or observed broken images.
- Browser console showed no JavaScript errors in the reviewed pages.
- Tested product selector switching, mobile menu, Insights search, FAQ question matching, calculator fictional scenario and demo form preview submission.
- Enquiry forms report that nothing was sent/saved. Calculator calculation remains functional.

Review homepage and Command Centre first, then Resources/articles and forms. Any later production rollout must retain the production visibility holds and email CTAs unless separately authorised to change them.
