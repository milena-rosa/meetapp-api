'use strict'

const Sentry = require('@sentry/node')

const Config = use('Config')
const Env = use('Env')
const Youch = use('youch')
const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   */
  async handle (error, { request, response }) {
    if (error.name === 'ValidationException') {
      console.error('erro api', error.messages)
      return response.status(error.status).send(error.messages)
    }

    if (
      Env.get('NODE_ENV') === 'development' ||
      Env.get('NODE_ENV') === 'testing'
    ) {
      const youch = new Youch(error, request.request)
      const errorJSON = await youch.toJSON()

      return response.status(error.status).send(errorJSON)
    }

    return response.status(error.status)
  }

  /**
   * Report exception for logging or debugging.
   */
  async report (error, { request }) {
    Sentry.init(Config.get('services.sentry.dsn'))
    Sentry.captureException(error)
  }
}

module.exports = ExceptionHandler
