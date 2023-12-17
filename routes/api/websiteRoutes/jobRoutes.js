const express = require("express");
const router = express.Router();

const asyncMiddleware = require("../../../middlewares/async");
const imagesUploader = require("../../../helpers/imagesUploader");
const validateId = require("../../../middlewares/validateId");
const isEmpty = require("../../../helpers/isEmpty");
const removeFile = require("../../../helpers/removeFile");

const Customer = require("../../../models/Customer");
const Seller = require("../../../models/Seller");
const Notification = require("../../../models/Notification");
const Job = require("../../../models/Job");
const { validateJob } = require("../../../models/Job");

const jobImageUrl = "/media/images/job/";

function validateJobImageFile(file) {
  if (!file.image) return "Job Image is required!";
  return null;
}

const uploadJobImageMiddleware = imagesUploader(validateJob, "/job").fields([
  { name: "image", maxCount: 1 },
]);

router.get(
  "/",
  asyncMiddleware(async (_, res) => {
    const jobs = await Job.find();
    let modifiedJobs = await Promise.all(
      jobs.map(async item => {
        try {
          let modifiedJob = { ...item.toJSON() };

          let customer = await Customer.findById(item.customerID);
          if (customer) modifiedJob = { ...modifiedJob, customer: customer };

          let seller = await Seller.findById(item.sellerID);
          if (seller) modifiedJob = { ...modifiedJob, seller: seller };

          return modifiedJob;
        } catch (err) {
          throw err;
        }
      })
    );
    res.json(modifiedJobs);
  })
);

router.get(
  "/:id",
  validateId,
  asyncMiddleware(async (req, res) => {
    const jobID = req.params.id;
    const response = await Job.findById(jobID);
    res.json(response || {});
  })
);

router.put(
  "/:id",
  validateId,
  asyncMiddleware(async (req, res) => {
    const jobID = req.params.id;

    uploadJobImageMiddleware(req, res, async err => {
      if (err)
        return err.code === "LIMIT_FILE_SIZE"
          ? res
            .status(400)
            .json({ message: "File too large. Must be less than 200 KB" })
          : res.status(400).json({ message: err.message });

      if (isEmpty(req.files)) {
        const { error } = validateJob(req.body);
        if (error)
          return res.status(400).json({ message: error.details[0].message });
      }

      const jobExist = await Job.findById(jobID);

      if (jobExist) {
        const payload = {
          title: req.body.title,
          description: req.body.description,
          budget: req.body.budget,
          status: req.body.status,
          customerID: req.body.customerID,
          dueDate: req.body.dueDate,
          deliveryDate: req.body.deliveryDate,
          sellerID: req.body.sellerID,
        };

        if (req.files.image) {
          const jobImage = {
            path: req.files.image[0].path,
            url: jobImageUrl + req.files.image[0].filename,
            filename: req.files.image[0].originalname,
          };
          payload.image = jobImage;
        }

        const result = await Job.findByIdAndUpdate(jobID, {
          $set: payload,
        });

        if (req.files.image && result.image) removeFile(result.image.path);

        res.json({ message: "Job Updated Successfully!" });
      }
    });
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    uploadJobImageMiddleware(req, res, async err => {
      if (err)
        return err.code === "LIMIT_FILE_SIZE"
          ? res
            .status(400)
            .json({ message: "File too large. Must be less than 200 KB" })
          : res.status(400).json({ message: err.message });

      if (isEmpty(req.files)) {
        const { error } = validateJob(req.body);
        if (error)
          return res.status(400).json({ message: error.details[0].message });
      }

      const payload = {
        title: req.body.title,
        description: req.body.description,
        budget: req.body.budget,
        status: "pending", // status pending for new job
        customerID: req.body.customerID,
        dueDate: req.body.dueDate,
        deliveryDate: req.body.deliveryDate,
        sellerID: req.body.sellerID,
      };

      if (req.files.image) {
        const jobImage = {
          path: req.files.image[0].path,
          url: jobImageUrl + req.files.image[0].filename,
          filename: req.files.image[0].originalname,
        };
        payload.image = jobImage;
      }

      const notificationPayload = {
        description: `New Job of amount (${payload.budget}) is created`,
        image: payload.image,
      };

      const error = validateJobImageFile(req.files);
      if (error) return res.status(400).json({ message: error });

      const job = new Job(payload);
      await job.save();

      const notification = new Notification(notificationPayload);
      await notification.save();

      // Add jobID in Customer Jobs as well
      await Customer.findByIdAndUpdate(req.body.customerID, {
        $push: { jobs: job._id },
      });

      // Add jobID in Seller Jobs as well
      if (req.body.sellerID)
        await Seller.findByIdAndUpdate(req.body.sellerID, {
          $push: { jobs: job._id },
        });

      res.json({ message: "Job Added Successfully!" });
    });
  })
);

router.delete(
  "/:id",
  validateId,
  asyncMiddleware(async (req, res) => {
    const jobID = req.params.id;
    const result = await Job.findByIdAndDelete(jobID);

    if (result.image) removeFile(result.image.path);

    res.json({ id: result._id } || {});
  })
);

module.exports = router;
