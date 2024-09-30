import { User,Company, Job, Application } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// 1- Add company controller
export const addCompany = async (req, res, next) => {
  try {
    // Ensure the authenticated user has the role of Company_HR
    if (req.authUser.role !== "Company_HR") {
      return next(new AppError(messages.user.notAuthorized, 403));
    }

    // Extract data from request body
    let {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR,
    } = req.body;

    // Convert companyName to lowercase
    companyName = companyName.toLowerCase();

    // Check if companyHR exists in the User collection
    const companyHRExist = await User.findById(companyHR);
    if (!companyHRExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // Check if company with the same name or email already exists
    const companyExist = await Company.findOne({ companyName });
    const emailExist = await Company.findOne({ companyEmail });

    if (companyExist || emailExist) {
      return next(new AppError(messages.company.alreadyExist, 409));
    }

    // Prepare the company object
    const company = new Company({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR,
      createdBy: req.authUser._id, // Assuming the logged-in user is creating the company
    });

    // Save company to the database
    const createdCompany = await company.save();
    if (!createdCompany) {
      return next(new AppError(messages.company.failToCreate, 500));
    }

    // Send successful response
    return res.status(201).json({
      message: messages.company.createSuccessfully,
      success: true,
      data: createdCompany,
    });
  } catch (error) {
    return next(error);
  }
};

// 2- Update company function
export const updateCompany = async (req, res, next) => {
  const { companyId } = req.params; // Assuming the company ID is passed as a URL parameter
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;

  // Find the company by ID
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError(messages.company.notFound, 404));
  }

  // Check if the authenticated user is the owner of the company
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  // Update the company details
  company.companyName = companyName ? companyName.toLowerCase() : company.companyName;
  company.description = description || company.description;
  company.industry = industry || company.industry;
  company.address = address || company.address;
  company.numberOfEmployees = numberOfEmployees || company.numberOfEmployees;
  company.companyEmail = companyEmail || company.companyEmail;

  // Save the updated company details
  const updatedCompany = await company.save();
  if (!updatedCompany) {
    return next(new AppError(messages.company.failToUpdate, 500));
  }

  // Send successful response
  return res.status(200).json({
    message: messages.company.updateSuccessfully,
    success: true,
    data: updatedCompany,
  });
};

// 3- Delete company data
export const deleteCompany = async (req, res, next) => {
  const { companyId } = req.params;

  // Validate companyId
  if (!companyId || companyId.length !== 24) {
    return next(new AppError('"companyId" must be a valid 24 character string', 400));
  }

  // Find the company by ID
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError(messages.company.notFound, 404));
  }

  // Check if the requesting user is the owner
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  // Proceed to delete the company
  await Company.findByIdAndDelete(companyId);

  // Send success response
  return res.status(200).json({
    message: messages.company.deleteSuccessfully,
    success: true,
  });
};

// 4- Get company data 
export const getCompanyData = async (req, res, next) => {
  const { companyId } = req.params;

  // Validate companyId
  if (!companyId) {
    return next(new AppError('Company ID is required', 400));
  }

  try {
    // Find the company by companyId
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError(messages.company.notFound, 404));
    }

    // Use ApiFeature to handle pagination and filtering
    const apiFeature = new ApiFeature(Job.find({ company: companyId }), req.query)
      .filter()
      .sort()
      .pagination();

    const jobs = await apiFeature.mongooseQuery;

    // Send successful response
    return res.status(200).json({
      message: messages.company.fetchedSuccessfully,
      success: true,
      data: {
        company,
        jobs,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// 5- Search Company by Name
export const searchCompany = async (req, res, next) => {
  try {
      const { name } = req.query;

      if (!name) {
          return next(new AppError("Company name is required", 400));
      }

      // Create a Mongoose query to find companies by name
      const query = Company.find({ companyName: { $regex: name, $options: 'i' } });

      // Initialize the ApiFeature class with the query and query parameters
      const apiFeature = new ApiFeature(query, req.query);

      // Apply filtering, pagination, and sorting
      const companies = await apiFeature.filter().sort().pagination().mongooseQuery;

      if (companies.length === 0) {
          return res.status(404).json({
              success: false,
              message: messages.company.notFound,
              data: [],
          });
      }

      return res.status(200).json({
          success: true,
          data: companies,
      });
  } catch (error) {
      return next(new AppError(error.message, 500));
  }
};

// 6- Get all applications for specific Job
export const getApplicationsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check if the job exists and if the authenticated user is the owner
    const job = await Job.findOne({ _id: jobId, createdBy: req.authUser._id });
    if (!job) {
      return next(new AppError("Job not found or not authorized", 404));
    }

    // Create a Mongoose query to find applications for the specific job
    const query = Application.find({ job: jobId }).populate("user", "-_id firstName lastName email"); // Populate user data excluding _id

    // Initialize the ApiFeature class with the query and query parameters
    const apiFeature = new ApiFeature(query, req.query);

    // Apply filtering, pagination, and sorting
    const applications = await apiFeature.filter().sort().pagination().mongooseQuery;

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: messages.application.notFound,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};