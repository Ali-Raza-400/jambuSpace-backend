const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../../middlewares/async");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Customer = require("../../models/Customer");

router.get(
  "/getAllUsers",
  asyncMiddleware(async (req, res) => {
    const userInfo = await User.find({});
    res.send(userInfo);
  })
);

router.get(
  "/getAllCustomers",
  asyncMiddleware(async (req, res) => {
    const customerInfo = await Customer.find({});
    res.send(customerInfo);
  })
);

router.get(
  "/getAllSellers",
  asyncMiddleware(async (req, res) => {
    const sellerInfo = await Seller.find({});
    res.send(sellerInfo);
  })
);

router.get(
  "/deleteSeller/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await Seller.findByIdAndDelete(id)
;
    res.send('Seller Deleted');
  })
);
router.get(
  "/deleteCustomer/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id)
;
    res.send('Customer Deleted');
  })
);
router.get(
  "/deleteUser/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id)
;
    res.send('User Deleted');
  })
);


router.post(
  "/editUser/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(id,req.body);
    res.send('User Edited');
  })
);

router.post(
  "/editSeller/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await Seller.findByIdAndUpdate(id,req.body);
    res.send('Seller Edited');
  })
);

router.post(
  "/editCustomer/:id",
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    await Customer.findByIdAndUpdate(id,req.body);
    res.send('Customer Edited');
  })
);

module.exports = router;