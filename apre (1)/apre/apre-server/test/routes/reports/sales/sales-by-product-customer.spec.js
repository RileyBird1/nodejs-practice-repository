/**
 * Tests for sales-by-product-customer endpoint
 */

const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

describe('Apre Sales Report API - Sales by Product and Customer', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  it('should return aggregated sales by product and customer (happy path)', async () => {
    const mockResult = [
      { product: 'Prod A', customer: 'Cust 1', totalSales: 100, salesCount: 2 },
      { product: 'Prod B', customer: 'Cust 2', totalSales: 200, salesCount: 3 }
    ];

    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(mockResult) })
      };
      await callback(db);
    });

    const res = await request(app).get('/api/reports/sales/sales-by-product-customer');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should include date range in aggregation pipeline when dates provided', async () => {
    let capturedPipeline = null;

    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: (pipeline) => {
          capturedPipeline = pipeline;
          return { toArray: jest.fn().mockResolvedValue([]) };
        }
      };
      await callback(db);
    });

    const res = await request(app).get('/api/reports/sales/sales-by-product-customer?startDate=2023-01-01&endDate=2023-01-31');
    expect(res.status).toBe(200);
    expect(capturedPipeline).not.toBeNull();
    // first stage should be $match with a date field containing $gte and $lte Date objects
    expect(capturedPipeline[0]).toHaveProperty('$match');
    expect(capturedPipeline[0].$match).toHaveProperty('date');
    expect(capturedPipeline[0].$match.date).toHaveProperty('$gte');
    expect(capturedPipeline[0].$match.date).toHaveProperty('$lte');
    expect(capturedPipeline[0].$match.date.$gte instanceof Date).toBeTruthy();
    expect(capturedPipeline[0].$match.date.$lte instanceof Date).toBeTruthy();
  });

  it('should return 400 for invalid date formats', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
      };
      await callback(db);
    });

    const res = await request(app).get('/api/reports/sales/sales-by-product-customer?startDate=not-a-date');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
