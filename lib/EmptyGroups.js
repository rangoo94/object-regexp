/**
 * This constructor is used for object expressions without named groups.
 *
 * @constructor
 */
function EmptyGroups () {
}

/**
 * Clone group.
 * This group doesn't have anything inside, so can be just reused.
 *
 * @returns {EmptyGroups}
 */
EmptyGroups.prototype.clone = function () {
  return this
}

module.exports = EmptyGroups
