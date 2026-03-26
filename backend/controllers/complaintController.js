import fs from "fs";
import Complaint from "../models/Complaint.js";

function removeFileIfExists(filepath) {
  if (!filepath) return;
  fs.promises.unlink(filepath).catch(() => {});
}
function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildFilters(query) {
  const filters = {};

  const department = String(query?.department || "").trim();
  if (department) {
    filters.department = new RegExp(`^${escapeRegex(department)}$`, "i");
  }

  const status = String(query?.status || "").trim();
  if (status) {
    const allowed = ["Pending", "In Progress", "Waiting for User Confirmation", "Resolved"];
    if (allowed.includes(status)) filters.status = status;
  }

  const priority = String(query?.priority || "").trim();
  if (priority) {
    const allowed = ["Low", "Medium", "High"];
    if (allowed.includes(priority)) filters.priority = priority;
  }

  const district = String(query?.district || "").trim();
  if (district) {
    filters["location.district"] = new RegExp(`^${escapeRegex(district)}$`, "i");
  }

  return filters;
}

const TAMIL_NADU_DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Dindigul",
  "Cuddalore",
  "Kanchipuram",
  "Tiruppur",
  "Karur",
  "Namakkal",
  "Virudhunagar",
  "Sivagangai",
  "Ramanathapuram",
  "Thoothukudi",
  "Nilgiris",
  "Krishnagiri",
  "Dharmapuri",
  "Ariyalur",
  "Perambalur",
  "Tenkasi",
  "Nagapattinam",
  "Mayiladuthurai",
  "Tiruvallur",
  "Tiruvannamalai"
];

export async function createComplaint(req, res) {
  // Debugging requested by you
  // eslint-disable-next-line no-console
  console.log("REQ BODY:", req.body);

  const body = req.body || {};

  // Accept location in:
  // - JSON body: location: { address, district, city, lat, lng }
  // - FormData: location[address], location[district], location[city], location[lat], location[lng]
  // - Legacy flat fields: district/city
  let location = null;
  if (body.location && typeof body.location === "object") location = body.location;
  if (body.location && typeof body.location === "string") {
    try {
      location = JSON.parse(body.location);
    } catch {
      location = null;
    }
  }

  const district = body.district ?? body["location[district]"] ?? location?.district;
  const city = body.city ?? body["location[city]"] ?? location?.city;
  const addressFromBody = body["location[address]"] ?? location?.address;
  const lat = body.lat ?? body["location[lat]"] ?? location?.lat;
  const lng = body.lng ?? body["location[lng]"] ?? location?.lng;
  const name = body.name;
  const phoneNumber = body.phoneNumber ?? body.phone;

  const nameClean = String(name || "").trim();
  const phoneClean = String(phoneNumber || "").trim();
  if (phoneClean && !/^\d{10}$/.test(phoneClean)) {
    if (req.file?.path) removeFileIfExists(req.file.path);
    return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
  }

  if (!body.title || !body.description || !body.department || !body.priority || !district || !city) {
    if (req.file?.path) removeFileIfExists(req.file.path);
    return res
      .status(400)
      .json({ message: "title, description, department, priority, district and city are required." });
  }

  const districtClean = String(district).trim();
  const cityClean = String(city).trim();
  const districtOk = TAMIL_NADU_DISTRICTS.some((d) => d.toLowerCase() === districtClean.toLowerCase());
  if (!districtOk) {
    if (req.file?.path) removeFileIfExists(req.file.path);
    return res.status(400).json({ message: "District must be in Tamil Nadu." });
  }
  let address = String(addressFromBody || "").trim();
  if (!address) address = `${cityClean}, ${districtClean}, Tamil Nadu`;
  if (!/tamil nadu/i.test(address)) address = `${address}, Tamil Nadu`.replace(/\s*,\s*,/g, ",").trim();
  if (!/tamil nadu/i.test(address)) {
    if (req.file?.path) removeFileIfExists(req.file.path);
    return res.status(400).json({ message: "Only Tamil Nadu locations are allowed." });
  }

  const latNum = lat !== undefined && lat !== "" ? Number(lat) : null;
  const lngNum = lng !== undefined && lng !== "" ? Number(lng) : null;

  const computedLocation = {
    address,
    district: districtClean,
    city: cityClean,
    lat: Number.isFinite(latNum) ? latNum : null,
    lng: Number.isFinite(lngNum) ? lngNum : null
  };
  // eslint-disable-next-line no-console
  console.log("computedLocation:", computedLocation);

  const complaint = new Complaint({
    title: String(body.title).trim(),
    description: String(body.description).trim(),
    department: String(body.department).trim(),
    priority: String(body.priority),
    name: nameClean,
    phoneNumber: phoneClean,
    createdBy: req.user._id,
    image: req.file ? `/uploads/${req.file.filename}` : "",
    location: {
      address: computedLocation.address,
      district: computedLocation.district,
      city: computedLocation.city,
      lat: computedLocation.lat,
      lng: computedLocation.lng
    }
  });

  await complaint.save();

  if (process.env.NODE_ENV !== "production") {
    const saved = await Complaint.findById(complaint._id).lean();
    // eslint-disable-next-line no-console
    console.log("SAVED DOC location:", saved?.location);
    // eslint-disable-next-line no-console
    console.log("SAVED DOC identity:", { name: saved?.name, phoneNumber: saved?.phoneNumber });
  }

  res.status(201).json({ complaint });
}

