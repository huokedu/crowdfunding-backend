const Roles = require('../../../lib/Roles')
const logger = require('../../../lib/logger')
const matchPayments = require('../../../lib/matchPayments')

module.exports = async (_, args, {pgdb, req, t}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')

  const transaction = await pgdb.transactionBegin()
  try {
    const {
      numMatchedPayments,
      numUpdatedPledges,
      numPaymentsSuccessful
    } = await matchPayments(transaction, t)

    await transaction.transactionCommit()
    const result = `
rematchPayments result:
num matched payments: ${numMatchedPayments}
num updated pledges: ${numUpdatedPledges}
num payments successfull: ${numPaymentsSuccessful}
    `
    console.log(result)
    return result
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
