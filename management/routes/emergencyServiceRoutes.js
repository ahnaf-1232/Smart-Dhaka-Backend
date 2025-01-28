const express = require("express");
const EmergencyService = require("../models/EmergencyService");
const authMiddleware = require("../middlewares/authMiddleware");
const ServiceHolder = require("../models/ServiceHolder");
const geolib = require("geolib");

const router = express.Router();

// Route to create a new EmergencyService
router.post("/create/:serviceHolderId", authMiddleware, async (req, res) => {
  const { serviceHolderId } = req.params; // Service Holder ID from params
  const { lat, lng } = req.body; // Requester location from body
  const requesterId = req.user.id; // Authenticated requester ID from token

  try {
    // Validate input
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Create the EmergencyService
    const emergencyService = new EmergencyService({
      serviceHolderId,
      requesterId,
      requesterLocation: { lat, lng },
      status: "Pending", // Default status
    });

    // Save to database
    await emergencyService.save();

    res.status(201).json({
      message: "Emergency service request created successfully",
      emergencyService,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to create emergency service request" });
  }
});

router.post("/closest/:category", async (req, res) => {
  const { category } = req.params; // Service type/category
  const { lat, lng } = req.body; // User's current location

  console.log(category, lat, lng);

  try {
    // Validate inputs
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Find all service holders with the specified category
    const serviceHolders = await ServiceHolder.find({
      role: "ServiceHolder",
      serviceType: category,
    });

    if (serviceHolders.length === 0) {
      return res
        .status(404)
        .json({ error: "No service holders found for the specified category" });
    }

    // Calculate distances and find the closest service holder
    let closestServiceHolder = null;
    let shortestDistance = Infinity;

    serviceHolders.forEach((serviceHolder) => {
      const distance = geolib.getDistance(
        { latitude: lat, longitude: lng },
        {
          latitude: serviceHolder.location.lat,
          longitude: serviceHolder.location.lng,
        }
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestServiceHolder = serviceHolder;
      }
    });

    // Respond with the closest service holder's ID and name
    if (closestServiceHolder) {
      res.json({
        _id: closestServiceHolder._id,
        name: closestServiceHolder.name,
        distance: shortestDistance / 1000,
      });
    } else {
      res.status(404).json({ error: "No service holder found" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to find the closest service holder" });
  }
});

router.get("/services", authMiddleware, async (req, res) => {
  try {
    const serviceHolderId = req.user.id;

    // Fetch all emergency services related to the specified service holder
    const emergencyServices = await EmergencyService.find({
      serviceHolderId,
    }).populate({
      path: "requesterId", // Populate the requesterId field
      select: "name phone", // Only include name and phone fields
    });

    if (!emergencyServices || emergencyServices.length === 0) {
      return res.status(404).json({
        message: "No emergency services found for this service holder.",
      });
    }

    const formattedServices = emergencyServices.map((service) => {
      const createdAtTime = new Date(service.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        _id: service._id,
        status: service.status,
        requesterLocation: service.requesterLocation,
        requester: {
          name: service.requesterId.name,
          phone: service.requesterId.phone || "No phone available",
        },
        time: createdAtTime, // Extracted time
        role: req.user.role,
      };
    });

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error fetching emergency services:", error);
    res.status(500).json({ error: "Failed to fetch emergency services." });
  }
});

router.put("/update-status/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ["Pending", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    // Find the emergency service and update its status
    const emergencyService = await EmergencyService.findById(id);
    if (!emergencyService) {
      return res.status(404).json({ message: "Emergency service not found." });
    }

    emergencyService.status = status;
    await emergencyService.save();

    res.status(200).json({
      message: "Emergency service status updated successfully.",
      emergencyService,
    });
  } catch (error) {
    console.error("Error updating emergency service status:", error);
    res
      .status(500)
      .json({ error: "Failed to update emergency service status." });
  }
});

router.get("/requested-user-service", authMiddleware, async (req, res) => {
  try {
    const userID = req.user.id;

    // Fetch all emergency services related to the specified service holder
    const emergencyServices = await EmergencyService.find({
      requesterId: userID,
    }).populate({
      path: "serviceHolderId", // Populate the requesterId field
      select: "name serviceType", // Only include name and phone fields
    });

    if (!emergencyServices || emergencyServices.length === 0) {
      return res.status(404).json({
        message: "No emergency services found for this service holder.",
      });
    }

    const formattedServices = emergencyServices.map((service) => {
      const createdAtTime = new Date(service.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        _id: service._id,
        status: service.status,
        serviceHolder: {
          name: service.serviceHolderId.name,
          serviceType: service.serviceHolderId.serviceType,
        },
        time: createdAtTime,
      };
    });

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error fetching emergency services:", error);
    res.status(500).json({ error: "Failed to fetch emergency services." });
  }
});

router.put("/services/:id/close", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the emergency service by ID
    const service = await EmergencyService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Emergency service not found." });
    }

    // Update the status to Closed
    service.status = "Closed";
    await service.save();

    res.status(200).json({
      message: "Emergency service status updated to Closed.",
      service,
    });
  } catch (error) {
    console.error("Error updating emergency service status:", error);
    res
      .status(500)
      .json({ error: "Failed to update emergency service status." });
  }
});

module.exports = router;