export async function getMyComplaints(req, res) {
  const filters = buildFilters(req.query);
  const complaints = await Complaint.find({ createdBy: req.user._id, ...filters })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ complaints });
}

export async function getAllComplaints(req, res) {
  const filters = buildFilters(req.query);
  const complaints = await Complaint.find({ ...filters })
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ complaints });
}

export async function updateComplaintStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  const desired = String(status || "");
  const allowed = ["Pending", "In Progress", "Waiting for User Confirmation", "Resolved"];
  if (!allowed.includes(desired)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });

  // Lifecycle requested:
  // Admin clicks "Resolved" -> status becomes "Waiting for User Confirmation"
  // User clicks Yes -> status becomes "Resolved"
  // User clicks No -> status becomes "Pending"
  if (desired === "Resolved") {
    complaint.status = complaint.status === "Resolved" ? "Resolved" : "Waiting for User Confirmation";
  } else {
    complaint.status = desired;
  }
  await complaint.save();

  res.json({ complaint });
}

export async function confirmComplaintCompletion(req, res) {
  const { id } = req.params;
  const body = req.body || {};
  const confirmed = body.confirmed;

  if (typeof confirmed !== "boolean") {
    return res.status(400).json({ message: "confirmed must be boolean." });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });

  // Only the complaint owner can confirm completion.
  if (String(complaint.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only confirm your own complaint." });
  }

  if (complaint.status !== "Waiting for User Confirmation") {
    return res.status(400).json({ message: "Confirmation is allowed only when waiting for user confirmation." });
  }

  complaint.status = confirmed ? "Resolved" : "Pending";
  await complaint.save();

  res.json({ complaint });
}

export async function deleteComplaint(req, res) {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });

  if (complaint.image) {
    const localPath = complaint.image.startsWith("/uploads/")
      ? `uploads/${complaint.image.replace("/uploads/", "")}`
      : "";
    removeFileIfExists(localPath);
  }

  await complaint.deleteOne();
  res.json({ ok: true });
}

export async function submitComplaintFeedback(req, res) {
  const { id } = req.params;
  const body = req.body || {};

  const ratingNum = Number(body.rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "Rating is required (1-5)." });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });

  // Only the complaint owner can submit feedback.
  if (String(complaint.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only submit feedback for your own complaint." });
  }

  if (complaint.status !== "Resolved") {
    return res.status(400).json({ message: "Feedback allowed only after resolution." });
   }

  if (complaint.isFeedbackGiven) {
    return res.status(409).json({ message: "Feedback already submitted." });
  }

  complaint.rating = ratingNum;
  complaint.feedback = String(body.feedback || "").trim();
  complaint.isFeedbackGiven = true;

  await complaint.save();
  res.json({ complaint });
}
