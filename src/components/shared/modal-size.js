/**
 * One width scale for every overlay in the app.
 *
 * WHY THIS EXISTS
 * The modals had grown six different widths — max-w-sm, md, lg, xl, 2xl and
 * 3xl — picked one at a time, so two forms with the same number of fields
 * could open at noticeably different sizes and the app read as several apps.
 * These five tokens are the whole vocabulary. Adding a sixth width means
 * adding a token here, with a reason, rather than typing a class into one
 * component.
 *
 * Widths only. Nothing here sets colour, radius, spacing or type — a modal's
 * own look stays its own.
 *
 * Every token is a `max-w-*`, so each one is a CEILING: the panel is `w-full`
 * below it and the token only decides where it stops growing. A phone renders
 * all five identically.
 */
export const MODAL_SIZE = {
  /** Confirmations and alerts. Set by ui/alert-dialog, listed for completeness. */
  confirm: 'max-w-sm',

  /**
   * A short form: up to three fields, one column, one job.
   * Invite a user, create a folder, upload a file, edit leave balances.
   * Wider than this and three inputs float in whitespace.
   */
  compact: 'max-w-md',

  /**
   * THE form width. Every multi-field or multi-column data-entry modal uses
   * this and nothing else, so forms stop disagreeing about how big a form is:
   * add an employee, record an exit, add a candidate, schedule an interview,
   * report a bug, apply for leave, edit a project.
   *
   * 3xl (48rem) rather than 2xl because these forms lay out as
   * `grid-cols-1 md:grid-cols-3`, and three columns of label-plus-input need
   * the room. Below md they stack, which is what makes the same token correct
   * on a phone.
   */
  form: 'max-w-3xl',

  /**
   * The task and project composer only (shared/create-modal). Its body is a
   * six-column grid of fields that collapses to one column under 640px — a
   * genuinely different shape from the forms above, not a wider version of
   * one.
   */
  composer: 'max-w-5xl',

  /** Read-only panels: exports, insights, a record's details. Not forms. */
  panel: 'max-w-4xl',
}
