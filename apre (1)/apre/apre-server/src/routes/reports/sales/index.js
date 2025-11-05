/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const createError = require('http-errors');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /sales-by-product-customer
 *
 * Fetches sales aggregated by product and customer within an optional date range
 * and optional product/customer filters.
 *
 * Query parameters:
 * - startDate (optional) ISO date string
 * - endDate (optional) ISO date string
 * - product (optional) product name/string
 * - customer (optional) customer name/string
 *
 * Example:
 * fetch('/sales-by-product-customer?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/sales-by-product-customer', (req, res, next) => {
  try {
    const { startDate, endDate, product, customer } = req.query;

    // Validate dates if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return next(createError(400, 'Invalid startDate format'));
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return next(createError(400, 'Invalid endDate format'));
    }

    mongo(async db => {
      const match = {};

      if (startDate || endDate) {
        match.date = {};
        if (startDate) match.date.$gte = new Date(startDate);
        if (endDate) match.date.$lte = new Date(endDate);
      }

      if (product) match.product = product;
      if (customer) match.customer = customer;

      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: { product: '$product', customer: '$customer' },
            totalSales: { $sum: '$amount' },
            salesCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            product: '$_id.product',
            customer: '$_id.customer',
            totalSales: 1,
            salesCount: 1
          }
        },
        { $sort: { product: 1, customer: 1 } }
      ];

      const result = await db.collection('sales').aggregate(pipeline).toArray();
      res.send(result);
    }, next);
  } catch (err) {
    console.error('Error getting sales by product/customer: ', err);
    next(err);
  }
});

module.exports = router;