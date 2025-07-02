// @ts-check

/** @typedef {Object} User
 * @property {string} name
 * @property {string} [id]
 */

/** @typedef {Object} TimeSlot
 * @property {string} time
 * @property {User[]} users
 */

/** @typedef {Object} Schedule
 * @property {string} id
 * @property {string} date
 * @property {TimeSlot[]} times
 */

/** @typedef {Object} AppointmentResponse
 * @property {Object} object
 * @property {string} object.id
 * @property {string} object.name
 * @property {string} object.startTime
 * @property {string} object.endTime
 * @property {User[]} object.users
 * @property {Schedule[]} object.schedules
 * @property {boolean} firstLogin
 * @property {Schedule[]} userSchedule
 */

/** @typedef {Object} DateInfo
 * @property {string} date
 * @property {number} key
 * @property {string} id
 */

/** @typedef {Object.<number, Object.<number, Object.<number, boolean>>>} SelectedTimesMap */

/** @typedef {Object} TimeSlotUpdate
 * @property {number} timeIndex
 * @property {number} buttonIndex
 * @property {boolean} value
 */

/** @typedef {Object} ScheduleUpdatePayload
 * @property {string} id
 * @property {string} date
 * @property {TimeSlot[]} times
 * @property {string} appointmentId
 */

module.exports = {};
