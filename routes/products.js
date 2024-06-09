const express = require('express');
const router = express.Router();

// model imports
const Product = require('../model/product')
const Sale = require('../model/sale')
const Customer = require('../model/customer')

const data = require('../data')
const utils = require('../utils')

router.get('/', async (req, res) => {
  console.log("products")
  const category = req.query.category;
  const sortType = req.query.sortType;
  const products = await Product.find();
  const _products = utils.getProductsByCategory(products, category);
  const sortedProducts = utils.sortProductsByPrice(_products, sortType)
  res.json(sortedProducts);
})

router.get('/sales/total', async (req, res) => {
  console.log("total sales")
  const products = await Product.find();
  const sales = await Sale.find();

  const totalSales = utils.calculateTotalSales(products, sales);
  res.json(totalSales);
})

router.get('/sales/trends', async (req, res) => {
  try {
    console.log("sales trends")
    const period = req.query.period || 'daily';

    const products = await Product.find();
    const sales = await Sale.find();

    const salesTrends = utils.getSalesTrends(sales, products, period);
    res.status(200).json(salesTrends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  console.log("add product")
  const product = new Product({
    name: req.body.name
  })
  const dbProduct = await product.save();
  res.json(dbProduct);
})

router.get('/customers/demographics', async (req, res) => {
  try {
    console.log("demographics")
    const customers = await Customer.find();
    const demographics = utils.analyzeCustomerDemographics(customers);
    res.json(demographics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/customers/segment', async (req, res) => {
  try {
    console.log("customers segment")
    const { ageGroup, gender} = req.query;
    let customers = await Customer.find();

    if (ageGroup) {
      customers = utils.segmentCustomers(customers, utils.ageGroupCriteria(ageGroup));
    }
    if (gender) {
      customers = utils.segmentCustomers(customers, utils.genderCriteria(gender));
    }

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/insert-data', async (req, res) => {
  console.log("inserting data")
  await Product.insertMany(data.products)
  await Sale.insertMany(data.sales)
  await Customer.insertMany(data.customers)
  res.send("inserted data successfully");
})

module.exports = router;