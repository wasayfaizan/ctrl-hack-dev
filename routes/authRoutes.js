const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Child = require("../models/Child");
const authController = require("../controllers/authController");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const QRCode = require("qrcode");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only jpeg files
    if (file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only jpeg format allowed!"));
    }
  },
});

router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/register-child", upload.single("photo"), async (req, res) => {
  try {
    const newChild = new Child({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      healthConditions: req.body.healthConditions,
      specialNeeds: req.body.specialNeeds === "on",
      registeredBy: req.user._id,
    });

    await newChild.save();
    res.redirect("/auth/help-me");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error registering child");
  }
});

router.get("/help-me", isAuthenticated, async (req, res) => {
  try {
    const children = await Child.find();
    console.log("Full children data:", JSON.stringify(children, null, 2));

    if (children.length > 0) {
      console.log("First child fields:", {
        _id: children[0]._id,
        childName: children[0].childName,
        name: children[0].name,
        firstName: children[0].firstName,
        yearOfBirth: children[0].yearOfBirth,
        birthYear: children[0].birthYear,
        dob: children[0].dob,
      });
    }

    res.render("helpme", {
      currentPage: "help-me",
      user: req.user,
      children: children || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/child/:id", isAuthenticated, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).send("Child not found");
    }

    res.render("childPhotoId", {
      currentPage: "help-me",
      user: req.user,
      child: child,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/child/:id/pdf", async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).send("Child not found");
    }

    // Create temp directory
    const tempDir = path.join(__dirname, "..", "temp");
    await fs.ensureDir(tempDir);

    // Save photo to temp file if it exists
    let photoPath = null;
    if (child.photo && child.photo.data) {
      photoPath = path.join(tempDir, `${child._id}-photo.jpg`);
      await fs.writeFile(photoPath, child.photo.data);
    }

    // Generate QR Code
    const qrCodeUrl = `${req.protocol}://${req.get("host")}/auth/child/${
      child._id
    }`;
    const qrCodePath = path.join(tempDir, `qr-${child._id}.png`);
    await QRCode.toFile(qrCodePath, qrCodeUrl);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers
    res.contentType("application/pdf");
    res.header(
      "Content-Disposition",
      `attachment; filename="EmpowerKids-ID-${child._id}.pdf"`
    );
    doc.pipe(res);

    // Add page border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .strokeColor("#6c63ff")
      .strokeOpacity(0.2)
      .stroke();

    // Starting Y position
    let yPos = 70;

    // Add letterhead
    doc
      .fontSize(24)
      .fillColor("#2a2d3e")
      .text("EMPOWER KIDS", 50, yPos, {
        align: "center",
        width: doc.page.width - 100,
      });
    yPos += 40;

    doc
      .fontSize(12)
      .fillColor("#666666")
      .text("Supporting Children in Need", 50, yPos, {
        align: "center",
        width: doc.page.width - 100,
      });
    yPos += 50;

    // Add document title
    doc
      .fontSize(16)
      .fillColor("#2a2d3e")
      .text("OFFICIAL IDENTIFICATION DOCUMENT", 50, yPos, {
        align: "center",
        width: doc.page.width - 100,
      });
    yPos += 50;

    // Add reference number and date
    const today = new Date().toLocaleDateString();
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 15);

    doc.fontSize(10).text(`Reference Number: EK-${child._id}`, 50, yPos);
    yPos += 20;
    doc.text(`Issue Date: ${today}`, 50, yPos);
    yPos += 20;
    doc.text(`Valid Until: ${validityDate.toLocaleDateString()}`, 50, yPos);
    yPos += 40;

    // Create a box for photo and details
    doc
      .rect(40, yPos, doc.page.width - 80, 180)
      .strokeColor("#6c63ff")
      .strokeOpacity(0.1)
      .stroke();

    // Add photo from database
    if (photoPath) {
      doc.image(photoPath, 60, yPos + 15, {
        fit: [150, 150],
      });
    }

    // Add personal details next to photo
    const detailsX = 240;
    doc
      .fontSize(12)
      .fillColor("#2a2d3e")
      .text("PERSONAL INFORMATION", detailsX, yPos + 15);

    // Add personal details
    const details = [
      { label: "Full Name", value: `${child.firstName} ${child.lastName}` },
      {
        label: "Date of Birth",
        value: new Date(child.dateOfBirth).toLocaleDateString(),
      },
      { label: "Gender", value: child.gender || "Not specified" },
      {
        label: "Health Conditions",
        value: child.healthConditions || "None reported",
      },
      { label: "Special Needs", value: child.specialNeeds ? "Yes" : "No" },
    ];

    let detailsY = yPos + 40;
    details.forEach((detail) => {
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(detail.label + ": ", detailsX, detailsY, { continued: true })
        .fillColor("#2a2d3e")
        .text(detail.value);
      detailsY += 25;
    });

    // Move position below the box
    yPos += 200;

    // Add QR code
    doc.image(qrCodePath, doc.page.width / 2 - 50, yPos, {
      fit: [100, 100],
    });
    yPos += 110;

    doc
      .fontSize(8)
      .fillColor("#666666")
      .text("Scan to verify authenticity", 50, yPos, {
        align: "center",
        width: doc.page.width - 100,
      });
    yPos += 30;

    // Add official declaration
    doc
      .fontSize(10)
      .fillColor("#2a2d3e")
      .text("OFFICIAL DECLARATION", 50, yPos, {
        align: "center",
        width: doc.page.width - 100,
      });
    yPos += 20;

    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This document certifies that the above-mentioned individual is registered with Empower Kids. This identification document is official and contains verified information. The authenticity of this document can be verified by scanning the QR code above.",
        50,
        yPos,
        {
          align: "justify",
          width: doc.page.width - 100,
        }
      );

    // Add footer
    doc
      .fontSize(8)
      .fillColor("#666666")
      .text("Empower Kids Foundation", 50, doc.page.height - 100, {
        align: "center",
        width: doc.page.width - 100,
      })
      .text(
        "This document is electronically generated and is valid without a signature.",
        50,
        doc.page.height - 80,
        { align: "center", width: doc.page.width - 100 }
      )
      .text(
        `Document generated on ${new Date().toLocaleString()}`,
        50,
        doc.page.height - 60,
        { align: "center", width: doc.page.width - 100 }
      );

    // Finalize PDF
    doc.end();

    // Clean up temporary files
    if (photoPath) {
      await fs.remove(photoPath);
    }
    await fs.remove(qrCodePath);
  } catch (error) {
    console.error("Detailed error:", error);
    if (!res.headersSent) {
      res.status(500).send("Error generating PDF");
    }
  }
});

router.post("/form", upload.single("photo"), async (req, res) => {
  try {
    console.log("Form Data:", req.body);
    console.log("File:", req.file);

    if (!req.file) {
      return res.status(400).send("Please upload a photo");
    }

    const newChild = new Child({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      healthConditions: req.body.healthConditions || "",
      specialNeeds: req.body.specialNeeds === "on",
      status: "Active",
    });

    const savedChild = await newChild.save();
    console.log("Child saved successfully:", savedChild._id);

    res.redirect("/auth/help-me");
  } catch (error) {
    console.error("Error saving child:", error);
    res.status(500).send("Error saving child. Please try again.");
  }
});

module.exports = router;
