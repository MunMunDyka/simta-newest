/**
 * ===========================================
 * Async Handler - Try-Catch Wrapper
 * ===========================================
 * Wrapper untuk async route handlers agar
 * tidak perlu try-catch berulang di setiap controller
 */

'use strict';

/**
 * Wrap async function to handle errors automatically
 * @param {Function} fn - Async function (req, res, next)
 * @returns {Function} - Wrapped function
 * 
 * @example
 * // Instead of:
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const data = await getData();
 *     res.json(data);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // Use:
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await getData();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
