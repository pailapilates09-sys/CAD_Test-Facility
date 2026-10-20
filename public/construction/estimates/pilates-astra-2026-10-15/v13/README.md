# V13 — original group budgets and owner-managed savings

The build joins the current v9 work register to v12 work-ID responsibility assignments. `budget-view.json` and the HTML tables are generated outputs, not separately edited financial registers. Every original work appears once in either the owner or professional table. Source units are shown beside the original quoted rates; v3 remains the SI conversion view.

Reconciliation at publication on 20 October 2026, before VAT and in the source's unspecified currency:

| Scope | Original amount | Included held budget | Remaining budget |
|---|---:|---:|---:|
| 14 owner-managed works | 15,12,850.40 | 1,03,853.50 | 14,08,996.90 |
| 37 professional works | 35,38,298.28 | 7,77,800.00 | 27,60,498.28 |
| All 51 works | 50,51,148.68 | 8,81,653.50 | 41,69,495.18 |

The remaining professional budget contains 34 active positive-quantity works and one zero-quantity door line. Two unsplit allowances (5,50,000.00 laminate flooring and 2,80,057.43 electrical) add 8,30,057.43. The project before VAT is 58,81,206.11. Source VAT is 7,64,556.79 and the original gross total is 66,45,762.90.

None of the owner-managed allocation is automatically a saving. It still requires products, measured quantities, waste, labour, fitting, delivery, equipment and coordination. No complete replacement quote has been accepted for those ten active works. The six held works keep their original budgets and are not released. New carpet/vanity options remain outside the original quote.

The browser comparison assumes NPR and takes **one complete, before-VAT alternative cost for all active owner-managed works**. It carries every professional amount, all held amounts and both allowances unchanged. It does not alter published values or reuse partial material totals as complete installed costs.

- Proposed owner total = active owner replacement cost + original owner held budget.
- Pre-VAT saving = original active owner budget − active owner replacement cost.
- Proposed project before VAT = original project before VAT − saving.
- A negative saving is an overrun. Blank/invalid input stays unknown. Explicit zero is a user scenario, never an automatic default.
- Tax and gross saving are not recalculated: direct vendors may quote taxes differently and source currency remains unspecified.

All monetary sums and differences use integer minor units. Scenario inputs persist only on the same browser, keyed to the financial source and responsibility revision. They are separate from v10/v11 material worksheet inputs. A shared source commit rebuilds every current view through the existing GitHub Actions deployment. Historical PDFs, dated exports and M1–M4 releases remain evidence snapshots.

Evidence rechecked 20 October 2026: [Daraz / Muskan sheer curtain panel](https://www.daraz.com.np/products/sheer-curtain-4x7-ft-1-pc-i127027468.html) is a product listing in a panel unit, not this project's measured installed curtain package. [Berger Nepal Easy Clean](https://bergernepal.com/product-detail/easy-clean) describes preparation/coats and offers a painting site-visit enquiry, without a complete price for the quoted work. Neither supports an accepted complete-project saving. V12 retains the full purchase-route source register and its access limitations; v5/v7/v8 retain their dated reference scopes.

Automated checks cover exact reconciliation, changes propagated from both shared sources, duplicate/missing assignment rejection, holds, zero quantity, currency assumptions, unknown/invalid costs, overruns, browser draft revisions, escaping and complete 51-work output. Browser visual QA is unavailable in the managed runtime.
